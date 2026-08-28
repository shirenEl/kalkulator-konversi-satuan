let expressionDisplay;
let resultDisplay;
let historyList;

let currentInput = '0';
let expression = '';
let shouldResetInput = false;

document.addEventListener("DOMContentLoaded", async () => {
    const includes = document.querySelectorAll("[data-include]");
    for (const el of includes) {
        const file = el.getAttribute("data-include");
        try {
            const response = await fetch(file);
            if (response.ok) {
                el.outerHTML = await response.text();
            } else {
                el.innerHTML = "<p class='text-red-400'>Komponen tidak ditemukan.</p>";
            }
        } catch (error) {
            console.error("Error loading component:", error);
        }
    }

    // Inisialisasi elemen kalkulator setelah komponen selesai di-render
    initCalculator();
});

function initCalculator() {
    expressionDisplay = document.getElementById('expressionDisplay');
    resultDisplay = document.getElementById('resultDisplay');
    historyList = document.getElementById('historyList');
    updateDisplay();
}

function updateDisplay() {
    if (resultDisplay) resultDisplay.innerText = currentInput;
    if (expressionDisplay) expressionDisplay.innerText = expression;
}

function inputNumber(num) {
    if (currentInput === '0' || shouldResetInput) {
        currentInput = num;
        shouldResetInput = false;
    } else {
        if (num === '.' && currentInput.includes('.')) return;
        currentInput += num;
    }
    updateDisplay();
}

function inputOperator(op) {
    const symbol = getSymbol(op);
    
    if (shouldResetInput) {
        expression = currentInput + ' ' + symbol + ' ';
        shouldResetInput = false;
    } else {
        expression += currentInput + ' ' + symbol + ' ';
    }
    
    currentInput = '0';
    updateDisplay();
}

function getSymbol(op) {
    switch (op) {
        case '*': return '×';
        case '/': return '÷';
        case '-': return '−';
        case '%': return 'mod';
        default: return op;
    }
}

function calculateResult() {
    if (!expression && currentInput === '0') return;

    let fullExpression = expression + currentInput;
    let evalExpression = fullExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/mod/g, '%');

    try {
        let evalResult = Function('"use strict";return (' + evalExpression + ')')();
        
        if (typeof evalResult === 'number' && !Number.isInteger(evalResult)) {
            evalResult = parseFloat(evalResult.toFixed(6));
        }

        const resultString = evalResult.toString();

        addHistoryItem(fullExpression, resultString);

        currentInput = resultString;
        expression = '';
        shouldResetInput = true;
        updateDisplay();
    } catch (e) {
        if (resultDisplay) resultDisplay.innerText = 'Error';
        currentInput = '0';
        expression = '';
        shouldResetInput = true;
    }
}

function calculateTrig(type) {
    let val = parseFloat(currentInput);
    if (isNaN(val)) return;

    let rad = val * (Math.PI / 180);
    let result = 0;

    switch (type) {
        case 'sin': result = Math.sin(rad); break;
        case 'cos': result = Math.cos(rad); break;
        case 'tan': result = Math.tan(rad); break;
    }

    if (!Number.isInteger(result)) {
        result = parseFloat(result.toFixed(6));
    }

    const trigExpr = `${type}(${val}°)`;
    addHistoryItem(trigExpr, result.toString());

    currentInput = result.toString();
    shouldResetInput = true;
    updateDisplay();
}

function clearCalculator() {
    currentInput = '0';
    expression = '';
    shouldResetInput = false;
    updateDisplay();
}

function deleteNumber() {
    if (shouldResetInput) return;
    if (currentInput.length === 1) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
}

function toggleSign() {
    if (currentInput === '0') return;
    if (currentInput.startsWith('-')) {
        currentInput = currentInput.slice(1);
    } else {
        currentInput = '-' + currentInput;
    }
    updateDisplay();
}

function inputPercentage() {
    let val = parseFloat(currentInput);
    if (!isNaN(val)) {
        currentInput = (val / 100).toString();
        updateDisplay();
    }
}

function addHistoryItem(exp, res) {
    if (!historyList) return;

    const item = document.createElement('div');
    item.className = 'flex items-center justify-between rounded-xl border border-white/5 bg-violet-950/20 px-4 py-2.5 hover:bg-white/5 transition';
    item.innerHTML = `
        <span class="text-sm text-zinc-400">${exp}</span>
        <span class="text-base font-medium text-white">${res}</span>
    `;

    historyList.prepend(item);
}

function clearHistory() {
    if (historyList) {
        historyList.innerHTML = '';
    }
}