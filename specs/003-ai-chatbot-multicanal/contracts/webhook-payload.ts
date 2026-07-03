export interface MetaWebhookPayload {
  object: string; // usually "whatsapp_business_account"
  entry: Array<{
    id: string; // WhatsApp Business Account ID
    changes: Array<{
      value: {
        messaging_product: string; // "whatsapp"
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string; // Sender's phone number
          id: string;   // Message ID
          timestamp: string;
          text?: {
            body: string;
          };
          type: string; // "text", "image", etc.
          referral?: {  // Click-to-WhatsApp Ads
            source_url: string;
            source_type: string;
            source_id: string;
            headline: string;
            body: string;
            media_type: string;
            image_url: string;
            video_url: string;
            thumbnail_url: string;
          };
        }>;
        statuses?: Array<{ // Message status updates (delivered, read)
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string; // "messages"
    }>;
  }>;
}
