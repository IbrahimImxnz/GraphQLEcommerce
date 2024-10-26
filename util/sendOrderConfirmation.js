const nodemailer = require("nodemailer");
require("dotenv").config();
const asyncHandler = require("express-async-handler");

const sendOrderConfirmation = asyncHandler(async (userEmail, transactionId) => {
  // const randomCode = Math.floor(10000000 + Math.random() * 90000000); // 8 digit code

  const html = `
    <h1>Your Order</h1>
    <p>Your code is confirmed #${transactionId}</p>
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
    subject: "Your Order",
    html: html,
  });

  console.log("Message sent: " + info.messageId);
  console.log(info.accepted); // which email was accepted
  console.log(info.rejected); // rejected
});

// main().catch((e) => console.log(e));
module.exports = sendOrderConfirmation;
