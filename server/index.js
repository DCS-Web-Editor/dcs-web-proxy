// import express from "express";
const express = require('express');
const axios = require("axios");
const fs = require("fs");
const http = require("http");
const https = require("https");
const cors = require("cors");


var privateKey = fs.readFileSync("./localhost-key.pem", "utf8");
var certificate = fs.readFileSync("./localhost.pem", "utf8");
var credentials = { key: privateKey, cert: certificate };

const app = express();
app.use(cors());

var httpsServer = https.createServer(credentials, app);

const { networkInterfaces } = require("os");

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


const config = {
  timeout: 2000,
};

app.get("*", async (req, res) => {
  const forwarded = "http://127.0.0.1:31485" + req.path;
  try {
    const forward = await axios.get(forwarded, config);
    console.log(req.method, req.protocol, req.headers.host + req.path, "forwarded to", forwarded, forward.status);
    const data = forward?.data;
    res.send(data);
  } catch (error) {
    if(error.cause) console.error(error.cause);
    console.log(req.method, "failed", forwarded, forward.status);
    res.status(500);
    res.send(error.cause);
  }
});


module.exports = function startProxy(port = 443) {
  httpsServer.listen(port, () => {
    console.log("DCS Web Proxy is listening for https requests on port", port);
    console.log("\nLocal network IP adresses:", JSON.stringify(results, null, 2));
    console.log("------------------");
  });
    
}