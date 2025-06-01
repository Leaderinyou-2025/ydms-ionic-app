import { NotificationTypes } from '../../enums/notification-type';

export interface SearchNotificationParams {
  name?: string;
  is_viewed?: boolean;
  start_date?: string;
  end_date?: string;
  notification_type?: NotificationTypes;
  user_id?: number;
}
