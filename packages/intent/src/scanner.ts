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
            if (this.isTargetCall(program, node, target)) {
              const event = this.toIntentEvent(node, sourceFile, target);
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

  private isTargetCall(program: ts.Program, call: ts.CallExpression, target: ScanTarget) {
    if (ts.isPropertyAccessExpression(call.expression)) {
      return this.isTargetPropertyAccessExpression(program, call.expression, target);
    }

    if (ts.isElementAccessExpression(call.expression)) {
      return this.isTargetElementAccessExpression(program, call.expression, target);
    }

    return false;
  }

  private isTargetPropertyAccessExpression(
    program: ts.Program,
    propertyAccess: ts.PropertyAccessExpression,
    target: ScanTarget,
  ): boolean {
    return (
      propertyAccess.name.text === target.methodName &&
      this.isTargetReceiver(program, propertyAccess.expression, target)
    );
  }

  private isTargetElementAccessExpression(
    program: ts.Program,
    elementAccess: ts.ElementAccessExpression,
    target: ScanTarget,
  ): boolean {
    return (
      elementAccess.argumentExpression?.getText() === target.methodName &&
      this.isTargetReceiver(program, elementAccess.expression, target)
    );
  }

  private isTargetReceiver(program: ts.Program, expression: ts.Expression, target: ScanTarget) {
    const receiverType = program.getTypeChecker().getTypeAtLocation(expression);
    if (!receiverType) {
      return false;
    }

    return this.isTargetClass(program, receiverType, target);
  }

  private isTargetClass(program: ts.Program, type: ts.Type, target: ScanTarget) {
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

  private toIntentEvent(
    call: ts.CallExpression,
    sourceFile: ts.SourceFile,
    target: ScanTarget,
  ): IntentEvent {
    const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, call.getStart());
    const callsite = `${sourceFile.fileName}:${line + 1}:${character + 1}`;
    const firstArg = this.extractFirstArgText(call.arguments[0], sourceFile);

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

  private extractFirstArgText(arg: ts.Expression | undefined, sourceFile: ts.SourceFile): string {
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
}
