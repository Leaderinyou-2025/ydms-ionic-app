import { IRelatedField } from '../base/related-field';
import { IBase } from '../base/base';
import { NotificationTypes } from '../../enums/notification-type';
import { FileMimeType } from '../../enums/file-mime-type';

/**
 * Model: Thông báo
 */
export interface ILiyYdmsNotification extends IBase {
  description: string;
  body: string;
  sender_id: IRelatedField;
  recipient_ids: Array<number>;
  is_viewed: boolean;
  attachment_id?: string;
  attachment_name?: string;
  x_attach_file_mine_type?: FileMimeType;
  notification_type?: NotificationTypes;
}
