import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsStudent } from '../../shared/interfaces/models/liy.ydms.student';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsStudentService {

  public readonly studentFields = [
    'name',
    'user_id',
    'avatar',
    'nickname',
    'email',
    'phone',
    'class_id',
    'student_code',
    'dob',
    'gender',
    'total_score',
    'class_rank',
    'active',
    'create_date',
    'write_date'
  ];

  constructor(
    private odooService: OdooService,
  ) {
  }

  /**
   * getStudentList
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getStudentList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<ILiyYdmsStudent[]> {
    let results = await this.odooService.searchRead<ILiyYdmsStudent>(
      ModelName.STUDENT, searchDomain, this.studentFields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * getStudentById
   * @param studentId
   */
  public async getStudentById(studentId: number): Promise<ILiyYdmsStudent | undefined> {
    if (!studentId) return undefined;
    const results = await this.odooService.read<ILiyYdmsStudent>(
      ModelName.STUDENT, [studentId], this.studentFields
    );
    return results?.length ? results[0] : undefined;
  }

  /**
   * getStudentsByClassId
   * @param classId
   * @param offset
   * @param limit
   * @param order
   */
  public async getStudentsByClassId(
    classId: number,
    offset: number = 0,
    limit: number = 50,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<ILiyYdmsStudent[]> {
    const searchDomain: SearchDomain = [
      ['class_id', '=', classId],
      ['active', '=', true]
    ];
    return this.getStudentList(searchDomain, offset, limit, order);
  }

  /**
   * getCountStudentsByClassId
   * @param classId
   */
  public async getCountStudentsByClassId(classId: number): Promise<number> {
    const searchDomain: SearchDomain = [
      ['class_id', '=', classId],
      ['active', '=', true]
    ];
    return this.odooService.searchCount<ILiyYdmsStudent>(ModelName.STUDENT, searchDomain);
  }

  /**
   * searchStudentsByName
   * @param classId
   * @param searchText
   * @param offset
   * @param limit
   * @param order
   */
  public async searchStudentsByName(
    classId: number,
    searchText: string,
    offset: number = 0,
    limit: number = 50,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<ILiyYdmsStudent[]> {
    const searchDomain: SearchDomain = [
      ['class_id', '=', classId],
      ['active', '=', true],
      '|',
      ['name', 'ilike', searchText],
      ['nickname', 'ilike', searchText]
    ];
    return this.getStudentList(searchDomain, offset, limit, order);
  }
}
