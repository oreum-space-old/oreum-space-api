import fs from 'fs'
import { createTransport, Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

const
  host = process.env.SMTP_HOST,
  port = process.env.SMTP_PORT,
  user = process.env.SMTP_USER,
  pass = process.env.SMTP_PASS

if (!host) {
  throw new Error('SMTP_HOST is not defined!')
}
if (!port) {
  throw new Error('SMTP_PORT is not defined!')
}
if (!user) {
  throw new Error('SMTP_USER is not defined!')
}
if (!pass) {
  throw new Error('SMTP_PASS is not defined!')
}

type MailRegistrationHTML = [string, string, string, string]

const options: SMTPTransport.Options = {
  host,
  port: parseInt(port),
  secure: false,
  auth: {
    user,
    pass
  }
}

export default new class MailTransporter {
  transporter: Transporter
  static html = fs.readFileSync('./src/assets/mail-registration.html', 'utf8').split('$$$') as MailRegistrationHTML

  constructor () {
    this.transporter = createTransport(options)
  }

  getHTML (username: string, code: string, activationLink: string): string {
    const html = MailTransporter.html
    return `${
      html[0]
    }${
      username
    }${
      html[1]
    }${
      code
    }${
      html[2] 
    }${
      activationLink
    }${
      html[3]
    }`
  }

  async sendActivationMail (to: string, username: string, code: string, link: string) {
    await this.transporter.sendMail({
      from: user,
      to,
      subject: 'Активация аккаунта на ' + process.env.API_URL,
      text: '',
      html: this.getHTML(username, code, link)
    })
  }
}