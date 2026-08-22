# 🐉 DRAGONTEC — INSTRUCTIONS POUR L'AJOUT D'UN NOUVEAU LAPTOP (PROMPT IA)

> **Rôle de l'IA** : Tu es un assistant développeur expert chargé de maintenir et d'enrichir la boutique en ligne **DragonTec Store**. À chaque fois qu'un utilisateur te fournit les détails d'un nouvel ordinateur portable, tu dois suivre scrupuleusement la procédure ci-dessous pour l'intégrer au site et assurer sa synchronisation avec les bases de données Firebase Firestore et Supabase.

---

## 🎯 OBJECTIF
Intégrer parfaitement le nouveau PC portable dans :
1. La boutique web (`index.html`) avec carte produit, modal de spécifications interactif et carrousel d'images.
2. Le script JavaScript (`script.js`) pour le filtrage de catégories, le calcul du prix et le passage de commande (checkout).
3. La base de données **Supabase** (`supabase_schema.sql` dans la table `public.products`).
4. La base de données **Firebase Firestore** (`firebase-config.js` pour l'enregistrement complet de la vente dans la collection `orders`).

---

## 📋 FORMAT D'ENTRÉE ATTENDU DU NOUVEL ORDINATEUR

```text
Nom : [Ex: Lenovo Yoga Slim 7 (AMD Ryzen 5)]
Description : [Ex: PC portable ultra-fin, léger et élégant en aluminium...]
Prix : [Ex: 66 000 DA]
Catégorie(s) : [all, pro, gaming, macbook, budget] (Note: 'budget' si prix < 65 000 DA)

Spécifications :
- Processeur (CPU) : [Ex: AMD Ryzen™ 5 4500U]
- Mémoire Vive (RAM) : [Ex: 8 Go LPDDR4X]
- Stockage : [Ex: 256 Go SSD NVMe]
- Carte Graphique (GPU) : [Ex: AMD Radeon™ Graphics]
- Écran : [Ex: 14" Full HD (1080p) IPS Anti-reflets]
- Châssis : [Ex: Aluminium haut de gamme avec haut-parleurs Dolby Atmos®]
- Système : [Ex: Windows 11 (64 bits)]
- État : [Ex: 10/10 (Très bon état)]
- Batterie : [Ex: Excellente autonomie]
- Garantie : [Ex: 3 mois]
- Accessoires inclus : [Ex: Chargeur d'origine Lenovo]

Ordre des images (dans le dossier laptops/) :
1ère image : laptops/[nom_image_1].png
2ème image : laptops/[nom_image_2].png
3ème image : laptops/[nom_image_3].png
```

---

## 🛠️ INSTRUCTIONS D'EXÉCUTION PAS-À-PAS POUR L'IA

### Étape 1 : Vérification & Préparation des Images
1. Vérifier que les 3 fichiers d'images existent bien dans le dossier `laptops/`.
2. L'image principale (1ère) sert de miniature pour la carte et de première diapositive du carrousel.

---

### Étape 2 : Ajout de la carte produit dans `index.html`
1. Trouver le dernier élément `<article class="product-card">` dans `<div class="product-showcase">`.
2. Déterminer le nouveau numéro de produit (ex: `22` si le précédent était `21`).
3. Formater les spécifications avec le séparateur tube `|` pour l'attribut `data-specs` :
   - Remplacer les guillemets `"` dans les textes par `&quot;`.
4. Générer le code HTML suivant :

```html
<article class="product-card" data-category="[categories]"
  data-name="[NOM_DU_LAPTOP]" data-price="[PRIX_NUMERIQUE] DA"
  data-specs="Processeur (CPU) : ...|Mémoire Vive (RAM) : ...|Stockage : ...|Carte Graphique (GPU) : ...|Écran : ...|Système : ...|État : ...|Batterie : ...|Garantie : ...|Accessoires inclus : ..."
  data-description="[DESCRIPTION_COURTE]"
  data-image="laptops/[image_1].png"
  data-carousel-images="laptops/[image_1].png,laptops/[image_2].png,laptops/[image_3].png">
  <div class="product-number">[NUMERO_SUIVANT]</div>
  <div class="product-image">
    <img src="laptops/[image_1].png" alt="[NOM_DU_LAPTOP]" />
  </div>
  <div class="product-body">
    <h3>[NOM_DU_LAPTOP]</h3>
    <p>[CPU_COURT] • [RAM_COURT] • [STOCKAGE_COURT]</p>
    <div class="product-meta">
      <span class="product-price">[PRIX_NUMERIQUE] DA</span>
      <div class="product-actions">
        <button class="btn btn-secondary small-btn btn-details">Détails</button>
        <button class="btn btn-primary small-btn btn-commander">Commander</button>
      </div>
    </div>
  </div>
</article>
```

---

### Étape 3 : Synchronisation dans `supabase_schema.sql`
1. Générer le **slug** URL unique (minuscules, sans accents, tirets uniquement).
   - Exemple : `lenovo-yoga-slim-7-amd-ryzen-5`
2. Ajouter la ligne dans l'instruction `INSERT INTO public.products` :
```sql
('[SLUG_UNIQUE]', '[NOM_DU_LAPTOP]', [PRIX_NUMERIQUE], 5, 'laptops/[image_1].png', '[CATEGORIE]')
```
3. Mettre à jour le commentaire du nombre d'ordinateurs portables (ex: `LES 22 ORDINATEURS PORTABLES`).

---

### Étape 4 : Vérification de `script.js` & `firebase-config.js`
1. **Passage de commande (`script.js`)** :
   - S'assurer que `currentCheckoutProduct` contient bien `name`, `price`, `image`, `id` (slug), `specs`, `description`.
   - Lors de la soumission, ces données sont transmises dans `customerData`.
2. **Enregistrement Firestore (`firebase-config.js`)** :
   - Le document dans `orders` contient à plat :
     - `laptop_nom`, `laptop_slug`, `laptop_prix`, `laptop_specs`, `laptop_description`, `laptop_image`, `quantite`
     - Informations client (`nom`, `prenom`, `telephone`, `email`, `wilaya`, `adresse_complete`)
     - Détails commande (`order_number`, `mode_livraison`, `frais_livraison_da`, `total_a_payer_da`, `statut: 'pending'`, `date_creation`).

---

### Étape 5 : Validation finale
1. Vérifier que la recherche textuelle et les filtres de catégories (`all`, `macbook`, `gaming`, `pro`, `budget`) fonctionnent pour ce nouveau PC.
2. Vérifier que le bouton **Détails** ouvre le modal avec le bon carrousel à 3 images et la liste des specs.
3. Vérifier que le bouton **Commander** ouvre le checkout avec le bon prix et nom de produit.
