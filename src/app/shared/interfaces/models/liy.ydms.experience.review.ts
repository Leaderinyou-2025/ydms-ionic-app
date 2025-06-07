import { IBase } from '../base/base';
import { IRelatedField } from '../base/related-field';
import { ExperienceReviewType } from '../../enums/experience-review-type';

/**
 * Model: Đánh giá kinh nghiệm
 */
export interface ILiyYdmsExperienceReview extends IBase {
  experience_id: IRelatedField;
  review: ExperienceReviewType;
}
