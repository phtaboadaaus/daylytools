/**
 * SERVICIO GLOBAL DE NOTIFICACIONES Y AUDIO - Daily Tools
 * notify.js (Versión Híbrida Blindada)
 */

// 1. CONFIGURACIÓN DE AUDIO GLOBAL
const globalAudio = new Audio();
// Pista de silencio para mantener el canal abierto
const SILENCE_TRACK = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAAP5MYXZjNTguMzUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvwAAAAEALAAAAAAABQAAgAAAAP/7EMQAA9wAAAAAAAABAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA/+//xDDEAAAZ4AAAAAAAACAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA//sQxDsAAOWAAAAAAAANAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA//tQxH8AAO8AAAAAAAARAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA';

// 2. INICIALIZAR PERMISOS Y DESBLOQUEO DE AUDIO
async function initNotifications() {
    // Pedir permisos de notificación
    if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
    }

    // DESBLOQUEO NATIVO: El audio solo funciona si el usuario toca la pantalla
    const unlockAudio = () => {
        globalAudio.src = SILENCE_TRACK;
        globalAudio.muted = true;
        globalAudio.play().then(() => {
            globalAudio.pause();
            globalAudio.muted = false;
            console.log("Canal de audio desbloqueado por el usuario");
        }).catch(e => console.log("Esperando interacción..."));
        
        // Limpiar eventos para que no se ejecute más de una vez
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
}
initNotifications();

// 3. FUNCIONES DE CONTROL (Mantenedor)
function mantenerAudioActivo() {
    globalAudio.src = SILENCE_TRACK;
    globalAudio.loop = true; 
    globalAudio.volume = 0;  
    globalAudio.play().catch(e => console.log("Audio background iniciado"));
}

function detenerAudio() {
    globalAudio.pause();
    globalAudio.loop = false;
    globalAudio.volume = 1; 
}

// 4. FUNCIÓN PRINCIPAL DE NOTIFICACIÓN
function notify(titleKey, textKey, module = "pomodoro") {
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || i18n; 
    let title = (translations && translations[lang]) ? (translations[lang][titleKey] || titleKey) : titleKey;
    let text = (translations && translations[lang]) ? (translations[lang][textKey] || textKey) : textKey;

    // A. AUDIO: Cambiamos la fuente y disparamos
    const saved = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
    let audioSource = (saved === "CUSTOM_FILE") 
        ? localStorage.getItem(`custom_audio_${module}`) 
        : `assets/ringtones/${saved}`;

    if (audioSource) {
        globalAudio.loop = false;
        globalAudio.volume = 1.0;
        globalAudio.src = audioSource;
        globalAudio.play().catch(e => console.warn("Error audio:", e));
    }

    // B. VIBRACIÓN
    const vibrationEnabled = localStorage.getItem('vibration') === 'true';
    if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // C. CONFIGURACIÓN VISUAL
    const options = { 
        body: text, 
        icon: 'assets/splash.png', 
        badge: 'assets/splash.png',
        tag: 'dailytools-alert',
        renotify: true,
        requireInteraction: true,
        vibrate: vibrationEnabled ? [200, 100, 200] : [],
        data: { url: window.location.href }
    };

    // D. LANZAMIENTO
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
        });
    } else if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, options);
    } else {
        M.toast({html: `<b>${title}</b>: ${text}`, displayLength: 8000});
    }
}
