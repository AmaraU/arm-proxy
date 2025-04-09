const axios = require("axios");
const fetch = require("node-fetch");
const https = require("https");

const APIURL = "https://apitest.armmfb.com.ng/CoralPay";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});


const coralcontroller = {
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
};

module.exports = coralcontroller;
// module.exports.get = async (req, res) => {
//   try {
//     axios({
//       method: "GET",
//       url: APIURL + req.query.url,
//       headers: {
//         ContentType: "application/json",
//         Authorization: req.headers.authorization
//           ? req.headers.authorization
//           : "",
//         "X-ARM-Api-Key-P": process.env.API_KEY,
//       },
//       httpsAgent, // Use custom HTTPS agent
//     })
//       .then((response) => {
//         res.status(200).json(response.data);
//       })
//       .catch((error) => {
//         res.status(400).json(error.response.data);
//       });
//   } catch (error) {
//     res.status(400).json(error.response.data);
//   }
// };

// module.exports.login = async (req, res) => {
//   try {
//     axios({
//       method: "POST",
//       url: APIURL + req.query.url,
//       headers: {
//         ContentType: req.headers["content-type"],
//         "X-ARM-Api-Key-P": process.env.API_KEY,
//       },
//       data: req.body,
//       httpsAgent,
//     })
//       .then((response) => {
//         res.status(200).json(response.data);
//       })
//       .catch((error) => {
//         console.error(error)
//         res.status(400).json(error.response.data);
//       });
//   } catch (error) {
//     console.error(error)
//     res.status(400).json(error.response.data);
//   }
// };

// module.exports.post = async (req, res) => {
//   try {
//     axios({
//       method: "POST",
//       url: APIURL + req.query.url,
//       headers: {
//         "Content-Type": req.headers["content-type"],
//         Authorization: req.headers.authorization
//           ? req.headers.authorization
//           : "",
//         "X-ARM-Api-Key-P": process.env.API_KEY,
//       },
//       data: req.body,
//       httpsAgent, // Use custom HTTPS agent
//     })
//       .then((response) => {
//         res.status(200).json(response.data);
//       })
//       .catch((error) => {
//         res.status(400).json(error.response.data);
//       });
//   } catch (error) {
//     res.status(400).json(error.response.data);
//   }
// };



// module.exports.put = async (req, res) => {
//   try {
//     axios({
//       method: "PUT",
//       url: APIURL + req.query.url,
//       headers: {
//         "Content-Type": req.headers["content-type"],
//         Authorization: req.headers.authorization
//           ? req.headers.authorization
//           : "",
//         "X-ARM-Api-Key-P": process.env.API_KEY,
//       },
//       data: req.body,
//       httpsAgent, // Use custom HTTPS agent
//     })
//       .then((response) => {
//         res.status(200).json(response.data);
//       })
//       .catch((error) => {
//         res.status(400).json(error.response.data);
//       });
//   } catch (error) {
//     res.status(400).json(error.response.data);
//   }
// };

// module.exports.upload = async (req, res) => {
//   try {
//     var myHeaders = new Headers();
//     myHeaders.append("channel", req.headers.channel);
//     myHeaders.append("Authorization", req.headers.authorization);

//     const formdata = new FormData();
//     formdata.append("file", req.body, "[PROXY]");

//     // Append the file here
//     var requestOptions = {
//       method: "POST",
//       headers: myHeaders,
//       body: formdata,
//       redirect: "follow",
//       agent: new https.Agent({ rejectUnauthorized: false }), // Use custom HTTPS agent for fetch
//     };

//     const response = await fetch(APIURL + req.query.url, requestOptions);
//     const data = await response.json(); // Assuming the response is JSON
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(400).json(error.response.data);
//   }
// };

// module.exports.delete = async (req, res) => {
//   try {
//     axios({
//       method: "DELETE",
//       url: APIURL + req.query.url,
//       headers: {
//         "Content-Type": req.headers["content-type"],
//         Authorization: req.headers.authorization
//           ? req.headers.authorization
//           : "",
//         "X-ARM-Api-Key-P": process.env.API_KEY,
//       },
//       data: req.body,
//       httpsAgent, // Use custom HTTPS agent
//     })
//       .then((response) => {
//         res.status(200).json(response.data);
//       })
//       .catch((error) => {
//         res.status(400).json(error.response.data);
//       });
//   } catch (error) {
//     res.status(400).json(error.response.data);
//   }
// };
