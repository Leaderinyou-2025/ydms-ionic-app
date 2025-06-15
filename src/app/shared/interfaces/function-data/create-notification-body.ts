import { ILiyYdmsNotification } from '../models/liy.ydms.notification';

export interface CreateNotificationBody extends Omit<Partial<ILiyYdmsNotification>, 'sender_id'> {
  sender_id: number;
}
