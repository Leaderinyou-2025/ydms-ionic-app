import { Injectable } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { LiyYdmsAvatarService } from '../models/liy.ydms.avatar.service';
import { LiyYdmsBadgeService } from '../models/liy.ydms.badge.service';
import { LiyYdmsLeaderboardService } from '../models/liy.ydms.leaderboard.service';
import { LiyYdmsAchievementService } from '../models/liy.ydms.achievement.service';
import { IAchievement, IBadge, ILeaderboard } from '../../shared/interfaces/rank/rank.interfaces';
import { SearchDomain } from '../odoo/odoo.service';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { IAssetsResource } from '../../shared/interfaces/settings/assets-resource';
import { IAuthData } from '../../shared/interfaces/auth/auth-data';
import { ILiyYdmsAchievement } from '../../shared/interfaces/models/liy.ydms.achievement';
import { OrderBy } from '../../shared/enums/order-by';
import { AreaOfExpertise } from '../../shared/enums/area-of-expertise';

@Injectable({
  providedIn: 'root'
})
export class RankService {

  private cacheAvatarResource: Map<number, IAssetsResource> = new Map<number, IAssetsResource>();

  constructor(
    private authService: AuthService,
    private liyYdmsLeaderboardService: LiyYdmsLeaderboardService,
    private liyYdmsAchievementService: LiyYdmsAchievementService,
    private liyYdmsAvatarService: LiyYdmsAvatarService,
    private liyYdmsBadgeService: LiyYdmsBadgeService
  ) {
  }

  /**
   * Lấy danh sách xếp hạng trừ tài khoản chính mình
   * @param teenagerId
   * @param offset
   * @param limit
   */
  public async getLeaderboardListIgnoreCurrent(
    teenagerId: number,
    offset: number = 0,
    limit: number = 20
  ): Promise<ILeaderboard[]> {
    const searchDomain: SearchDomain = [['teenager_id', OdooDomainOperator.NOT_EQUAL, teenagerId]];
    return this.liyYdmsLeaderboardService.getLeaderboardList(searchDomain, offset, limit);
  }

  /**
   * Lấy xếp hạng của tài khoản học sinh
   * @param teenagerId
   */
  public async getLeaderboardByTeenagerId(teenagerId: number): Promise<ILeaderboard | undefined> {
    return this.liyYdmsLeaderboardService.getLeaderboardByTeenagerId(teenagerId);
  }

  /**
   * Load teenager avatar resource and caching
   * @param teenagerIds
   */
  public async loadTeenagerAvatarResource(teenagerIds: number[]): Promise<IAuthData[]> {
    const teenagerAvatars = await this.authService.getTeenagerAvatarByIds(teenagerIds);
    const avatarIds: number[] = Array.from(new Set(
      teenagerAvatars.flatMap(teenager => {
        const id = teenager?.avatar?.id;
        return id != null && !this.cacheAvatarResource.has(id) ? [id] : [];
      })
    ));

    if (!avatarIds?.length) return teenagerAvatars;

    // Load avatar resource and caching
    const avatarResource = await this.liyYdmsAvatarService.getImageByIds(avatarIds);
    for (const avatar of avatarResource) {
      if (avatar?.id != null && !this.cacheAvatarResource.has(avatar.id))
        this.cacheAvatarResource.set(avatar.id, avatar);
    }

    return teenagerAvatars;
  }

  /**
   * Get avatar resource on cache
   * @param avatarId
   */
  public getAvatarResource(avatarId: number): IAssetsResource | undefined {
    return this.cacheAvatarResource.get(avatarId);
  }

  /**
   * Lấy danh sách tất cả thành tích, huy hiệu đạt được trong tháng của học sinh
   * Sắp xếp theo trình tự khía cạnh
   * @private
   */
  public async getUserAchievementThisMonth(teenagerId: number): Promise<ILiyYdmsAchievement[]> {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    const firstDayFormatted = `${firstDay.toISOString().split('T')[0]} 00:00:00`;
    const lastDayFormatted = `${lastDay.toISOString().split('T')[0]} 23:59:59`;

    const searchDomain: SearchDomain = [
      ['teenager_id', OdooDomainOperator.EQUAL, teenagerId],
      ['create_date', OdooDomainOperator.GREATER_EQUAL, firstDayFormatted],
      ['create_date', OdooDomainOperator.LESS_EQUAL, lastDayFormatted],
    ];

    return this.liyYdmsAchievementService.getAchievementList(searchDomain, 0, 0);
  }

  /**
   * Lấy danh sách badge theo area of expertise
   * @param areaOfExpertise
   * @param ignoreBadgeIds
   * @param offset
   * @param limit
   * @param order
   */
  public async getBadgeByByAreaOfExpertise(
    areaOfExpertise: AreaOfExpertise,
    ignoreBadgeIds: Array<number> = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.ORDER_WEIGHT_ASC
  ): Promise<IBadge[]> {
    return this.liyYdmsBadgeService.getBadgesByExpertiseOfArea(
      areaOfExpertise,
      ignoreBadgeIds,
      offset,
      limit,
      order,
    )
  }

  /**
   * Lấy danh sách thành tích đạt được theo huy hiệu
   * @param teenagerId
   * @param badgeIds
   */
  public async getAchievementByBadgeIds(
    teenagerId: number,
    badgeIds: Array<number>
  ): Promise<IAchievement[]> {
    return this.liyYdmsAchievementService.getAchievementByTeenagerIdAndBadgeIds(teenagerId, badgeIds);
  }

  /**
   * getCountUserAchievement
   * @param teenagerId
   */
  public async getCountUserAchievement(teenagerId: number): Promise<number> {
    return this.liyYdmsAchievementService.getCountAchievement([['teenager_id', OdooDomainOperator.EQUAL, teenagerId]]);
  }

}
