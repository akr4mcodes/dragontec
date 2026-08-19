/**
 * DragonTec Store — Firebase & Cloud Firestore Configuration
 * Enregistrement direct des informations complètes de commande et d'acheteur dans Firestore
 */

const firebaseConfig = {
  apiKey: "AIzaSyD0Y7UfHeg6pdikgLgeSUiH2Tp-1mlErUw",
  authDomain: "dragontec-ec435.firebaseapp.com",
  projectId: "dragontec-ec435",
  storageBucket: "dragontec-ec435.firebasestorage.app",
  messagingSenderId: "457547826855",
  appId: "1:457547826855:web:9ebe09324b0a3fb7163d82",
  measurementId: "G-HZS94PZFZ7"
};

let firebaseApp = null;
let firestoreDb = null;
let firebaseAnalytics = null;

function initDragonFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
      } else {
        firebaseApp = firebase.app();
      }
      firestoreDb = firebase.firestore();

      if (typeof firebase.analytics === 'function') {
        try {
          firebaseAnalytics = firebase.analytics();
        } catch (e) {
          console.warn('DragonTec: Analytics non activé localement:', e.message);
        }
      }
      console.log('✅ DragonTec: Firebase App & Firestore connectés avec succès.');
    } else {
      console.error('❌ DragonTec: SDK Firebase non trouvé.');
    }
  } catch (err) {
    console.error('❌ DragonTec: Erreur initialisation Firebase:', err);
  }
}

initDragonFirebase();

/**
 * Enregistrer la commande avec tous les champs visibles à la racine du document Firestore
 * @param {Object} orderData
 * @returns {Promise<{success: boolean, id: string, orderNumber: string}>}
 */
async function saveOrderToFirestore(orderData) {
  if (!firestoreDb) {
    initDragonFirebase();
  }

  if (!firestoreDb) {
    throw new Error("Impossible de se connecter à Firebase Firestore. Vérifiez votre connexion.");
  }

  const orderNumber = orderData.orderNumber || ('DT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000));
  const deliveryLabel = orderData.deliveryMethod === 'yalidine' ? 'Bureau Yalidine (500 DA)' : 'Livraison à domicile (800 DA)';

  // Tous les champs à plat à la racine pour un affichage parfait et clair dans la console Firebase
  const firestorePayload = {
    // 1. Informations de la commande
    order_number: orderNumber,
    statut: "pending",
    
    // 2. Informations du client
    nom: orderData.nom || '',
    prenom: orderData.prenom || '',
    nom_complet: `${orderData.prenom || ''} ${orderData.nom || ''}`.trim(),
    telephone: orderData.telephone || '',
    email: orderData.email || '',
    wilaya: orderData.wilaya || '',
    adresse_complete: orderData.adresse || '',

    // 3. Informations du Laptop
    laptop_nom: orderData.productName || '',
    laptop_slug: orderData.productSlug || '',
    laptop_prix: orderData.productPrice || 0,
    quantite: orderData.quantity || 1,

    // 4. Livraison & Tarifs
    mode_livraison: deliveryLabel,
    frais_livraison_da: orderData.deliveryPrice || 0,
    sous_total_da: orderData.productPrice || 0,
    total_a_payer_da: orderData.totalPrice || 0,

    // 5. Dates
    date_creation: firebase.firestore.FieldValue.serverTimestamp(),
    date_texte: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Algiers' })
  };

  console.log('📤 Envoi de la commande complète dans Firestore (collection "orders")...', firestorePayload);

  // Enregistrement dans la collection "orders"
  const docRef = await firestoreDb.collection('orders').add(firestorePayload);
  console.log('🎉 Commande enregistrée avec succès dans Firebase ! ID:', docRef.id, 'N° Commande:', orderNumber);

  return {
    success: true,
    id: docRef.id,
    orderNumber: orderNumber,
    total_price: firestorePayload.total_a_payer_da
  };
}

// Exposer globalement sur window
window.dragonFirebase = {
  get app() { return firebaseApp; },
  get db() { return firestoreDb; },
  saveOrderToFirestore
};
window.saveOrderToFirestore = saveOrderToFirestore;
