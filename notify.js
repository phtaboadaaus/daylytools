/**
 * SERVICIO GLOBAL DE NOTIFICACIONES, PERMISOS Y VIBRACIÓN
 */

// Objeto global para evitar el retraso del audio
let globalAudio = new Audio();

// 1. FUNCIÓN PARA PEDIR PERMISOS Y DESPERTAR AUDIO
async function initNotifications() {
    // Pedir permisos
    if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
    }

    // DESPERTAR EL AUDIO (Esto quita el retraso de la primera vez)
    const unlockAudio = () => {
        globalAudio.src = "assets/ringtones/ringtone.mp3"; // Carga uno por defecto
        globalAudio.muted = true;
        globalAudio.play().then(() => {
            globalAudio.pause();
            globalAudio.muted = false;
            console.log("Audio desbloqueado correctamente");
        });
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
}

// Llamar al inicio
initNotifications();

/**
 * Función principal de notificación
 */
function notify(titleKey, textKey, module = "pomodoro") {
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || i18n; 

    let title = titleKey;
    let text = textKey;

    if (translations && translations[lang]) {
        title = translations[lang][titleKey] || titleKey;
        text = translations[lang][textKey] || textKey;
    }

    // --- GESTIÓN DE AUDIO (SIN RETRASO) ---
    const saved = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
    let audioSource = (saved === "CUSTOM_FILE") 
        ? localStorage.getItem(`custom_audio_${module}`) 
        : `assets/ringtones/${saved}`;

    if (audioSource) {
        globalAudio.src = audioSource;
        globalAudio.play().catch(e => console.warn("Error audio:", e));
    }

    // --- VIBRACIÓN ---
    const vibrationEnabled = localStorage.getItem('vibration') === 'true';
    if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // --- NOTIFICACIÓN DE SISTEMA (PARA APK/TWA) ---
    // Usamos el Service Worker para ocultar la URL
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: text,
                icon: 'assets/splash.png', // Usa el splash como icono
                badge: 'assets/splash.png', // Icono pequeño para la barra de estado
                vibrate: vibrationEnabled ? [200, 100, 200] : [],
                tag: module // Evita que se amontonen si es el mismo módulo
            });
        });
    } else {
        // Respaldo por si falla el Service Worker
        alert(`${title}\n\n${text}`);
    }
}