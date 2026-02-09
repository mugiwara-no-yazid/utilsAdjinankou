const el = id => document.getElementById(id);
let logoData = null;
let logoName = '';

// Mise à jour de l'aperçu
function updatePreview() {
    const fullname = el('fullname').value.trim();
    const role = el('role').value.trim();
    const phone = el('phone').value.trim();
    const email = el('email').value.trim();
    const website = el('website').value.trim();
    const address = el('address').value.trim();
    const color = el('color').value;

    const p = el('previewInner');
    p.innerHTML = '';

    // Si tout est vide
    if (!fullname && !role && !phone && !email && !website && !logoData && !address) {
        p.innerHTML = '<div class="empty-preview">Remplissez les champs pour voir l\'aperçu</div>';
        el('removeLogo').style.display = 'none';
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'sig-container';

    const info = document.createElement('div');
    info.className = 'sig-info';

    if (fullname) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'sig-name';
        nameDiv.style.color = color;
        nameDiv.textContent = fullname;
        info.appendChild(nameDiv);
    }

    if (role) {
        const roleDiv = document.createElement('div');
        roleDiv.className = 'sig-role';
        roleDiv.textContent = role;
        info.appendChild(roleDiv);
    }

    const contact = document.createElement('div');
    contact.className = 'sig-contact';

    // On utilise des icônes simples ou du texte
    if (phone) contact.innerHTML += `<span>Tel: ${phone}</span><br>`;
    if (email) contact.innerHTML += `<span>E-mail: ${email}</span><br>`;
    if (website) contact.innerHTML += `<span>Site web: ${website}</span><br>`;
    if (address) contact.innerHTML += `<span>Adresse: ${address}</span><br>`;

    info.appendChild(contact);
    wrapper.appendChild(info);

    if (logoData) {
        const wrapperLogo = document.createElement('div');
        wrapperLogo.className = 'sig-logo-wrapper';
        const img = document.createElement('img');
        img.src = logoData;
        img.alt = logoName || 'logo';
        img.className = 'sig-logo';
        wrapperLogo.appendChild(img);
        wrapper.appendChild(wrapperLogo);
        el('removeLogo').style.display = 'block';
    } else {
        el('removeLogo').style.display = 'none';
    }

    p.appendChild(wrapper);
}

// Gestion du logo
el('logoInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) {
        logoData = null;
        logoName = '';
        updatePreview();
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        logoData = e.target.result;
        logoName = file.name;
        updatePreview();
    };
    reader.readAsDataURL(file);
});

// Supprimer le logo
el('removeLogo').addEventListener('click', () => {
    logoData = null;
    logoName = '';
    el('logoInput').value = '';
    updatePreview();
});

// Drag & Drop
const previewCard = el('previewCard');
previewCard.addEventListener('dragover', e => {
    e.preventDefault();
    previewCard.classList.add('drag-over');
});

previewCard.addEventListener('dragleave', () => {
    previewCard.classList.remove('drag-over');
});

previewCard.addEventListener('drop', e => {
    e.preventDefault();
    previewCard.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
        el('logoInput').files = e.dataTransfer.files;
        el('logoInput').dispatchEvent(new Event('change'));
    }
});

// Événements de mise à jour
['fullname', 'role', 'phone', 'email', 'website', 'address', 'color'].forEach(id => {
    el(id).addEventListener('input', updatePreview);
});

// Gestion de la couleur
el('colorCircle').style.backgroundColor = el('color').value;
el('colorCircle').addEventListener('click', () => el('color').click());

el('color').addEventListener('input', () => {
    const colorValue = el('color').value;
    el('colorCircle').style.backgroundColor = colorValue;
    el('colorValue').textContent = colorValue;
    updatePreview();
});

// Copier HTML (sans message)
el('copyHtml').addEventListener('click', () => {
    const html = el('previewInner').innerHTML;
    navigator.clipboard.writeText(html);
});

// Copier visuel (sans message)
el('copyVisual').addEventListener('click', () => {
    const clone = el('previewInner').cloneNode(true);
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.appendChild(clone);
    document.body.appendChild(tempDiv);

    const range = document.createRange();
    range.selectNode(clone);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    try {
        document.execCommand('copy');
    } catch (err) {}

    sel.removeAllRanges();
    document.body.removeChild(tempDiv);
});

// Télécharger PNG (sans message)
el('downloadPNG').addEventListener('click', () => {
    html2canvas(el('previewInner'), {
        backgroundColor: '#ffffff',
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'signature-email.png';
        link.click();
    });
});

// Fonction utilitaire pour afficher le Toast
function showToast(message) {
    // Supprime l'ancien toast s'il existe
    const oldToast = document.querySelector('.toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Force le reflow pour l'animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Disparaît après 3 secondes
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Copier HTML avec Toast
el('copyHtml').addEventListener('click', () => {
    const html = el('previewInner').innerHTML;
    navigator.clipboard.writeText(html).then(() => {
        showToast("Code HTML copié !");
    });
});

// Copier visuel avec Toast
el('copyVisual').addEventListener('click', () => {
    const clone = el('previewInner').cloneNode(true);
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.appendChild(clone);
    document.body.appendChild(tempDiv);

    const range = document.createRange();
    range.selectNode(clone);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    try {
        if (document.execCommand('copy')) {
            showToast("Signature copiée (prête à coller) !");
        }
    } catch (err) {
        showToast("Erreur lors de la copie");
    }

    sel.removeAllRanges();
    document.body.removeChild(tempDiv);
});

// Télécharger PNG avec Toast
el('downloadPNG').addEventListener('click', () => {
    // On prévient l'utilisateur car html2canvas peut prendre 1s
    showToast("Génération de l'image...");
    
    html2canvas(el('previewInner'), {
        backgroundColor: '#ffffff',
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'signature-email.png';
        link.click();
        showToast("Image téléchargée !");
    });
});

// Initialisation
updatePreview();