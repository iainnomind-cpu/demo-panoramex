import { Database } from '../src/lib/database.types.js';

type Agents = Database['public']['Tables']['agents']['Row'];
type Role = Agents['role'];
