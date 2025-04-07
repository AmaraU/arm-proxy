import express from "express"
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();
import routes from "./routes/routes.js";
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
app.get("/", (req, res) => res.send("<h2>Finedge reverse proxy</h2>"));
app.use(routes);
