// recupération des éléments HTML
const inputText = document.getElementById('inputText');
const urlInput = document.getElementById('urlInput');
const extractBtn = document.getElementById('extractBtn');
const keywordsInput = document.getElementById('keywords');

const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');
const readTime = document.getElementById('readTime');
const sentenceCount = document.getElementById('sentenceCount');
const keywordDensity = document.getElementById('keywordDensity');

const wordMeter = document.getElementById('wordMeter');
const charMeter = document.getElementById('charMeter');
const readMeter = document.getElementById('readMeter');
const sentenceMeter = document.getElementById('sentenceMeter');
const keywordMeter = document.getElementById('keywordMeter');

const keywordList = document.getElementById('keywordList');

// Écouteurs d'événements
inputText.addEventListener('input', analyzeText);
keywordsInput.addEventListener('input', analyzeText);
extractBtn.addEventListener('click', extractContent);

// Fonction principale d'analyse
function analyzeText() {
  const text = inputText.value.trim();
  const keywords = keywordsInput.value.trim();

  if (!text) {
    resetMetrics();
    return;
  }

  // calcul des métriques
  const words = countWords(text);
  const chars = text.length;
  const sentences = countSentences(text);
  const readingTime = Math.ceil(words / 200); 
  
  // Mise à jour des valeurs
  updateMetric(wordCount, wordMeter, words, 1000, 'words');
  updateMetric(charCount, charMeter, chars, 5000, 'chars');
  updateMetric(readTime, readMeter, readingTime, 15, 'time', ' min');
  updateMetric(sentenceCount, sentenceMeter, sentences, 50, 'sentences');

  // Analyse des mots-clés
  if (keywords) {
    analyzeKeywords(text, keywords, words);
  } else {
    keywordList.classList.remove('visible');
  }
}

// Compte des mots
function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Compte des phrases
function countSentences(text) {
  const sentences = text.match(/[.!?]+/g);
  return sentences ? sentences.length : 0;
}

// Analyse des mots-clés
function analyzeKeywords(text, keywordsStr, totalWords) {
  const keywordsArray = keywordsStr.split(',').map(k => k.trim()).filter(k => k);
  const keywordStats = [];

  if (totalWords === 0) {
    keywordList.classList.remove('visible');
    return;
  }

  keywordsArray.forEach(keyword => {
    const variations = keyword.split('|').map(v => v.trim());
    let totalCount = 0;

    variations.forEach(variation => {
      if (variation.length > 0) {
        const regex = new RegExp(`\\b${variation}\\b`, 'gi');
        const matches = text.match(regex);
        totalCount += matches ? matches.length : 0;
      }
    });

    // Calcul de la densité 
    const density = totalCount > 0 ? ((totalCount / totalWords) * 100).toFixed(2) : '0.00';
    keywordStats.push({
      keyword: keyword,
      count: totalCount,
      density: parseFloat(density)
    });
  });

  // Affichage des résultats
  if (keywordStats.length > 0) {
    displayKeywordStats(keywordStats);
    
    const foundKeywords = keywordStats.filter(k => k.count > 0);
    const avgDensity = foundKeywords.length > 0 
      ? (foundKeywords.reduce((sum, k) => sum + k.density, 0) / foundKeywords.length).toFixed(2)
      : '0.00';
    
    updateMetric(keywordDensity, keywordMeter, parseFloat(avgDensity), 10, 'density', '%');
  } else {
    keywordList.classList.remove('visible');
    updateMetric(keywordDensity, keywordMeter, 0, 10, 'density', '%');
  }
}

// Affichage des statistiques des mots-clés
function displayKeywordStats(stats) {
  let html = '</br> <h3> Occurrences des mots-clés</h3> </br>';
  
  stats.forEach(stat => {
    
    html += `
      <div class="keyword-item">
        <div>
          <span class="keyword-name">${stat.keyword}</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="keyword-count">${stat.count}</span>
        </div>
      </div>
    `;
  });

  keywordList.innerHTML = html;
  keywordList.classList.add('visible');
}

