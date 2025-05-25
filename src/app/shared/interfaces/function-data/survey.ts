import { ILiyYdmsAssessmentAnswerOption } from '../models/liy.ydms.assessment.answer.option';
import { ILiyYdmsAssessmentQuestion } from '../models/liy.ydms.assessment.question';
import { ILiyYdmsAssessmentResult } from '../models/liy.ydms.assessment.result';

export interface ISurvey {
  assessment_result: ILiyYdmsAssessmentResult;
  questions: ISurveyQuestion[];
}

export interface ISurveyQuestion extends ILiyYdmsAssessmentQuestion {
  options?: ISurveyOption[];
  answer_id?: number;
  answer_text?: string;
  answer_result_id: number;
}

export interface ISurveyOption extends ILiyYdmsAssessmentAnswerOption {
  selected: boolean;
}
