import type { IntentEvent, SpecEvent, ImplEvent, TodoEvent } from './types';
import ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { Spec } from './spec';
import { Sdk } from './sdk';

type ScanTarget = {
  className: string;
  methodName: string;
  moduleFileHint: string;
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

  async scan(): Promise<IntentEvent[]> {
    // For now, use a default glob pattern - this could be made configurable
    const collector = new TsConfigCollector(['**/*.ts']);
    const configs = collector.collectTsConfigs();

    const events: IntentEvent[] = [];

    for (const { parsed } of configs) {
      const program = ts.createProgram({
        rootNames: parsed.fileNames,
        options: parsed.options,
      });
      const checker = program.getTypeChecker();

      for (const sf of program.getSourceFiles()) {
        if (sf.isDeclarationFile) continue;

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
  ): IntentEvent | null {
    const firstArg = this.extractFirstArgText(call.arguments[0], sf);
    const { line, character } = ts.getLineAndCharacterOfPosition(sf, call.getStart());
    const callsite = `${sf.fileName}:${line + 1}:${character + 1}`;

    // Extract the first argument as specId or intentId
    const argValue = firstArg?.value || '';

    // Map method names to event types
    switch (target.methodName) {
      case 'spec':
        return {
          type: 'spec',
          specId: argValue,
          callsite,
        } as SpecEvent;

      case 'impl':
        // For impl events, we need both specId and intentId
        // Assuming the first arg is specId and we need to extract intentId from context
        return {
          type: 'impl',
          specId: argValue,
          intentId: argValue, // This might need more sophisticated extraction
          callsite,
        } as ImplEvent;

      case 'todo':
        return {
          type: 'todo',
          specId: argValue,
          intentId: argValue, // This might need more sophisticated extraction
          callsite,
        } as TodoEvent;

      default:
        return null;
    }
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

class TsConfigCollector {
  constructor(private globPatterns: string[]) {}

  collectTsConfigs(): Array<{ configPath: string; parsed: ts.ParsedCommandLine }> {
    const configs: Array<{ configPath: string; parsed: ts.ParsedCommandLine }> = [];

    for (const pattern of this.globPatterns) {
      // For now, we'll look for tsconfig.json files in the pattern directories
      // This is a simplified implementation - in a full implementation you'd use a proper glob library
      const configPath = this.findTsConfigInPattern(pattern);
      if (configPath) {
        const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
        const parsed = ts.parseJsonConfigFileContent(
          configFile.config,
          ts.sys,
          path.dirname(configPath),
          undefined,
          configPath,
        );
        configs.push({ configPath, parsed });
      }
    }

    return configs;
  }

  private findTsConfigInPattern(pattern: string): string | null {
    // Simplified pattern matching - look for tsconfig.json in the pattern directory
    const dir = path.dirname(pattern);
    const configPath = path.resolve(dir, 'tsconfig.json');

    if (fs.existsSync(configPath)) {
      return configPath;
    }

    // Also try looking in the current working directory
    const cwdConfigPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
    return cwdConfigPath || null;
  }
}
