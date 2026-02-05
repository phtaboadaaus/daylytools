/**
 * SERVICIO GLOBAL DE NOTIFICACIONES Y AUDIO - Daily Tools
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
        }).catch(e => console.log("Esperando interacción..."));
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
}
initNotifications();

function detenerAudio() {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio.loop = false;
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
    const translations = window.i18n || {}; 
    let title = (translations[lang] && translations[lang][titleKey]) ? translations[lang][titleKey] : titleKey;
    let text = (translations[lang] && translations[lang][textKey]) ? translations[lang][textKey] : textKey;

    // AUDIO - Sincronizado con settings.js
    try {
        const filename = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
        let source = (filename === "CUSTOM_FILE") 
            ? localStorage.getItem(`custom_audio_${module}`) 
            : `assets/ringtones/${filename}`;

        if (source) {
            globalAudio.src = source;
            globalAudio.loop = true;
            globalAudio.volume = 1.0;
            // Un pequeño delay de 100ms para evitar el conflicto con el reset de los timers
            setTimeout(() => {
                globalAudio.play()
                    .then(() => console.log("Audio sonando..."))
                    .catch(e => console.error("Error play:", e));
            }, 100);
        }
    } catch (e) { console.error("Error Audio:", e); }

    // NOTIFICACIÓN INTERNA (Materialize)
    if (typeof M !== 'undefined') {
        const btnText = (translations[lang] && translations[lang]['btn_stop']) ? translations[lang]['btn_stop'] : 'OK';
        M.toast({
            html: `<span><b>${title}</b><br>${text}</span><button class="btn-flat toast-action" onclick="detenerAudio()" style="color:#ffeb3b; font-weight:bold; margin-left:10px;">${btnText}</button>`,
            displayLength: 150000,
            classes: 'rounded'
        });
    }

    // NOTIFICACIÓN EXTERNA
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, {
                body: text,
                icon: 'assets/splash.png',
                tag: 'dailytools-alert',
                renotify: true,
                requireInteraction: true
            });
        });
    }
}
