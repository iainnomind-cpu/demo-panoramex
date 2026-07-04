const fs = require('fs');
let content = fs.readFileSync('src/lib/database.types.ts', 'utf8');

// 1. Fix duplicate Relationships
content = content.replace(/([ ]+Relationships: \[\]\r?\n)([ ]+Relationships: \[\]\r?\n)/g, '$1');

// 2. Add rate_limit_buckets right before `    }\n    Views:`
const rl = `      rate_limit_buckets: {
        Row: {
          key: string
          window_start: string
          count: number
        }
        Insert: {
          key: string
          window_start: string
          count?: number
        }
        Update: {
          key?: string
          window_start?: string
          count?: number
        }
          Relationships: []
      }
    }\n    Views:`;
// Try both CRLF and LF versions
content = content.replace(/    \}\r?\n    Views:/, rl);

// 3. Add upsert_rate_limit inside Functions, right before the closing `    }\n    Enums:`
const fn = `      upsert_rate_limit: {
        Args: {
          p_key: string
          p_window_start: string
          p_limit: number
        }
        Returns: Json
      }
      cleanup_rate_limit_buckets: {
        Args: Record<string, never>
        Returns: undefined
      }
    }\n    Enums:`;
content = content.replace(/    \}\r?\n    Enums:/, fn);

fs.writeFileSync('src/lib/database.types.ts', content, 'utf8');
console.log('Patched. Lines now:', content.split('\n').length);
