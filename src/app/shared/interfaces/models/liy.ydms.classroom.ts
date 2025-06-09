import { IBase } from '../base/base';
import { IRelatedField } from '../base/related-field';

/**
 * Model: liy.ydms.classroom - Lớp học
 */
export interface ILiyYdmsClassroom extends IBase {
  code?: string;
  school_id: IRelatedField;
}
