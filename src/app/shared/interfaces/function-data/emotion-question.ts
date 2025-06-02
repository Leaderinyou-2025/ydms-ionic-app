import { ILiyYdmsEmotionalQuestion } from '../models/liy.ydms.emotional.question';
import { ILiyYdmsEmotionalAnswerOption } from '../models/liy.ydms.emotional.answer.option';

export interface IEmotionQuestion extends ILiyYdmsEmotionalQuestion {
  answers: ILiyYdmsEmotionalAnswerOption[];
}
