import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function testBrevoEmail() {
  const testEmail = process.argv[2]

  if (!testEmail) {
    console.error('Usage: npx tsx scripts/test-email.ts <email>')
    console.error('Example: npx tsx scripts/test-email.ts test@example.com')
    process.exit(1)
  }

  const user = process.env.BREVO_SMTP_USER
  const pass = process.env.BREVO_SMTP_KEY
  const from = process.env.EMAIL_FROM || 'GhostSwap <hello@kthcsk.me>'

  if (!user || !pass) {
    console.error('Brevo SMTP credentials not configured.')
    console.error('Set BREVO_SMTP_USER and BREVO_SMTP_KEY in .env.local')
    process.exit(1)
  }

  console.log('Testing Brevo SMTP configuration...')
  console.log('SMTP User:', user)
  console.log('From:', from)
  console.log('Sending to:', testEmail)
  console.log('')

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user,
      pass,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ghostswap.kthcsk.me'
  const groupUrl = `${appUrl}/groups/test-group-id`

  try {
    const info = await transporter.sendMail({
      from,
      to: testEmail,
      subject: 'Test - ¡El sorteo ya se realizó!',
      html: getTestEmailTemplate({
        recipientName: 'Usuario de Prueba',
        groupName: 'Grupo de Prueba',
        groupUrl,
      }),
    })

    console.log('Email sent successfully!')
    console.log('Message ID:', info.messageId)
    console.log('Response:', info.response)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

interface EmailTemplateParams {
  recipientName: string
  groupName: string
  groupUrl: string
}

function getTestEmailTemplate({ recipientName, groupName, groupUrl }: EmailTemplateParams) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡El sorteo ya se realizó!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; width: 100%; border-collapse: collapse;">

          <!-- Test Banner -->
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <div style="background-color: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                ⚠️ CORREO DE PRUEBA (Brevo SMTP)
              </div>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <span style="font-size: 24px; font-weight: 700; color: #0f172a;">👻 GhostSwap</span>
              </div>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">

                <!-- Emoji Header -->
                <tr>
                  <td align="center" style="padding: 32px 32px 0;">
                    <div style="font-size: 48px;">🎁</div>
                  </td>
                </tr>

                <!-- Title -->
                <tr>
                  <td align="center" style="padding: 16px 32px 8px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0f172a;">
                      ¡El sorteo ya se realizó!
                    </h1>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td align="center" style="padding: 8px 32px 24px;">
                    <p style="margin: 0; font-size: 16px; line-height: 24px; color: #475569;">
                      Hola <strong style="color: #0f172a;">${recipientName}</strong>,
                    </p>
                    <p style="margin: 12px 0 0; font-size: 16px; line-height: 24px; color: #475569;">
                      El sorteo del grupo <strong style="color: #4f46e5;">${groupName}</strong> ya se realizó.
                      ¡Entra a tu cuenta para descubrir a quién le vas a regalar!
                    </p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding: 0 32px 32px;">
                    <a href="${groupUrl}"
                       style="display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.4);">
                      Ver mi Amigo Secreto
                    </a>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 0 32px;">
                    <div style="height: 1px; background-color: #e2e8f0;"></div>
                  </td>
                </tr>

                <!-- Reminder -->
                <tr>
                  <td align="center" style="padding: 24px 32px 32px;">
                    <p style="margin: 0; font-size: 14px; color: #64748b;">
                      Recuerda que solo tú puedes ver a quién te tocó.
                      ¡No le cuentes a nadie! 🤫
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 20px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #94a3b8;">
                Este correo fue enviado por GhostSwap
              </p>
              <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                Si no esperabas este correo, puedes ignorarlo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

testBrevoEmail()
