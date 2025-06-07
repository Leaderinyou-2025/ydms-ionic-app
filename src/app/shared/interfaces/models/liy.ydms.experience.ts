import { IBase } from '../base/base';
import { IRelatedField } from '../base/related-field';
import { AreaOfExpertise } from '../../enums/area-of-expertise';
import { ExperienceStatus } from '../../enums/experience-status';
import { FileMimeType } from '../../enums/file-mime-type';

/**
 * Model: Chia sẻ kinh nghiệm
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
  attach_file?: string;
  x_attach_file_name?: string;
  x_attach_file_mine_type?: FileMimeType;
}
