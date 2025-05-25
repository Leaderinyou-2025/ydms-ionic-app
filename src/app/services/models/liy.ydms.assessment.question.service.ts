import { Injectable } from '@angular/core';
import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { ModelName } from '../../shared/enums/model-name';
import { ILiyYdmsAssessmentQuestion } from '../../shared/interfaces/models/liy.ydms.assessment.question';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { OrderBy } from '../../shared/enums/order-by';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsAssessmentQuestionService {
  // Fields for assessment question model
  private fields = [
    'name',
    'description',
    'answer_ids',
    'order_weight',
    'answer_type',
    'display_type',
    'assessment_id',
    'scores'
  ];

  constructor(
    private odooService: OdooService
  ) {
  }

  /**
   * getAssessmentQuestionList
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getAssessmentQuestionList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.ORDER_WEIGHT_ASC
  ): Promise<ILiyYdmsAssessmentQuestion[]> {
    const results = await this.odooService.searchRead<ILiyYdmsAssessmentQuestion>(
      ModelName.ASSESSMENT_QUESTION, searchDomain, this.fields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get assessment questions by assessment ID
   * @param assessmentId Assessment ID
   * @returns Array of assessment questions
   */
  public async getAssessmentQuestionsByAssessmentId(assessmentId: number): Promise<ILiyYdmsAssessmentQuestion[]> {
    const searchDomain: SearchDomain = [['assessment_id', OdooDomainOperator.EQUAL, assessmentId]];
    return this.getAssessmentQuestionList(searchDomain, 0, 0);
  }
}
