// import CryptoJS  from "crypto-js";
const CryptoJS = require("crypto-js");


const AES_KEY_FOR_DETAILS_REQUEST = "ZpJFemkqxFmkyvEZW/8xSA==";
// const HMAC_AND_AES_KEY_FOR_ENC_REQUEST = "lM97ez5aC0taf/qj5VLCIQ==";

const encryptRequest = async (data) => {
  try {
    const iv = CryptoJS.enc.Utf8.parse("\0".repeat(16));
    const cryptoKey = CryptoJS.enc.Utf8.parse(AES_KEY_FOR_DETAILS_REQUEST);

    // Convert data to JSON string
    const dataStr = JSON.stringify(data);

    // Encrypt the data using AES
    const encrypted = CryptoJS.AES.encrypt(dataStr, cryptoKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Return the encrypted data as a string
    return encrypted.toString();
  } catch (err) {
    console.error("Encryption error:", err);
    return null;
  }
};

function buildFullQueryUrl(input) {
  const { url } = input;
  const [baseUrl, existingQuery] = url.split('?');
  const queryParams = new URLSearchParams(existingQuery || '');

  const dynamicParams = { ...input };
  delete dynamicParams.url;

  for (const key in dynamicParams) {
    if (dynamicParams[key] != null) {
      queryParams.set(key, String(dynamicParams[key]));
    }
  }

  const finalQueryString = queryParams.toString();
  return finalQueryString ? `${baseUrl}?${finalQueryString}` : baseUrl;
}


module.exports = { encryptRequest, buildFullQueryUrl };