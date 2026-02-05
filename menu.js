document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);

    // Inicializar selects de configuración con protección de errores
    const langSelect = document.getElementById('lang-select');
    const firstModuleSelect = document.getElementById('first-module-select');

    // Solo asignamos el valor si el elemento realmente existe en el DOM
    if (langSelect) {
        langSelect.value = localStorage.getItem('lang') || 'es';
        // Sincronizamos con la función de cambio de idioma de settings.js
        if (typeof changeLanguage === 'function') {
            changeLanguage(langSelect.value);
        }
    }

    if (firstModuleSelect) {
        firstModuleSelect.value = localStorage.getItem('firstModule') || 'pomodoro';
    }
});

function showModule(moduleId) {
    const modules = document.querySelectorAll('.module');
    modules.forEach(mod => mod.style.display = 'none');
    const selected = document.getElementById(moduleId + '-module');
    if(selected) {
        selected.style.display = 'block';
    }
}

function setFirstModule(moduleId){
    localStorage.setItem('firstModule', moduleId);
}

// Al cargar la página, ir al módulo de inicio guardado
window.onload = () => {
    // Sincronizado con la llave 'startModule' que usas en settings.js
    const start = localStorage.getItem('startModule') || 'pomodoro';
    showModule(start);
};
