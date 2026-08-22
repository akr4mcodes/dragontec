# 🐉 PROMPT IA — AJOUT D'UN NOUVEAU LAPTOP & SYNCHRONISATION BDD

Copiez-collez le texte ci-dessous à l'IA avec les informations de votre nouveau laptop :

---

```text
Tu es l'assistant développeur du site e-commerce DragonTec Store.
Ajoute le nouvel ordinateur portable ci-dessous au catalogue du site et synchronise les bases de données Firebase Firestore et Supabase.

--- INFORMATIONS DU LAPTOP ---
Nom : [Nom complet du laptop]
Description : [Description détaillée du laptop]
Prix : [Prix en DA, ex: 66 000 DA]
Catégories : [pro / gaming / macbook / budget] (inclure 'budget' si prix < 65 000 DA)

Spécifications :
- Processeur (CPU) : [Modèle CPU, cœurs, fréquence]
- Mémoire Vive (RAM) : [Capacité et type de RAM]
- Stockage : [Capacité et type SSD]
- Carte Graphique (GPU) : [Modèle GPU]
- Écran : [Taille, résolution, technologie, fréquence]
- Châssis / Audio : [Matériaux, caractéristiques audio]
- Système : [OS préinstallé, ex: Windows 11 64 bits]
- État : [ex: 10/10 (Très bon état)]
- Batterie : [Autonomie estimée]
- Garantie : [ex: 3 mois]
- Accessoires inclus : [ex: Chargeur d'origine]

Images (dossier laptops/) :
1ère image : laptops/[image1].png (miniature principale & 1ère diapositive)
2ème image : laptops/[image2].png (2ème diapositive carrousel)
3ème image : laptops/[image3].png (3ème diapositive carrousel)

--- ACTIONS TECHNIQUES À EFFECTUER AUTOMATIQUEMENT ---
1. index.html :
   - Insérer la nouvelle carte <article class="product-card"> à la fin de <div class="product-showcase"> avec le numéro d'article incrémenté.
   - Renseigner tous les data-attributes : data-category, data-name, data-price, data-specs (séparateur |), data-description, data-image, data-carousel-images (séparateur virgule).
   - Inclure les boutons "Détails" (btn-details) et "Commander" (btn-commander).

2. supabase_schema.sql :
   - Ajouter le produit dans la table public.products (slug unique, nom, prix, stock=5, image_url, category).

3. script.js & firebase-config.js :
   - Vérifier que lors d'un achat, les spécifications complètes, la description et l'image du produit sont bien enregistrées dans la collection 'orders' de Firebase Firestore et dans 'order_items' de Supabase.

4. Tester et valider :
   - S'assurer que le filtrage par catégorie, la recherche textuelle, le modal carrousel et le popup de commande fonctionnent sans erreur.
```