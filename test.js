var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
//   service: 'smtp.hostnet.nl',
//   auth: {
//     user: 'noreply@3dconfigure.nl',
//     pass: 'Dz8000csdsd_+='
//   }
  host: "smtp.hostnet.nl",  
  port: 587,  
//   secure: true, // use SSL  
  auth: {  
      user: 'noreply@3dconfigure.nl', // your email address  
      pass: 'Dz8000csdsd_+=' // your email password  
  } 
});

var mailOptions = {
  from: 'Boxspringgelderland <noreply@3dconfigure.nl>',
  to: 'sislight0224@gmail.com',
  replyTo: "info@boxspringgelderland.nl",
  subject: 'Uw aanvraag van',
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
                <td align="center"><a href="{{ pdf }}" download="offer.pdf">Download PDF</a></td>
            </tr>
            <tr>
                <td>
                    <p>Let op: Dit is een automatisch gegenereerd bericht waar niet op gereageerd kan worden. Heeft u vragen of opmerkingen? Stuur dan een e-mail naar info@boxspringgelderland.nl</p>
                </td>
            </tr>
        </tbody>
    </table>

  `
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});