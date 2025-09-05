// spec(calculator.core): Calculator core functionality with add, subtract, multiply, divide, and clear operations
// spec(calculator.dx): TypeScript implementation

class Calculator {
  private display: HTMLElement;
  private currentValue: string = '0';
  private previousValue: string = '';
  private operator: string = '';
  private waitingForOperand: boolean = false;
  private activeOperatorButton: HTMLElement | null = null;

  constructor() {
    this.display = document.getElementById('display')!;
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        if (target.dataset.number) {
          this.inputNumber(target.dataset.number);
        } else if (target.dataset.action) {
          this.handleAction(target.dataset.action, target);
        }
      });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });
  }

  private inputNumber(num: string): void {
    if (this.waitingForOperand) {
      this.currentValue = num;
      this.waitingForOperand = false;
    } else {
      this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
    }

    this.updateDisplay();
    this.clearActiveOperator();
  }

  private handleAction(action: string, buttonElement?: HTMLElement): void {
    switch (action) {
      case 'clear':
        this.clear();
        break;
      case 'toggle-sign':
        this.toggleSign();
        break;
      case 'percent':
        this.percent();
        break;
      case 'decimal':
        this.inputDecimal();
        break;
      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
        this.inputOperator(action, buttonElement);
        break;
      case 'equals':
        this.calculate();
        break;
    }
  }

  // spec(calculator.core): Clear functionality
  private clear(): void {
    this.currentValue = '0';
    this.previousValue = '';
    this.operator = '';
    this.waitingForOperand = false;
    this.updateDisplay();
    this.clearActiveOperator();
  }

  private toggleSign(): void {
    if (this.currentValue !== '0') {
      this.currentValue = this.currentValue.startsWith('-')
        ? this.currentValue.slice(1)
        : '-' + this.currentValue;
      this.updateDisplay();
    }
  }

  private percent(): void {
    const value = parseFloat(this.currentValue);
    this.currentValue = (value / 100).toString();
    this.updateDisplay();
  }

  private inputDecimal(): void {
    if (this.waitingForOperand) {
      this.currentValue = '0.';
      this.waitingForOperand = false;
    } else if (this.currentValue.indexOf('.') === -1) {
      this.currentValue += '.';
    }

    this.updateDisplay();
  }

  private inputOperator(nextOperator: string, buttonElement?: HTMLElement): void {
    if (this.previousValue === '') {
      this.previousValue = this.currentValue;
    } else if (this.operator) {
      const currentValue = parseFloat(this.currentValue);
      const result = this.performCalculation(
        parseFloat(this.previousValue),
        currentValue,
        this.operator,
      );

      this.currentValue = String(result);
      this.previousValue = this.currentValue;
      this.updateDisplay();
    }

    this.waitingForOperand = true;
    this.operator = nextOperator;

    this.setActiveOperator(buttonElement);
  }

  // spec(calculator.core): Core mathematical operations - add, subtract, multiply, divide
  private performCalculation(
    firstOperand: number,
    secondOperand: number,
    operator: string,
  ): number {
    switch (operator) {
      case 'add':
        return firstOperand + secondOperand;
      case 'subtract':
        return firstOperand - secondOperand;
      case 'multiply':
        return firstOperand * secondOperand;
      case 'divide':
        return secondOperand !== 0 ? firstOperand / secondOperand : 0;
      default:
        return secondOperand;
    }
  }

  private calculate(): void {
    if (this.operator && this.previousValue !== '') {
      const currentValue = parseFloat(this.currentValue);
      const previousValue = parseFloat(this.previousValue);
      const result = this.performCalculation(previousValue, currentValue, this.operator);

      this.currentValue = String(result);
      this.previousValue = '';
      this.operator = '';
      this.waitingForOperand = true;
      this.updateDisplay();
      this.clearActiveOperator();
    }
  }

  private updateDisplay(): void {
    const value = parseFloat(this.currentValue);

    // Format large numbers with scientific notation
    if (Math.abs(value) >= 1e9) {
      this.display.textContent = value.toExponential(2);
    } else {
      // Remove trailing zeros and unnecessary decimal points
      this.display.textContent = parseFloat(this.currentValue).toString();
    }
  }

  private setActiveOperator(buttonElement?: HTMLElement): void {
    this.clearActiveOperator();
    if (buttonElement) {
      buttonElement.classList.add('active');
      this.activeOperatorButton = buttonElement;
    }
  }

  private clearActiveOperator(): void {
    if (this.activeOperatorButton) {
      this.activeOperatorButton.classList.remove('active');
      this.activeOperatorButton = null;
    }
  }

  private handleKeyboard(e: KeyboardEvent): void {
    const key = e.key;

    if (key >= '0' && key <= '9') {
      this.inputNumber(key);
    } else {
      switch (key) {
        case '+':
          this.handleAction('add');
          break;
        case '-':
          this.handleAction('subtract');
          break;
        case '*':
          this.handleAction('multiply');
          break;
        case '/':
          e.preventDefault();
          this.handleAction('divide');
          break;
        case '=':
        case 'Enter':
          this.handleAction('equals');
          break;
        case '.':
          this.handleAction('decimal');
          break;
        case 'Escape':
        case 'c':
        case 'C':
          this.handleAction('clear');
          break;
        case '%':
          this.handleAction('percent');
          break;
      }
    }
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});
