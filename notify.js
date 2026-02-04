/**
 * SERVICIO GLOBAL DE NOTIFICACIONES Y AUDIO
 * notify.js
 */

// Creamos el audio globalmente
const globalAudio = new Audio();
// Pista de silencio (base64 de un mp3 vacío muy corto) para mantener el canal abierto
const SILENCE_TRACK = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////wAAAP5MYXZjNTguMzUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvwAAAAEALAAAAAAABQAAgAAAAP/7EMQAA9wAAAAAAAABAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA/+//xDDEAAAZ4AAAAAAAACAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA//sQxDsAAOWAAAAAAAANAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA//tQxH8AAO8AAAAAAAARAAAAAA5UAICAAAAAAAAAAAAAAAAAAAAAA';

// 1. INICIALIZAR (Pedir permisos)
async function initNotifications() {
    if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
    }
}
initNotifications();

// 2. FUNCIÓN PARA MANTENER EL AUDIO DESPIERTO (Llamar al iniciar Timer)
function mantenerAudioActivo() {
    globalAudio.src = SILENCE_TRACK;
    globalAudio.loop = true; // Bucle infinito
    globalAudio.volume = 0;  // Silencio total
    globalAudio.play().catch(e => console.log("Audio background iniciado"));
}

// 3. FUNCIÓN PARA DETENER EL "MANTENEDOR"
function detenerAudio() {
    globalAudio.pause();
    globalAudio.loop = false;
    globalAudio.volume = 1; // Restaurar volumen
}

// 4. FUNCIÓN PRINCIPAL DE NOTIFICACIÓN
function notify(titleKey, textKey, module = "pomodoro") {
    // A. Preparar textos
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || i18n; 
    let title = (translations && translations[lang]) ? (translations[lang][titleKey] || titleKey) : titleKey;
    let text = (translations && translations[lang]) ? (translations[lang][textKey] || textKey) : textKey;

    // B. CAMBIAR AUDIO (El canal ya está abierto, el cambio es instantáneo)
    const saved = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
    let audioSource = (saved === "CUSTOM_FILE") 
        ? localStorage.getItem(`custom_audio_${module}`) 
        : `assets/ringtones/${saved}`;

    if (audioSource) {
        // Ya no hacemos play() desde cero, sino que cambiamos el src del audio que ya está corriendo
        globalAudio.loop = false;
        globalAudio.volume = 1.0;
        globalAudio.src = audioSource;
        globalAudio.play().catch(e => console.warn("Error reproduciendo alarma:", e));
    }

    // C. VIBRACIÓN
    if (localStorage.getItem('vibration') === 'true' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // D. MOSTRAR NOTIFICACIÓN VISUAL (Primero Audio, luego Notificación)
    const options = { 
        body: text, 
        icon: 'assets/splash.png', 
        badge: 'assets/splash.png',
        tag: 'dailytools-timer',
        renotify: true
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => reg.showNotification(title, options));
    } else if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, options);
    } else {
        // Fallback visual si todo falla
        M.toast({html: title + ": " + text, displayLength: 4000});
    }
}
