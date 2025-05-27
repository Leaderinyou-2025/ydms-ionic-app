import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IFriend } from '../../shared/interfaces/friend/friend';
import { LiyYdmsFriendService } from '../models/liy.ydms.friend.service';
import { SearchDomain } from '../odoo/odoo.service';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { OrderBy } from '../../shared/enums/order-by';
import { CommonConstants } from '../../shared/classes/common-constants';

@Injectable({
  providedIn: 'root'
})
export class FriendService {

  constructor(
    private liyYdmsFriendService: LiyYdmsFriendService,
  ) { }

  /**
   * Get friends list with pagination and search
   * @param searchTerm Optional search term
   * @param offset Pagination offset
   * @param limit Pagination limit
   * @returns Observable with list of friends
   */
  public getFriends(
    searchTerm: string = '',
    offset: number = 0,
    limit: number = 20
  ): Observable<{ friends: IFriend[], total: number }> {

    return new Observable(observer => {
      // Build search domain
      const searchDomain: SearchDomain = [];
      if (searchTerm) {
        searchDomain.push(['name', OdooDomainOperator.ILIKE, searchTerm]);
      }

      // Use model service to get friends
      this.liyYdmsFriendService.getFriendList(searchDomain, offset, limit, OrderBy.NAME_ASC)
        .then(results => {
          const friends = results || [];
          console.log(friends)
          const total = friends.length;

          observer.next({ friends, total });
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching friends:', error);
          // Return empty result on error
          observer.next({ friends: [], total: 0 });
          observer.complete();
        });
    });
  }

  /**
   * Get friend details by ID
   * @param friendId The ID of the friend to retrieve
   * @returns Observable with friend details or undefined if not found
   */
  public getFriendById(friendId: number): Observable<IFriend | undefined> {
    return new Observable(observer => {
      // Use model service to get friend detail
      this.liyYdmsFriendService.getFriendById(friendId)
        .then(result => {
          observer.next(result);
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching friend detail:', error);
          // Return undefined on error
          observer.next(undefined);
          observer.complete();
        });
    });
  }



  /**
   * Get friend avatar image with base64 processing
   * @param friend
   */
  public getFriendAvatarImage(friend: IFriend): string {
    if (friend.avatar && typeof friend.avatar === 'string') {
      const prefix = CommonConstants.detectMimeType(friend.avatar);
      if (prefix) {
        return prefix + friend.avatar;
      }
    }
    return CommonConstants.defaultUserAvatarImage;
  }
}
