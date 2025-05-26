import { IRelatedField } from '../base/related-field';
import { IBase } from '../base/base';
import { NotificationTypes } from '../../enums/notification-type';

/**
 * Model: Thông báo
 */
export interface ILiyYdmsNotification extends IBase {
  sender_id: IRelatedField;
  description: string;
  recipient_ids: Array<number>;
  body: string;
  attachment_id?: string;
  attachment_name?: string;
  notification_log_ids?: Array<number>;
  type?: NotificationTypes;
  state?: boolean; // Read/unread status for UI compatibility
  create_time?: string;
}
