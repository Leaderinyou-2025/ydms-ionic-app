import { IBase } from '../base/base';
import { IRelatedField } from '../base/related-field';

/**
 * Model: liy.ydms.class - Lớp học
 */
export interface ILiyYdmsClass extends IBase {
  /** Tên lớp */
  name: string;
  /** Mã lớp */
  code?: string;
  /** Giáo viên chủ nhiệm - Many2one to res.user */
  teacher_id?: IRelatedField;
  /** Khối lớp */
  grade?: string;
  /** Năm học */
  academic_year?: string;
  /** Số lượng học sinh */
  student_count?: number;
  /** Danh sách học sinh - One2many to liy.ydms.student */
  student_ids?: Array<number>;
  /** Mô tả */
  description?: string;
  /** Trạng thái hoạt động */
  active?: boolean;
}
