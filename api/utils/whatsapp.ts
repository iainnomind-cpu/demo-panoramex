// ============================================================
// PANORAMEX CRM — WhatsApp Shared Utility (api/utils/whatsapp.ts)
// Reutilizable por: webhook, campaigns/send-batch, cron/birthdays, cron/surveys
// ============================================================

const META_API_VERSION = 'v20.0'
const META_API_URL = `https://graph.facebook.com/${META_API_VERSION}`

/**
 * Sends a plain text message via WhatsApp Cloud API
 */
export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<{ messages: Array<{ id: string }> }> {
  const url = `${META_API_URL}/${phoneNumberId}/messages`

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `WA send failed: ${response.status} ${response.statusText} - ${errorBody}`
    )
  }

  return await response.json()
}

/**
 * Sends a pre-approved template message via WhatsApp Cloud API
 * Components follow the Meta template format:
 * https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates
 */
export async function sendWhatsAppTemplate(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  templateName: string,
  languageCode: string = 'es',
  components: Array<{
    type: 'header' | 'body' | 'button'
    parameters?: Array<{ type: 'text'; text: string }>
    sub_type?: 'quick_reply' | 'url'
    index?: number
  }> = []
): Promise<{ messages: Array<{ id: string }> }> {
  const url = `${META_API_URL}/${phoneNumberId}/messages`

  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: components.length > 0 ? components : undefined,
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `WA template send failed: ${response.status} ${response.statusText} - ${errorBody}`
    )
  }

  return await response.json()
}

/**
 * Sends a template with interactive buttons (used for surveys)
 * Button payloads should encode the survey context: e.g. "SURVEY_5_RES_abc123"
 */
export async function sendWhatsAppInteractiveButtons(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<{ messages: Array<{ id: string }> }> {
  const url = `${META_API_URL}/${phoneNumberId}/messages`

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: 'reply',
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `WA interactive send failed: ${response.status} ${response.statusText} - ${errorBody}`
    )
  }

  return await response.json()
}

/**
 * Sleeps for a given number of milliseconds — used for throttling
 */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
