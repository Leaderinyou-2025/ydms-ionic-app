import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsClassroom } from '../../shared/interfaces/models/liy.ydms.classroom';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';

@Injectable({
  providedIn: 'root'
})
export class LiyYdmsClassService {

  public readonly classFields = ['name', 'code'];

  constructor(
    private odooService: OdooService,
  ) {
  }

  /**
   * getClassList
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getClassList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<ILiyYdmsClassroom[]> {
    let results = await this.odooService.searchRead<ILiyYdmsClassroom>(
      ModelName.CLASS, searchDomain, this.classFields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * getClassById
   * @param classId
   */
  public async getClassById(classId: number): Promise<ILiyYdmsClassroom | undefined> {
    if (!classId) return undefined;
    const results = await this.odooService.read<ILiyYdmsClassroom>(
      ModelName.CLASS, [classId], this.classFields
    );
    return results?.length ? results[0] : undefined;
  }

  public async getClassesByClassIds(
    classIds: Array<number>,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<ILiyYdmsClassroom[]> {
    if (!classIds?.length) return [];
    const searchDomain: SearchDomain = [
      ['id', 'in', classIds]
    ];
    return this.getClassList(searchDomain, offset, limit, order);
  }

  /**
   * getCountClassesByClassIds
   * @param classIds
   */
  public async getCountClassesByClassIds(classIds: Array<number>): Promise<number> {
    if (!classIds?.length) return 0;
    const searchDomain: SearchDomain = [
      ['id', 'in', classIds]
    ];
    return this.odooService.searchCount<ILiyYdmsClassroom>(ModelName.CLASS, searchDomain);
  }

  /**
   * getClassesByUserClassrooms
   * Get classes by user's classroom_id and classroom_ids
   * @param classroomId Single classroom ID
   * @param classroomIds Array of classroom IDs
   * @param offset
   * @param limit
   * @param order
   */
  public async getClassesByUserClassrooms(
    classroomId?: number,
    classroomIds?: Array<number>,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<ILiyYdmsClassroom[]> {
    const allClassIds: Array<number> = [];

    // Add single classroom_id if exists
    if (classroomId) {
      allClassIds.push(classroomId);
    }

    // Add classroom_ids array if exists
    if (classroomIds?.length) {
      allClassIds.push(...classroomIds);
    }

    // Remove duplicates
    const uniqueClassIds = [...new Set(allClassIds)];

    if (!uniqueClassIds.length) return [];

    const searchDomain: SearchDomain = [
      ['id', OdooDomainOperator.IN, uniqueClassIds]
    ];
    return this.getClassList(searchDomain, offset, limit, order);
  }

  /**
   * getCountClassesByUserClassrooms
   * Count classes by user's classroom_id and classroom_ids
   * @param classroomId Single classroom ID
   * @param classroomIds Array of classroom IDs
   */
  public async getCountClassesByUserClassrooms(
    classroomId?: number,
    classroomIds?: Array<number>
  ): Promise<number> {
    const allClassIds: Array<number> = [];

    // Add single classroom_id if exists
    if (classroomId) {
      allClassIds.push(classroomId);
    }

    // Add classroom_ids array if exists
    if (classroomIds?.length) {
      allClassIds.push(...classroomIds);
    }

    // Remove duplicates
    const uniqueClassIds = [...new Set(allClassIds)];

    if (!uniqueClassIds.length) return 0;

    const searchDomain: SearchDomain = [
      ['id', OdooDomainOperator.IN, uniqueClassIds]
    ];
    return this.odooService.searchCount<ILiyYdmsClassroom>(ModelName.CLASS, searchDomain);
  }
}
