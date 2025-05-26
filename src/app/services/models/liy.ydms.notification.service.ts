import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsNotification } from '../../shared/interfaces/models/liy.ydms.notification';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsNotificationService {

  public readonly notificationFields = [
    'sender_id',
    'name',
    'description',
    'recipient_ids',
    'body',
    'attachment_id',
    'attachment_name',
    'notification_log_ids',
    // 'type',
  ];

  constructor(
    private odooService: OdooService,
  ) {
  }

  /**
   * getNotificationList
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getNotificationList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC
  ): Promise<ILiyYdmsNotification[]> {
    let results = await this.odooService.searchRead<ILiyYdmsNotification>(
      ModelName.NOTIFICATION, searchDomain, this.notificationFields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * getNotificationById
   * @param id
   */
  public async getNotificationById(id: number): Promise<ILiyYdmsNotification | undefined> {
    if (!id) return undefined;

    let results = await this.odooService.read<ILiyYdmsNotification>(
      ModelName.NOTIFICATION, [id], this.notificationFields
    );
    if (!results || !results?.length) return undefined;

    const convertedResults = CommonConstants.convertArr2ListItem(results);
    return convertedResults[0];
  }

}
