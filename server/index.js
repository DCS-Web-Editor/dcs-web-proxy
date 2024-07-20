import express from "express";
import axios from "axios";
import fs from "fs";
import http from "http";
import https from "https";

var privateKey = fs.readFileSync("./localhost-key.pem", "utf8");
var certificate = fs.readFileSync("./localhost.pem", "utf8");
var credentials = { key: privateKey, cert: certificate };

const app = express();

var httpsServer = https.createServer(credentials, app);
const PORT = 443;

httpsServer.listen(PORT, () => {
  console.log("Our app is listening for request on port", PORT);
});

const config = {
  timeout: 2000,
};

app.get("*", async (req, res) => {
  console.log("REQUEST", req.path);
  try {
    const forward = await axios.get("http://localhost:31485" + req.path, config);
    const data = forward?.data;
    res.send(data);
  } catch (error) {
    console.error(error.cause);
    res.status(500);
    res.send(error.cause);
  }
});
