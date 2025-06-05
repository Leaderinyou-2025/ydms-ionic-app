import { IBase } from '../base/base';
import { IRelatedField } from '../base/related-field';

/**
 * Model: liy.ydms.student - Học sinh
 */
export interface ILiyYdmsStudent extends IBase {
  /** Người dùng - Many2one to res.user */
  user_id: IRelatedField;
  /** Tên học sinh - Related to user_id.name */
  name?: string;
  /** Hình đại diện - Related to user_id.avatar */
  avatar?: string;
  /** Biệt danh - Related to user_id.nickname */
  nickname?: string;
  /** Email - Related to user_id.email */
  email?: string;
  /** Số điện thoại - Related to user_id.phone */
  phone?: string;
  /** Lớp học - Many2one to liy.ydms.class */
  class_id?: IRelatedField;
  /** Mã số học sinh */
  student_code?: string;
  /** Ngày sinh - Related to user_id.dob */
  dob?: string;
  /** Giới tính - Related to user_id.gender */
  gender?: 'male' | 'female' | 'other';
  /** Điểm tổng kết */
  total_score?: number;
  /** Xếp hạng trong lớp */
  class_rank?: number;
  /** Trạng thái hoạt động */
  active?: boolean;
}
