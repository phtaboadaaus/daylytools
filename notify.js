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
        globalAudio.play().then(() => {
            globalAudio.pause();
            console.log("🔊 Audio desbloqueado correctamente");
        }).catch(() => console.log("Esperando interacción..."));
        document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
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
    globalAudio.currentTime = 0;
    globalAudio.loop = false;
    // Esto quita los Toasts de la pantalla
    if (typeof M !== 'undefined') {
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(t => {
            const instance = M.Toast.getInstance(t);
            if (instance) instance.dismiss();
        });
    }
}

function notify(titleKey, textKey, module = "pomodoro") {
    // 1. Traducciones
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || {}; 
    let title = (translations[lang] && translations[lang][titleKey]) ? translations[lang][titleKey] : titleKey;
    let text = (translations[lang] && translations[lang][textKey]) ? translations[lang][textKey] : textKey;

    // 2. Lógica de Audio
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
            globalAudio.loop = true;
            globalAudio.volume = 1.0;
            globalAudio.load(); 

            setTimeout(() => {
                globalAudio.play()
                    .catch(e => {
                        console.warn("Audio bloqueado, esperando clic:", e);
                        document.addEventListener('click', () => globalAudio.play(), {once:true});
                    });
            }, 1000); 
        }
    } catch (e) { console.error("Error audio:", e); }

    // 3. Ventana Interna (Toast Materialize)
    if (typeof M !== 'undefined') {
        const btnText = (translations[lang] && translations[lang]['btn_stop']) ? translations[lang]['btn_stop'] : 'OK';
        const toastHTML = `
            <div class="toast-content-wrapper">
                <div class="toast-text">
                    <b>${title}</b><br>
                    <span>${text}</span>
                </div>
                <button class="btn-flat btn-stop-alarm" onclick="detenerAudio()">
                    ${btnText}
                </button>
            </div>`;
        M.toast({ html: toastHTML, displayLength: 150000, classes: 'rounded alarm-toast' });
    }

    // 4. Vibración (Navegador abierto)
    if (localStorage.getItem('vibration') === 'true' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // 5. NOTIFICACIÓN DE SISTEMA (Service Worker)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            // Enviamos los datos para que el SW los muestre con botones y vibración
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    title: title,
                    text: text
                });
            } else {
                // Si no hay controlador (pasa al refrescar), la lanzamos directamente desde el registro
                reg.showNotification(title, {
                    body: text,
                    icon: 'assets/splash.png',
                    badge: 'assets/favicon-16x16.png',
                    vibrate: [1000, 500, 1000],
                    requireInteraction: true,
                    tag: 'dailytools-alert',
                    renotify: true,
                    actions: [{ action: 'stop', title: 'DETENER ALARMA' }]
                });
            }
        });
    }
}














