import { Injectable } from '@angular/core';

import { ILiyYdmsNotification } from '../../shared/interfaces/models/liy.ydms.notification';
import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { SearchNotificationParams } from '../../shared/interfaces/notification/notification.interface';
import { OrderBy } from '../../shared/enums/order-by';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsNotificationService {
  // Notification fields
  public notificationFields = [
    'name', 'description', 'body',
    'sender_id', 'recipient_ids', 'notification_type',
    'is_viewed', 'create_date',
    'attachment_id', 'attachment_name',
  ];

  constructor(
    private odooService: OdooService
  ) {
  }

  /**
   * Get search notifications
   * @param searchParams
   * @param offset
   * @param limit
   * @param order
   */
  public async getNotificationList(
    searchParams: SearchNotificationParams,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC
  ): Promise<ILiyYdmsNotification[]> {

    // Search domain
    const query: SearchDomain = [];
    if (searchParams.name) query.push(['name', OdooDomainOperator.ILIKE, searchParams.name]);
    if (searchParams.user_id) query.push(['recipient_ids', OdooDomainOperator.IN, [searchParams.user_id]]);
    if (searchParams.is_viewed != undefined) query.push(['is_viewed', OdooDomainOperator.EQUAL, searchParams.is_viewed]);
    if (searchParams.start_date != undefined) query.push(['create_date', OdooDomainOperator.GREATER_EQUAL, searchParams.start_date]);
    if (searchParams.end_date != undefined) query.push(['create_date', OdooDomainOperator.LESS_EQUAL, searchParams.end_date]);
    if (searchParams.notification_type != undefined) query.push(['notification_type', OdooDomainOperator.EQUAL, searchParams.notification_type]);
    const results = await this.odooService.searchRead<ILiyYdmsNotification>(ModelName.NOTIFICATION, query, this.notificationFields, offset, limit, order);
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get notification detail by id
   * @param id
   */
  public async getNotificationDetail(id: number): Promise<ILiyYdmsNotification | undefined> {
    if (!id) return undefined;

    let results = await this.odooService.read<ILiyYdmsNotification>(ModelName.NOTIFICATION, [id], this.notificationFields);
    if (!results || !results?.length) return undefined;
    results = CommonConstants.convertArr2ListItem(results);
    return results[0];
  }

  /**
   * Mark a notification as read
   * @param notificationIds
   */
  public async markAsRead(notificationIds: Array<number>): Promise<number | boolean> {
    if (!notificationIds) return true;
    return this.odooService.write<ILiyYdmsNotification>(ModelName.NOTIFICATION, notificationIds, {is_viewed: true});
  }
}
