import { IDictionary } from './dictionary';

export interface IBase extends IDictionary<any> {
  id: number;
  name?: string;
  create_date?: string;
  create_time?: string;
  write_date?: string;
  write_time?: string;
}
