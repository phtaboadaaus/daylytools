/**
 * FUNCIÓN AUXILIAR PARA OBTENER TRADUCCIONES DINÁMICAS
 */
function getTxt(key, fallback) {
    const lang = localStorage.getItem('lang') || 'es';
    return (window.i18n && window.i18n[lang] && window.i18n[lang][key]) ? window.i18n[lang][key] : fallback;
}

/**
 * 1. CAMBIO DE IDIOMA
 */
function changeLanguage(lang) {
    localStorage.setItem('lang', lang);
    const texts = i18n[lang] || i18n['es'];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (texts[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = texts[key];
            } else {
                const icon = el.querySelector('i');
                el.textContent = texts[key];
                if (icon) el.prepend(icon); 
            }
        }
    });

    const langSelect = document.getElementById('language-select');
    if (langSelect) langSelect.value = lang;
}

/**
 * 2. GESTIÓN DE SONIDOS (Con soporte para archivos locales y Base64)
 */
function saveModuleRingtone(module, filename) {
    localStorage.setItem(`ringtone_${module}`, filename);
    
    let source;
    if (filename === "CUSTOM_FILE") {
        source = localStorage.getItem(`custom_audio_${module}`);
    } else {
        source = `assets/ringtones/${filename}`;
    }

    if (source) {
        const audio = new Audio(source);
        audio.play().catch(e => console.warn("Error al probar sonido:", e));
    }
}

function handleFileUpload(module, input) {
    const file = input.files[0];
    if (!file) return;

    const maxSize = 3 * 1024 * 1024; // 3MB límite para LocalStorage
    if (file.size > maxSize) {
        M.toast({ html: '⚠️ ' + getTxt('error_file_size', 'Máx 3MB'), classes: 'red' });
        input.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const base64Audio = e.target.result;
            localStorage.setItem(`custom_audio_${module}`, base64Audio);
            localStorage.setItem(`custom_name_${module}`, file.name);
            localStorage.setItem(`ringtone_${module}`, "CUSTOM_FILE");
            
            updateSelectWithCustom(module, file.name);
            
            M.toast({ html: '✅ ' + file.name });
            new Audio(base64Audio).play().catch(e => console.log(e));
        } catch (err) {
            M.toast({ html: '❌ Error: LocalStorage Full' });
        }
    };
    reader.readAsDataURL(file);
}

function updateSelectWithCustom(module, fileName) {
    const select = document.getElementById(`ringtone-${module}`);
    if (!select) return;

    let customOpt = select.querySelector('option[value="CUSTOM_FILE"]');
    if (!customOpt) {
        customOpt = document.createElement('option');
        customOpt.value = "CUSTOM_FILE";
        select.appendChild(customOpt);
    }
    customOpt.textContent = "⭐ " + fileName;
    customOpt.selected = true;
}

/**
 * 3. CONFIGURACIÓN DE INICIO
 */
function setStartModule(moduleId) {
    localStorage.setItem('startModule', moduleId);
    M.toast({ html: '✅ ' + getTxt('success_save', 'Actualizado') });
}

function goToStartModule() {
    const startModule = localStorage.getItem('startModule') || 'pomodoro';
    if (typeof showModule === "function") showModule(startModule);
}

/**
 * 4. EXPORTAR E IMPORTAR DATOS (BACKUP COMPLETO)
 */
function exportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_tools_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;

    if (!confirm(getTxt('confirm_import', '¿Continuar? Se sobrescribirán los datos actuales.'))) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
            location.reload();
        } catch (err) {
            M.toast({ html: '❌ Error JSON' });
        }
    };
    reader.readAsText(file);
}

/**
 * 5. TEMA Y VIBRACIÓN
 */
function changeTheme(theme) {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
    }
}

function toggleVibration(enabled) {
    localStorage.setItem('vibration', enabled);
    if (enabled && navigator.vibrate) navigator.vibrate(50);
}

/**
 * 6. GESTIÓN PREMIUM (Google Play Ready)
 */
