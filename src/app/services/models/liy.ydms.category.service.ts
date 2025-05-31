import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsCategory } from '../../shared/interfaces/models/liy.ydms.category';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsCategoryService {

  public readonly fields = [
    'name', 'area_of_expertise', 'tags', 'desciption', 'image_128'
  ]

  constructor(
    private odooService: OdooService,
  ) {
  }

  /**
   * Get category list
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getCategories(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<ILiyYdmsCategory[]> {
    const results = await this.odooService.searchRead<ILiyYdmsCategory>(
      ModelName.CATEGORY, searchDomain, this.fields, offset, limit, order,
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get list category by ids
   * @param categoryIds
   */
  public async getCategoryByIds(categoryIds: Array<number>): Promise<ILiyYdmsCategory[]> {
    return this.getCategories([['id', OdooDomainOperator.IN, categoryIds]], 0, 0);
  }
}
