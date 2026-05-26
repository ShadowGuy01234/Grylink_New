const { Resend } = require('resend');

const createTransporter = () => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  return {
    sendMail: async (options) => {
      // Force 'from' to use the verified Resend domain
      const from = 'Gryork <no-reply@gryork.com>';
      
      const res = await resend.emails.send({
        from: from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (res.error) {
        console.error("Resend API Error:", res.error);
        throw new Error(res.error.message);
      }
      
      return res;
    }
  };
};

module.exports = createTransporter;
