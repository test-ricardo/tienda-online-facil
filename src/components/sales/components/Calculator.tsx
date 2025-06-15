
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [previousValue, setPreviousValue] = useState<number | null>(null);

  const inputNumber = (num: string) => {
    if (waitingForNext) {
      setDisplay(num);
      setWaitingForNext(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNext(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNext(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setOperation(null);
    setPreviousValue(null);
    setWaitingForNext(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const inputDecimal = () => {
    if (waitingForNext) {
      setDisplay('0.');
      setWaitingForNext(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Calculadora</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Display */}
            <div className="bg-gray-100 p-4 rounded text-right text-2xl font-mono">
              {display}
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" onClick={clear}>C</Button>
              <Button variant="outline" onClick={clearEntry}>CE</Button>
              <Button variant="outline" onClick={() => inputOperation('÷')}>÷</Button>
              <Button variant="outline" onClick={() => inputOperation('×')}>×</Button>

              <Button variant="outline" onClick={() => inputNumber('7')}>7</Button>
              <Button variant="outline" onClick={() => inputNumber('8')}>8</Button>
              <Button variant="outline" onClick={() => inputNumber('9')}>9</Button>
              <Button variant="outline" onClick={() => inputOperation('-')}>-</Button>

              <Button variant="outline" onClick={() => inputNumber('4')}>4</Button>
              <Button variant="outline" onClick={() => inputNumber('5')}>5</Button>
              <Button variant="outline" onClick={() => inputNumber('6')}>6</Button>
              <Button variant="outline" onClick={() => inputOperation('+')}>+</Button>

              <Button variant="outline" onClick={() => inputNumber('1')}>1</Button>
              <Button variant="outline" onClick={() => inputNumber('2')}>2</Button>
              <Button variant="outline" onClick={() => inputNumber('3')}>3</Button>
              <Button variant="outline" onClick={performCalculation} className="row-span-2 bg-blue-500 text-white hover:bg-blue-600">=</Button>

              <Button variant="outline" onClick={() => inputNumber('0')} className="col-span-2">0</Button>
              <Button variant="outline" onClick={inputDecimal}>.</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calculator;
