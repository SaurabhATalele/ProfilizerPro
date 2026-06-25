import { sendEmail } from "@/Utils/api/email";

interface ContactFormBody {
  email: string;
  name: string;
  message: string;
}

interface MailResponse {
  message: string;
}

const sendMail = async (body: ContactFormBody): Promise<MailResponse> => {
  const { email, name, message } = body;

  const to = process.env.CONTACT_RECIPIENT || process.env.EMAIL_ID;
  if (!to) {
    return { message: "Email service is not configured" };
  }

  const result = await sendEmail({
    to,
    subject: "Contact Form Submission",
    html: `Email: ${email} </br> Name: ${name} </br> ${message}`,
  });

  if (!result.success) {
    return { message: "Something went wrong" };
  }

  return { message: "Mail sent successfully. We will Contact You Soon" };
};

export default sendMail;
