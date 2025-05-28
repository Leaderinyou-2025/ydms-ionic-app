import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsFriend } from '../../shared/interfaces/models/liy.ydms.friend';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { FriendStatus } from '../../shared/enums/friend-status';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsFriendService {

  public readonly friendFields = [
    'user_id',
    'friend_id',
    'name',
    'nickname',
    'friendly_point',
    'status',
  ];

  constructor(
    private odooService: OdooService,
  ) {
  }

  /**
   * getFriendList
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getFriendList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<ILiyYdmsFriend[]> {
    let results = await this.odooService.searchRead<ILiyYdmsFriend>(
      ModelName.FRIEND, searchDomain, this.friendFields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get count friends
   * @param teenagerId
   * @param status
   */
  public async getCountFriends(
    teenagerId: number,
    status?: FriendStatus,
  ): Promise<number> {
    const searchDomain: SearchDomain = [['user_id', OdooDomainOperator.EQUAL, teenagerId]];
    if (status) searchDomain.push(['status', OdooDomainOperator.EQUAL, status]);
    return this.odooService.searchCount<ILiyYdmsFriend>(ModelName.FRIEND, searchDomain);
  }

  /**
   * getFriendById
   * @param id
   */
  public async getFriendById(id: number): Promise<ILiyYdmsFriend | undefined> {
    if (!id) return undefined;

    let results = await this.odooService.read<ILiyYdmsFriend>(
      ModelName.FRIEND, [id], this.friendFields
    );
    if (!results || !results?.length) return undefined;

    const convertedResults = CommonConstants.convertArr2ListItem(results);
    return convertedResults[0];
  }

  /**
   * getFriendsByIds
   * @param ids
   */
  public async getFriendsByIds(ids: Array<number>): Promise<ILiyYdmsFriend[]> {
    if (!ids?.length) return [];
    return this.getFriendList([['friend_id', OdooDomainOperator.IN, ids]], 0, 0);
  }

}
