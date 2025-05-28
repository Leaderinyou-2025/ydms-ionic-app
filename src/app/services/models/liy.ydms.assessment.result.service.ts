import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { ModelName } from '../../shared/enums/model-name';
import { ILiyYdmsAssessmentResult } from '../../shared/interfaces/models/liy.ydms.assessment.result';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { OrderBy } from '../../shared/enums/order-by';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsAssessmentResultService {
  // Fields for assessment result model
  private fields = [
    'assessment_id',
    'nickname',
    'assignee_id',
    'name',
    'area_of_expertise',
    'scores',
    'rank_point',
    'is_posted',
    'create_date',
    'write_date'
  ];

  constructor(
    private odooService: OdooService
  ) {
  }

  /**
   * getAssessmentResultList
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getAssessmentResultList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC
  ): Promise<ILiyYdmsAssessmentResult[]> {
    let results = await this.odooService.searchRead<ILiyYdmsAssessmentResult>(
      ModelName.ASSESSMENT_RESULT, searchDomain, this.fields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Search count assessment result
   * @param searchDomain
   */
  public async getCountAssessmentResult(searchDomain: SearchDomain = []): Promise<number> {
    return this.odooService.searchCount<ILiyYdmsAssessmentResult>(ModelName.ASSESSMENT_RESULT, searchDomain);
  }

  /**
   * Update Assessment Result
   * @param id
   * @param body
   */
  public async updateAssessmentResult(id: number, body: Partial<ILiyYdmsAssessmentResult>): Promise<number | boolean> {
    return this.odooService.write<ILiyYdmsAssessmentResult>(
      ModelName.ASSESSMENT_RESULT,
      [id],
      body,
    );
  }

  /**
   * Load survey history by area of expertise
   * @param areaOfExpertise Area of expertise (e.g., 'conflict', 'stress', etc.)
   * @param assigneeId
   * @param limit Number of records to return (default: 10)
   * @param offset Offset for pagination (default: 0)
   * @returns Array of survey history results
   */
  public async getAssessmentResultByAreaOfExpertise(
    areaOfExpertise: string,
    assigneeId: number,
    offset: number = 0,
    limit: number = 10
  ): Promise<ILiyYdmsAssessmentResult[]> {
    const searchDomain: SearchDomain = [
      ['area_of_expertise', OdooDomainOperator.EQUAL, areaOfExpertise],
      ['assignee_id', OdooDomainOperator.EQUAL, assigneeId]
    ];
    return this.getAssessmentResultList(searchDomain, offset, limit);
  }

  /**
   * Đếm số lượng bài khảo sát đang chờ trả lời
   * @param assigneeId
   * @param areaOfExpertise
   */
  public async getCountAssessmentResultPending(
    assigneeId: number,
    areaOfExpertise?: string,
  ): Promise<number> {
    const searchDomain: SearchDomain = [
      ['assignee_id', OdooDomainOperator.EQUAL, assigneeId],
      ['is_posted', OdooDomainOperator.EQUAL, false] // Chưa trả lời
    ];
    if (areaOfExpertise) searchDomain.push(['area_of_expertise', OdooDomainOperator.EQUAL, areaOfExpertise]);
    return this.getCountAssessmentResult(searchDomain);
  }

  /**
   * Lấy danh sách bài khảo sát đang chờ trả lời
   * @param assigneeId
   * @param areaOfExpertise
   */
  public async getAssessmentResultPending(
    assigneeId: number,
    areaOfExpertise?: string,
  ): Promise<ILiyYdmsAssessmentResult[]> {
    const searchDomain: SearchDomain = [
      ['assignee_id', OdooDomainOperator.EQUAL, assigneeId],
      ['is_posted', OdooDomainOperator.EQUAL, false] // Chưa trả lời
    ];
    if (areaOfExpertise) searchDomain.push(['area_of_expertise', OdooDomainOperator.EQUAL, areaOfExpertise]);
    return this.getAssessmentResultList(searchDomain, 0, 0);
  }

  /**
   * getAssessmentResultById
   * @param id
   */
  public async getAssessmentResultById(id: number): Promise<ILiyYdmsAssessmentResult | undefined> {
    let results = await this.odooService.read<ILiyYdmsAssessmentResult>(
      ModelName.ASSESSMENT_RESULT,
      [id],
      this.fields,
    )
    if (!results || !results?.length) return;
    results = CommonConstants.convertArr2ListItem(results);
    return results[0];
  }

  /**
   * getAssessmentResultInMonth
   * @param assigneeId
   * @param month
   * @param year
   * @param areaOfExpertise
   */
  public async getAssessmentResultInMonth(
    assigneeId: number,
    month?: number,
    year?: number,
    areaOfExpertise?: string,
  ): Promise<ILiyYdmsAssessmentResult[]> {
    const currentDate = new Date();
    const firstDay = new Date(year || currentDate.getFullYear(), month ? (month - 1) : currentDate.getMonth(), 1, 0, 0, 0);
    const lastDay = new Date(year || currentDate.getFullYear(), month || (currentDate.getMonth() + 1), 0, 23, 59, 59);

    const firstDayFormatted = `${firstDay.toISOString().split('T')[0]} 00:00:00`;
    const lastDayFormatted = `${lastDay.toISOString().split('T')[0]} 23:59:59`;

    const searchDomain: SearchDomain = [
      ['assignee_id', OdooDomainOperator.EQUAL, assigneeId],
      ['create_date', OdooDomainOperator.GREATER_EQUAL, firstDayFormatted],
      ['create_date', OdooDomainOperator.LESS_EQUAL, lastDayFormatted],
    ];
    if (areaOfExpertise) searchDomain.push(['area_of_expertise', OdooDomainOperator.EQUAL, areaOfExpertise]);
    return this.getAssessmentResultList(searchDomain, 0, 0);
  }
}
