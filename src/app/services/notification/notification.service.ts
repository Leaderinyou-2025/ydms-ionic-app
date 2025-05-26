import { Injectable } from '@angular/core';

import { ILiyYdmsNotification } from '../../shared/interfaces/models/liy.ydms.notification';
import { SearchDomain } from '../odoo/odoo.service';
import { SearchNotificationParams } from '../../shared/interfaces/notification/notification.interface';
import { OrderBy } from '../../shared/enums/order-by';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { LiyYdmsNotificationService } from '../models/liy.ydms.notification.service';
import { ForceTestData } from '../../shared/classes/force-test-data';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private liyYdmsNotificationService: LiyYdmsNotificationService
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
    if (searchParams.start_date != undefined) query.push(['create_date', OdooDomainOperator.GREATER_EQUAL, searchParams.start_date]);
    if (searchParams.end_date != undefined) query.push(['create_date', OdooDomainOperator.LESS_EQUAL, searchParams.end_date]);
    if (searchParams.type != undefined) query.push(['type', OdooDomainOperator.EQUAL, searchParams.type]);

    const results = await this.liyYdmsNotificationService.getNotificationList(query, offset, limit, order);
    return results?.length ? results : ForceTestData.notifications;
  }

  /**
   * Get notification detail by id
   * @param id
   */
  public async getNotificationDetail(id: number): Promise<ILiyYdmsNotification | undefined> {
    if (!id) return undefined;

    // Use model service to get notification detail
    const result = await this.liyYdmsNotificationService.getNotificationById(id);
    return result || ForceTestData.notifications.find(u => u.id === id);
  }

  /**
   * Mark a notification as read
   * @param notificationIds
   */
  public async markAsRead(notificationIds: Array<number>): Promise<number | boolean> {
    if (!notificationIds) return true;
    // This will be handled by backend
    return true;
  }

}
