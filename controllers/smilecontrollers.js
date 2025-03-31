const axios = require("axios");
const fetch = require("node-fetch");
const https = require("https");

const APIURL = "https://stag-api.arm.com.ng/mfb-validation-service/api";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

module.exports.get = async (req, res) => {
  try {
    axios({
      method: "GET",
      url: APIURL + req.query.url,
      headers: {
        ContentType: "application/json",
        Authorization: req.headers.authorization
          ? req.headers.authorization
          : "",
        "X-Api-Key": process.env.SMILEID_KEY,
        "X-Api-Secret": process.env.SMILEID_SECRET,
      },
      httpsAgent, // Use custom HTTPS agent
    })
      .then((response) => {
        res.status(200).json(response.data);
      })
      .catch((error) => {
        res.status(400).json(error.response.data);
      });
  } catch (error) {
    res.status(400).json(error.response.data);
  }
};

module.exports.login = async (req, res) => {
  try {
    axios({
      method: "POST",
      url: APIURL + req.query.url,
      headers: {
        ContentType: req.headers["content-type"],
        "X-Api-Key": process.env.SMILE_KEY,
        "X-Api-Secret": process.env.SMILE_SECRET,
      },
      data: req.body,
      httpsAgent,
    })
      .then((response) => {
        res.status(200).json(response.data);
      })
      .catch((error) => {
        res.status(400).json(error.response.data);
      });
  } catch (error) {
    res.status(400).json(error.response.data);
  }
};

module.exports.post = async (req, res) => {
  try {
    axios({
      method: "POST",
      url: APIURL + req.query.url,
      headers: {
        "Content-Type": req.headers["content-type"],
        Authorization: req.headers.authorization
          ? req.headers.authorization
          : "",
        "X-Api-Key": process.env.SMILE_KEY,
        "X-Api-Secret": process.env.SMILE_SECRET,
      },
      data: req.body,
      httpsAgent, // Use custom HTTPS agent
    })
      .then((response) => {
        res.status(200).json(response.data);
      })
      .catch((error) => {
        res.status(400).json(error.response.data);
      });
  } catch (error) {
    res.status(400).json(error.response.data);
  }
};

module.exports.upload = async (req, res) => {
  try {
    var myHeaders = new Headers();
    myHeaders.append("channel", req.headers.channel);
    myHeaders.append("Authorization", req.headers.authorization);

    const formdata = new FormData();
    formdata.append("file", req.body, "[PROXY]");

    // Append the file here
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
      agent: new https.Agent({ rejectUnauthorized: false }), // Use custom HTTPS agent for fetch
    };

    const response = await fetch(APIURL + req.query.url, requestOptions);
    const data = await response.json(); // Assuming the response is JSON
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error.response.data);
  }
};

module.exports.delete = async (req, res) => {
  try {
    axios({
      method: "DELETE",
      url: APIURL + req.query.url,
      headers: {
        "Content-Type": req.headers["content-type"],
        Authorization: req.headers.authorization
          ? req.headers.authorization
          : "",
        "X-Api-Key": process.env.SMILE_KEY,
        "X-Api-Secret": process.env.SMILE_SECRET,
      },
      data: req.body,
      httpsAgent, // Use custom HTTPS agent
    })
      .then((response) => {
        res.status(200).json(response.data);
      })
      .catch((error) => {
        res.status(400).json(error.response.data);
      });
  } catch (error) {
    res.status(400).json(error.response.data);
  }
};
