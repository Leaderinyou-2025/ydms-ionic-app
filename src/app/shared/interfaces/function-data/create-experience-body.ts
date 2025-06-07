import { ILiyYdmsExperience } from '../models/liy.ydms.experience';

export interface ICreateExperienceBody extends Omit<ILiyYdmsExperience, 'parent_id'> {
  parent_id: number;
}
