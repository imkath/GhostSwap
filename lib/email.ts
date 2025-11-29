import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface DrawNotificationParams {
  to: string
  recipientName: string
  groupName: string
  groupId: string
}

export async function sendDrawNotification({
  to,
  recipientName,
  groupName,
  groupId,
}: DrawNotificationParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ghostswap-phi.vercel.app'
  const groupUrl = `${appUrl}/groups/${groupId}`

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'GhostSwap <onboarding@resend.dev>',
      to,
      subject: `${groupName} - ¡El sorteo ya se realizó!`,
      html: getEmailTemplate({ recipientName, groupName, groupUrl }),
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

interface EmailTemplateParams {
  recipientName: string
  groupName: string
  groupUrl: string
}

function getEmailTemplate({ recipientName, groupName, groupUrl }: EmailTemplateParams) {
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

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3.5 5.5-.5.5-1 1.5-1 2.5 0 1.5 1 2.5 2 3v1c0 1.1.9 2 2 2s2-.9 2-2v-1c1-.5 2-1.5 2-3 0-1-.5-2-1-2.5 2-1 3.5-3 3.5-5.5 0-3.5-2.5-6-6-6z" fill="#4f46e5"/>
                  <circle cx="9" cy="8" r="1.5" fill="white"/>
                  <circle cx="15" cy="8" r="1.5" fill="white"/>
                </svg>
                <span style="font-size: 24px; font-weight: 700; color: #0f172a;">GhostSwap</span>
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

export async function sendDrawNotifications(
  participants: Array<{ email: string; name: string }>,
  groupName: string,
  groupId: string
) {
  const results = await Promise.allSettled(
    participants.map((participant) =>
      sendDrawNotification({
        to: participant.email,
        recipientName: participant.name,
        groupName,
        groupId,
      })
    )
  )

  const successful = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  console.log(`Sent ${successful} emails, ${failed} failed for group ${groupId}`)

  return { successful, failed }
}
