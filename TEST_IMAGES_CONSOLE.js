// COMMENT TESTER LES IMAGES EN LOCAL
// Copie ce code dans la console (F12) pour vérifier

console.log("🚀 Démarrage diagnostic images...\n");

// 1. Vérifier que les images existent
const imageUrls = [
  "/images/267A1009.webp",
  "/images/267A1011.webp",
  "/images/267A1031.webp",
  "/images/267A1086.webp",
  "/images/267A1088.webp",
  "/images/267A1088_alt.webp",
  "/images/canon_eos_5d_mk3_160.webp",
  "/images/canon_eos_5d_mk3_161.webp",
];

console.log("📋 Images à vérifier:", imageUrls.length);
console.log("-----------------------------------\n");

// 2. Fonction pour vérifier chaque image
async function verifyImages() {
  for (const url of imageUrls) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const status = response.ok ? "✅ OK (200)" : `❌ FAIL (${response.status})`;
      console.log(`${status} ${url}`);
    } catch (err) {
      console.log(`🔴 ERROR: ${url}`, err.message);
    }
  }
}

// 3. Lancer la vérification
console.log("🔍 Vérification des URLs...\n");
verifyImages().then(() => {
  console.log("\n-----------------------------------");
  console.log("✅ Vérification terminée!\n");
  
  // 4. Afficher diagnostic existant
  if (typeof ImageDiagnosticsTracker !== "undefined") {
    console.log("📊 DIAGNOSTICS COMPLETS:");
    ImageDiagnosticsTracker.logToConsole();
  } else {
    console.log("⚠️ ImageDiagnosticsTracker pas encore chargé");
  }
});

console.log("-----------------------------------");
console.log("🌐 Device Info:");
console.log("User Agent:", navigator.userAgent);
console.log("-----------------------------------\n");
