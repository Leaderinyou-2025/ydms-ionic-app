import { IBase } from '../base/base';
import { IRelatedField } from '../base/related-field';

export interface ILiyYdmsPartnerToken extends IBase {
  token: string;
  partner_id: IRelatedField;
}
