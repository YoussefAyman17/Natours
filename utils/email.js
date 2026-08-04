const Nodemailer = require('nodemailer');
const { MailtrapTransport } = require('mailtrap');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.name = user.name;
    this.url = url;
    this.from = `Youssef Ayman <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    const TOKEN = process.env.EMAIL_TOKEN;
    return Nodemailer.createTransport(
      MailtrapTransport({
        token: TOKEN,
        sandbox: true,
        testInboxId: 4757598,
      }),
    );
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const sender = {
      address: this.from,
      name: this.name,
    };
    const recipients = this.to;

    const mailOptions = {
      from: sender,
      to: recipients,
      subject: subject,
      html,
      text: htmlToText.convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
};