function checkPremiumStatus() {
    const isPremium = localStorage.getItem('isPremium') === 'true';
    const card = document.getElementById('premium-card');
    
    if (isPremium) {
        // Si es premium, ocultamos botones de compra y mostramos estado activo
        if (document.getElementById('btn-get-premium')) document.getElementById('btn-get-premium').style.display = 'none';
        
        const restoreBtn = document.getElementById('btn-restore-premium');
        if (restoreBtn) {
            restoreBtn.innerHTML = `<i class="material-icons left">check_circle</i> ${getTxt('status_premium', 'Cuenta Premium Activada')}`;
            restoreBtn.onclick = null; // Desactivar clic
        }

        if (card) {
            card.style.background = 'linear-gradient(45deg, #fff176, #fffde7)';
            // En modo oscuro, un tono dorado más sutil
            if(document.body.classList.contains('dark-mode')) card.style.background = '#332b00';
        }

        // Aquí se eliminaría el contenedor de anuncios si existiera
        const adContainer = document.getElementById('ad-container');
        if (adContainer) adContainer.remove();
    }
}

async function purchasePremium() {
    if (localStorage.getItem('isPremium') === 'true') {
        alert(getTxt('already_premium', '¡Ya eres Premium!'));
        return;
    }

    if(confirm(getTxt('confirm_premium', '¿Deseas comprar la versión Premium para quitar anuncios?'))) {
        // Simulación de éxito de pasarela Google Play
        localStorage.setItem('isPremium', 'true');
        checkPremiumStatus();
        alert(getTxt('purchase_success', '¡Gracias por tu compra! Reiniciando...'));
        location.reload();
    }
}

async function restorePurchases() {
    M.toast({ html: getTxt('restoring_msg', 'Validando con Google Play...') });
    
    // Simulación de validación
    setTimeout(() => {
        const isPremium = localStorage.getItem('isPremium') === 'true';
        if (isPremium) {
            M.toast({ html: '✅ ' + getTxt('restore_ok', 'Suscripción restaurada') });
            checkPremiumStatus();
        } else {
            M.toast({ html: '❌ ' + getTxt('restore_none', 'Sin compras') });
        }
    }, 2000);
}

function deleteAllData() {
    if (confirm(getTxt('confirm_delete_all', '¿Eliminar TODO? Esta acción es irreversible.'))) {
        localStorage.clear();
        location.reload();
    }
}

function showPrivacy() {
    const title = getTxt('settings_privacy', 'Política de Privacidad');
    const body = getTxt('privacy_text', 'Contenido legal...');
    alert(title + "\n\n" + body);
}

/**
 * INICIALIZACIÓN
 */
document.addEventListener('DOMContentLoaded', () => {
    // A. Idioma y Tema
    const savedLang = localStorage.getItem('lang') || 'es';
    changeLanguage(savedLang);

    const savedTheme = localStorage.getItem('theme') || 'light';
    changeTheme(savedTheme);
    const themeSelect = document.getElementById('theme-select');
    if(themeSelect) themeSelect.value = savedTheme;

    // B. Vibración
    const vibEnabled = localStorage.getItem('vibration') === 'true';
    const vibSwitch = document.getElementById('vibration-switch');
    if(vibSwitch) vibSwitch.checked = vibEnabled;

    // C. Sonidos
    ['pomodoro', 'timer', 'reminders'].forEach(m => {
        const customName = localStorage.getItem(`custom_name_${m}`);
        if (customName) updateSelectWithCustom(m, customName);
        
        const savedRingtone = localStorage.getItem(`ringtone_${m}`) || 'ringtone.mp3';
        const selectEl = document.getElementById(`ringtone-${m}`);
        if (selectEl) selectEl.value = savedRingtone;
    });

    // D. Inicio
    const start = localStorage.getItem('startModule') || 'pomodoro';
    const startSelect = document.getElementById('start-module-select');
    if (startSelect) startSelect.value = start;

    // E. Estado Premium
    checkPremiumStatus();

});


