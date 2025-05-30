const axios = require("axios");
const fetch = require("node-fetch");
const https = require("https");
const { encryptRequest } = require("../utils/encrypt.js");


const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const APIURL = "https://apitest.armmfb.com.ng/FinedgeApi/api";


const controller = {
  async get(req, res) {
    try {
      const response = await axios({
        method: "GET",
        url: `${APIURL}${req.query.url}`,
        headers: {
          ContentType: "application/json",
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": process.env.API_KEY,
        },
        httpsAgent,
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async encget(req, res) {
    try {
      //check if the encryption part has space
      const path = req.query.url.split("?")[0];
      const query = req.query.url.split("?")[1].replaceAll(" ", "+");

      const response = await axios({
        method: "GET",
        url: `${APIURL}${path}?${query}`,
        headers: {
          ContentType: "application/json",
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": process.env.API_KEY,
        },
        httpsAgent,
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async login(req, res) {
    try {
      const response = await axios({
        method: "POST",
        url: `${APIURL}${req.query.url}`,
        headers: {
          ContentType: req.headers["content-type"],
          "X-ARM-Api-Key-P": process.env.API_KEY,
        },
        data: req.body,
        httpsAgent,
      });
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(400).json(error.response?.data);
    }
  },

  async post(req, res) {
    try {
      const encryptedData = await encryptRequest(req.body);
      const response = await axios({
        method: "POST",
        url: `${APIURL}${req.query.url}`,
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": req.headers["content-type"],
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": process.env.API_KEY,
        },
        data: encryptedData,
        transformRequest: [(data) => data],
        httpsAgent,
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async encpost(req, res) {
    try {
      const path = req.query.url.split("?")[0];
      const query = req.query.url.split("?")[1].replaceAll(" ", "+");

      const encryptedData = await encryptRequest(req.body);
      const response = await axios({
        method: "POST",
        url: `${APIURL}${path}?${query}`,
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": process.env.API_KEY,
        },
        data: encryptedData,
        transformRequest: [(data) => data],
        httpsAgent,
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async put(req, res) {
    try {
      const encryptedData = await encryptRequest(req.body);
      const response = await axios({
        method: "PUT",
        url: `${APIURL}${req.query.url}`,
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": req.headers["content-type"],
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": process.env.API_KEY,
        },
        data: encryptedData,
        transformRequest: [(data) => data],
        httpsAgent,
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async upload(req, res) {
    try {
      const myHeaders = new Headers();
      myHeaders.append("channel", req.headers.channel);
      myHeaders.append("Authorization", req.headers.authorization);

      const formdata = new FormData();
      formdata.append("file", req.body, "[PROXY]");
      
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
        agent: httpsAgent,
      };

      const response = await fetch(`${APIURL}${req.query.url}`, requestOptions);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: "Upload failed" });
    }
  },

  async delete(req, res) {
    try {
      const response = await axios({
        method: "DELETE",
        url: `${APIURL}${req.query.url}`,
        headers: {
          "Content-Type": req.headers["content-type"],
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": process.env.API_KEY,
        },
        data: req.body,
        httpsAgent,
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },

  async encdelete(req, res) {
    try {

      //check if the encryption part has space
      const path = req.query.url.split("?")[0];
      const query = req.query.url.split("?")[1].replaceAll(" ", "+");

      const encryptedData = await encryptRequest(req.body);
      const response = await axios({
        method: "DELETE",
        url: `${APIURL}${path}?${query}`,
        // url: `${APIURL}${req.query.url}`,
        headers: {
          "Content-Type": req.headers["content-type"],
          Authorization: req.headers.authorization || "",
          "X-ARM-Api-Key-P": process.env.API_KEY,
        },
        data: encryptedData,
        httpsAgent,
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json(error.response?.data);
    }
  },
};

module.exports = controller;