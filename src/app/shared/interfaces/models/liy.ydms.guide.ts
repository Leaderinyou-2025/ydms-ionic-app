import { IBase } from '../base/base';
import { AgeOption } from '../../enums/age-option';
import { AreaOfExpertise } from '../../enums/area-of-expertise';
import { GuideType } from '../../enums/guide-type';
import { IRelatedField } from '../base/related-field';

/**
 * Model: Bài tập, hướng dẫn chuyên môn
 */
export interface ILiyYdmsGuide extends IBase {
  guide_type: GuideType;
  area_of_expertise: AreaOfExpertise;
  category_ids: Array<IRelatedField>;
  age_option: AgeOption;
  from_age?: number;
  to_age?: number;
  scores: number;
  rank_point: number;
  guide_attachment?: string;
  desciption?: string;
  guide_content?: string;
}
