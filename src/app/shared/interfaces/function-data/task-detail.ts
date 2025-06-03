import { ILiyYdmsTask } from '../models/liy.ydms.task';
import { ILiyYdmsGuide } from '../models/liy.ydms.guide';

export interface ITaskDetail extends ILiyYdmsTask {
  guide: ILiyYdmsGuide;
}
