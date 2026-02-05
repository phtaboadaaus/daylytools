/**
 * SERVICIO GLOBAL DE NOTIFICACIONES Y AUDIO - Daily Tools
 * notify.js (Versión Sincronizada con Settings.js)
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

function detenerAudio() {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio.loop = false;
    // Cerramos los Toasts de Materialize
    if (typeof M !== 'undefined') {
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(t => {
            const instance = M.Toast.getInstance(t);
            if (instance) instance.dismiss();
        });
    }
}

function notify(titleKey, textKey, module = "pomodoro") {
    // 1. OBTENER TRADUCCIONES (Sincronizado con getTxt de settings.js)
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || {}; 
    let title = (translations[lang] && translations[lang][titleKey]) ? translations[lang][titleKey] : titleKey;
    let text = (translations[lang] && translations[lang][textKey]) ? translations[lang][textKey] : textKey;

    // 2. LOGICA DE AUDIO (Copiada exactamente de saveModuleRingtone en settings.js)
    try {
        const filename = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
        let source;
        
        if (filename === "CUSTOM_FILE") {
            source = localStorage.getItem(`custom_audio_${module}`);
        } else {
            source = `assets/ringtones/${filename}`;
        }

        if (source) {
            globalAudio.pause();
            globalAudio.src = source;
            globalAudio.loop = true; // Para que la alarma no pare hasta que el usuario le de a OK
            globalAudio.volume = 1.0;
            globalAudio.play().catch(err => {
                console.warn("Reintentando audio en 1s por bloqueo de navegador...");
                setTimeout(() => globalAudio.play(), 1000);
            });
        }
    } catch (e) { console.error("Error cargando audio:", e); }

    // 3. VENTANA INTERNA PERSISTENTE (Híbrida)
    if (typeof M !== 'undefined') {
        const btnText = (translations[lang] && translations[lang]['btn_stop']) ? translations[lang]['btn_stop'] : 'OK';
        const toastHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span><b>${title}</b><br>${text}</span>
                <button class="btn-flat toast-action" onclick="detenerAudio()" style="color:#ffeb3b; font-weight:bold; margin-left:10px; border:1px solid #ffeb3b; border-radius:4px;">${btnText}</button>
            </div>
        `;
        M.toast({
            html: toastHTML, 
            displayLength: 300000, // 5 minutos (Persistente)
            classes: 'rounded pulse'
        });
    }

    // 4. VIBRACIÓN
    if (localStorage.getItem('vibration') === 'true' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // 5. NOTIFICACIÓN EXTERNA (Sistema Operativo)
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
