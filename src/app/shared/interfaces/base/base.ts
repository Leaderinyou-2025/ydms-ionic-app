import { IDictionary } from './dictionary';
import { IRelatedField } from './related-field';

export interface IBase extends IDictionary<any> {
  id: number;
  name?: string;
  create_date?: string;
  write_date?: string;
  active?: boolean;
  create_uid?: IRelatedField;
  write_uid?: IRelatedField;
}
