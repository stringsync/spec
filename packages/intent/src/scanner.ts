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
              const event = toIntentEvent(target, node, sourceFile);
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
): IntentEvent {
  const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, call.getStart());
  const callsite = `${sourceFile.fileName}:${line + 1}:${character + 1}`;
  const firstArg = extractFirstArgText(call.arguments[0], sourceFile);

  if (target.className === 'Spec' && target.methodName === 'impl') {
    return {
      type: 'impl',
      callsite,
      intentId: firstArg,
      specId: '<todo>',
    };
  }

  if (target.className === 'Spec' && target.methodName === 'todo') {
    return {
      type: 'todo',
      callsite,
      intentId: firstArg,
      specId: '<todo>',
    };
  }

  if (target.className === 'Sdk' && target.methodName === 'spec') {
    return {
      type: 'spec',
      callsite,
      specId: '<todo>',
    };
  }

  throw new Error(`Unhandled target: ${target.className}.${target.methodName}`);
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
