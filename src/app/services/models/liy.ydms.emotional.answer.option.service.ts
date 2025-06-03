import { Injectable } from '@angular/core';
import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { ModelName } from '../../shared/enums/model-name';
import { ILiyYdmsEmotionalAnswerOption } from '../../shared/interfaces/models/liy.ydms.emotional.answer.option';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { OrderBy } from '../../shared/enums/order-by';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsEmotionalAnswerOptionService {
  // Fields for emotional answer option model
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
  ): Promise<ILiyYdmsEmotionalAnswerOption[]> {
    const results = await this.odooService.searchRead<ILiyYdmsEmotionalAnswerOption>(
      ModelName.EMOTIONAL_ANSWER_OPTION, searchDomain, this.fields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get answer options by question ids
   * @returns Array of answer options
   * @param ids
   */
  public async getAnswerOptionsByQuestionIds(ids: Array<number>): Promise<ILiyYdmsEmotionalAnswerOption[]> {
    return this.getAnswerOptionList([['question_id', OdooDomainOperator.IN, ids]], 0, 0);
  }

  /**
   * Get answer option by id
   * @param id Answer option ID
   * @returns Promise<ILiyYdmsEmotionalAnswerOption | null>
   */
  public async getAnswerOptionById(id: number): Promise<ILiyYdmsEmotionalAnswerOption | undefined> {
    const results = await this.getAnswerOptionList(
      [['id', OdooDomainOperator.EQUAL, id]], 0, 1
    );
    return results?.[0];
  }

  /**
   * Get answer option by id
   * @param ids Answer option IDs
   * @returns Promise<ILiyYdmsEmotionalAnswerOption | null>
   */
  public async getAnswerOptionByIds(ids: Array<number>): Promise<ILiyYdmsEmotionalAnswerOption[]> {
    return this.getAnswerOptionList(
      [['id', OdooDomainOperator.IN, ids]], 0, 0
    );
  }

  /**
   * Get answer options by question id
   * @param questionId Question ID
   * @returns Promise<ILiyYdmsEmotionalAnswerOption[]>
   */
  public async getAnswerOptionsByQuestionId(questionId: number): Promise<ILiyYdmsEmotionalAnswerOption[]> {
    return this.getAnswerOptionList([['question_id', OdooDomainOperator.EQUAL, questionId]], 0, 0);
  }
}
