import { IResUser } from '../models/res.user';
import { IRelatedField } from '../base/related-field';
import { UserRoles } from '../../enums/user-roles';
import { IUserSettings } from '../settings/user-settings';

export interface IAuthData extends IResUser {
  nickname?: string;
  avatar?: IRelatedField;
  avatar_128?: string;
  image_128?: string;
  code?: string;
  edu_id?: string;
  social_id?: string;
  app_settings?: IUserSettings;

  // User roles
  is_teenager: boolean;
  is_parent: boolean;
  is_teacher: boolean;

  // Related fields
  school_id?: IRelatedField;
  classroom_id?: IRelatedField;
  parent_id?: IRelatedField;
  partner_id?: IRelatedField;
  classroom_ids?: Array<number>;
  child_ids?: Array<number>;
}
