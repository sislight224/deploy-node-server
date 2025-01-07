const https = require("https");
const fs = require("fs");
const http = require("http");
const axios = require("axios");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid"); // Import the UUID function

const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  //   service: 'smtp.hostnet.nl',
  //   auth: {
  //     user: 'noreply@3dconfigure.nl',
  //     pass: 'Dz8000csdsd_+='
  //   }
  host: "smtp.hostnet.nl",
  port: 587,
  auth: {
    user: "noreply@3dconfigure.nl", // your email address
    pass: "Dz8000csdsd_+=", // your email password
  },
});

const API_URL = "https://3dconfiguration.net";
// const API_URL = "http://localhost:4000";

const app = express();
const port = process.env.PORT || 4000;

const multer = require("multer");
const { sendDataTransaction } = require("./generateTx");
// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ dest: "uploads/", storage: storage }); // specify the uploads directory

const options = {
  // key: fs.readFileSync('privatekey.pem'),
  // cert: fs.readFileSync('certificate.pem')
};

// Configure CORS to allow requests from your specific origin
const corsOptions = {
  origin: "*", // Allow this origin to access the resource
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});
app.get("/company-horse", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/upload", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log(req.body);
  const { to_email } = req.body;
  console.log(to_email);
  // Generate a UUID for the uploaded file
  const fileUUID = uuidv4();
  const fileName = `${fileUUID}${path.extname(req.file.originalname)}.pdf`; // Append the original file extension

  const filePath = path.join(__dirname, "uploads", fileName);
  fs.writeFileSync(filePath, req.file.buffer);

  var mailOptions_for_customer = {
    from: "Boxspringgelderland <noreply@3dconfigure.nl>",
    to: to_email,
    replyTo: "info@boxspringgelderland.nl",
    subject: "Uw aanvraag van",
    html: `
      <h1 style="text-align: center;">Uw offerte is gereed.</h1>
      <table border="0" cellspacing="0" cellpadding="40" align="center">
          <tbody>
              <tr>
                  <td align="center">
                      <p>Klik hieronder om de offerte te downloaden.</p>
                  </td>
              </tr>
              <tr></tr>
          </tbody>
      </table>
      <table border="0" cellspacing="0" cellpadding="40" align="center">
          <tbody>
              <tr>
                  <td align="center"><a href="${API_URL}/uploads/${fileName}" download="offer.pdf">Download PDF</a></td>
              </tr>
              <tr>
                  <td>
                      <p>Let op: Dit is een automatisch gegenereerd bericht waar niet op gereageerd kan worden. Heeft u vragen of opmerkingen? Stuur dan een e-mail naar info@boxspringgelderland.nl</p>
                  </td>
              </tr>
          </tbody>
      </table>
  
    `,
  };

  var mailOptions_for_company = {
    from: `Boxspringgelderland from ${to_email} <noreply@3dconfigure.nl>`,
    to: "info@boxspringgelderland.nl",
    replyTo: to_email,
    subject: "Uw aanvraag van",
    html: `
      <h1 style="text-align: center;">Uw offerte is gereed.</h1>
      <table border="0" cellspacing="0" cellpadding="40" align="center">
          <tbody>
              <tr>
                  <td align="center">
                      <p>Klik hieronder om de offerte te downloaden.</p>
                  </td>
              </tr>
              <tr></tr>
          </tbody>
      </table>
      <table border="0" cellspacing="0" cellpadding="40" align="center">
          <tbody>
              <tr>
                  <td align="center"><a href="${API_URL}/uploads/${fileName}" download="offer.pdf">Download PDF</a></td>
              </tr>
              <tr>
                  <td>
                      <p>Let op: Dit is een automatisch gegenereerd bericht waar niet op gereageerd kan worden. Heeft u vragen of opmerkingen? Stuur dan een e-mail naar info@boxspringgelderland.nl</p>
                  </td>
              </tr>
          </tbody>
      </table>
    `,
  };

  transporter.sendMail(mailOptions_for_customer, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  transporter.sendMail(mailOptions_for_company, function (error, info) {
    if (error) {
      console.log(error);
      res.send({ status: "error", message: fileName });
    } else {
      console.log("Email sent: " + info.response);
      res.send({ status: "success", message: fileName });
    }
  });

  res.send({ status: "success", message: fileName });
});

app.get("/api/get-all-tokens", (req, res) => {
  axios
    .get("http://3.146.146.202:9200/data-application/active-users/all")
    .then((result) => {
      console.log(result.data);
      res.send(
        result.data.map((item) => {
          const { id, userId } = item[1];
          return {
            userId: userId,
            token: id,
          };
        })
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
});

app.get("/api/get-token/:userId", (req, res) => {
  axios
    .get("http://3.146.146.202:9200/data-application/active-users/all")
    .then((result) => {
      console.log(result.data);
      res.send(
        result.data.filter((item) => item[1].userId == req.params.userId)
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
});

app.post("/api/create-token", async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await sendDataTransaction(
      userId,
    );
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send(`${err.message}`);
  }
});

http.createServer(options, app).listen(port, function (req, res) {
  console.log(`server started at port ${port}`);
});
