const fs = require('fs');
let content = fs.readFileSync('src/lib/database.types.ts', 'utf8');

// Add Relationships to all tables
content = content.replace(/Update: \{[\s\S]*?\n\s{8}\}/g, match => {
  return match + '\n          Relationships: []';
});

// Add Relationships to Views as well if needed (Views often have Relationships now too)
content = content.replace(/Views: \{[\s\S]*?Row: \{[\s\S]*?\n\s{8}\}/g, match => {
  return match + '\n          Relationships: []';
});

// Re-apply missing properties
if (!content.includes('CompositeTypes: Record<string, never>')) {
  content = content.replace(
    'Enums: Record<string, never>',
    'Enums: Record<string, never>\n    CompositeTypes: Record<string, never>'
  );
}

if (!content.includes('can_edit_catalog: boolean')) {
  content = content.replace(
    /role: 'admin' \| 'agent'/g,
    "role: 'admin' | 'agent'\n          can_edit_catalog: boolean"
  );
}

if (!content.includes('can_edit_catalog?: boolean')) {
  content = content.replace(
    /role\?: 'admin' \| 'agent'/g,
    "role?: 'admin' | 'agent'\n          can_edit_catalog?: boolean"
  );
}

if (!content.includes('campaign_id: string')) {
  const targetRow = 'reservation_id: string\n            prospect_id: string';
  content = content.replace(
    targetRow,
    'reservation_id: string\n            campaign_id: string\n            prospect_id: string'
  );
}

if (!content.includes('campaign_id?: string')) {
  const targetUpdate = 'reservation_id\\?: string\\n\\s*prospect_id\\?: string';
  content = content.replace(
    new RegExp(targetUpdate, 'g'),
    'reservation_id?: string\n            campaign_id?: string\n            prospect_id?: string'
  );
}

fs.writeFileSync('src/lib/database.types.ts', content, 'utf8');
console.log('Added Relationships and missing properties');
