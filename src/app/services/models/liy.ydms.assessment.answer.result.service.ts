import { Injectable } from '@angular/core';
import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { ModelName } from '../../shared/enums/model-name';
import { ILiyYdmsAssessmentAnswerResult } from '../../shared/interfaces/models/liy.ydms.assessment.answer.result';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { OrderBy } from '../../shared/enums/order-by';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsAssessmentAnswerResultService {
  // Fields for assessment answer result model
  private fields = [
    'assessment_result_id',
    'question_id',
    'question_name',
    'answer_id',
    'answer_text',
    'scores'
  ];

  constructor(
    private odooService: OdooService
  ) {
  }

  /**
   * Lấy danh sách câu trả lời khảo sát
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getAssessmentAnswerResultsList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 0,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsAssessmentAnswerResult[]> {
    const results = await this.odooService.searchRead<ILiyYdmsAssessmentAnswerResult>(
      ModelName.ASSESSMENT_ANSWER_RESULT, searchDomain, this.fields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get assessment answer results by assessment result ID
   * @param assessmentResultId Assessment result ID
   * @returns Array of assessment answer results
   */
  public async getAnswersByAssessmentResultId(assessmentResultId: number): Promise<ILiyYdmsAssessmentAnswerResult[]> {
    const searchDomain: SearchDomain = [['assessment_result_id', OdooDomainOperator.EQUAL, assessmentResultId]];
    return this.getAssessmentAnswerResultsList(searchDomain);
  }

  /**
   * Update answer
   * @param id
   * @param body
   */
  public async updateAnswersResult(id: number, body: ILiyYdmsAssessmentAnswerResult): Promise<boolean | number> {
    return this.odooService.write<ILiyYdmsAssessmentAnswerResult>(
      ModelName.ASSESSMENT_ANSWER_RESULT, [id], body
    );
  }
}
