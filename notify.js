/**
 * SERVICIO GLOBAL DE NOTIFICACIONES Y AUDIO - Daily Tools
 * notify.js (Versión Completa Blindada)
 */

// 1. CONFIGURACIÓN DE AUDIO GLOBAL
const globalAudio = new Audio();
// Pista de silencio para mantener el canal de audio abierto en segundo plano
const SILENCE_TRACK = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAAP5MYXZjNTguMzUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvwAAAAEALAAAAAAABQAAgAAAAP/7EMQAA9wAAAAAAAABAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA/+//xDDEAAAZ4AAAAAAAACAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA//sQxDsAAOWAAAAAAAANAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA//tQxH8AAO8AAAAAAAARAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA';

// 2. INICIALIZAR PERMISOS
async function initNotifications() {
    if ("Notification" in window) {
        if (Notification.permission === "default") {
            await Notification.requestPermission();
        }
    }
}
initNotifications();

// 3. FUNCIONES DE CONTROL DE AUDIO
function mantenerAudioActivo() {
    globalAudio.src = SILENCE_TRACK;
    globalAudio.loop = true; 
    globalAudio.volume = 0;  
    globalAudio.play().catch(e => console.log("Canal de audio en espera..."));
}

function detenerAudio() {
    globalAudio.pause();
    globalAudio.loop = false;
    globalAudio.volume = 1; 
}

// 4. FUNCIÓN PRINCIPAL DE NOTIFICACIÓN (Lógica Visual y Sonora)
function notify(titleKey, textKey, module = "pomodoro") {
    // A. Traducción de textos
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || i18n; 
    let title = (translations && translations[lang]) ? (translations[lang][titleKey] || titleKey) : titleKey;
    let text = (translations && translations[lang]) ? (translations[lang][textKey] || textKey) : textKey;

    // B. Gestión del Sonido de Alarma
    const saved = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
    let audioSource = (saved === "CUSTOM_FILE") 
        ? localStorage.getItem(`custom_audio_${module}`) 
        : `assets/ringtones/${saved}`;

    if (audioSource) {
        globalAudio.loop = false;
        globalAudio.volume = 1.0;
        globalAudio.src = audioSource;
        globalAudio.play().catch(e => console.warn("Error reproduciendo alarma:", e));
    }

    // C. Configuración de la Notificación para Android/iOS/PC
    const options = { 
        body: text, 
        icon: 'assets/splash.png', 
        badge: 'assets/splash.png',
        tag: 'dailytools-alert',    // Evita duplicados, reemplaza la anterior
        renotify: true,             // Fuerza aviso sonoro/vibración si ya existe una
        requireInteraction: true,   // Mantiene la notificación hasta que se descarte
        vibrate: [200, 100, 200, 100, 200], // Patrón de vibración del sistema
        silent: false,              // Asegura que no sea silenciosa
        data: {
            url: window.location.href 
        }
    };

    // D. Vibración Manual (como refuerzo)
    if (localStorage.getItem('vibration') === 'true' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // E. Lanzamiento de la Notificación Visual
    // Prioridad 1: Service Worker (Mejor para móviles y apps cerradas)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
        }).catch(err => {
            console.error("Fallo SW, usando notificación normal:", err);
            new Notification(title, options);
        });
    } 
    // Prioridad 2: Notificación de Navegador Estándar
    else if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, options);
    } 
    // Prioridad 3: Toast (Si todo lo anterior falla o no hay permisos)
    else {
        M.toast({html: `<b>${title}</b>: ${text}`, displayLength: 8000});
    }
}
