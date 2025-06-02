// Base interfaces
import { IBase } from '../base/base';
import { IRelatedField } from '../base/related-field';

// Enums
import { AreaOfExpertise } from '../../enums/area-of-expertise';
import { ExperienceStatus } from '../../enums/experience-status';

/**
 * Interface: Bài chia sẻ kinh nghiệm
 * Mô tả: Định nghĩa cấu trúc dữ liệu cho bài chia sẻ kinh nghiệm của phụ huynh
 * Kế thừa: IBase (chứa id, name, create_date, write_date)
 */
export interface ILiyYdmsExperience extends IBase {
  area_of_expertise: AreaOfExpertise;
  parent_id: IRelatedField;
  experience_content: string;
  review_ids: Array<IRelatedField>;
  active: boolean;
  total_like: number;
  total_love: number;
  status: ExperienceStatus;
}

/**
 * Interface: Dữ liệu tạo bài chia sẻ kinh nghiệm mới
 * Mô tả: Định nghĩa cấu trúc dữ liệu cần thiết khi tạo bài chia sẻ mới
 * Lưu ý: parent_id là number thay vì IRelatedField để gửi lên backend
 */
export interface ICreateExperience {
  name: string;
  area_of_expertise: AreaOfExpertise;
  experience_content: string;
  parent_id: number;
  active: boolean;
  total_like: number;
  total_love: number;
  status: ExperienceStatus;
}
