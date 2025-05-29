import { Injectable } from '@angular/core';

import { ResUsersService } from '../models/res.users.service';
import { LiyYdmsFriendService } from '../models/liy.ydms.friend.service';
import { SearchDomain } from '../odoo/odoo.service';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { OrderBy } from '../../shared/enums/order-by';
import { FriendStatus } from '../../shared/enums/friend-status';
import { ILiyYdmsFriend } from '../../shared/interfaces/models/liy.ydms.friend';
import { IAuthData } from '../../shared/interfaces/auth/auth-data';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  constructor(
    private liyYdmsFriendService: LiyYdmsFriendService,
    private resUserService: ResUsersService
  ) {
  }

  /**
   * Get friends list with pagination and search
   * Filters to show only friends of the current user with accepted status
   * @param searchTerm Optional search term
   * @param teenagerId
   * @param status
   * @param offset
   * @param limit
   * @returns Observable with list of friends
   */
  public async getFriends(
    searchTerm: string = '',
    teenagerId: number,
    status: FriendStatus = FriendStatus.ACCEPTED,
    offset: number = 0,
    limit: number = 20
  ): Promise<ILiyYdmsFriend[]> {
    if (!teenagerId) return [];
    const searchDomain: SearchDomain = [['user_id', OdooDomainOperator.EQUAL, teenagerId], ['nickname', OdooDomainOperator.ILIKE, searchTerm]];
    if (status) searchDomain.push(['status', OdooDomainOperator.EQUAL, status]);
    return this.liyYdmsFriendService.getFriendList(searchDomain, offset, limit, OrderBy.NAME_ASC);
  }

  /**
   * Get friend details by ID
   * @param friendId The ID of the friend to retrieve
   * @returns Observable with friend details or undefined if not found
   */
  public async getFriendById(friendId: number): Promise<ILiyYdmsFriend | undefined> {
    return this.liyYdmsFriendService.getFriendById(friendId);
  }

  /**
   * searchNewFriends
   * @param nickname
   * @param userId
   * @param schoolId
   * @param classroomId
   * @param offset
   * @param limit
   */
  public async searchNewFriendsByNickname(
    nickname: string = '',
    userId: number,
    schoolId?: number,
    classroomId?: number,
    offset: number = 0,
    limit: number = 20
  ): Promise<IAuthData[]> {
    const results = await this.resUserService.searchUserListBySchoolId(
      nickname, schoolId, classroomId, offset, limit
    );
    if (!results?.length) return [];

    const friendIds = results.map(user => user.id);
    const friends = await this.liyYdmsFriendService.getFriendsByIds(userId, friendIds);

    if (!friends) return results;

    // Filter new friend user
    const friendUserIds = friends.map(friend => friend.friend_id.id);
    return results.filter(u => u.id !== userId && !friendUserIds.includes(u.id));
  }

  /**
   * getCountUserFriends
   * @param userId
   * @param status
   */
  public async getCountUserFriends(
    userId: number,
    status?: FriendStatus,
  ): Promise<number> {
    return this.liyYdmsFriendService.getCountFriends(userId, status);
  }

  /**
   * Create a friend request
   * @param userId
   * @param friend
   */
  public async sendNewFriendRequest(
    userId: number,
    friend: IAuthData
  ): Promise<number | undefined> {
    return this.liyYdmsFriendService.createFriend(
      userId, friend.id
    );
  }

  /**
   * Accept friend request
   * @param friend
   */
  public async acceptFriendRequest(friend: ILiyYdmsFriend): Promise<number | boolean> {
    return this.liyYdmsFriendService.updateFriend(friend.id);
  }

  /**
   * Cancel friend request
   * @param friend
   */
  public async cancelFriendRequest(friend: ILiyYdmsFriend): Promise<number | boolean> {
    return this.liyYdmsFriendService.updateFriend(friend.id, FriendStatus.CANCEL);
  }
}