// Mise à jour des métriques
function updateMetric(element, meter, value, maxValue, type, suffix = '') {
  element.textContent = value + suffix;
  
  // Calcul dupourcentage pour la barre
  const percentage = Math.min((value / maxValue) * 100, 100);
  meter.style.width = percentage + '%';

  // Application des couleurs
  setMeterColor(element, meter, value, maxValue, type);
}

function setMeterColor(element, meter, value, maxValue, type) {
  element.classList.remove('red', 'orange', 'green');
  meter.classList.remove('red', 'orange', 'green');

  let isOptimal = false;

  switch(type) {
    case 'words':
      if (value >= 300 && value <= 1500) isOptimal = true;
      else if (value < 100) {
        element.classList.add('red');
        meter.classList.add('red');
      } else if (value < 300 || value > 2000) {
        element.classList.add('orange');
        meter.classList.add('orange');
      } else {
        element.classList.add('green');
        meter.classList.add('green');
      }
      break;
    
    case 'chars':
      if (value >= 1500 && value <= 5000) isOptimal = true;
      else if (value < 500) {
        element.classList.add('red');
        meter.classList.add('red');
      } else if (value < 1500 || value > 7000) {
        element.classList.add('orange');
        meter.classList.add('orange');
      } else {
        element.classList.add('green');
        meter.classList.add('green');
      }
      break;
    
    case 'time':
      if (value >= 2 && value <= 10) isOptimal = true;
      else if (value < 1) {
        element.classList.add('red');
        meter.classList.add('red');
      } else if (value < 2 || value > 15) {
        element.classList.add('orange');
        meter.classList.add('orange');
      } else {
        element.classList.add('green');
        meter.classList.add('green');
      }
      break;
    
    case 'sentences':
      if (value >= 10 && value <= 50) isOptimal = true;
      else if (value < 5) {
        element.classList.add('red');
        meter.classList.add('red');
      } else if (value < 10 || value > 80) {
        element.classList.add('orange');
        meter.classList.add('orange');
      } else {
        element.classList.add('green');
        meter.classList.add('green');
      }
      break;
    
    case 'density':
      if (value >= 2 && value <= 5) {
        element.classList.add('green');
        meter.classList.add('green');
      } else if (value > 0 && value < 2) {
        element.classList.add('orange');
        meter.classList.add('orange');
      } else if (value > 5) {
        element.classList.add('red');
        meter.classList.add('red');
      } else if (value === 0) {
        element.classList.remove('red', 'orange', 'green');
        meter.classList.remove('red', 'orange', 'green');
      }
      break;
  }
}

// Extraction du contenu d'une URL
async function extractContent() {
  const url = urlInput.value.trim();

  if (!url) {
    showError('Veuillez entrer une URL valide');
    return;
  }

  // Validation de l'URL
  if (!isValidUrl(url)) {
    showError('URL invalide. Assurez-vous qu\'elle commence par http:// ou https://');
    return;
  }

  extractBtn.disabled = true;
  extractBtn.textContent = 'Extraction en cours...';

  // Essaie de chargement du contenu de l'URL avec plusieurs méthodes
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ];

  let success = false;
  let lastError = null;

  for (let proxyUrl of proxies) {
    try {
      console.log('Tentative avec proxy:', proxyUrl.split('?')[0]);
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      let htmlContent = '';
      
      // Gestion des différents formats de réponse
      if (proxyUrl.includes('allorigins')) {
        const data = await response.json();
        htmlContent = data.contents;
      } else if (proxyUrl.includes('codetabs')) {
        const data = await response.json();
        htmlContent = data.contents;
      } else {
        htmlContent = await response.text();
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Extraction des balises H (H1, H2, H3, H4, H5, H6)
      const headings = extractHeadings(doc);
      
      // Extraction du texte du body
      const bodyText = doc.body.textContent || '';
      
      if (headings.length === 0 && !bodyText.trim()) {
        throw new Error('Aucun contenu trouvé');
      }

      if (bodyText.trim()) {
        const textWithHeadings = headings.map(h => `${h.text}`).join('\n\n');
        const fullText = `${textWithHeadings}\n\n${bodyText}`;
        
        inputText.value = fullText;
        analyzeText();
        
        // Affichage de la structure des headings
        if (headings.length > 0) {
          displayHeadingStructure(headings);
        }
        
        showSuccess(`✓ Contenu extrait avec succès ! (${headings.length} titres trouvés)`);
        success = true;
        break;
      }
    } catch (error) {
      lastError = error.message;
      console.log('Proxy échoué:', error.message);
      continue;
    }
  }

  if (!success) {
    showError('Impossible d\'accéder à cette URL.\n\nCe site bloque probablement les requêtes externes.');
  }

  extractBtn.disabled = false;
  extractBtn.textContent = 'Extraire le contenu';
}

