let calcDisplay = document.getElementById('calc-display');
let calcInput = '';

function calcPress(value) {
    if (value === 'C') {
        calcInput = '';
        calcDisplay.value = '0';
        return;
    }

    if (value === '=') {
        if (calcInput === '') return;
        try {
            // Usamos Function en lugar de eval para un poquito más de seguridad
            let result = new Function('return ' + calcInput)();
            
            // Limitar decimales si son muchos
            if (result.toString().includes('.')) {
                result = parseFloat(result.toFixed(8));
            }
            
            calcInput = result.toString();
            calcDisplay.value = calcInput;
        } catch (e) {
            calcDisplay.value = 'Error';
            calcInput = '';
        }
        return;
    }

    // Evitar que el input empiece con operadores
    if (calcInput === '' && ['+', '*', '/'].includes(value)) return;

    calcInput += value;
    calcDisplay.value = calcInput;
}