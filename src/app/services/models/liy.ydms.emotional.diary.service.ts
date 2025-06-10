import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsEmotionalDiary } from '../../shared/interfaces/models/liy.ydms.emotional.diary';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { IEmotionJournal } from '../../shared/interfaces/function-data/emtion-journal';
import { PublicEmotionalOption } from '../../shared/enums/public-emotional-option';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsEmotionalDiaryService {

  public readonly emotionalDiaryFields = [
    'answer_icon', 'answer_id', 'answer_text', 'question_id',
    'nickname', 'teenager_id', 'rank_point', 'scores', 'create_date', 'write_date',
    'public_emotional', 'public_emotional_to', 'public_user_ids'
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
      [
        ['teenager_id', OdooDomainOperator.EQUAL, teenagerId],
        ['public_emotional', OdooDomainOperator.EQUAL, true],
      ],
      offset,
      limit,
      order
    );
  }

  /**
   * Lấy danh sách các nhật ký được bạn bè chia sẻ
   * @param teenagerId
   * @param offset
   * @param limit
   * @param order
   */
  public async getTeenagerSharedEmotionDiaryList(
    teenagerId: number,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsEmotionalDiary[]> {
    return this.getEmotionalDiaryList(
      [
        OdooDomainOperator.OR,
        OdooDomainOperator.OR,
        ['public_emotional_to', OdooDomainOperator.EQUAL, PublicEmotionalOption.ALL],
        ['public_emotional_to', OdooDomainOperator.EQUAL, PublicEmotionalOption.ALL_FRIENDS],
        ['public_user_ids', OdooDomainOperator.IN, [teenagerId]],
        ['public_emotional', OdooDomainOperator.EQUAL, true],
      ],
      offset,
      limit,
      order
    );
  }

  /**
   * getUserEmotionDiaryListInMonth
   * @param teenagerId
   * @param offset
   * @param limit
   * @param order
   * @param month
   * @param year
   */
  public async getUserEmotionDiaryListInMonth(
    teenagerId: number,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
    month?: number,
    year?: number,
  ): Promise<ILiyYdmsEmotionalDiary[]> {
    const rangeDateMonth = CommonConstants.getFirstAndLastDateInMonth(month, year);
    const searchDomain: SearchDomain = [
      ['teenager_id', OdooDomainOperator.EQUAL, teenagerId],
      ['create_date', OdooDomainOperator.GREATER_EQUAL, rangeDateMonth.firstDate],
      ['create_date', OdooDomainOperator.LESS_EQUAL, rangeDateMonth.lastDate],
    ];

    return this.getEmotionalDiaryList(searchDomain, offset, limit, order);
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
  ): Promise<number> {
    const rangeDateMonth = CommonConstants.getFirstAndLastDateInMonth(month, year);
    const searchDomain: SearchDomain = [
      ['teenager_id', OdooDomainOperator.EQUAL, teenagerId],
      ['create_date', OdooDomainOperator.GREATER_EQUAL, rangeDateMonth.firstDate],
      ['create_date', OdooDomainOperator.LESS_EQUAL, rangeDateMonth.lastDate],
      ['answer_id', OdooDomainOperator.NOT_EQUAL, false],
    ];
    return this.getCountEmotionDiaryList(searchDomain);
  }

  /**
   * updateEmotionDiary
   * @param id
   * @param body
   */
  public async updateEmotionDiary(
    id: number,
    body: Partial<IEmotionJournal>
  ): Promise<boolean | number> {
    return this.odooService.write<IEmotionJournal>(
      ModelName.EMOTIONAL_DIARY,
      [id],
      body
    );
  }

  /**
   * createEmotionDiary
   * @param body
   */
  public async createEmotionDiary(
    body: Partial<IEmotionJournal>
  ): Promise<number | undefined> {
    return this.odooService.create<IEmotionJournal>(
      ModelName.EMOTIONAL_DIARY, body
    );
  }

  /**
   * Get emotion diary by id
   * @param id
   */
  public async getEmotionDiary(id: number): Promise<Partial<ILiyYdmsEmotionalDiary> | undefined> {
    let results = await this.odooService.read<ILiyYdmsEmotionalDiary>(
      ModelName.EMOTIONAL_DIARY, [id], this.emotionalDiaryFields
    );
    return CommonConstants.convertArr2ListItem(results)?.[0];
  }

  /**
   * Lấy số lượng lượt chia sẻ cảm xúc cho userId trong ngày
   * @param userId
   */
  public async getCountNewEmotionSharedWithUserId(userId: number): Promise<number> {
    if (!userId) return 0;

    const currentDate = new Date();
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const d = currentDate.getDate();

    // Create local dates first
    const startDatetime = new Date(y, m, d, 0, 0, 0);
    const endDatetime = new Date(y, m, d, 23, 59, 59);

    return this.getCountEmotionDiaryList([
      ['public_user_ids', OdooDomainOperator.IN, [userId]],
      ['create_date', OdooDomainOperator.GREATER_EQUAL, CommonConstants.formatUTC(startDatetime)],
      ['create_date', OdooDomainOperator.LESS_EQUAL, CommonConstants.formatUTC(endDatetime)],
    ]);
  }
}
