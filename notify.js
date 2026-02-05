/**
 * SERVICIO GLOBAL DE NOTIFICACIONES Y AUDIO - Daily Tools
 * notify.js (Versión de Rescate)
 */

const globalAudio = new Audio();
const SILENCE_TRACK = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAAP5MYXZjNTguMzUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvwAAAAEALAAAAAAABQAAgAAAAP/7EMQAA9wAAAAAAAABAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA/+//xDDEAAAZ4AAAAAAAACAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA//sQxDsAAOWAAAAAAAANAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA//tQxH8AAO8AAAAAAAARAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA';

async function initNotifications() {
    console.log("Iniciando sistema de notificaciones...");
    if ("Notification" in window) {
        if (Notification.permission === "default") {
            await Notification.requestPermission();
        }
        console.log("Permiso actual:", Notification.permission);
    }

    const unlockAudio = () => {
        globalAudio.src = SILENCE_TRACK;
        globalAudio.muted = true;
        globalAudio.play().then(() => {
            globalAudio.pause();
            globalAudio.muted = false;
            console.log("Audio desbloqueado por interacción");
        }).catch(e => console.error("Error al desbloquear audio:", e));
        
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
}
initNotifications();

function mantenerAudioActivo() {
    globalAudio.src = SILENCE_TRACK;
    globalAudio.loop = true; 
    globalAudio.volume = 0;  
    globalAudio.play().catch(e => console.warn("Fallo al mantener audio activo"));
}

function detenerAudio() {
    globalAudio.pause();
    globalAudio.loop = false;
    globalAudio.volume = 1; 
}

function notify(titleKey, textKey, module = "pomodoro") {
    console.log("Llamada a notify:", titleKey, textKey);
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || i18n; 
    let title = (translations && translations[lang]) ? (translations[lang][titleKey] || titleKey) : titleKey;
    let text = (translations && translations[lang]) ? (translations[lang][textKey] || textKey) : textKey;

    // AUDIO
    const saved = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
    let audioSource = (saved === "CUSTOM_FILE") 
        ? localStorage.getItem(`custom_audio_${module}`) 
        : `assets/ringtones/${saved}`;

    if (audioSource) {
        globalAudio.src = audioSource;
        globalAudio.loop = false;
        globalAudio.volume = 1.0;
        globalAudio.play()
            .then(() => console.log("Audio reproduciéndose:", audioSource))
            .catch(e => console.error("Error al reproducir audio:", e));
    }

    // VIBRACIÓN
    if (localStorage.getItem('vibration') === 'true' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // NOTIFICACIÓN
    const options = { 
        body: text, 
        icon: 'assets/splash.png', 
        badge: 'assets/splash.png',
        tag: 'dailytools-alert',
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: { url: window.location.href }
    };

    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            console.log("Enviando notificación vía Service Worker");
            registration.showNotification(title, options);
        }).catch(err => {
            console.error("Service Worker no listo:", err);
            new Notification(title, options);
        });
    } else if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, options);
    } else {
        console.warn("Permisos denegados o SW no disponible, usando Toast");
        M.toast({html: `<b>${title}</b>: ${text}`, displayLength: 8000});
    }
}
