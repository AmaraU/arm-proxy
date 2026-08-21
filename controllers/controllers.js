const axios = require("axios");
const fetch = require("node-fetch");
const https = require("https");
const { postEncrypted, putEncrypted, getPlain, getEncryptedQuery, deleteEncrypted } = require("../utils/e2e/e2eClient");
const { decryptResponse, encryptRequest } = require("../utils/encrypt");


const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const APIURL = process.env.BASE_APIURL;


const controller = {

  async get(req, res) {
    try {
      const response = await getPlain({
        apiBaseUrl: APIURL,
        path: `api${req.query.url}`,
        bearerToken: req.headers.authorization || undefined,
        tenantHeader: process.env.API_KEY,
      });
      console.log('get:', response);
      const encryptedResponse = await encryptRequest(response.data);

      if (response.data.success || response.data.isSuccess) {
        res.status(200).json(encryptedResponse);
      } else {
        res.status(response.status).json(encryptedResponse);
      }
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async encget(req, res) {
    try {
      const decrypted = await decryptResponse(req.query.data);

      const response = await getEncryptedQuery({
        apiBaseUrl: APIURL,
        path: `api${req.query.url}`,
        bearerToken: req.headers.authorization || undefined,
        tenantHeader: process.env.API_KEY,
        body: decrypted,
      });
      console.log('encget:', response);
      const encryptedResponse = await encryptRequest(response.data);

      if (response.data.success || response.data.isSuccess) {
        res.status(200).json(encryptedResponse);
      } else {
        res.status(response.status).json(encryptedResponse);
      }
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async post(req, res) {
    try {
      const decrypted = await decryptResponse(req.body.data);

      const response = await postEncrypted({
        apiBaseUrl: APIURL,
        path: `api${req.query.url}`,
        bearerToken: req.headers.authorization || undefined,
        tenantHeader:  process.env.API_KEY,
        body: decrypted,
      })
      
      console.log(response);
      const encryptedResponse = await encryptRequest(response.data);

      if (response.data.success || response.data.isSuccess) {
        res.status(200).json(encryptedResponse);
      } else {
        res.status(response.status).json(encryptedResponse);
      }
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async put(req, res) {
    try {
      const decrypted = await decryptResponse(req.body.data);

      const response = await putEncrypted({
        apiBaseUrl: APIURL,
        path: `api${req.query.url}`,
        bearerToken: req.headers.authorization || undefined,
        tenantHeader:  process.env.API_KEY,
        body: decrypted,
      })
      console.log(response);
      const encryptedResponse = await encryptRequest(response.data);

      if (response.data.success) {
        res.status(200).json(encryptedResponse);
      } else {
        res.status(response.status).json(encryptedResponse);
      }
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async encput(req, res) {
    try {
      const path = req.query.url.split("?")[0];
      const query = req.query.url.split("?")[1].replaceAll(" ", "+");
      const response = await axios({
        method: "PUT",
        url: `${APIURL}${path}?${query}`,
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": process.env.API_KEY,
        },
        data: req.body.data,
        transformRequest: [(data) => data],
        httpsAgent,
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async encdelete(req, res) {
    try {
      const decrypted = await decryptResponse(req.body.data);

      const response = await deleteEncrypted({
        apiBaseUrl: APIURL,
        path: `api${req.query.url}`,
        bearerToken: req.headers.authorization || undefined,
        tenantHeader: process.env.API_KEY,
        body: decrypted,
      });

      console.log(response);
      const encryptedResponse = await encryptRequest(response.data);

      if (response.data.success) {
        res.status(200).json(encryptedResponse);
      } else {
        res.status(response.status).json(encryptedResponse);
      }
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },
};

module.exports = controller;