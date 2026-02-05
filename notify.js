/**
 * SERVICIO GLOBAL DE NOTIFICACIONES Y AUDIO - Daily Tools
 * notify.js (Versión Final Blindada con Respaldo Interno)
 */

const globalAudio = new Audio();
const SILENCE_TRACK = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAAP5MYXZjNTguMzUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvwAAAAEALAAAAAAABQAAgAAAAP/7EMQAA9wAAAAAAAABAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA/+//xDDEAAAZ4AAAAAAAACAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA//sQxDsAAOWAAAAAAAANAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA//tQxH8AAO8AAAAAAAARAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA';

async function initNotifications() {
    if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
    }
    const unlockAudio = () => {
        globalAudio.src = SILENCE_TRACK;
        globalAudio.muted = true;
        globalAudio.play().then(() => {
            globalAudio.pause();
            globalAudio.muted = false;
        }).catch(e => console.log("Audio esperando interacción"));
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
}
initNotifications();

function mantenerAudioActivo() {
    try {
        globalAudio.src = SILENCE_TRACK;
        globalAudio.loop = true; 
        globalAudio.volume = 0;  
        globalAudio.play();
    } catch(e) {}
}

function detenerAudio() {
    globalAudio.pause();
    globalAudio.loop = false;
    globalAudio.volume = 1; 
}

function notify(titleKey, textKey, module = "pomodoro") {
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || i18n; 
    let title = (translations && translations[lang]) ? (translations[lang][titleKey] || titleKey) : titleKey;
    let text = (translations && translations[lang]) ? (translations[lang][textKey] || textKey) : textKey;

    // 1. INTENTO DE REPRODUCCIÓN DE AUDIO (No bloquea el resto)
    try {
        const saved = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
        let audioSource = (saved === "CUSTOM_FILE") 
            ? localStorage.getItem(`custom_audio_${module}`) 
            : `assets/ringtones/${saved}`;
        if (audioSource) {
            globalAudio.src = audioSource;
            globalAudio.loop = false;
            globalAudio.volume = 1.0;
            globalAudio.play().catch(err => console.warn("Audio bloqueado por el navegador"));
        }
    } catch (e) { console.error("Error en Audio:", e); }

    // 2. VENTANA INTERNA (Aviso en pantalla inmediato)
    if (typeof M !== 'undefined') {
        M.toast({html: `<div style="width:100%"><b>${title}</b><br>${text}</div>`, displayLength: 10000});
    }

    // 3. VIBRACIÓN
    if (localStorage.getItem('vibration') === 'true' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // 4. NOTIFICACIÓN EXTERNA (Con manejo de errores)
    const options = { 
        body: text, 
        icon: 'assets/splash.png', 
        badge: 'assets/splash.png',
        tag: 'dailytools-alert',
        renotify: true,
        requireInteraction: true,
        data: { url: window.location.href }
    };

    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
        }).catch(err => {
            new Notification(title, options);
        });
    } else if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, options);
    }
}
