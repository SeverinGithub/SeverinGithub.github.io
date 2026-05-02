// Calculator functionality
let display = document.getElementById('display');
let currentInput = '0';
let operator = null;
let previousInput = null;
let shouldResetDisplay = false;

// Update the display
function updateDisplay() {
    display.textContent = currentInput;
}

// Clear the display
function clearDisplay() {
    currentInput = '0';
    operator = null;
    previousInput = null;
    shouldResetDisplay = false;
    updateDisplay();
}

// Delete the last character
function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Append number or operator to display
function appendToDisplay(value) {
    // If display should be reset (after equals), clear it first
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }

    // Handle decimal point
    if (value === '.') {
        if (currentInput.includes('.')) {
            return; // Don't add multiple decimal points
        }
        if (currentInput === '0') {
            currentInput = '0.';
        } else {
            currentInput += '.';
        }
    }
    // Handle numbers
    else if (value >= '0' && value <= '9') {
        if (currentInput === '0') {
            currentInput = value;
        } else {
            currentInput += value;
        }
    }
    // Handle operators
    else if (['+', '-', '*', '/'].includes(value)) {
        if (operator !== null && previousInput !== null) {
            calculate();
        }
        operator = value;
        previousInput = currentInput;
        shouldResetDisplay = true;
    }

    updateDisplay();
}

// Perform calculation
function calculate() {
    if (operator === null || previousInput === null) {
        return;
    }

    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                currentInput = 'Error';
                operator = null;
                previousInput = null;
                shouldResetDisplay = true;
                updateDisplay();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }

    // Round to avoid floating point precision issues
    result = Math.round(result * 100000000) / 100000000;
    
    currentInput = result.toString();
    operator = null;
    previousInput = null;
    shouldResetDisplay = true;
    updateDisplay();
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Numbers and decimal point
    if ((key >= '0' && key <= '9') || key === '.') {
        appendToDisplay(key);
    }
    // Operators
    else if (['+', '-', '*', '/'].includes(key)) {
        appendToDisplay(key);
    }
    // Equals
    else if (key === 'Enter' || key === '=') {
        calculate();
    }
    // Clear
    else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    }
    // Backspace
    else if (key === 'Backspace') {
        deleteLast();
    }
});

// Initialize display
updateDisplay();
