import { IBase } from '../base/base';
import { IRelatedField } from '../base/related-field';

/**
 * Interface for liy.ydms.assessment.answer.result model (Assessment Answer Result)
 */
export interface ILiyYdmsAssessmentAnswerResult extends IBase {
  assessment_result_id: IRelatedField;
  question_id: IRelatedField;
  question_name?: string;
  answer_id?: IRelatedField;
  answer_text?: string;
  scores: number;
}
