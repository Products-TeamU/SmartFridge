import nodemailer from 'nodemailer';

// Настройка транспорта для отправки писем
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // SMTP-сервер (например, smtp.mail.ru)
  port: Number(process.env.SMTP_PORT), // порт (465 для SSL, 587 для STARTTLS)
  secure: process.env.SMTP_SECURE === 'true', // true для порта 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Отправляет письмо со ссылкой для сброса пароля
 * @param to - email получателя
 * @param resetLink - полная ссылка для сброса пароля (формируется в контроллере)
 */
export const sendResetEmail = async (to: string, resetLink: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Сброс пароля в SmartFridge',
    html: `
      <p>Вы запросили сброс пароля для вашей учётной записи SmartFridge.</p>
      <p>Перейдите по ссылке, чтобы установить новый пароль:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Ссылка действительна в течение 1 часа.</p>
      <p>Если вы не запрашивали сброс, просто проигнорируйте это письмо.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
  console.log(`Reset email sent to ${to} via ${process.env.SMTP_HOST}`);
};