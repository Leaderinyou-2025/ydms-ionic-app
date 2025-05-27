import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsFriend } from '../../shared/interfaces/models/liy.ydms.friend';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsFriendService {

  public readonly friendFields = [
    'friend_id',
    'name',
    'avatar',
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

}
