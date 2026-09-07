const axios = require("axios");
const fetch = require("node-fetch");
const https = require("https");

const APIURL = process.env.CORAL_APIURL;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});


const coralcontroller = {
  async get(req, res) {
    try {
      // console.log('\n coral get request: ', req)
      const response = await axios({
        method: "GET",
        url: `${APIURL}${req.query.url}`,
        headers: {
          ContentType: "application/json",
          Authorization: req.headers.authorization || "",
          "X-Api-Key": process.env.CORAL_API_KEY,
        },
        httpsAgent,
      });
      console.log('\ncoral get response: ', response);
      res.status(200).json(response.data);
    } catch (error) {
      console.log('\ncoral get error: ', error);
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
          "X-Api-Key": process.env.CORAL_API_KEY,
        },
        data: JSON.stringify(req.body),
        transformRequest: [(data) => data],
        httpsAgent,
      });
      console.log('\ncoral post response: ', response.data);
      res.status(200).json(response.data);
    } catch (error) {
      console.log('\ncoral post response: ', error.response);
      res.status(400).json(error.response?.data);
    }
  },
};

module.exports = coralcontroller;