// Valider l'URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Extraction des balises H1 H2 H3 H4 H5 H6
function extractHeadings(doc) {
  const headings = [];
  const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headingElements.forEach(element => {
    const level = parseInt(element.tagName[1]);
    const text = element.textContent.trim();
    
    if (text) {
      headings.push({
        level: level,
        tag: element.tagName,
        text: text,
        indent: 1 * 20
      });
    }
  });

  return headings;
}

function displayHeadingStructure(headings) {
  let html = '</br><h3>Structure de la page</h3></br>';
  
  headings.forEach(heading => {
    html += `
      <div class="heading-item" style="margin-left: ${heading.indent}px; padding: 8px 12px; background: #f5f5f5; border-left: 3px solid ; border-radius: 4px; margin-bottom: 6px;">
        <span style="color: #666; font-size: 12px; font-weight: 600;">${heading.tag}</span>
        <span style="margin-left: 8px; color: #333;">${heading.text}</span>
        </br>
      </div>
    `;
  });

  const structureList = document.getElementById('structureList');
  structureList.innerHTML = html;
  structureList.classList.add('visible');
}

// Affichage d'un message d'erreur (notif)
function showError(message) {
  removeExistingNotification();
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'notification notification-error';
  errorDiv.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">⚠️</span>
      <div class="notification-message-wrapper">
        <span class="notification-message">${message}</span>
        ${message.includes('URL') ? `
          <div class="notification-solutions">
            <span class="solutions-title">Solutions alternatives :</span>
            <ol>
              <li>Copiez le code source de la page (Ctrl+U) et collez-le dans le champ texte ci-dessus</li>
              <li>Utilisez une extension navigateur pour contourner les CORS</li>
              <li>Vérifiez que l'URL est accessible publiquement</li>
            </ol>
          </div>
        ` : ''}
      </div>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  
  document.body.appendChild(errorDiv);
  setTimeout(() => {
    if (errorDiv.parentElement) errorDiv.remove();
  }, 6000);
}

// Affichage d'un message de succès (notif)
function showSuccess(message) {
  removeExistingNotification();
  
  const successDiv = document.createElement('div');
  successDiv.className = 'notification notification-success';
  successDiv.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">✓</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 4000);
}

// Suppression des notifications existantes
function removeExistingNotification() {
  const existing = document.querySelectorAll('.notification');
  existing.forEach(notif => notif.remove());
}

// Réinitialisation des métriques
function resetMetrics() {
  wordCount.textContent = '0';
  charCount.textContent = '0';
  readTime.textContent = '0 min';
  sentenceCount.textContent = '0';
  keywordDensity.textContent = '0%';

  [wordMeter, charMeter, readMeter, sentenceMeter, keywordMeter].forEach(meter => {
    meter.style.width = '0%';
    meter.classList.remove('red', 'orange', 'green');
  });

  [wordCount, charCount, readTime, sentenceCount, keywordDensity].forEach(el => {
    el.classList.remove('red', 'orange', 'green');
  });

  keywordList.classList.remove('visible');
}