import { IBase } from '../base/base';
import { IRelatedField } from '../base/related-field';
import { AreaOfExpertise } from '../../enums/area-of-expertise';

/**
 * Model: Dữ liệu khảo sát
 */
export interface ILiyYdmsAssessmentResult extends IBase {
  answer_ids: Array<number>;
  area_of_expertise: AreaOfExpertise;
  assessment_id: IRelatedField;
  assignee_id: IRelatedField;
  is_posted: boolean;
  nickname?: string;
  rank_point?: number;
  scores?: number;
}
