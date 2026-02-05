/**
 * SERVICIO GLOBAL DE NOTIFICACIONES Y AUDIO - Daily Tools
 * notify.js (Versión Profesional - Notificación Persistente)
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
    // Al detener, quitamos los Toasts activos
    if (typeof M !== 'undefined') {
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(t => {
            const instance = M.Toast.getInstance(t);
            if (instance) instance.dismiss();
        });
    }
}

function notify(titleKey, textKey, module = "pomodoro") {
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || i18n; 
    let title = (translations && translations[lang]) ? (translations[lang][titleKey] || titleKey) : titleKey;
    let text = (translations && translations[lang]) ? (translations[lang][textKey] || textKey) : textKey;

    // 1. REPRODUCCIÓN DE AUDIO (Forzada)
    try {
        const saved = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
        let audioSource = (saved === "CUSTOM_FILE") 
            ? localStorage.getItem(`custom_audio_${module}`) 
            : `assets/ringtones/${saved}`;
        
        if (audioSource) {
            globalAudio.pause(); // Reset por si acaso
            globalAudio.src = audioSource;
            globalAudio.loop = false;
            globalAudio.volume = 1.0;
            globalAudio.play().catch(err => {
                console.warn("Audio bloqueado, intentando de nuevo en 1s...");
                setTimeout(() => globalAudio.play(), 1000);
            });
        }
    } catch (e) { console.error("Error en Audio:", e); }

    // 2. VENTANA INTERNA (Persistente hasta click)
    if (typeof M !== 'undefined') {
        // Creamos un toast que dura mucho tiempo (casi fijo)
        // Añadimos un botón de cerrar para que sea profesional
        const toastHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span><b>${title}</b><br>${text}</span>
                <button class="btn-flat toast-action" onclick="detenerAudio()" style="color:#ffeb3b; font-weight:bold; margin-left:10px;">OK</button>
            </div>
        `;
        M.toast({
            html: toastHTML, 
            displayLength: 150000, // 2.5 minutos
            classes: 'rounded alert-toast'
        });
    }

    // 3. VIBRACIÓN
    if (localStorage.getItem('vibration') === 'true' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // 4. NOTIFICACIÓN EXTERNA
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
        });
    } else if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, options);
    }
}
