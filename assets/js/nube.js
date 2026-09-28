// ============================================================================
//  CONEXIÓN CON FIREBASE (la usan la app y el formulario de turno)
// ============================================================================
//  Configuración del proyecto: Firebase Console → ⚙ Configuración del
//  proyecto → "Tus apps" → app Web → objeto firebaseConfig. La API key web es
//  pública por diseño: lo que protege los datos son las reglas (firestore.rules).
// ============================================================================
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBQzRHnGBX9TtxrOBoh5KX5dm6agguoSaQ",
    authDomain: "mantenimiento-f405b.firebaseapp.com",
    projectId: "mantenimiento-f405b",
    storageBucket: "mantenimiento-f405b.firebasestorage.app",
    messagingSenderId: "1026028107442",
    appId: "1:1026028107442:web:c4a15a817ac5d55623fbab",
  };
  window.CLOUD = { db: null, enabled: false };
  try {
    if (firebaseConfig.projectId && window.firebase) {
      firebase.initializeApp(firebaseConfig);
      window.CLOUD.db = firebase.firestore();
      // Copia local de lo leído (IndexedDB): al recargar dentro del turno no se
      // vuelve a leer todo de la nube (cada lectura cuenta en la cuota diaria)
      // y la app sigue funcionando sin señal.
      window.CLOUD.db.enablePersistence({ synchronizeTabs: true }).catch((e) => console.log("[Firebase] sin copia local:", e && e.code));
      window.CLOUD.enabled = true;
    } else {
      console.log("[Firebase] Sin configuración: todo queda en este navegador.");
    }
  } catch (e) {
    console.error("[Firebase] No se pudo iniciar; se usa el almacenamiento de este navegador:", e);
  }
})();
