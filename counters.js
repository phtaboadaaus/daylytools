let counters = JSON.parse(localStorage.getItem('counters')) || [];
const countersList = document.getElementById('counters-list');

// Obtener el idioma actual para las traducciones
const currentLang = localStorage.getItem('lang') || 'es';
const t = i18n[currentLang];

function saveCounters() {
    localStorage.setItem('counters', JSON.stringify(counters));
}

function renderCounters() {
    countersList.innerHTML = '';
    
    counters.forEach((c, i) => {
        const div = document.createElement('div');
        div.classList.add('counter-item', 'animate-in');

        // Nombre del contador (Usando placeholder traducido)
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = c.name;
        nameInput.placeholder = t.placeholder_counter; // <--- TRADUCCIÓN
        nameInput.onchange = () => { c.name = nameInput.value; saveCounters(); };

        // Valor numérico
        const valueSpan = document.createElement('span');
        valueSpan.classList.add('counter-value');
        valueSpan.textContent = c.value;

        // Contenedor de botones
        const actions = document.createElement('div');
        actions.classList.add('counter-actions');

        // Botón Incrementar (+)
        const inc = document.createElement('button');
        inc.className = 'btn-floating waves-effect waves-light green';
        inc.innerHTML = '<i class="material-icons">add</i>';
        inc.onclick = () => { c.value++; saveCounters(); renderCounters(); };

        // Botón Decrementar (-)
        const dec = document.createElement('button');
        dec.className = 'btn-floating waves-effect waves-light orange';
        dec.innerHTML = '<i class="material-icons">remove</i>';
        dec.onclick = () => { 
            c.value--; 
            if (c.value < 0) c.value = 0; 
            saveCounters(); 
            renderCounters(); 
        };

        // Botón Borrar (Basura)
        const del = document.createElement('button');
        del.className = 'btn-floating waves-effect waves-light red light-2';
        del.innerHTML = '<i class="material-icons">delete</i>';
        del.onclick = () => { 
            // Podrías agregar una clave "confirm_delete" en languages.js si quieres traducir esto también
            if(confirm('¿Eliminar?')) { 
                counters.splice(i, 1); 
                saveCounters(); 
                renderCounters(); 
            }
        };

        // Armar la estructura
        actions.appendChild(dec);
        actions.appendChild(inc);
        actions.appendChild(del);

        div.appendChild(nameInput);
        div.appendChild(valueSpan);
        div.appendChild(actions);
        
        countersList.appendChild(div);
    });
}

function addCounter() {
    const input = document.getElementById('new-counter-name');
    const name = input.value.trim();
    if (!name) {
        // Usamos el placeholder o una frase de error traducida
        M.toast({html: t.placeholder_counter}); // O podrías crear t.error_empty_name
        return;
    }
    counters.push({ name, value: 0 });
    saveCounters();
    renderCounters();
    input.value = '';
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    // Aplicar traducción al placeholder del input principal si existe en el HTML
    const mainInput = document.getElementById('new-counter-name');
    if(mainInput) mainInput.placeholder = t.placeholder_counter;

    renderCounters();
});