const https = require('https');
const fs = require('fs');
const http = require('http');
const axios = require('axios');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
const express = require('express');
const path = require('path');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

const options = {
  // key: fs.readFileSync('server.key'),
  // cert: fs.readFileSync('server.cert')
};
app.use(cors());
app.use(express.static('public')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});
app.get('/company-horse', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});


http.createServer(options, app)
.listen(port, function(req, res) {
  console.log(`server started at port ${port}`)
})

