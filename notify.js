/**
 * SERVICIO GLOBAL DE NOTIFICACIONES, PERMISOS Y VIBRACIÓN (VERSIÓN DEFINITIVA)
 */

// 1. GESTIÓN DE AUDIO GLOBAL (Para evitar retrasos)
// Creamos el objeto fuera para que persista en memoria
let globalAudio = new Audio();

async function initNotifications() {
    // Pedir permisos si no se tienen
    if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
    }

    // "Despertar" el motor de audio con el primer clic del usuario
    const unlockAudio = () => {
        globalAudio.src = "assets/ringtones/ringtone.mp3"; 
        globalAudio.muted = true;
        // Reproducir y pausar inmediatamente para 'calentar' el canal de audio
        globalAudio.play().then(() => {
            globalAudio.pause();
            globalAudio.currentTime = 0;
            globalAudio.muted = false; // Ya lo dejamos listo y con volumen
            console.log("Audio desbloqueado y listo.");
        }).catch(e => console.log("Esperando interacción para audio..."));
        
        // Quitamos los listeners para que no se ejecute más veces
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
}

// Inicializamos al cargar el script
initNotifications();

/**
 * Función principal de notificación
 */
function notify(titleKey, textKey, module = "pomodoro") {
    // --- A. TRADUCCIÓN ---
    const lang = localStorage.getItem('lang') || 'es';
    const translations = window.i18n || i18n; 
    let title = titleKey;
    let text = textKey;

    if (translations && translations[lang]) {
        title = translations[lang][titleKey] || titleKey;
        text = translations[lang][textKey] || textKey;
    }

    // --- B. AUDIO INSTANTÁNEO ---
    const saved = localStorage.getItem(`ringtone_${module}`) || 'ringtone.mp3';
    let audioSource = (saved === "CUSTOM_FILE") 
        ? localStorage.getItem(`custom_audio_${module}`) 
        : `assets/ringtones/${saved}`;

    if (audioSource) {
        // Usamos el objeto global ya desbloqueado
        globalAudio.src = audioSource;
        globalAudio.play().catch(e => console.warn("El navegador bloqueó el audio:", e));
    }

    // --- C. VIBRACIÓN ---
    const vibrationEnabled = localStorage.getItem('vibration') === 'true';
    if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // --- D. NOTIFICACIÓN (Lógica Híbrida) ---
    const notifOptions = { 
        body: text,
        icon: 'assets/splash.png', 
        badge: 'assets/splash.png',
        vibrate: vibrationEnabled ? [200, 100, 200] : [],
        tag: module, // Agrupa notificaciones del mismo tipo
        renotify: true // Vuelve a sonar/vibrar si ya existe
    };

    // INTENTO 1: Usar Service Worker (Ideal para quitar la URL en APK)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, notifOptions);
        }).catch(err => {
            console.warn("Falló SW Notification, usando normal:", err);
            lanzarNotificacionNormal(title, notifOptions);
        });
    } 
    // INTENTO 2: Notificación Web Estándar (Como en tu código viejo)
    else if (window.Notification && Notification.permission === 'granted') {
        lanzarNotificacionNormal(title, notifOptions);
    } 
    // INTENTO 3: Fallback final (Alert)
    else {
        alert(`${title}\n\n${text}`);
    }
}

// Función auxiliar para la notificación estándar
function lanzarNotificacionNormal(title, options) {
    try {
        new Notification(title, options);
    } catch (e) {
        // Si todo falla, alerta visual
        alert(`${title}\n\n${options.body}`);
    }
}
