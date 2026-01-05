const nodemailer = require('nodemailer');

function getBaseUrl() {
  const raw =
    process.env.APP_BASE_URL ||
    process.env.APP_URL ||
    process.env.BASE_URL ||
    process.env.SITE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.RAILWAY_PUBLIC_DOMAIN ||
    process.env.CYCLIC_URL ||
    (process.env.VERCEL_URL
      ? (process.env.VERCEL_URL.startsWith('http')
        ? process.env.VERCEL_URL
        : `https://${process.env.VERCEL_URL}`)
      : null) ||
    `http://localhost:${process.env.PORT || 3000}`;

  return String(raw).replace(/\/$/, '');
}

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      'Mailer belum dikonfigurasi. Set env GMAIL_USER dan GMAIL_APP_PASSWORD.'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

async function sendPasswordResetEmail({ to, token }) {
  const transporter = createTransporter();
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  const from = process.env.MAIL_FROM || process.env.GMAIL_USER;
  const appName = process.env.APP_NAME || 'Sistem Komoditas';

  await transporter.sendMail({
    from: `${appName} <${from}>`,
    to,
    subject: `[${appName}] Reset Password`,
    text:
      `Anda meminta reset password.\n\n` +
      `Klik link ini untuk reset password (berlaku 1 jam):\n${resetUrl}\n\n` +
      `Jika Anda tidak meminta reset password, abaikan email ini.`,
    html:
      `<p>Anda meminta reset password.</p>` +
      `<p><strong>Link reset password (berlaku 1 jam):</strong><br>` +
      `<a href="${resetUrl}">${resetUrl}</a></p>` +
      `<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>`
  });
}

async function sendPasswordResetOtpEmail({ to, otp }) {
  const transporter = createTransporter();
  const baseUrl = getBaseUrl();
  const resetPageUrl = `${baseUrl}/reset-password`;

  const from = process.env.MAIL_FROM || process.env.GMAIL_USER;
  const appName = process.env.APP_NAME || 'Sistem Komoditas';

  await transporter.sendMail({
    from: `${appName} <${from}>`,
    to,
    subject: `[${appName}] Kode OTP Reset Password`,
    text:
      `Anda meminta reset password.\n\n` +
      `Kode OTP Anda (berlaku 10 menit): ${otp}\n\n` +
      `Buka halaman reset password untuk memasukkan OTP:\n${resetPageUrl}\n\n` +
      `Jika Anda tidak meminta reset password, abaikan email ini.`,
    html:
      `<p>Anda meminta reset password.</p>` +
      `<p><strong>Kode OTP (berlaku 10 menit):</strong><br>` +
      `<span style="font-size: 24px; letter-spacing: 4px; font-weight: 700;">${otp}</span></p>` +
      `<p>Masukkan kode tersebut di halaman reset password:<br>` +
      `<a href="${resetPageUrl}">${resetPageUrl}</a></p>` +
      `<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>`
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetOtpEmail,
  getBaseUrl
};
