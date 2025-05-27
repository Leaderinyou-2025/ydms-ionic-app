import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IFriend } from '../../shared/interfaces/friend/friend';
import { LiyYdmsFriendService } from '../models/liy.ydms.friend.service';
import { SearchDomain } from '../odoo/odoo.service';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { OrderBy } from '../../shared/enums/order-by';
import { CommonConstants } from '../../shared/classes/common-constants';
import { AuthService } from '../auth/auth.service';
import { FriendStatus } from '../../shared/enums/friend-status';

@Injectable({
  providedIn: 'root'
})
export class FriendService {

  constructor(
    private liyYdmsFriendService: LiyYdmsFriendService,
    private authService: AuthService,
  ) { }

  /**
   * Get friends list with pagination and search
   * Filters to show only friends of the current user with accepted status
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
      // Get current user first
      this.authService.getAuthData().then(currentUser => {
        if (!currentUser) {
          console.error('No authenticated user found');
          observer.next({ friends: [], total: 0 });
          observer.complete();
          return;
        }

        const searchDomain: SearchDomain = [];

        // Filter by current user's friends
        searchDomain.push(['user_id', OdooDomainOperator.EQUAL, currentUser.id]);

        // Filter by accepted status only
        searchDomain.push(['status', OdooDomainOperator.EQUAL, FriendStatus.ACCEPTED]);

        // Add search term filter if provided
        if (searchTerm) {
          searchDomain.push(['name', OdooDomainOperator.ILIKE, searchTerm]);
        }

        // Use model service to get friends
        this.liyYdmsFriendService.getFriendList(searchDomain, offset, limit, OrderBy.NAME_ASC)
          .then(results => {
            const friends = results || [];
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
      }).catch(error => {
        console.error('Error getting auth data:', error);
        observer.next({ friends: [], total: 0 });
        observer.complete();
      });
    });
  }

  public getFriendsByStatus(
    status: FriendStatus,
    searchTerm: string = '',
    offset: number = 0,
    limit: number = 20
  ): Observable<{ friends: IFriend[], total: number }> {

    return new Observable(observer => {
      // Get current user first
      this.authService.getAuthData().then(currentUser => {
        if (!currentUser) {
          console.error('No authenticated user found');
          observer.next({ friends: [], total: 0 });
          observer.complete();
          return;
        }

        // Build search domain with filters
        const searchDomain: SearchDomain = [];

        // Filter by current user's friends
        searchDomain.push(['user_id', OdooDomainOperator.EQUAL, currentUser.id]);

        // Filter by specific status
        searchDomain.push(['status', OdooDomainOperator.EQUAL, status]);

        // Add search term filter if provided
        if (searchTerm) {
          searchDomain.push(['name', OdooDomainOperator.ILIKE, searchTerm]);
        }

        // Use model service to get friends
        this.liyYdmsFriendService.getFriendList(searchDomain, offset, limit, OrderBy.NAME_ASC)
          .then(results => {
            const friends = results || [];
            console.log(`Filtered friends (${status} status):`, friends);
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
      }).catch(error => {
        console.error('Error getting auth data:', error);
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
