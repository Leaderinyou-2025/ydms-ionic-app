import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { IAuthData } from '../../shared/interfaces/auth/auth-data';
import { OrderBy } from '../../shared/enums/order-by';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';

@Injectable({
  providedIn: 'root'
})
export class ResUsersService {
  public readonly fields = ['nickname', 'avatar', 'avatar_512', 'edu_id', 'school_id', 'classroom_id', 'social_id'];

  constructor(
    private odooService: OdooService
  ) {
  }

  /**
   * getUserList
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getUserList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 0,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<IAuthData[]> {
    const results = await this.odooService.searchRead<IAuthData>(
      ModelName.RES_USERS, searchDomain, this.fields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get user by school and classroom
   * @param nickname
   * @param schoolId
   * @param classroomId
   * @param offset
   * @param limit
   * @param order
   */
  public async searchUserListBySchoolId(
    nickname: string,
    schoolId: number,
    classroomId?: number,
    offset: number = 0,
    limit: number = 0,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<IAuthData[]> {
    const searchDomain: SearchDomain = [
      ['nickname', OdooDomainOperator.ILIKE, nickname],
      ['school_id', OdooDomainOperator.EQUAL, schoolId]
    ];
    if (classroomId) searchDomain.push(['classroom_id', OdooDomainOperator.EQUAL, classroomId]);
    return this.getUserList(searchDomain, offset, limit, order);
  }
}
