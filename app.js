const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes/routes");
const port = process.env.PORT || 5001;

const app = express();


// middleware
app.use(express.static("public"));
app.use(express.json({limit: '100mb'}));
// app.use(express.urlencoded({ limit: '100mb', extended: true }));


// view engine
app.set("view engine", "ejs");
app.use(
  cors({
    origin: "*",
  })
);

app.listen(port, () => {
  console.log(`App listening on PORT: ${port}`);
});

// routes
app.get("/", (req, res) => res.send("<h2>Kuleanpay reverse proxy</h2>"));
app.use(routes);
