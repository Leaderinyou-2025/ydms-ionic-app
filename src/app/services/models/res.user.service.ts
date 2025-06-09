import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { IAuthData } from '../../shared/interfaces/auth/auth-data';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';

@Injectable({
  providedIn: 'root'
})
export class ResUserService {

  private userFields = [
    'id', 'name', 'email', 'login', 'phone', 'nickname', 'avatar', 'avatar_512', 'image_128',
    'is_teenager', 'is_parent', 'is_teacher',
    'school_id', 'classroom_id', 'parent_id', 'partner_id'
  ];

  constructor(
    private odooService: OdooService,
  ) {
  }

  /**
   * Get user list with filters
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getUserList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.NAME_ASC,
  ): Promise<IAuthData[]> {
    const results = await this.odooService.searchRead<IAuthData>(
      ModelName.RES_USERS, searchDomain, this.userFields, offset, limit, order
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get list of users by type (teenager/parent/teacher)
   * @param authData Optional current user data for context-based filtering
   * @param isTeenager Filter for teenagers
   * @param isParent Filter for parents
   * @param isTeacher Filter for teachers
   * @param offset Pagination offset
   * @param limit Pagination limit
   * @param order Sort order
   */
  public async getListUser(
    authData?: IAuthData,
    isTeenager: boolean = false,
    isParent: boolean = false,
    isTeacher: boolean = false,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.NAME_ASC
  ): Promise<IAuthData[]> {
    const searchDomain: SearchDomain = [];

    if (authData?.id) {
      searchDomain.push(['id', OdooDomainOperator.NOT_EQUAL, authData.id]);
    }

    if (isTeenager) {
      searchDomain.push(['is_teenager', OdooDomainOperator.EQUAL, true]);
      if (authData?.classroom_id?.id) {
        searchDomain.push(['classroom_id', OdooDomainOperator.EQUAL, authData.classroom_id.id]);
      }
    }

    if (isParent) {
      searchDomain.push(['is_parent', OdooDomainOperator.EQUAL, true]);
      if (authData?.school_id?.id) {
        searchDomain.push(['school_id', OdooDomainOperator.EQUAL, authData.school_id.id]);
      }
    }

    if (isTeacher) {
      searchDomain.push(['is_teacher', OdooDomainOperator.EQUAL, true]);
      if (authData?.school_id?.id) {
        searchDomain.push(['school_id', OdooDomainOperator.EQUAL, authData.school_id.id]);
      }
    }

    return this.getUserList(searchDomain, offset, limit, order);
  }

  /**
   * Get user by ID
   * @param userId
   */
  public async getUserById(userId: number): Promise<IAuthData | undefined> {
    const results = await this.odooService.read<IAuthData>(
      ModelName.RES_USERS, [userId], this.userFields
    );
    if (!results?.length) return undefined;
    const convertedResults = CommonConstants.convertArr2ListItem(results);
    return convertedResults[0];
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
}
