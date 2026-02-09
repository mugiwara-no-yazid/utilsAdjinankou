// Initialisation du QR code
let qrcode = null;

// Gestion de l'upload du logo
document.getElementById('logoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const fileName = document.getElementById('fileName');
    const dispLogo = document.getElementById('disp-logo');
    
    if (file) {
        fileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            dispLogo.src = event.target.result;
            dispLogo.style.display = 'block';
            updateVCard();
        };
        reader.readAsDataURL(file);
    } else {
        fileName.textContent = 'Aucun fichier choisi';
        dispLogo.style.display = 'none';
        dispLogo.src = '';
        updateVCard();
    }
});

// Mise à jour en temps réel des champs
document.getElementById('prenom').addEventListener('input', updateVCard);
document.getElementById('nom').addEventListener('input', updateVCard);
document.getElementById('poste').addEventListener('input', updateVCard);
document.getElementById('societe').addEventListener('input', updateVCard);
document.getElementById('telephone').addEventListener('input', updateVCard);
document.getElementById('email').addEventListener('input', updateVCard);
document.getElementById('site').addEventListener('input', updateVCard);

function updateVCard() {
    const prenom = document.getElementById('prenom').value || 'Prénom';
    const nom = document.getElementById('nom').value || 'Nom';
    const poste = document.getElementById('poste').value || 'Poste';
    const societe = document.getElementById('societe').value || 'Société';
    const telephone = document.getElementById('telephone').value || 'Téléphone';
    const email = document.getElementById('email').value || 'Email';
    const site = document.getElementById('site').value || 'Site web';
    
    // Mise à jour de l'affichage
    document.getElementById('disp-name').textContent = `${prenom} ${nom}`;
    document.getElementById('disp-job').textContent = `${poste} • ${societe}`;
    document.getElementById('disp-tel').textContent = telephone;
    document.getElementById('disp-email').textContent = email;
    document.getElementById('disp-site').textContent = site;
    
    // Génération du contenu vCard
    const vcardData = generateVCardString();
    
    // Mise à jour du QR code
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = '';
    
    qrcode = new QRCode(qrcodeDiv, {
        text: vcardData,
        width: 140,
        height: 140,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

function generateVCardString() {
    const prenom = document.getElementById('prenom').value || '';
    const nom = document.getElementById('nom').value || '';
    const poste = document.getElementById('poste').value || '';
    const societe = document.getElementById('societe').value || '';
    const telephone = document.getElementById('telephone').value || '';
    const email = document.getElementById('email').value || '';
    const site = document.getElementById('site').value || '';
    
    let vcard = 'BEGIN:VCARD\n';
    vcard += 'VERSION:3.0\n';
    vcard += `FN:${prenom} ${nom}\n`;
    vcard += `N:${nom};${prenom};;;\n`;
    
    if (poste) vcard += `TITLE:${poste}\n`;
    if (societe) vcard += `ORG:${societe}\n`;
    if (telephone) vcard += `TEL:${telephone}\n`;
    if (email) vcard += `EMAIL:${email}\n`;
    if (site) vcard += `URL:${site}\n`;
    
    vcard += 'END:VCARD';
    
    return vcard;
}

// Télécharger l'image PNG de la carte complète
async function downloadPNG() {
    const element = document.getElementById('vcard-to-print');
    
    try {
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
        });
        
        const link = document.createElement('a');
        const prenom = document.getElementById('prenom').value || 'Prenom';
        const nom = document.getElementById('nom').value || 'Nom';
        link.download = `vcard_${prenom}_${nom}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('Erreur lors de la génération du PNG:', error);
        alert('Erreur lors de la génération de l\'image');
    }
}

// Télécharger uniquement le QR code
function downloadQR() {
    const qrcodeDiv = document.getElementById('qrcode');
    const img = qrcodeDiv.querySelector('img');
    
    if (img) {
        const link = document.createElement('a');
        const prenom = document.getElementById('prenom').value || 'Prenom';
        const nom = document.getElementById('nom').value || 'Nom';
        link.download = `qrcode_${prenom}_${nom}.png`;
        link.href = img.src;
        link.click();
    } else {
        alert('Aucun QR code à télécharger');
    }
}

// Télécharger le fichier .vcf
function downloadVCF() {
    const vcardData = generateVCardString();
    const blob = new Blob([vcardData], { type: 'text/vcard' });
    const link = document.createElement('a');
    
    const prenom = document.getElementById('prenom').value || 'Prenom';
    const nom = document.getElementById('nom').value || 'Nom';
    link.download = `contact_${prenom}_${nom}.vcf`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

// Initialisation du QR code au chargement de la page
window.addEventListener('load', function() {
    updateVCard();
});