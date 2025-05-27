import { IRelatedField } from '../base/related-field';
import { IBase } from '../base/base';

/**
 * Model: Bạn bè
 */
export interface ILiyYdmsFriend extends IBase {
  friend_id: IRelatedField;
  avatar?: string;
  nickname?: string;
  friendly_point?: number;
  status?: string;
}
