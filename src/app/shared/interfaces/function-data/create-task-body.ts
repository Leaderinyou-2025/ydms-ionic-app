import { ILiyYdmsTask } from '../models/liy.ydms.task';

export interface CreateTaskBody extends Omit<ILiyYdmsTask, 'guide_id'> {
  guide_id: number;
}
