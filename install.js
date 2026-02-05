/**
 * LÓGICA DE INSTALACIÓN PWA
 */

let deferredPrompt;
const installBanner = document.getElementById('pwa-install-banner');
const btnInstall = document.getElementById('btn-install-pwa');

// 1. Detectar si ya está instalada la app
const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

if (!isAppStandalone) {
    // Si no está instalada, esperamos el evento de Android/Chrome
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // Mostramos el banner solo si es Android o PC
        installBanner.style.display = 'block';
    });

    // Detectar si es iOS (Safari no lanza beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        // En iOS, mostramos el banner, pero al darle a instalar abrimos el Modal de guía
        installBanner.style.display = 'block';
        btnInstall.addEventListener('click', () => {
            const modal = M.Modal.getInstance(document.getElementById('modal-ios-install'));
            modal.open();
        });
    }
}

// 2. Acción de instalar para Android/Chrome
btnInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('Usuario aceptó instalar');
            installBanner.style.display = 'none';
        }
        deferredPrompt = null;
    }
});

// 3. Función para ocultar el banner temporalmente
function hideInstallBanner() {
    installBanner.style.display = 'none';
    // Opcional: guardar en localStorage para no molestar en 24h
    localStorage.setItem('pwa_banner_dismissed', Date.now());
}

// Inicializar modales de Materialize (si no lo tienes ya en otro lado)
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
});
