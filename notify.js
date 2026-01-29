/**
 * SERVICIO GLOBAL DE NOTIFICACIONES, PERMISOS Y VIBRACIÓN
 */

// 1. FUNCIÓN PARA PEDIR PERMISOS (Llamar al iniciar la App)
async function initNotifications() {
    if (!("Notification" in window)) {
        console.warn("Este dispositivo no soporta notificaciones de escritorio.");
        return;
    }

    if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Permisos de notificación concedidos.");
        }
    }
}

/**
 * Función principal de notificación
 * @param {string} titleKey - Clave de traducción para el título
 * @param {string} textKey - Clave de traducción para el mensaje
 * @param {string} module - Módulo que dispara ('pomodoro', 'timer', 'reminders')
 */
function notify(titleKey, textKey, module = "pomodoro") {
    // Obtener idioma y traducciones
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || i18n; 

    let title = titleKey;
    let text = textKey;

    if (translations && translations[lang]) {
        title = translations[lang][titleKey] || titleKey;
        text = translations[lang][textKey] || textKey;
    }

    // Gestionar Audio
    const saved = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
    let audioSource = (saved === "CUSTOM_FILE") 
        ? localStorage.getItem(`custom_audio_${module}`) 
        : `assets/ringtones/${saved}`;

    if (audioSource) {
        const audio = new Audio(audioSource);
        audio.play().catch(e => console.warn("Audio bloqueado por el navegador:", e));
    }

    // Lógica de Vibración
    const vibrationEnabled = localStorage.getItem('vibration') === 'true';
    if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // Notificación de Sistema (Push)
    if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, { 
            body: text,
            icon: 'assets/ic_launcher.png', // Opcional: añade tu icono aquí
            vibrate: vibrationEnabled ? [200, 100, 200] : []
        });
    }

    // Alerta Visual y Respaldo
    setTimeout(() => {
        alert(`${title}\n\n${text}`);
        if (navigator.vibrate) navigator.vibrate(0);
    }, 100);
}