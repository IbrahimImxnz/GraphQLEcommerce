const nodemailer = require("nodemailer");
require("dotenv").config();
const asyncHandler = require("express-async-handler");

const sendMail = asyncHandler(async (userEmail, randomCode) => {
  // const randomCode = Math.floor(10000000 + Math.random() * 90000000); // 8 digit code

  const html = `
    <h1>Your code</h1>
    <p>Your code is ${randomCode}</p>
    <img src="cid:uniqueimage" width="700" height="350">
`;
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.HOST_PORT, // this is ssl // for tls differs
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `Ibrahim <${process.env.EMAIL}>`,
    to: userEmail, // const emails = [...] for multiple recipients
    subject: "Your code",
    html: html,
    attachments: [
      { filename: "unlock.jpg", path: "./unlock.jpg", cid: "uniqueimage" },
    ],
  });

  console.log("Message sent: " + info.messageId);
  console.log(info.accepted); // which email was accepted
  console.log(info.rejected); // rejected
});

// main().catch((e) => console.log(e));
module.exports = sendMail;
