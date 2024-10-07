const https = require('https');
const fs = require('fs');
const http = require('http');
const axios = require('axios');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
const express = require('express');
const path = require('path');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid'); // Import the UUID function

const app = express();
const port = process.env.PORT || 4000;

const multer = require('multer'); 
// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ dest: 'uploads/', storage: storage }); // specify the uploads directory

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  console.log(req.body);
  
  // Generate a UUID for the uploaded file
  const fileUUID = uuidv4();
  const fileName = `${fileUUID}${path.extname(req.file.originalname)}.pdf`; // Append the original file extension

  const filePath = path.join(__dirname, 'uploads', fileName);
  fs.writeFileSync(filePath, req.file.buffer);
  res.send({status: "success", message : fileName});
});  

http.createServer(options, app)
.listen(port, function(req, res) {
  console.log(`server started at port ${port}`)
})

