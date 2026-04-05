import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

export const sendMail = async ({ recipient, subject, text }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail", // ✅ FIXED
            auth: {
                user: "mdsamiransari@gmail.com",
                pass: ""
            },
        });

        const info = await transporter.sendMail({
            from: "mdsamiransari@gmail.com",
            to: recipient,
            subject,
            text
        });

        console.log("Mail sent:", info.response);

    } catch (e) {
        console.log("Error:", e);
    }
};

export const sendMailUsingMailsender = async ({ recipient, subject, text, name }) => {
    try {
        const mailerSend = new MailerSend({
            apiKey: process.env.MAIL_API_KEY,
        });

        const sentFrom = new Sender(process.env.MAIL_SENDER_EMAIL, "Mohammad Samir");

        const recipients = [
            new Recipient(recipient, "Anonymous")
        ];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject(subject)
            .setHtml(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; margin-top:30px; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background:#4f46e5; padding:20px; text-align:center; color:#ffffff;">
              <h1 style="margin:0;">Welcome 🎉</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333;">
              <h2 style="margin-top:0;">Hi ${name},</h2>
              
              <p style="font-size:16px; line-height:1.6;">
                Thank you for registering with us! We're excited to have you on board.
              </p>

              
              <p style="font-size:14px; color:#777;">
                If you have any questions, feel free to reach out.
              </p>

              <p style="font-size:14px;">
                — Team Samir 🚀</br>
                — mdsamiransari2000@gmail.com 🚀
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f6f8; padding:15px; text-align:center; font-size:12px; color:#888;">
              © 2026 Your Company. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`)
            .setText(text);

        const response = await mailerSend.email.send(emailParams);

        console.log("Mail sent:", response);


    } catch (e) {
        console.log("Error:", e);
    }
};

export const isAdmin = (req, res, next) => {
    console.log("isAdmin called", process.env.USER_EMAIL);

    const { authKey } = req.body;

    if (!authKey) {
        return res.status(401).json({ message: "Auth Key required" });
    }
    if (authKey) {
        try {
            const decoded = jwt.verify(authKey, "mysecret");
            if (!decoded) {
                return res.status(400).json({ message: "Something went wrong" });
            }
            if (decoded['data']['userType'] == 'Admin') {
                next();
                return;
            } else {
                return res.status(403).json({ message: "You're not authorized to perform this action" });
            }
        } catch (e) {
            console.log('47-->', e);
            return res.status(401).json({ message: e });
        }
    }
};

export const isExist = (req, res, next) => {
    // console.log("isAdmin called", req.body);

    const { authKey } = req.body;

    if (!authKey) {
        return res.status(401).json({ message: "Auth Key required" });
    }
    if (authKey) {
        try {
            const decoded = jwt.verify(authKey, "mysecret");            
            if (!decoded) {
                return res.status(400).json({ message: "Something went wrong" });
            }
            if (decoded['data']) {
                next();
                return;
            } else {
                return res.status(403).json({ message: "You're not authorized to perform this action" });
            }
        } catch (e) {
            console.log('47-->', e);
            return res.status(401).json({ message: e });
        }
    }
};