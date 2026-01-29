let notes = JSON.parse(localStorage.getItem('notes')) || [];
const notesListEl = document.getElementById('notes-list');

// FUNCIÓN DE AYUDA: Obtiene traducción de forma segura
function getTxt(key, fallback) {
    try {
        const lang = localStorage.getItem('lang') || 'es';
        if (window.i18n && window.i18n[lang] && window.i18n[lang][key]) {
            return window.i18n[lang][key];
        }
    } catch (e) {
        console.warn("Error en traducciones de notas:", e);
    }
    return fallback;
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function renderNotes() {
    if (!notesListEl) return;
    notesListEl.innerHTML = '';
    
    notes.forEach((n, i) => {
        // Crear Tarjeta
        const card = document.createElement('div');
        card.classList.add('note-card');
        
        // Al hacer clic en la tarjeta, se edita
        card.onclick = (e) => {
            if (e.target.closest('.btn-delete-note')) return;
            openEditModal(i);
        };

        // Contenido de la nota
        const content = document.createElement('div');
        content.classList.add('note-content');
        content.textContent = n;

        // Footer con botón borrar
        const footer = document.createElement('div');
        footer.classList.add('note-footer');

        const del = document.createElement('button');
        del.className = 'btn-floating btn-small btn-delete-note waves-effect';
        del.innerHTML = '<i class="material-icons">delete</i>';
        del.onclick = (e) => {
            e.stopPropagation(); 
            // Uso de traducción para la confirmación
            const confirmMsg = getTxt('notes_confirm_delete', '¿Eliminar esta nota?');
            if(confirm(confirmMsg)) {
                notes.splice(i, 1);
                saveNotes();
                renderNotes();
            }
        };

        footer.appendChild(del);
        card.appendChild(content);
        card.appendChild(footer);
        
        notesListEl.appendChild(card);
    });
}

function openEditModal(index) {
    const modalEl = document.getElementById('note-modal');
    const instance = M.Modal.init(modalEl);
    const textArea = document.getElementById('modal-note-text');
    const modalTitle = modalEl.querySelector('h4');
    
    // Traducir título del modal si existe
    if (modalTitle) modalTitle.textContent = getTxt('modal_note_title', 'Editar Nota');
    
    textArea.value = notes[index];
    instance.open();

    // Reasignar evento guardar
    document.getElementById('save-modal-note').onclick = () => {
        if (textArea.value.trim() !== "") {
            notes[index] = textArea.value.trim();
            saveNotes();
            renderNotes();
            instance.close();
        }
    };
}

function saveNote() {
    const input = document.getElementById('note-input');
    const text = input.value.trim();
    if (!text) {
        // Uso de traducción para el error
        const errorMsg = getTxt('notes_error_empty', 'Escribe algo en la nota primero');
        M.toast({html: errorMsg});
        return;
    }
    notes.push(text);
    saveNotes();
    renderNotes();
    input.value = '';
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    M.Modal.init(document.querySelectorAll('.modal'));

    // Traducir placeholders iniciales
    const mainInput = document.getElementById('note-input');
    if (mainInput) {
        mainInput.placeholder = getTxt('placeholder_notes', 'Escribe tu nota aquí...');
    }

    renderNotes();
});