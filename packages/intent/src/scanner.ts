import ts from 'typescript';
import type { IntentEvent } from './types';
import type { FileSystem } from '@stringsync/core';
import * as path from 'path';

export type ScanTarget = {
  className: string;
  methodName: string;
  moduleFileHint: string;
};

const SCAN_TARGETS = [
  {
    className: 'Spec',
    methodName: 'impl',
    moduleFileHint: 'intent',
  },
  {
    className: 'Spec',
    methodName: 'todo',
    moduleFileHint: 'intent',
  },
  {
    className: 'Sdk',
    methodName: 'spec',
    moduleFileHint: 'intent',
  },
] as const;

export class Scanner {
  constructor(
    private tsConfigPath: string,
    private fileSystem: FileSystem,
  ) {}

  async scan() {
    const events = new Array<IntentEvent>();

    const content = await this.fileSystem.read(this.tsConfigPath);
    const json = JSON.parse(content);
    const tsConfig = ts.parseJsonConfigFileContent(
      json,
      ts.sys,
      path.dirname(this.tsConfigPath),
      undefined,
    );

    const program = ts.createProgram({
      rootNames: tsConfig.fileNames,
      options: tsConfig.options,
    });

    for (const sourceFile of program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) {
        continue;
      }

      const dfs = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          for (const target of SCAN_TARGETS) {
            if (isTargetCall(target, program, node)) {
              const event = toIntentEvent(target, node, sourceFile, program);
              events.push(event);
            }
          }
        }
        ts.forEachChild(node, dfs);
      };

      dfs(sourceFile);
    }

    return events;
  }
}

function isTargetCall(target: ScanTarget, program: ts.Program, call: ts.CallExpression) {
  if (ts.isPropertyAccessExpression(call.expression)) {
    return isTargetPropertyAccessExpression(target, program, call.expression);
  }

  if (ts.isElementAccessExpression(call.expression)) {
    return isTargetElementAccessExpression(target, program, call.expression);
  }

  return false;
}

function isTargetPropertyAccessExpression(
  target: ScanTarget,
  program: ts.Program,
  propertyAccess: ts.PropertyAccessExpression,
): boolean {
  return (
    propertyAccess.name.text === target.methodName &&
    isTargetReceiver(target, program, propertyAccess.expression)
  );
}

function isTargetElementAccessExpression(
  target: ScanTarget,
  program: ts.Program,
  elementAccess: ts.ElementAccessExpression,
): boolean {
  return (
    elementAccess.argumentExpression?.getText() === target.methodName &&
    isTargetReceiver(target, program, elementAccess.expression)
  );
}

function isTargetReceiver(target: ScanTarget, program: ts.Program, expression: ts.Expression) {
  const receiverType = program.getTypeChecker().getTypeAtLocation(expression);
  if (!receiverType) {
    return false;
  }

  return isTargetClass(target, program, receiverType);
}

function isTargetClass(target: ScanTarget, program: ts.Program, type: ts.Type) {
  const declarations = program
    .getTypeChecker()
    .getPropertyOfType(type, target.methodName)
    ?.getDeclarations();
  if (!declarations) {
    return false;
  }

  return declarations
    .filter((d) => ts.isClassLike(d.parent))
    .some((d) => {
      const parent = d.parent as ts.ClassLikeDeclaration;
      return (
        parent.name?.getText() === target.className &&
        // Check class module
        d.getSourceFile().fileName.includes(target.moduleFileHint)
      );
    });
}

function toIntentEvent(
  target: ScanTarget,
  call: ts.CallExpression,
  sourceFile: ts.SourceFile,
  program: ts.Program,
): IntentEvent {
  const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, call.getStart());
  const callsite = `${sourceFile.fileName}:${line + 1}:${character + 1}`;
  const firstArg = extractFirstArgText(call.arguments[0], sourceFile);

  if (target.className === 'Spec' && target.methodName === 'impl') {
    const specId = inferSpecId(call, program);
    return {
      type: 'impl',
      callsite,
      intentId: firstArg,
      specId,
    };
  }

  if (target.className === 'Spec' && target.methodName === 'todo') {
    const specId = inferSpecId(call, program);
    return {
      type: 'todo',
      callsite,
      intentId: firstArg,
      specId,
    };
  }

  if (target.className === 'Sdk' && target.methodName === 'spec') {
    return {
      type: 'spec',
      callsite,
      specId: firstArg,
    };
  }

  throw new Error(`Unhandled target: ${target.className}.${target.methodName}`);
}

function inferSpecId(call: ts.CallExpression, program: ts.Program): string {
  // Get the receiver expression (e.g., 'spec' in 'spec.impl(...)')
  let receiverExpression: ts.Expression | null = null;

  if (ts.isPropertyAccessExpression(call.expression)) {
    receiverExpression = call.expression.expression;
  } else if (ts.isElementAccessExpression(call.expression)) {
    receiverExpression = call.expression.expression;
  }

  if (!receiverExpression) {
    return '<error: no receiver>';
  }

  // If it's an identifier (e.g., 'spec'), trace it back to its declaration
  if (ts.isIdentifier(receiverExpression)) {
    return traceSpecIdentifier(receiverExpression, program);
  }

  return '<error: unknown receiver>';
}

