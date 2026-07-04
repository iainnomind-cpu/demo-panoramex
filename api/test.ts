import { Database } from '../src/lib/database.types';

type Agents = Database['public']['Tables']['agents']['Row'];
type Role = Agents['role'];
