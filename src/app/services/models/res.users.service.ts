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
  public readonly fields = [
    'name', 'nickname', 'avatar', 'avatar_512', 'image_128',
    'email', 'phone', 'gender', 'dob',
    'edu_id', 'school_id', 'classroom_id', 'classroom_ids', 'social_id',
    'is_teenager', 'is_parent', 'is_teacher',
    'total_friendly_points',
    'street', 'precint_id', 'district_id', 'state_id',
    'parent_id', 'partner_id',
    'create_date', 'write_date'
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
   * Get count of users with filters
   * @param searchDomain
   */
  public async getCountUser(searchDomain: SearchDomain = []): Promise<number> {
    const results = await this.odooService.searchCount(ModelName.RES_USERS, searchDomain);
    return results || 0;
  }

  /**
   * Get friends list by ids
   * @param ids
   */
  public async getFriendListByIds(ids: Array<number>): Promise<Partial<IAuthData>[]> {
    const results = await this.odooService.read<IAuthData>(ModelName.RES_USERS, ids, ['nickname', 'avatar_512', 'school_id', 'classroom_id']);
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get count teenager by classroom id
   * @param classroomId
   */
  public async getCountTeenagerByClassroomId(classroomId: number): Promise<number> {
    return this.getCountUser([
      ['classroom_id', OdooDomainOperator.EQUAL, classroomId],
      ['is_teenager', OdooDomainOperator.EQUAL, true],
    ]);
  }

  /**
   * Lấy danh sách id của tất cả học sinh trong lớp
   * @param classroomId
   * @private
   */
  public async getTeenagerIdsByClassroomId(classroomId: number): Promise<IAuthData[]> {
    return this.odooService.searchRead<IAuthData>(
      ModelName.RES_USERS,
      [
        ['classroom_id', OdooDomainOperator.EQUAL, classroomId],
        ['is_teenager', OdooDomainOperator.EQUAL, true],
      ],
      ['id', 'nickname'], 0, 0
    );
  }

  /**
   * Lấy danh sách học sinh theo cha mẹ
   * @param parentId
   * @param offset
   * @param limit
   * @param order
   */
  public async getChildrenByParentId(
    parentId: number,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<IAuthData[]> {
    const searchDomain: SearchDomain = [
      ['parent_id', OdooDomainOperator.EQUAL, parentId],
      ['is_teenager', OdooDomainOperator.EQUAL, true],
    ];
    return this.getUserList(searchDomain, offset, limit, order);
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
    nickname: string = '',
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
      ModelName.RES_USERS, searchDomain, this.fields, offset, limit, order
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
      ModelName.RES_USERS, [userId], this.fields
    );
    if (!results?.length) return undefined;
    const convertedResults = CommonConstants.convertArr2ListItem(results);
    return convertedResults[0];
  }

  /**
   * Get user by ID
   * @param userIds
   */
  public async getListUserByIds(userIds: number[]): Promise<IAuthData[]> {
    return this.getUserList(
      [['id', OdooDomainOperator.IN, userIds]], 0, 0
    );
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
      ModelName.RES_USERS, searchDomain, this.fields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }
}
