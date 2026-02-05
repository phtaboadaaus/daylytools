/**
 * LÓGICA DE INSTALACIÓN PWA
 */

let deferredPrompt;
const installBanner = document.getElementById('pwa-install-banner');
const btnInstall = document.getElementById('btn-install-pwa');

// 1. Detectar si ya está instalada la app
const isAppStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

if (!isAppStandalone) {
    // Escuchar evento para Android / Chrome en PC
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBanner) installBanner.style.display = 'block';
    });

    // Detectar iOS de forma más precisa
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        if (installBanner) installBanner.style.display = 'block';
        
        if (btnInstall) {
            btnInstall.addEventListener('click', () => {
                const modalEl = document.getElementById('modal-ios-install');
                // Intentar obtener la instancia, si no existe, inicializarla
                let instance = M.Modal.getInstance(modalEl);
                if (!instance) instance = M.Modal.init(modalEl);
                instance.open();
            });
        }
    }
}

// 2. Acción de instalar para Android/PC
if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                if (installBanner) installBanner.style.display = 'none';
            }
            deferredPrompt = null;
        }
    });
}

function hideInstallBanner() {
    if (installBanner) installBanner.style.display = 'none';
    localStorage.setItem('pwa_banner_dismissed', Date.now());
}
