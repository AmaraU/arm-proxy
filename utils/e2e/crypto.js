const envelopeAlgorithm = "RSA-OAEP-SHA256+A256GCM";

export async function generateClientKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 3072,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["sign", "verify"]
  );

  const publicKeyDer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKeyDer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKeyPem: derToPem(publicKeyDer, "PUBLIC KEY"),
    privateKeyPem: derToPem(privateKeyDer, "PRIVATE KEY")
  };
}

export async function createEncryptedEnvelope(payload, options) {
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const aesKeyBytes = crypto.getRandomValues(new Uint8Array(32));
  const nonceBytes = crypto.getRandomValues(new Uint8Array(12));

  const aesKey = await crypto.subtle.importKey("raw", aesKeyBytes, { name: "AES-GCM" }, false, ["encrypt"]);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonceBytes, tagLength: 128 },
    aesKey,
    plaintext
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - 16);
  const tag = encryptedBytes.slice(encryptedBytes.length - 16);

  const serverPublicKey = await importRsaOaepPublicKey(options.serverPublicKeyPem);
  const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, serverPublicKey, aesKeyBytes);

  const envelope = {
    Algorithm: envelopeAlgorithm,
    KeyId: options.serverKeyId,
    ClientKeyId: options.clientKeyId,
    Timestamp: dotNetUtcTimestamp(),
    RequestNonce: bytesToBase64(crypto.getRandomValues(new Uint8Array(16))),
    CorrelationId: crypto.randomUUID().replaceAll("-", ""),
    EncryptedKey: arrayBufferToBase64(encryptedKey),
    Nonce: bytesToBase64(nonceBytes),
    Ciphertext: bytesToBase64(ciphertext),
    Tag: bytesToBase64(tag),
    Signature: ""
  };

  const signingKey = await importRsaPssPrivateKey(options.clientPrivateKeyPem);
  const signature = await crypto.subtle.sign(
    { name: "RSA-PSS", saltLength: 32 },
    signingKey,
    new TextEncoder().encode(serializeForSignature(envelope))
  );

  envelope.Signature = arrayBufferToBase64(signature);
  return envelope;
}

export async function decryptResponseEnvelope(rawEnvelope, options) {
  const envelope = normalizeEnvelope(rawEnvelope);

  const serverSigningKey = await importRsaPssPublicKey(options.serverPublicKeyPem);
  const isValid = await crypto.subtle.verify(
    { name: "RSA-PSS", saltLength: 32 },
    serverSigningKey,
    base64ToArrayBuffer(envelope.Signature),
    new TextEncoder().encode(serializeForSignature(envelope))
  );

  if (!isValid) {
    throw new Error("Invalid E2E response signature.");
  }

  const decryptKey = await importRsaOaepPrivateKey(options.clientPrivateKeyPem);
  const aesKeyBytes = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    decryptKey,
    base64ToArrayBuffer(envelope.EncryptedKey)
  );

  const aesKey = await crypto.subtle.importKey("raw", aesKeyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
  const ciphertext = new Uint8Array(base64ToArrayBuffer(envelope.Ciphertext));
  const tag = new Uint8Array(base64ToArrayBuffer(envelope.Tag));
  const encryptedPayload = concatBytes(ciphertext, tag);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToArrayBuffer(envelope.Nonce), tagLength: 128 },
    aesKey,
    toArrayBuffer(encryptedPayload)
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}

export function isEnvelope(value) {
  if (!value || typeof value !== "object") return false;
  return Boolean(value.Algorithm ?? value.algorithm) &&
    Boolean(value.EncryptedKey ?? value.encryptedKey) &&
    Boolean(value.Ciphertext ?? value.ciphertext) &&
    Boolean(value.Signature ?? value.signature);
}

function normalizeEnvelope(value) {
  return {
    Algorithm: value.Algorithm ?? value.algorithm,
    KeyId: value.KeyId ?? value.keyId,
    ClientKeyId: value.ClientKeyId ?? value.clientKeyId,
    Timestamp: value.Timestamp ?? value.timestamp,
    RequestNonce: value.RequestNonce ?? value.requestNonce,
    CorrelationId: value.CorrelationId ?? value.correlationId,
    EncryptedKey: value.EncryptedKey ?? value.encryptedKey,
    Nonce: value.Nonce ?? value.nonce,
    Ciphertext: value.Ciphertext ?? value.ciphertext,
    Tag: value.Tag ?? value.tag,
    Signature: value.Signature ?? value.signature
  };
}

function serializeForSignature(envelope) {
  return [
    envelope.Algorithm,
    envelope.KeyId,
    envelope.ClientKeyId || "",
    normalizeTimestampForSignature(envelope.Timestamp),
    envelope.RequestNonce,
    envelope.CorrelationId,
    envelope.EncryptedKey,
    envelope.Nonce,
    envelope.Ciphertext,
    envelope.Tag
  ].join("\n");
}

function normalizeTimestampForSignature(timestamp) {
  const match = timestamp.match(/^(.+\.\d{3})(\d{4})(\+00:00)$/);
  return match ? `${match[1]}${match[2]}Z`.replace("Z", "+00:00") : timestamp;
}

function dotNetUtcTimestamp(date = new Date()) {
  return date.toISOString().replace("Z", "0000+00:00");
}

async function importRsaOaepPublicKey(pem) {
  return crypto.subtle.importKey("spki", pemToArrayBuffer(pem), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
}

async function importRsaOaepPrivateKey(pem) {
  return crypto.subtle.importKey("pkcs8", pemToArrayBuffer(pem), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
}

async function importRsaPssPrivateKey(pem) {
  return crypto.subtle.importKey("pkcs8", pemToArrayBuffer(pem), { name: "RSA-PSS", hash: "SHA-256" }, false, ["sign"]);
}

async function importRsaPssPublicKey(pem) {
  return crypto.subtle.importKey("spki", pemToArrayBuffer(pem), { name: "RSA-PSS", hash: "SHA-256" }, false, ["verify"]);
}

function derToPem(buffer, label) {
  const base64 = arrayBufferToBase64(buffer);
  const lines = base64.match(/.{1,64}/g)?.join("\n") ?? base64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s/g, "");
  return base64ToArrayBuffer(base64);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return toArrayBuffer(bytes);
}

function toArrayBuffer(bytes) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function arrayBufferToBase64(buffer) {
  return bytesToBase64(new Uint8Array(buffer));
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function concatBytes(left, right) {
  const output = new Uint8Array(left.length + right.length);
  output.set(left, 0);
  output.set(right, left.length);
  return output;
}