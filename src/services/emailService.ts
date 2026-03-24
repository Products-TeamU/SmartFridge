import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY не задан');
}
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (to: string, resetLink: string) => {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'SmartFridge <noreply@smartfridge.ru>',
    to,
    subject: 'Сброс пароля в SmartFridge',
    html: `
      <p>Вы запросили сброс пароля для вашей учётной записи SmartFridge.</p>
      <p>Перейдите по ссылке, чтобы установить новый пароль:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Ссылка действительна в течение 1 часа.</p>
      <p>Если вы не запрашивали сброс, просто проигнорируйте это письмо.</p>
    `,
  });
  if (error) {
    console.error('Resend error:', error);
    throw new Error('Не удалось отправить письмо');
  }
  console.log(`Reset email sent to ${to} via Resend`);
};