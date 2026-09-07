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
      // console.log('\nget request: ', req);
      const response = await axios({
        method: "GET",
        url: `${APIURL}${req.query.url}`,
        headers: {
          "Content-Type": req.headers["content-type"],
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": req.headers["x-arm-api-key-p"] || "",
        },
        httpsAgent,
      });
      // console.log('\nget response: ', response.data);
      res.status(200).json(response.data);
    } catch (error) {
      // console.log('\nget error: ', error.response);
      res.status(400).json(error.response?.data);
    }
  },

  async post(req, res) {
    try {
      const response = await axios({
        method: "POST",
        url: `${APIURL}${req.query.url}`,
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": req.headers["content-type"],
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": req.headers["x-arm-api-key-p"] || "",
        },
        data: JSON.stringify(req.body),
        transformRequest: [(data) => data],
        httpsAgent,
      });
      console.log('\npost response: ', response?.data);
      res.status(200).json(response?.data);
    } catch (error) {
      console.log('\npost error: ', error.response?.data);
      res.status(400).json(error?.response?.data);
    }
  },

  async put(req, res) {
    try {
      // console.log('\nput request: ', req);
      const response = await axios({
        method: "PUT",
        url: `${APIURL}${req.query.url}`,
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": req.headers["content-type"],
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": req.headers["x-arm-api-key-p"] || "",
        },
        data: JSON.stringify(req.body),
        transformRequest: [(data) => data],
        httpsAgent,
      });
      // console.log('\nput response: ', response?.data);
      res.status(200).json(response.data);
    } catch (error) {
      console.log('\nput error: ', error.response?.data);
      res.status(400).json(error.response?.data);
    }
  },

  async delete(req, res) {
    try {
      // console.log('\ndelete request: ', req.headers);
      const response = await axios({
        method: "DELETE",
        url: `${APIURL}${req.query.url}`,
        headers: {
          "Content-Type": req.headers["content-type"],
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": req.headers["x-arm-api-key-p"] || "",
        },
        data: JSON.stringify(req.body),
        httpsAgent,
      });
      // console.log('\ndelete response: ', response?.data);
      res.status(200).json(response.data);
    } catch (error) {
      console.log('\ndelete error: ', error.response?.data);
      res.status(400).json(error.response?.data);
    }
  },
};

module.exports = controller;