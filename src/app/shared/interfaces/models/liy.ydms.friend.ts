import { IRelatedField } from '../base/related-field';
import { IBase } from '../base/base';
import { FriendStatus } from '../../enums/friend-status';

/**
 * Model: liy.ydms.friend - Danh sách bạn bè của học sinh
 */
export interface ILiyYdmsFriend extends IBase {
  /** Người dùng sở hữu - Many2one to res.user (owner of the friend relationship) */
  user_id?: IRelatedField;
  /** Bạn - Many2one to res.user */
  friend_id: IRelatedField;
  /** Tên người bạn - Related to friend_id.name */
  name?: string;
  /** Hình đại diện - Related to friend_id.avatar */
  avatar?: string;
  /** Biệt danh - Related to friend_id.nickname */
  nickname?: string;
  /** Điểm thân thiện */
  friendly_point?: number;
  /** Trạng thái - new: Lời mời kết bạn, accepted: Đồng ý, cancel: Không đồng ý */
  status?: FriendStatus;
}
