import { Injectable } from '@angular/core';

import { ResUsersService } from '../models/res.users.service';
import { LiyYdmsFriendService } from '../models/liy.ydms.friend.service';
import { SearchDomain } from '../odoo/odoo.service';
import { IFriend } from '../../shared/interfaces/friend/friend';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { OrderBy } from '../../shared/enums/order-by';
import { FriendStatus } from '../../shared/enums/friend-status';
import { ILiyYdmsFriend } from '../../shared/interfaces/models/liy.ydms.friend';
import { IAuthData } from '../../shared/interfaces/auth/auth-data';
import { LiyYdmsAvatarService } from '../models/liy.ydms.avatar.service';
import { IAssetsResource } from '../../shared/interfaces/settings/assets-resource';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FriendService {

  private cachingAvatarImages: IAssetsResource[] = new Array<IAssetsResource>();

  constructor(
    private authService: AuthService,
    private liyYdmsFriendService: LiyYdmsFriendService,
    private liyYdmsAvatarService: LiyYdmsAvatarService,
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
    const searchDomain: SearchDomain = [['user_id', OdooDomainOperator.EQUAL, teenagerId]];
    if (status) searchDomain.push(['status', OdooDomainOperator.EQUAL, status]);
    if (searchTerm) searchDomain.push(['name', OdooDomainOperator.ILIKE, searchTerm]);
    return this.liyYdmsFriendService.getFriendList(searchDomain, offset, limit, OrderBy.NAME_ASC);
  }

  /**
   * Lấy danh sách yêu cầu kết bạn
   * @param teenagerId
   * @param offset
   * @param limit
   */
  public async getFriendRequests(
    teenagerId: number,
    offset: number = 0,
    limit: number = 20
  ): Promise<ILiyYdmsFriend[]> {
    if (!teenagerId) return [];
    const searchDomain: SearchDomain = [
      OdooDomainOperator.OR, ['user_id', OdooDomainOperator.EQUAL, teenagerId], ['friend_id', OdooDomainOperator.EQUAL, teenagerId],
      ['status', OdooDomainOperator.NOT_EQUAL, FriendStatus.ACCEPTED]
    ];
    return this.liyYdmsFriendService.getFriendList(searchDomain, offset, limit, OrderBy.CREATE_AT_DESC);
  }

  /**
   * Get friend details by ID
   * @param friendId The ID of the friend to retrieve
   * @returns Observable with friend details or undefined if not found
   */
  public async getFriendById(friendId: number): Promise<IFriend | undefined> {
    return this.liyYdmsFriendService.getFriendById(friendId);
  }

  /**
   * Get friend avatar image with base64 processing
   * @param userId
   * @param friends
   */
  public async loadFriendAvatarImage(
    userId: number,
    friends: IFriend[]
  ): Promise<[IAuthData[], IAssetsResource[]]> {
    const teenagerIds = friends.map(f => {
      if (f.friend_id.id === userId) return f.user_id.id;
      else return f.friend_id.id;
    });
    return Promise.all([
      this.authService.getAvatarByTeenagerIds(teenagerIds),
      this.liyYdmsAvatarService.getImages(true),
    ]);
  }

  /**
   * searchNewFriends
   * @param nickname
   * @param schoolId
   * @param classroomId
   * @param offset
   * @param limit
   */
  public async searchNewFriendsByNickname(
    nickname: string = '',
    schoolId: number,
    classroomId?: number,
    offset: number = 0,
    limit: number = 20
  ): Promise<IAuthData[]> {
    const results = await this.resUserService.searchUserListBySchoolId(nickname, schoolId, classroomId, offset, limit);
    if (!results?.length) return [];

    const userIds = results.map(user => user.id);
    const friends = await this.liyYdmsFriendService.getFriendsByIds(userIds);

    if (!friends) return results;

    const friendsIds = friends.map(friend => friend.id);
    return results.filter(u => !friendsIds.includes(u.id));
  }

  /**
   * getCountUserFriends
   * @param teenagerId
   * @param status
   */
  public async getCountUserFriends(
    teenagerId: number,
    status?: FriendStatus,
  ): Promise<number> {
    return this.liyYdmsFriendService.getCountFriends(teenagerId, status);
  }
}
