import { PublicEmotionalOption } from '../../enums/public-emotional-option';

export interface IEmotionJournal {
  teenager_id?: number;
  question_id?: number;
  answer_id?: number;
  public_emotional?: boolean;
  public_emotional_to?: PublicEmotionalOption;
  public_user_ids?: number[];
}
