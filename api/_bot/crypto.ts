import crypto from 'crypto';

export function verifyMetaSignature(
  payload: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) {
    return false;
  }

  // The signature comes as "sha256=<hash>"
  const signature = signatureHeader.replace('sha256=', '');

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload, 'utf8')
    .digest('hex');

  // Use timing-safe equal to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (e) {
    return false; // For instance if lengths are different
  }
}