function traceSpecIdentifier(identifier: ts.Identifier, program: ts.Program): string {
  const typeChecker = program.getTypeChecker();
  const symbol = typeChecker.getSymbolAtLocation(identifier);

  if (!symbol) {
    // If we can't find the symbol, try to find it manually by looking for imports
    return traceIdentifierManually(identifier, program);
  }

  // Try to get the aliased symbol if this is an import
  const aliasedSymbol = typeChecker.getAliasedSymbol(symbol);
  const targetSymbol = aliasedSymbol !== symbol ? aliasedSymbol : symbol;

  if (!targetSymbol.valueDeclaration) {
    // If we still can't find the value declaration, try manual resolution
    return traceIdentifierManually(identifier, program);
  }

  const declaration = targetSymbol.valueDeclaration;

  // Check if it's a variable declaration
  if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
    return extractSpecIdFromExpression(declaration.initializer);
  }

  // Check if it's an import declaration
  if (ts.isImportSpecifier(declaration)) {
    return traceImportedSpec(declaration, program);
  }

  // If the original symbol was an import, try to trace it manually
  if (symbol.flags & ts.SymbolFlags.Alias) {
    return traceIdentifierManually(identifier, program);
  }

  return '<error: unknown declaration>';
}

function traceIdentifierManually(identifier: ts.Identifier, program: ts.Program): string {
  const sourceFile = identifier.getSourceFile();
  const identifierName = identifier.text;

  // Look for import declarations in the same file
  let importDeclaration: ts.ImportDeclaration | null = null;

  const findImport = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && node.importClause?.namedBindings) {
      if (ts.isNamedImports(node.importClause.namedBindings)) {
        for (const element of node.importClause.namedBindings.elements) {
          if (element.name.text === identifierName) {
            importDeclaration = node;
            return;
          }
        }
      }
    }
    ts.forEachChild(node, findImport);
  };

  findImport(sourceFile);

  if (!importDeclaration) {
    return '<error: no import found>';
  }

  const moduleSpecifierNode = importDeclaration.moduleSpecifier;
  if (!moduleSpecifierNode || !ts.isStringLiteral(moduleSpecifierNode)) {
    return '<error: invalid module specifier>';
  }

  // Resolve the module manually
  const moduleSpecifier = moduleSpecifierNode.text;
  const resolvedModule = resolveModule(moduleSpecifier, sourceFile, program);

  if (!resolvedModule) {
    return '<error: module not resolved>';
  }

  return findExportedSpecId(resolvedModule, identifierName);
}

function resolveModule(
  moduleSpecifier: string,
  fromFile: ts.SourceFile,
  program: ts.Program,
): ts.SourceFile | null {
  // Handle relative imports
  if (moduleSpecifier.startsWith('./') || moduleSpecifier.startsWith('../')) {
    const fromDir = path.dirname(fromFile.fileName);
    const resolvedPath = path.resolve(fromDir, moduleSpecifier);

    // Try different extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      const sourceFile = program.getSourceFile(fullPath);
      if (sourceFile) {
        return sourceFile;
      }
    }
  }

  return null;
}

function traceImportedSpec(importSpecifier: ts.ImportSpecifier, program: ts.Program): string {
  const importDeclaration = importSpecifier.parent?.parent?.parent;
  if (!ts.isImportDeclaration(importDeclaration) || !importDeclaration.moduleSpecifier) {
    return '<error: no import declaration>';
  }

  const moduleSpecifier = importDeclaration.moduleSpecifier;
  if (!ts.isStringLiteral(moduleSpecifier)) {
    return '<error: invalid module specifier>';
  }

  // Resolve the imported module
  const typeChecker = program.getTypeChecker();
  const symbol = typeChecker.getSymbolAtLocation(moduleSpecifier);

  if (!symbol || !symbol.valueDeclaration) {
    return '<error: no symbol>';
  }

  const sourceFile = symbol.valueDeclaration.getSourceFile();

  // Look for export declarations in the imported file
  const exportName = importSpecifier.name.text;
  return findExportedSpecId(sourceFile, exportName);
}

function findExportedSpecId(sourceFile: ts.SourceFile, exportName: string): string {
  let result: string | null = null;

  const dfs = (node: ts.Node) => {
    // Look for variable declarations that match the export name
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === exportName &&
      node.initializer
    ) {
      result = extractSpecIdFromExpression(node.initializer);
      return;
    }

    // Look for export assignments
    if (ts.isExportAssignment(node) && !node.isExportEquals) {
      result = extractSpecIdFromExpression(node.expression);
      return;
    }

    ts.forEachChild(node, dfs);
  };

  dfs(sourceFile);
  return result ?? '<error: no exported spec found>';
}

function extractSpecIdFromExpression(expression: ts.Expression): string {
  // Look for sdk.spec('specId', ...) pattern
  if (
    ts.isCallExpression(expression) &&
    ts.isPropertyAccessExpression(expression.expression) &&
    expression.expression.name.text === 'spec' &&
    ts.isIdentifier(expression.expression.expression) &&
    expression.expression.expression.text === 'sdk' &&
    expression.arguments.length > 0
  ) {
    const firstArg = expression.arguments[0];
    if (ts.isStringLiteral(firstArg)) {
      return firstArg.text;
    }
  }

  return '<error: unknown pattern>';
}

function extractFirstArgText(arg: ts.Expression | undefined, sourceFile: ts.SourceFile): string {
  if (!arg) {
    return '<none>';
  }

  if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
    return arg.text;
  }

  if (ts.isTemplateExpression(arg) && arg.templateSpans.length === 0) {
    return arg.head.text;
  }

  if (ts.isNumericLiteral(arg)) {
    return arg.text;
  }

  if (arg.kind === ts.SyntaxKind.TrueKeyword) {
    return 'true';
  }

  if (arg.kind === ts.SyntaxKind.FalseKeyword) {
    return 'false';
  }

  if (arg.kind === ts.SyntaxKind.NullKeyword) {
    return 'null';
  }

  return arg.getText(sourceFile);
}
