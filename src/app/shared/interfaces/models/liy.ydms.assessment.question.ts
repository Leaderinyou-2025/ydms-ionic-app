import { IBase } from '../base/base';
import { AnswerType } from '../../enums/answer-type';
import { IRelatedField } from '../base/related-field';
import { DisplayType } from '../../enums/display-type';

/**
 * Model: Bảng hỏi - Câu hỏi
 */
export interface ILiyYdmsAssessmentQuestion extends IBase {
  answer_ids: Array<number>;
  answer_type: AnswerType;
  assessment_id: IRelatedField;
  description?: string;
  display_type: DisplayType;
  order_weight: number;
  scores: number;
}
