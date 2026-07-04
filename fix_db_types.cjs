const fs = require('fs');
let content = fs.readFileSync('src/lib/database.types.ts', 'utf8');

// 1. Add CompositeTypes
if (!content.includes('CompositeTypes: Record<string, never>')) {
  content = content.replace(
    'Enums: Record<string, never>',
    'Enums: Record<string, never>\n    CompositeTypes: Record<string, never>'
  );
}

// 2. Add can_edit_catalog to agents Row
if (!content.includes('can_edit_catalog: boolean')) {
  content = content.replace(
    /role: 'admin' \| 'agent'/g,
    "role: 'admin' | 'agent'\n          can_edit_catalog: boolean"
  );
}

// 3. Add can_edit_catalog? to agents Insert and Update
if (!content.includes('can_edit_catalog?: boolean')) {
  content = content.replace(
    /role\?: 'admin' \| 'agent'/g,
    "role?: 'admin' | 'agent'\n          can_edit_catalog?: boolean"
  );
}

// 4. Add campaign_id to satisfaction_surveys
if (!content.includes('campaign_id: string')) {
  // We need to inject it into satisfaction_surveys Row
  const targetRow = 'reservation_id: string\n            prospect_id: string';
  content = content.replace(
    targetRow,
    'reservation_id: string\n            campaign_id: string\n            prospect_id: string'
  );
}
// We need to inject it into satisfaction_surveys Insert
if (!content.includes('campaign_id?: string')) {
  // It's the same string in Insert/Update because they are identical lines, wait Insert requires campaign_id too?
  // Let's just make it optional in Insert/Update just in case
  const targetUpdate = 'reservation_id?: string\n            prospect_id?: string';
  content = content.replace(
    targetUpdate,
    'reservation_id?: string\n            campaign_id?: string\n            prospect_id?: string'
  );
  content = content.replace( // run twice to get both Insert and Update
    targetUpdate,
    'reservation_id?: string\n            campaign_id?: string\n            prospect_id?: string'
  );
}

// 5. Add missing webhook_events.Row.payload property?
// Actually webhook_events DOES have payload.
// Let's check what properties webhook_events was missing:
// "Object literal may only specify known properties, and 'reservation_id' does not exist in type 'never[]'." - Wait, webhook/whatsapp.ts was trying to insert into something with reservation_id and prospect_id.
// Wait! `api/webhook/whatsapp.ts(128,23): error TS2353: Object literal may only specify known properties, and 'reservation_id' does not exist in type 'never[]'.`
// What table is it inserting into? `conversations`? `messages`? `satisfaction_surveys`?

fs.writeFileSync('src/lib/database.types.ts', content, 'utf8');
