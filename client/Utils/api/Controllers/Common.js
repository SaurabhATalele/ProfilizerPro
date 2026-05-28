import nodeMailer from "nodemailer";

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.PASS_KEY,
  },
});

const sendMail = async (body) => {
  const { email, name, message } = body;
  try {
    const mailOptions = {
      from: "saurabhatalele@gmail.com",
      to: "saurabhatalele@gmail.com",
      subject: "Contact Form Submission",
      html: `Email: ${email} </br> Mobile:${name} </br> ${message}`,
    };
    await transporter.sendMail(mailOptions);

    return { message: "Mail sent successfully. We will Contact You Soon" };
  } catch (error) {
    console.log(error);
    return { message: "Something went wrong" };
  }
};

export default sendMail;
