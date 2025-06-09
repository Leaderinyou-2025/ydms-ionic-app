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

  public readonly teenagerFields = [
    'name',
    'nickname',
    'avatar',
    'avatar_512',
    'email',
    'phone',
    'edu_id',
    'school_id',
    'classroom_id',
    'classroom_ids',
    'social_id',
    'gender',
    'dob',
    'is_teenager',
    'total_friendly_points',
    'street',
    'precint_id',
    'district_id',
    'state_id',
    'parent_id',
    'create_date',
    'write_date'
  ];

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
    schoolId?: number,
    classroomId?: number,
    offset: number = 0,
    limit: number = 0,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<IAuthData[]> {
    const searchDomain: SearchDomain = [['nickname', OdooDomainOperator.ILIKE, nickname], ['is_teenager', OdooDomainOperator.EQUAL, true]];
    if (schoolId) searchDomain.push(['school_id', OdooDomainOperator.EQUAL, schoolId]);
    if (classroomId) searchDomain.push(['classroom_id', OdooDomainOperator.EQUAL, classroomId]);
    return this.getUserList(searchDomain, offset, limit, order);
  }

  /**
   * Get teenagers by classroom ID
   * @param classroomId
   * @param offset
   * @param limit
   * @param order
   */
  public async getTeenagersByClassroomId(
    classroomId: number,
    offset: number = 0,
    limit: number = 50,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<IAuthData[]> {
    const searchDomain: SearchDomain = [
      ['is_teenager', OdooDomainOperator.EQUAL, true],
      '|',
      ['classroom_id', OdooDomainOperator.EQUAL, classroomId],
      ['classroom_ids', OdooDomainOperator.IN, [classroomId]]
    ];

    const results = await this.odooService.searchRead<IAuthData>(
      ModelName.RES_USERS, searchDomain, this.teenagerFields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get count of teenagers by classroom ID
   * @param classroomId
   */
  public async getCountTeenagersByClassroomId(classroomId: number): Promise<number> {
    const searchDomain: SearchDomain = [
      ['is_teenager', OdooDomainOperator.EQUAL, true],
      '|',
      ['classroom_id', OdooDomainOperator.EQUAL, classroomId],
      ['classroom_ids', OdooDomainOperator.IN, [classroomId]]
    ];
    return this.odooService.searchCount<IAuthData>(ModelName.RES_USERS, searchDomain);
  }

  /**
   * Get user by ID
   * @param userId
   */
  public async getUserById(userId: number): Promise<IAuthData | undefined> {
    if (!userId) return undefined;
    const results = await this.odooService.read<IAuthData>(
      ModelName.RES_USERS, [userId], this.teenagerFields
    );
    if (!results?.length) return undefined;
    const convertedResults = CommonConstants.convertArr2ListItem(results);
    return convertedResults[0];
  }

  /**
   * Search teenagers by name in classroom
   * @param classroomId
   * @param searchText
   * @param offset
   * @param limit
   * @param order
   */
  public async searchTeenagersByNameInClassroom(
    classroomId: number,
    searchText: string,
    offset: number = 0,
    limit: number = 50,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<IAuthData[]> {
    const searchDomain: SearchDomain = [
      ['is_teenager', OdooDomainOperator.EQUAL, true],
      '|',
      ['classroom_id', OdooDomainOperator.EQUAL, classroomId],
      ['classroom_ids', OdooDomainOperator.IN, [classroomId]],
      '|',
      ['name', OdooDomainOperator.ILIKE, searchText],
      ['nickname', OdooDomainOperator.ILIKE, searchText]
    ];

    const results = await this.odooService.searchRead<IAuthData>(
      ModelName.RES_USERS, searchDomain, this.teenagerFields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }
}
