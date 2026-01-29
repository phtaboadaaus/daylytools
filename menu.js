document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);

    // Inicializar selects de configuración
    const langSelect = document.getElementById('lang-select');
    const firstModuleSelect = document.getElementById('first-module-select');
    langSelect.value = localStorage.getItem('lang') || 'es';
    firstModuleSelect.value = localStorage.getItem('firstModule') || 'pomodoro';
    changeLanguage(langSelect.value);
});

function showModule(moduleId) {
    const modules = document.querySelectorAll('.module');
    modules.forEach(mod => mod.style.display = 'none');
    const selected = document.getElementById(moduleId + '-module');
    if(selected) selected.style.display = 'block';
}

function setFirstModule(moduleId){
    localStorage.setItem('firstModule', moduleId);
}

// Al cargar la página, ir al módulo de inicio guardado
window.onload = () => {
    const start = localStorage.getItem('startModule') || 'pomodoro';
    showModule(start);
};
