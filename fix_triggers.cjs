const fs = require('fs');
let sql = fs.readFileSync('supabase/migrations/run_all_pending_safe.sql', 'utf8');

// Replace Triggers
sql = sql.replace(/CREATE TRIGGER\s+(\w+)\s+(BEFORE|AFTER)\s+([^O]+)ON\s+([\w\.]+)/gi, (match, name, beforeAfter, events, table) => {
    return `DROP TRIGGER IF EXISTS ${name} ON ${table};\n${match}`;
});

// Replace Policies
sql = sql.replace(/CREATE POLICY\s+"([^"]+)"\s+ON\s+([\w\.]+)/gi, (match, name, table) => {
    return `DROP POLICY IF EXISTS "${name}" ON ${table};\n${match}`;
});

fs.writeFileSync('supabase/migrations/run_all_pending_bulletproof.sql', sql);
console.log('Fixed SQL generated.');
