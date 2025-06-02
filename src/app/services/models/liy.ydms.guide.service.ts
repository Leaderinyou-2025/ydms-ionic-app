import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { ILiyYdmsGuide } from '../../shared/interfaces/models/liy.ydms.guide';
import { OrderBy } from '../../shared/enums/order-by';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsGuideService {

  public readonly fields = [
    'name', 'guide_type', 'area_of_expertise', 'category_ids', 'age_option',
    'from_age', 'to_age', 'scores', 'rank_point', 'guide_attachment', 'desciption', 'guide_content',
  ];

  constructor(
    private odooService: OdooService,
  ) {
  }

  /**
   * Get guide list
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getGuideList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsGuide[]> {
    const results = await this.odooService.searchRead<ILiyYdmsGuide>(
      ModelName.GUIDE, searchDomain, this.fields, offset, limit, order,
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get guide list by category_ids
   * @param categoryIds
   * @param offset
   * @param limit
   * @param order
   */
  public async getGuideListByCategoryIds(
    categoryIds: number[],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsGuide[]> {
    return this.getGuideList(
      [['category_ids', OdooDomainOperator.IN, categoryIds]], offset, limit, order,
    );
  }

  /**
   * Get guide list by category_ids
   * @param id
   */
  public async getGuideById(id: number): Promise<ILiyYdmsGuide | undefined> {
    const results = await this.getGuideList([['id', OdooDomainOperator.EQUAL, id]], 0, 1,);
    return results?.[0];
  }
}
