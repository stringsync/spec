import type { IntentService } from '../intent-service';
import ts from 'typescript';
import * as path from 'path';

export async function scan(input: { intentService: IntentService; path: string }) {
  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, projectTsconfig);
  if (!configPath) {
    console.error(`Could not find ${projectTsconfig}`);
    process.exit(1);
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath,
  );

  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
  });
  const checker = program.getTypeChecker();

  const hits: Array<{
    file: string;
    line: number;
    col: number;
    firstArg: { kind: string; value: string } | null;
    snippet: string;
  }> = [];

  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile) continue;

    const visit = (node: ts.Node) => {
      if (isOptionalCall(node as any) || ts.isCallExpression(node)) {
        const call = node as ts.CallExpression;
        if (isTargetSpecImpl(checker, call)) {
          const firstArg = extractFirstArgText(call.arguments[0], sf);
          const { line, character } = ts.getLineAndCharacterOfPosition(sf, call.getStart());
          hits.push({
            file: sf.fileName,
            line: line + 1,
            col: character + 1,
            firstArg,
            snippet: call.getText(sf),
          });
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sf);
  }

  for (const h of hits) {
    const arg = h.firstArg ? `${h.firstArg.kind}:${JSON.stringify(h.firstArg.value)}` : 'no-arg';
    console.log(`${h.file}:${h.line}:${h.col}  arg=${arg}\n  ${h.snippet}\n`);
  }

  if (hits.length === 0) {
    console.log('No Spec#impl calls found.');
  }
}

/** Adjust these to your project */
const TARGET = {
  className: 'Spec', // the class declaring the method
  methodName: 'impl', // the instance method name
  // A path substring to prove the declaration comes from *your* module (recommended)
  // e.g., "node_modules/intentx" or "packages/intentx/src"
  moduleFileHint: 'intent',
};

const projectTsconfig = path.resolve('examples', 'calculator', 'tsconfig.json');

function deAlias(checker: ts.TypeChecker, sym?: ts.Symbol) {
  if (!sym) return sym;
  return sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
}

function sameFileAsLib(decls: readonly ts.Declaration[] | undefined, hint: string) {
  return !!decls?.some((d) => d.getSourceFile().fileName.includes(hint));
}

function isOptionalCall(node: ts.Node): node is ts.CallExpression | ts.OptionalChain {
  return ts.isCallExpression(node) || ts.isOptionalChain?.(node as any);
}

function getPropertyAccessFromCall(
  expr: ts.LeftHandSideExpression,
): ts.PropertyAccessExpression | ts.ElementAccessExpression | null {
  if (ts.isPropertyAccessExpression(expr)) return expr;
  if (ts.isElementAccessExpression(expr)) return expr;
  // Optional call expressions in recent TS can wrap inner expr; but here we only get the callee node
  return null;
}

/** Prove that the callee is the TARGET.methodName coming from TARGET.className in our module */
function isTargetSpecImpl(checker: ts.TypeChecker, call: ts.CallExpression): boolean {
  const callee = call.expression;
  const pa = getPropertyAccessFromCall(callee);
  if (!pa) return false;

  // Ensure property name matches 'impl' (element access: ['impl'])
  const propName = ts.isPropertyAccessExpression(pa)
    ? pa.name.text
    : ts.isElementAccessExpression(pa) && ts.isStringLiteral(pa.argumentExpression)
      ? pa.argumentExpression.text
      : null;

  if (propName !== TARGET.methodName) return false;

  // Resolve the property symbol (the `impl` member actually being used)
  const propSym = deAlias(
    checker,
    checker.getSymbolAtLocation(
      ts.isPropertyAccessExpression(pa) ? pa.name : (pa.argumentExpression as ts.Expression),
    ),
  );
  if (!propSym) return false;

  // Sanity: declaration must live in our module
  const propDecls = propSym.getDeclarations() ?? [];
  if (TARGET.moduleFileHint && !sameFileAsLib(propDecls, TARGET.moduleFileHint)) {
    // It might still be inherited; keep going but prefer fast-fail if you only want your module.
    return false;
  }

  // Confirm the member lives on a class named Spec (directly or via base class)
  const recvType = checker.getTypeAtLocation(pa.expression);
  if (!recvType) return false;

  // Try property lookup on the receiver type (handles inheritance/interfaces/augmentations)
  const lookedUp = checker.getPropertyOfType(recvType, TARGET.methodName);
  const lookedUpDecls = lookedUp?.getDeclarations() ?? [];

  // Check: the defining class name and file hint
  const definesOnTargetClass = lookedUpDecls.some((d) => {
    // We want a MethodDeclaration (or signature) whose parent is a ClassDeclaration named Spec
    const parent = d.parent;
    const isMethod =
      ts.isMethodDeclaration?.(d as any) ||
      (ts.isCallSignatureDeclaration(d) && ts.isClassLike(parent as any));
    if (!isMethod) return false;

    const parentClass = parent as ts.ClassLikeDeclaration;
    const className = parentClass.name?.getText() ?? '';
    const fileOk = TARGET.moduleFileHint
      ? d.getSourceFile().fileName.includes(TARGET.moduleFileHint)
      : true;
    return className === TARGET.className && fileOk;
  });

  return !!definesOnTargetClass;
}

/** Extract a readable value from arg0 (tweak as you like) */
function extractFirstArgText(
  arg: ts.Expression | undefined,
  sf: ts.SourceFile,
): { kind: string; value: string } | null {
  if (!arg) return null;

  if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
    return { kind: 'string', value: arg.text };
  }
  if (ts.isTemplateExpression(arg) && arg.templateSpans.length === 0) {
    return { kind: 'string', value: arg.head.text };
  }
  if (ts.isNumericLiteral(arg)) return { kind: 'number', value: arg.text };
  if (arg.kind === ts.SyntaxKind.TrueKeyword) return { kind: 'boolean', value: 'true' };
  if (arg.kind === ts.SyntaxKind.FalseKeyword) return { kind: 'boolean', value: 'false' };
  if (arg.kind === ts.SyntaxKind.NullKeyword) return { kind: 'null', value: 'null' };

  return { kind: 'expr', value: arg.getText(sf) };
}
