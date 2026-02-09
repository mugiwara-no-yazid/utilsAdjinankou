<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Générateur de Bannières Réseaux Sociaux Gratuit</title>
    <link rel="stylesheet" href="../styles/generateur-baniere.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Lato:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:ital,wght@0,400;0,700;1,400;1,700&family=Raleway:ital,wght@0,400;0,700;1,400;1,700&family=Oswald:wght@400;700&family=Merriweather:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Bebas+Neue&family=Anton&family=Pacifico&display=swap" rel="stylesheet">
</head>
<body>
<header>
    <h1>
        Concevez vos visuels de réseaux sociaux en ligne gratuitement. Boostez votre image de marque en quelques secondes.
    </h1>
</header>
<div id="banner-gen-wrapper">
  <div class="bgv2-container">  
    <div class="bgv2-controls">
      <div class="bgv2-section">
        <label class="bgv2-label">Format de bannière</label>
        <select id="bgFormatSelect" class="bgv2-select">
          <optgroup label="Facebook">
            <option value="1200,630">Facebook Post (1200 × 630 px)</option>
            <option value="820,312">Facebook Couverture (820 × 312 px)</option>
            <option value="1080,1920">Facebook Story (1080 × 1920 px)</option>
          </optgroup>
          <optgroup label="Instagram">
            <option value="1080,1080" selected>Instagram Post Carré (1080 × 1080 px)</option>
            <option value="1080,1350">Instagram Post Portrait (1080 × 1350 px)</option>
            <option value="1080,566">Instagram Post Paysage (1080 × 566 px)</option>
            <option value="1080,1920">Instagram Story (1080 × 1920 px)</option>
          </optgroup>
          <optgroup label="Twitter / X">
            <option value="1200,675">Twitter Post (1200 × 675 px)</option>
            <option value="1500,500">Twitter Header (1500 × 500 px)</option>
          </optgroup>
          <optgroup label="LinkedIn">
            <option value="1200,627">LinkedIn Post (1200 × 627 px)</option>
            <option value="1584,396">LinkedIn Couverture (1584 × 396 px)</option>
          </optgroup>
          <optgroup label="YouTube">
            <option value="1280,720">YouTube Miniature (1280 × 720 px)</option>
            <option value="2560,1440">YouTube Bannière (2560 × 1440 px)</option>
          </optgroup>
          <optgroup label="Pinterest">
            <option value="1000,1500">Pinterest Pin (1000 × 1500 px)</option>
          </optgroup>
          <optgroup label="TikTok">
            <option value="1080,1920">TikTok Vidéo (1080 × 1920 px)</option>
          </optgroup>
        </select>
      </div>

      <div class="bgv2-section">
        <label class="bgv2-label">Type de fond</label>
        <select id="bgType" class="bgv2-select">
          <option value="color">Couleur unie</option>
          <option value="gradient">Dégradé</option>
          <option value="image">Image</option>
        </select>
      </div>

      <div id="bgColorControls" class="bgv2-section">
        <label class="bgv2-label">Couleur de fond</label>
        <div class="bgv2-color-picker">
          <div class="bgv2-color-pastille">
            <div class="bgv2-color-display" id="bgColorDisplay" style="background: #ffffff;"></div>
            <input type="color" id="bgColor" value="#ffffff" class="bgv2-color-input">
          </div>
          <input type="text" id="bgColorText" value="#ffffff" class="bgv2-color-text">
        </div>
      </div>

      <div id="bgGradientControls" class="bgv2-section" style="display:none;">
        <label class="bgv2-label">Type de dégradé</label>
        <select id="bgGradientType" class="bgv2-select">
          <option value="linear">Linéaire</option>
          <option value="radial">Radial</option>
        </select>

        <div class="bgv2-slider-group">
          <div class="bgv2-slider-label">
            <label class="bgv2-label" style="margin: 0;">Angle</label>
            <span id="bgGradAngleVal" class="bgv2-slider-value">90°</span>
          </div>
          <input type="range" id="bgGradAngle" min="0" max="360" value="90" class="bgv2-slider">
        </div>

        <label class="bgv2-label">Couleur 1</label>
        <div class="bgv2-color-picker" style="margin-bottom: 16px;">
          <div class="bgv2-color-pastille">
            <div class="bgv2-color-display" id="bgGrad1Display" style="background: #667eea;"></div>
            <input type="color" id="bgGrad1" value="#667eea" class="bgv2-color-input">
          </div>
          <input type="text" id="bgGrad1Text" value="#667eea" class="bgv2-color-text">
        </div>

        <label class="bgv2-label">Couleur 2</label>
        <div class="bgv2-color-picker">
          <div class="bgv2-color-pastille">
            <div class="bgv2-color-display" id="bgGrad2Display" style="background: #764ba2;"></div>
            <input type="color" id="bgGrad2" value="#764ba2" class="bgv2-color-input">
          </div>
          <input type="text" id="bgGrad2Text" value="#764ba2" class="bgv2-color-text">
        </div>
      </div>

      <div id="bgImageControls" class="bgv2-section" style="display:none;">
        <label class="bgv2-label">Image de fond</label>
        <input type="file" id="bgImageInput" accept="image/*" class="bgv2-input">
        
        <div style="margin-top: 16px;">
          <label class="bgv2-label">Ajustement de l'image</label>
         <!-- <select id="bgImageFit" class="bgv2-select">
            <option value="cover">Couvrir (cover)</option>
            <option value="contain">Contenir (contain)</option>
            <option value="fill">Étirer (fill)</option>
            <option value="repeat">Répéter (repeat)</option>
            <option value="no-repeat">Centré (no-repeat)</option>
          </select>-->
          <select id="bgImageFit" class="bgv2-select">
            <option value="cover">Remplit tout l'espace</option>
            <option value="contain">Image complète visible</option>
            <option value="fill">Étirer</option>
            <option value="repeat">Répéter</option>
            <option value="repeat-x">Répéter horizontalement</option>
            <option value="repeat-y">Répéter verticalement</option>
            <option value="no-repeat">Centré</option>
          </select>
        </div>
      </div>

      <div class="bgv2-section" style="margin-bottom: 0;">
        <label class="bgv2-label">Ajouter des éléments</label>
        <div class="bgv2-add-buttons">
          <button class="bgv2-button bgv2-button-primary" onclick="addImage()">+ Image</button>
          <button class="bgv2-button bgv2-button-primary" onclick="addText()">+ Texte</button>
        </div>
        <p class="bgv2-hint">Cliquez sur un élément pour le modifier</p> 
      </div>
    </div>

    <!-- CANVAS CENTRAL -->
    <div class="bgv2-preview">
      <div style="display: flex; flex-direction: column; gap: 20px; align-items: center;">
        <div id="canvas-container-v2">
          <canvas id="canvas-v2"></canvas>
        </div>
        <button class="bgv2-button bgv2-button-primary" onclick="exportBanner()" style="width: auto; padding: 12px 32px; font-size: 15px;">
        Télécharger la bannière
        </button>
      </div>
    </div>

    <!-- SIDEBAR DROITE - CONTEXT PANEL -->
    <div id="contextPanel" class="bgv2-context-panel hidden">
      <div class="bgv2-empty-state">
        Sélectionnez un élément<br />dans le canvas<br />pour le modifier
      </div>
    </div>

  </div>
</div>
<script src="../scripts/generateur-baniere.js"></script>
</body>
</html>