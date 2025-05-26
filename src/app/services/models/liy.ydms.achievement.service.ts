import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsAchievement } from '../../shared/interfaces/models/liy.ydms.achievement';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsAchievementService {
  public readonly achievementFields = [
    'area_of_expertise',
    'teenager_id',
    'badge_id',
    'badge_image',
  ];

  constructor(
    private odooService: OdooService,
  ) {
  }

  /**
   * getAchievementList
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getAchievementList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.AREA_OF_EXPERTISE_ASC
  ): Promise<Array<ILiyYdmsAchievement>> {
    let results = await this.odooService.searchRead<ILiyYdmsAchievement>(
      ModelName.ACHIEVEMENT, searchDomain, this.achievementFields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * getCountAchievement
   * @param searchDomain
   */
  public async getCountAchievement(searchDomain: SearchDomain = []): Promise<number> {
    return this.odooService.searchCount<ILiyYdmsAchievement>(ModelName.ACHIEVEMENT, searchDomain);
  }

  /**
   * Lấy danh sách huy hiệu đã đạt được của học sinh dựa trên huy hiệu
   * @param teenagerId
   * @param badgeIds
   */
  public async getAchievementByTeenagerIdAndBadgeIds(
    teenagerId: number,
    badgeIds: Array<number>,
  ): Promise<Array<ILiyYdmsAchievement>> {
    const searchDomain: SearchDomain = [
      ['teenager_id', OdooDomainOperator.EQUAL, teenagerId],
      ['badge_id', OdooDomainOperator.IN, badgeIds],
    ];
    return this.getAchievementList(searchDomain, 0, 0, OrderBy.CREATE_AT_DESC);
  }
}
