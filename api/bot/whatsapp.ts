const META_API_VERSION = 'v20.0';
const META_API_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<any> {
  const url = `${META_API_URL}/${phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: { body: text }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send WhatsApp message: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return await response.json();
}
