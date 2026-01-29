let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
const taskListEl = document.getElementById('task-list');

// FUNCIÓN DE AYUDA: Intenta obtener un texto traducido, si falla devuelve el default
function getTxt(key, fallback) {
    try {
        const lang = localStorage.getItem('lang') || 'es';
        if (window.i18n && window.i18n[lang] && window.i18n[lang][key]) {
            return window.i18n[lang][key];
        }
    } catch (e) {
        console.warn("Error en traducciones:", e);
    }
    return fallback;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(taskList));
}

function renderTasks() {
    if (!taskListEl) return;
    taskListEl.innerHTML = '';
    
    taskList.forEach((t, i) => {
        const li = document.createElement('li');
        li.classList.add('task-item');

        // Icono de Check
        const checkBtn = document.createElement('i');
        checkBtn.classList.add('material-icons', 'task-checkbox');
        checkBtn.textContent = t.done ? 'check_circle' : 'radio_button_unchecked';
        checkBtn.onclick = () => {
            t.done = !t.done;
            saveTasks();
            renderTasks();
        };

        // Texto de la tarea
        const input = document.createElement('input');
        input.type = 'text';
        input.value = t.text;
        input.classList.add('task-text');
        if (t.done) input.classList.add('done');
        
        input.onchange = () => {
            t.text = input.value;
            saveTasks();
        };

        // Botón Borrar
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-floating waves-effect waves-light red lighten-2 btn-small';
        delBtn.innerHTML = '<i class="material-icons">delete</i>';
        delBtn.onclick = () => {
            taskList.splice(i, 1);
            saveTasks();
            renderTasks();
        };

        li.appendChild(checkBtn);
        li.appendChild(input);
        li.appendChild(delBtn);
        
        taskListEl.appendChild(li);
    });
}

function addTask() {
    const input = document.getElementById('new-task');
    if (!input) return;

    const text = input.value.trim();
    if (!text) {
        // Si la traducción falla, usa el texto en español
        const msg = getTxt('checklist_error', 'Escribe una tarea primero');
        M.toast({html: msg});
        return;
    }
    taskList.push({ text, done: false });
    saveTasks();
    renderTasks();
    input.value = '';
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    // Aplicar traducción al placeholder inicial de forma segura
    const inputEl = document.getElementById('new-task');
    if (inputEl) {
        inputEl.placeholder = getTxt('placeholder_checklist', 'Nueva tarea');
    }
    
    renderTasks();
});