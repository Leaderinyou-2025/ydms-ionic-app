import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { ILiyYdmsGuide } from '../../shared/interfaces/models/liy.ydms.guide';
import { OrderBy } from '../../shared/enums/order-by';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { GuideType } from '../../shared/enums/guide-type';
import { AreaOfExpertise } from '../../shared/enums/area-of-expertise';

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

  /**
   * Lấy danh sách gợi ý điều tiết cảm xúc
   * @param searchTerm
   * @param offset
   * @param limit
   * @param order
   */
  public async getEmotionGuideList(
    searchTerm: string = '',
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.NAME_ASC,
  ): Promise<ILiyYdmsGuide[]> {
    return this.getGuideList(
      [
        ['name', OdooDomainOperator.ILIKE, searchTerm],
        ['guide_type', OdooDomainOperator.EQUAL, GuideType.INSTRUCTION],
        ['area_of_expertise', OdooDomainOperator.EQUAL, AreaOfExpertise.EMOTION],
      ], offset, limit, order,
    );
  }

  /**
   * Get guide list by guide_type
   * @param searchTerm
   * @param guideType
   * @param offset
   * @param limit
   * @param order
   */
  public async getGuideListByGuideType(
    searchTerm: string = '',
    guideType: GuideType,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsGuide[]> {
    return this.getGuideList(
      [
        ['name', OdooDomainOperator.ILIKE, searchTerm.trim()],
        ['guide_type', OdooDomainOperator.EQUAL, guideType],
      ], offset, limit, order,
    );
  }

  /**
   * Get guide list with search and filters
   * @param searchTerm
   * @param areaOfExpertise
   * @param offset
   * @param limit
   * @param order
   */
  public async getGuideListWithFilters(
    searchTerm: string = '',
    areaOfExpertise?: AreaOfExpertise | 'all',
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsGuide[]> {
    const searchDomain: SearchDomain = [
      ['guide_type', OdooDomainOperator.EQUAL, GuideType.INSTRUCTION]
    ];

    // Add search term filter
    if (searchTerm.trim()) {
      searchDomain.push(['name', OdooDomainOperator.ILIKE, searchTerm.trim()]);
    }

    // Add area of expertise filter
    if (areaOfExpertise && areaOfExpertise !== 'all') {
      searchDomain.push(['area_of_expertise', OdooDomainOperator.EQUAL, areaOfExpertise]);
    }

    return this.getGuideList(searchDomain, offset, limit, order);
  }

  /**
   * Get count guide
   * @param searchDomain
   */
  public async getCountGuide(searchDomain: SearchDomain = []): Promise<number> {
    return this.odooService.searchCount(
      ModelName.GUIDE, searchDomain
    );
  }

  /**
   * Đếm số lượng guide trong tháng
   * @param guideType
   * @param areaOfExpertise
   * @param month
   * @param year
   */
  public async getCountGuideInMonth(
    guideType?: GuideType,
    areaOfExpertise?: AreaOfExpertise,
    month?: number,
    year?: number,
  ): Promise<number> {
    const rangeDateMonth = CommonConstants.getFirstAndLastDateInMonth(month, year);
    const searchDomain: SearchDomain = [
      ['create_date', OdooDomainOperator.GREATER_EQUAL, rangeDateMonth.firstDate],
      ['create_date', OdooDomainOperator.LESS_EQUAL, rangeDateMonth.lastDate],
    ];

    if (guideType) searchDomain.push(['guide_type', OdooDomainOperator.EQUAL, guideType]);
    if (areaOfExpertise) searchDomain.push(['area_of_expertise', OdooDomainOperator.EQUAL, areaOfExpertise]);
    return this.getCountGuide(searchDomain);
  }
}
