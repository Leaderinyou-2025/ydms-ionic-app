import { ILiyYdmsEmotionalDiary } from '../models/liy.ydms.emotional.diary';
import { ILiyYdmsTask } from '../models/liy.ydms.task';

export interface IEmotionalDiary extends ILiyYdmsEmotionalDiary {
  avatar?: string;
  suggestions?: ILiyYdmsTask[];
}
