// convex/encryption.ts
// Chiffrement AES-256-GCM pour les clés secrètes de paiement
// La clé maître vient de la variable d'environnement ENCRYPTION_SECRET

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_SECRET;
  if (!key) {
    // En développement, utiliser une clé par défaut (à NE PAS utiliser en prod)
    console.warn("⚠️  ENCRYPTION_SECRET non défini — utilisation clé de dev");
    return "dev-key-32-chars-not-for-prod!!!";
  }
  return key;
}

export async function encrypt(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const rawKey = encoder.encode(getEncryptionKey().substring(0, 32));

  const key = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text)
  );

  // Combiner IV + données chiffrées
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Encoder en base64
  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encoded: string): Promise<string> {
  const encoder = new TextEncoder();
  const rawKey = encoder.encode(getEncryptionKey().substring(0, 32));

  const key = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}

// Masquer une clé pour affichage (ex: "APP_USR-1234...5678")
export function maskKey(key: string): string {
  if (!key || key.length < 12) return "***";
  const prefix = key.substring(0, 12);
  const suffix = key.substring(key.length - 4);
  return `${prefix}...${suffix}`;
}
