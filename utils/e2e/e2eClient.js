import {
  createEncryptedEnvelope,
  decryptResponseEnvelope,
  isEnvelope
} from "./crypto.js";

const API_BASE = process.env.BASE_APIURL;
const PRIVATE_CLIENT_KEY = process.env.CLIENT_PRIVATE_KEY;
const CLIENT_KEY_ID = 'web-client-2026-q3';


export async function fetchServerKeys(apiBaseUrl) {
  const response = await fetch(`${trimBaseUrl(apiBaseUrl)}/.well-known/e2e-keys`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch server E2E keys. HTTP ${response.status}`);
  }

  return response.json();
}

export async function postEncrypted(options) {
  try {
    const serverKeys = await fetchServerKeys(API_BASE);
    const e2eKeys = {
      serverKeyId: serverKeys.activeKeyId,
      serverPublicKeyPem: serverKeys.keys.find(k => k.isActive).publicKeyPem,
      clientKeyId: CLIENT_KEY_ID,
      clientPrivateKeyPem: PRIVATE_CLIENT_KEY,
    }

    if (!serverKeys) {
      throw new Error("E2E keys are required for encrypted POST.");
    }

    const envelope = await createEncryptedEnvelope(options.body ?? {}, e2eKeys);

    return sendRequest({
      ...options,
      e2eKeys,
      method: "POST",
      requestBody: JSON.stringify(envelope),
      encryptedRequest: envelope
    });
  } catch (error) {
    console.log(error)
  }
  
}

export async function getPlain(options) {
  return sendRequest({
    ...options,
    method: "GET"
  });
}

export async function getEncryptedQuery(options) {
  try {
    const serverKeys = await fetchServerKeys(API_BASE);
    if (!serverKeys) {
      throw new Error("E2E keys are required for encrypted GET query.");
    }

    const e2eKeys = {
      serverKeyId: serverKeys.activeKeyId,
      serverPublicKeyPem: serverKeys.keys.find(k => k.isActive).publicKeyPem,
      clientKeyId: CLIENT_KEY_ID,
      clientPrivateKeyPem: PRIVATE_CLIENT_KEY,
    }

    const queryString = extractQueryString(options.path);
    const pathWithoutQuery = options.path.split("?")[0];
    const envelope = await createEncryptedEnvelope(queryString, e2eKeys);
    const encryptedPath = `${pathWithoutQuery}?e2e=${encodeURIComponent(JSON.stringify(envelope))}`;

    return sendRequest({
      ...options,
      e2eKeys,
      path: encryptedPath,
      method: "GET",
      encryptedRequest: envelope
    });

  } catch (error) {
    console.log(error)
  }
}

export async function putEncrypted(options) {
  try {
    const serverKeys = await fetchServerKeys(API_BASE);
    const e2eKeys = {
      serverKeyId: serverKeys.activeKeyId,
      serverPublicKeyPem: serverKeys.keys.find(k => k.isActive).publicKeyPem,
      clientKeyId: CLIENT_KEY_ID,
      clientPrivateKeyPem: PRIVATE_CLIENT_KEY,
    }

    if (!serverKeys) {
      throw new Error("E2E keys are required for encrypted POST.");
    }

    const envelope = await createEncryptedEnvelope(options.body ?? {}, e2eKeys);

    return sendRequest({
      ...options,
      e2eKeys,
      method: "PUT",
      requestBody: JSON.stringify(envelope),
      encryptedRequest: envelope
    });
  } catch (error) {
    console.log(error)
  }
  
}

export async function deleteEncrypted(options) {
  const serverKeys = await fetchServerKeys(API_BASE);
  const e2eKeys = {
    serverKeyId: serverKeys.activeKeyId,
    serverPublicKeyPem: serverKeys.keys.find(k => k.isActive).publicKeyPem,
    clientKeyId: CLIENT_KEY_ID,
    clientPrivateKeyPem: PRIVATE_CLIENT_KEY,
  }
  if (!serverKeys) {
    throw new Error("E2E keys are required for encrypted DELETE.");
  }

  const envelope = await createEncryptedEnvelope(options.body ?? {}, options.e2eKeys);
  return sendRequest({
    ...options,
    method: "DELETE",
    requestBody: JSON.stringify(envelope),
    encryptedRequest: envelope
  });
}


async function sendRequest(options) {
  const headers = {
    Accept: "application/json"
  };

  if (options.requestBody) {
    headers["Content-Type"] = "application/json";
  }

  if (options.bearerToken) {
    headers.Authorization = `${options.bearerToken}`;
  }

  if (options.tenantHeader) {
    headers["X-ARM-Api-Key-P"] = options.tenantHeader;
  }


  const response = await fetch(
    `${trimBaseUrl(options.apiBaseUrl)}${normalizePath(options.path)}`,
    {
      method: options.method,
      headers,
      body: options.requestBody
    }
  );


  const rawResponse = await readResponse(response);
  const responseEncrypted = isEnvelope(rawResponse);
  const data = options.e2eKeys && responseEncrypted
    ? await decryptResponseEnvelope(rawResponse, options.e2eKeys)
    : rawResponse;

  return {
    status: response.status,
    ok: response.ok,
    encryptedRequest: options.encryptedRequest,
    responseEncrypted,
    responseDecrypted: Boolean(options.e2eKeys && responseEncrypted),
    plainMiddlewareError: isPlainMiddlewareError(rawResponse),
    rawResponse,
    data,
    headers: Object.fromEntries(response.headers.entries())
  };
}

async function readResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function trimBaseUrl(apiBaseUrl) {
  return apiBaseUrl.replace(/\/+$/, "");
}

function normalizePath(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

function extractQueryString(path) {
  const questionIndex = path.indexOf("?");
  return questionIndex >= 0 ? path.slice(questionIndex) : "";
}

function isPlainMiddlewareError(value) {
  if (!value || typeof value !== "object") return false;
  return value.Success === false &&
    value.ResponseCode === "01" &&
    value.Message === "Invalid or tampered encrypted request.";
}