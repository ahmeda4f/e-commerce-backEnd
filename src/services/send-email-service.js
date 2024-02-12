import nodemailer from "nodemailer";
const sendEmailService = async ({
  to = "",
  subject = "no-reply",
  message = `<h1>no-message</h1>`,
  attachements = [],
}) => {
  const transporter = nodemailer.createTransport({
    host: "localhost",
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: `"Fred Foo 👻" <${process.env.EMAIL}>`, // sender address
    to,
    subject,
    html: message, // html body
    attachements,
  });
  return info.accepted.length ? true : false;
};
export default sendEmailService;
