import { IBase } from '../base/base';
import { IRelatedField } from '../base/related-field';

/**
 * Model: Câu hỏi cảm xúc - Các phương án trả lời câu hỏi
 */
export interface ILiyYdmsEmotionalAnswerOption extends IBase {
  question_id: IRelatedField;
  encourage?: string;
  guide_category_ids?: Array<number>;
  image_1920?: string;
  order_weight: number;
  scores: number;
}
