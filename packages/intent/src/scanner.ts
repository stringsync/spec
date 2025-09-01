import ts from 'typescript';
import { glob } from 'glob';
import { Spec } from './spec';
import { Sdk } from './sdk';

export type ScanTarget = {
  className: string;
  methodName: string;
  moduleFileHint: string;
};

export type ScanEvent = {
  target: ScanTarget;
  callsite: string;
  firstArg: { kind: string; value: string } | null;
};

const SCAN_TARGETS = [
  {
    className: Spec.name,
    methodName: 'impl',
    moduleFileHint: 'intent',
  },
  {
    className: Spec.name,
    methodName: 'todo',
    moduleFileHint: 'intent',
  },
  {
    className: Sdk.name,
    methodName: 'spec',
    moduleFileHint: 'intent',
  },
] as const;

export class Scanner {
  private readonly targets = SCAN_TARGETS;

  constructor(
    private configs: Array<{ configPath: string; parsed: ts.ParsedCommandLine }>,
    private globPatterns: string[] = [],
  ) {}

  async scan(): Promise<ScanEvent[]> {
    const events: ScanEvent[] = [];

    // Get all files matching the glob patterns if provided
    let matchingFiles: Set<string> | null = null;
    if (this.globPatterns.length > 0) {
      matchingFiles = new Set<string>();
      for (const pattern of this.globPatterns) {
        const files = await glob(pattern, { absolute: true });
        files.forEach((file: string) => matchingFiles!.add(file));
      }
    }

    for (const { parsed } of this.configs) {
      const program = ts.createProgram({
        rootNames: parsed.fileNames,
        options: parsed.options,
      });
      const checker = program.getTypeChecker();

      for (const sf of program.getSourceFiles()) {
        if (sf.isDeclarationFile) continue;

        // Filter files based on glob patterns if provided
        if (matchingFiles && !matchingFiles.has(sf.fileName)) {
          continue;
        }

        const visit = (node: ts.Node) => {
          if (this.isOptionalCall(node) || ts.isCallExpression(node)) {
            const call = node as ts.CallExpression;

            for (const target of this.targets) {
              if (this.isTargetCall(checker, call, target)) {
                const event = this.createEventFromCall(call, sf, target);
                if (event) {
                  events.push(event);
                }
              }
            }
          }
          ts.forEachChild(node, visit);
        };

        visit(sf);
      }
    }

    return events;
  }

  private createEventFromCall(
    call: ts.CallExpression,
    sf: ts.SourceFile,
    target: ScanTarget,
  ): ScanEvent | null {
    const { line, character } = ts.getLineAndCharacterOfPosition(sf, call.getStart());
    const callsite = `${sf.fileName}:${line + 1}:${character + 1}`;
    const firstArg = this.extractFirstArgText(call.arguments[0], sf);

    return {
      target,
      callsite,
      firstArg,
    };
  }

  private isOptionalCall(node: ts.Node): node is ts.CallExpression {
    return ts.isCallExpression(node);
  }

  private getPropertyAccessFromCall(
    expr: ts.LeftHandSideExpression,
  ): ts.PropertyAccessExpression | ts.ElementAccessExpression | null {
    if (ts.isPropertyAccessExpression(expr)) return expr;
    if (ts.isElementAccessExpression(expr)) return expr;
    return null;
  }

  private isTargetCall(
    checker: ts.TypeChecker,
    call: ts.CallExpression,
    target: ScanTarget,
  ): boolean {
    const callee = call.expression;
    const pa = this.getPropertyAccessFromCall(callee);
    if (!pa) return false;

    // Ensure property name matches the target method name
    const propName = ts.isPropertyAccessExpression(pa)
      ? pa.name.text
      : ts.isElementAccessExpression(pa) && ts.isStringLiteral(pa.argumentExpression)
        ? pa.argumentExpression.text
        : null;

    if (propName !== target.methodName) return false;

    // Resolve the property symbol
    const propSym = this.deAlias(
      checker,
      checker.getSymbolAtLocation(
        ts.isPropertyAccessExpression(pa) ? pa.name : (pa.argumentExpression as ts.Expression),
      ),
    );
    if (!propSym) return false;

    // Sanity: declaration must live in our module
    const propDecls = propSym.getDeclarations() ?? [];
    if (target.moduleFileHint && !this.sameFileAsLib(propDecls, target.moduleFileHint)) {
      return false;
    }

    // Confirm the member lives on the target class
    const recvType = checker.getTypeAtLocation(pa.expression);
    if (!recvType) return false;

    // Try property lookup on the receiver type
    const lookedUp = checker.getPropertyOfType(recvType, target.methodName);
    const lookedUpDecls = lookedUp?.getDeclarations() ?? [];

    // Check: the defining class name and file hint
    const definesOnTargetClass = lookedUpDecls.some((d) => {
      const parent = d.parent;
      const isMethod =
        ts.isMethodDeclaration(d) || (ts.isCallSignatureDeclaration(d) && ts.isClassLike(parent));
      if (!isMethod) return false;

      const parentClass = parent as ts.ClassLikeDeclaration;
      const className = parentClass.name?.getText() ?? '';
      const fileOk = target.moduleFileHint
        ? d.getSourceFile().fileName.includes(target.moduleFileHint)
        : true;
      return className === target.className && fileOk;
    });

    return !!definesOnTargetClass;
  }

  private deAlias(checker: ts.TypeChecker, sym?: ts.Symbol) {
    if (!sym) return sym;
    return sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
  }

  private sameFileAsLib(decls: readonly ts.Declaration[] | undefined, hint: string) {
    return !!decls?.some((d) => d.getSourceFile().fileName.includes(hint));
  }

  private extractFirstArgText(
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
}
