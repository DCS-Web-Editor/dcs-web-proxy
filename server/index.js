import express from "express";
import axios from "axios";
import fs from "fs";
import http from "http";
import https from "https";
import cors from "cors";


var privateKey = fs.readFileSync("./localhost-key.pem", "utf8");
var certificate = fs.readFileSync("./localhost.pem", "utf8");
var credentials = { key: privateKey, cert: certificate };

const app = express();
app.use(cors());

var httpsServer = https.createServer(credentials, app);
const PORT = 443;

import { networkInterfaces } from "os";

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
    if (net.family === familyV4Value && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

httpsServer.listen(PORT, () => {
  console.log("DCS Web Proxy is listening for https requests on port", PORT);
  console.log("\nLocal network IP adresses:", JSON.stringify(results, null, 2));
  console.log("------------------");
});

const config = {
  timeout: 2000,
};

app.get("*", async (req, res) => {
  console.log("REQUEST", req.path, res.statusCode);
  try {
    const forward = await axios.get("http://127.0.0.1:31485" + req.path, config);
    const data = forward?.data;
    res.send(data);
  } catch (error) {
    if(error.cause) console.error(error.cause);
    res.status(500);
    res.send(error.cause);
  }
});
