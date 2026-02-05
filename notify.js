/**
 * SERVICIO GLOBAL DE NOTIFICACIONES Y AUDIO - Daily Tools
 */

const globalAudio = new Audio();
// Pista de silencio para mantener el canal abierto y evitar bloqueos
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
        }).catch(e => console.log("Esperando interacción para audio"));
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
    // 1. Traducciones (Sincronizado con languages.js/settings.js)
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || {}; 
    let title = (translations[lang] && translations[lang][titleKey]) ? translations[lang][titleKey] : titleKey;
    let text = (translations[lang] && translations[lang][textKey]) ? translations[lang][textKey] : textKey;

    // 2. Lógica de Audio (Soporte archivos locales y subidos)
   // 2. Lógica de Audio
    try {
        const filename = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
        let source;
        
        if (filename === "CUSTOM_FILE") {
            source = localStorage.getItem(`custom_audio_${module}`);
        } else {
            // USAMOS RUTA RELATIVA A LA RAÍZ (sin el punto inicial)
            // Esto es lo más compatible para GitHub Pages
            source = `assets/ringtones/${filename}`;
        }

        if (source) {
            console.log("Intentando cargar:", source);
            
            globalAudio.pause();
            globalAudio.src = source;
            globalAudio.loop = true;
            globalAudio.volume = 1.0;

            // IMPORTANTE: Forzamos la carga antes de intentar reproducir
            globalAudio.load(); 

            setTimeout(() => {
                globalAudio.play().then(() => {
                    console.log("✅ ¡SONANDO!");
                }).catch(e => {
                    console.error("❌ Error de reproducción:", e);
                    // Si falla por la ruta, intentamos un último recurso:
                    if (!source.startsWith('data:')) {
                        globalAudio.src = 'ringtone.mp3'; // Intento desesperado si está en la raíz
                        globalAudio.play().catch(() => {});
                    }
                });
            }, 200);
        }
    } catch (e) { console.error("Error crítico notify.js:", e); }

    // 3. Ventana Interna (Toast Persistente con botón OK)
    if (typeof M !== 'undefined') {
        const btnText = (translations[lang] && translations[lang]['btn_stop']) ? translations[lang]['btn_stop'] : 'OK';
        const toastHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span><b>${title}</b><br>${text}</span>
                <button class="btn-flat toast-action" onclick="detenerAudio()" style="color:#ffeb3b; font-weight:bold; margin-left:10px; border:1px solid #ffeb3b; border-radius:4px;">${btnText}</button>
            </div>
        `;
        M.toast({ html: toastHTML, displayLength: 150000, classes: 'rounded' });
    }

    // 4. Vibración
    if (localStorage.getItem('vibration') === 'true' && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // 5. Notificación de Sistema
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
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





