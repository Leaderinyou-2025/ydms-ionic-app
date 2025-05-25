import { Injectable } from '@angular/core';
import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { ModelName } from '../../shared/enums/model-name';
import { ILiyYdmsAssessmentAnswerOption } from '../../shared/interfaces/models/liy.ydms.assessment.answer.option';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { OrderBy } from '../../shared/enums/order-by';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsAssessmentAnswerOptionService {
  // Fields for assessment answer option model
  private fields = [
    'name',
    'image_1920',
    'scores',
    'encourage',
    'guide_category_ids',
    'question_id',
    'order_weight'
  ];

  constructor(
    private odooService: OdooService
  ) {
  }

  /**
   * getAnswerOptionList
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getAnswerOptionList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.ORDER_WEIGHT_ASC,
  ): Promise<ILiyYdmsAssessmentAnswerOption[]> {
    const results = await this.odooService.searchRead<ILiyYdmsAssessmentAnswerOption>(
      ModelName.ASSESSMENT_ANSWER_OPTION, searchDomain, this.fields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get answer options by question ids
   * @returns Array of answer options
   * @param ids
   */
  public async getAnswerOptionsByQuestionIds(ids: Array<number>): Promise<ILiyYdmsAssessmentAnswerOption[]> {
    return this.getAnswerOptionList([['question_id', OdooDomainOperator.IN, ids]], 0, 0);
  }
}
