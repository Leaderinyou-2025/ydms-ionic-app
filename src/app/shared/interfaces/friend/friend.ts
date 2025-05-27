import { ILiyYdmsFriend } from '../models/liy.ydms.friend';

/**
 * Extended interface for Friend with client-side properties
 */
export interface IFriend extends ILiyYdmsFriend {
  likeCount?: number; // For UI compatibility
  rank?: number; // For UI compatibility
  achievements?: number; // For UI compatibility
  friendshipLevel?: number; // For UI compatibility
}
