import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsEmotionalDiary } from '../../shared/interfaces/models/liy.ydms.emotional.diary';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsEmotionalDiaryService {

  public readonly emotionalDiaryFields = [
    'answer_icon', 'answer_id', 'answer_text', 'question_id',
    'nickname', 'teenager_id', 'rank_point', 'scores', 'create_date', 'write_date'
  ];

  constructor(
    private odooService: OdooService
  ) {
  }

  /**
   * getEmotionalDiaryList
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getEmotionalDiaryList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsEmotionalDiary[]> {
    const results = await this.odooService.searchRead<ILiyYdmsEmotionalDiary>(
      ModelName.EMOTIONAL_DIARY, searchDomain, this.emotionalDiaryFields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * getCountEmotionDiaryList
   * @param searchDomain
   */
  public async getCountEmotionDiaryList(searchDomain: SearchDomain = []): Promise<number> {
    return this.odooService.searchCount<ILiyYdmsEmotionalDiary>(
      ModelName.EMOTIONAL_DIARY, searchDomain,
    );
  }

  /**
   * getUserEmotionDiaryList
   * @param teenagerId
   * @param offset
   * @param limit
   * @param order
   */
  public async getUserEmotionDiaryList(
    teenagerId: number,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsEmotionalDiary[]> {
    return this.getEmotionalDiaryList(
      [['teenager_id', OdooDomainOperator.EQUAL, teenagerId]],
      offset,
      limit,
      order
    );
  }

  /**
   * Lấy danh sách emotion diary chưa trả lời của user
   * @param teenagerId
   * @param offset
   * @param limit
   * @param order
   */
  public async getUserEmotionDiaryPending(
    teenagerId: number,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsEmotionalDiary[]> {
    return this.getEmotionalDiaryList(
      [
        ['teenager_id', OdooDomainOperator.EQUAL, teenagerId],
        ['answer_id', OdooDomainOperator.EQUAL, false],
      ],
      offset,
      limit,
      order
    );
  }

  /**
   * getCountUserEmotionDiaryPending
   * @param teenagerId
   */
  public async getCountUserEmotionDiaryPending(teenagerId: number): Promise<number> {
    return this.getCountEmotionDiaryList(
      [
        ['teenager_id', OdooDomainOperator.EQUAL, teenagerId],
        ['answer_id', OdooDomainOperator.EQUAL, false],
      ],
    );
  }

  /**
   * Lấy số ngày checkin cảm xúc trong tháng
   * @param teenagerId
   * @param month
   * @param year
   */
  public async getStreakEmotionDiaryInMonth(
    teenagerId: number,
    month?: number,
    year?: number
  ) {
    const currentDate = new Date();
    const firstDay = new Date(year || currentDate.getFullYear(), month ? (month - 1) : currentDate.getMonth(), 1, 0, 0, 0);
    const lastDay = new Date(year || currentDate.getFullYear(), month || (currentDate.getMonth() + 1), 0, 23, 59, 59);

    const firstDayFormatted = `${firstDay.toISOString().split('T')[0]} 00:00:00`;
    const lastDayFormatted = `${lastDay.toISOString().split('T')[0]} 23:59:59`;

    const searchDomain: SearchDomain = [
      ['teenager_id', OdooDomainOperator.EQUAL, teenagerId],
      ['create_date', OdooDomainOperator.GREATER_EQUAL, firstDayFormatted],
      ['create_date', OdooDomainOperator.LESS_EQUAL, lastDayFormatted],
    ];

    return this.getCountEmotionDiaryList(searchDomain);
  }

  /**
   * updateEmotionDiary
   * @param id
   * @param body
   */
  public async updateEmotionDiary(id: number, body: Partial<ILiyYdmsEmotionalDiary>): Promise<boolean | number> {
    return this.odooService.write<ILiyYdmsEmotionalDiary>(
      ModelName.EMOTIONAL_DIARY,
      [id],
      body
    );
  }
}
