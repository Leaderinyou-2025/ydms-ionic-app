import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsEmotionalQuestion } from '../../shared/interfaces/models/liy.ydms.emotional.question';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsEmotionalQuestionService {

  public readonly emotionalQuestionFields = [
    'name', 'answer_ids', 'encourage_interaction', 'rank_point'
  ];

  constructor(
    private odooService: OdooService
  ) {
  }

  /**
   * getQuestionList - Lấy danh sách câu hỏi cảm xúc
   * @param searchDomain Domain tìm kiếm
   * @param offset Vị trí bắt đầu
   * @param limit Số lượng bản ghi
   * @param order Thứ tự sắp xếp
   * @returns Promise<ILiyYdmsEmotionalQuestion[]>
   */
  public async getQuestionList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC
  ): Promise<ILiyYdmsEmotionalQuestion[]> {
    const results = await this.odooService.searchRead<ILiyYdmsEmotionalQuestion>(
      ModelName.EMOTIONAL_QUESTION, searchDomain, this.emotionalQuestionFields,
      offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * getQuestionById - Lấy câu hỏi cảm xúc theo ID
   * @param questionId ID của câu hỏi
   * @returns Promise<ILiyYdmsEmotionalQuestion | null>
   */
  public async getQuestionById(questionId: number): Promise<ILiyYdmsEmotionalQuestion | null> {
    const results = await this.getQuestionList(
      [['id', OdooDomainOperator.EQUAL, questionId]], 0, 1
    );
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get count questions
   * @param searchDomain
   */
  public async getCountQuestions(searchDomain: SearchDomain = []): Promise<number> {
    return this.odooService.searchCount<ILiyYdmsEmotionalQuestion>(
      ModelName.EMOTIONAL_QUESTION, searchDomain
    );
  }
}
