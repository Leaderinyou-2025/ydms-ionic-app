import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';

import { AuthService } from '../../../services/auth/auth.service';
import { ResUsersService } from '../../../services/models/res.users.service';
import { LiyYdmsEmotionalDiaryService } from '../../../services/models/liy.ydms.emotional.diary.service';
import { LiyYdmsNotificationService } from '../../../services/models/liy.ydms.notification.service';
import { LiyYdmsGuideService } from '../../../services/models/liy.ydms.guide.service';

import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { ILiyYdmsEmotionalDiary } from '../../../shared/interfaces/models/liy.ydms.emotional.diary';

import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { GuideType } from '../../../shared/enums/guide-type';
import { AreaOfExpertise } from '../../../shared/enums/area-of-expertise';
import { TaskStatus } from '../../../shared/enums/task-status';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { TaskService } from '../../../services/task/task.service';

@Component({
  selector: 'app-parent-dashboard',
  templateUrl: './parent-dashboard.page.html',
  styleUrls: ['./parent-dashboard.page.scss'],
  standalone: false,
})
export class ParentDashboardPage implements OnInit {

  authData?: IAuthData;
  children: IAuthData[] = [];
  selectedChild?: IAuthData;

  // Dashboard data
  latestEmotions: ILiyYdmsEmotionalDiary[] = [];

  // Count data like teacher-dashboard
  totalEmotions = 0;
  totalNotifications = 0;
  totalFamilyActivities = 0;
  totalExpertGuides = 0;

  // Loading states
  isLoading = true;
  isLoadingEmotions = false;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly GuideType = GuideType;
  protected readonly TaskStatus = TaskStatus;
  protected readonly CommonConstants = CommonConstants;

  constructor(
    private router: Router,
    private authService: AuthService,
    private resUsersService: ResUsersService,
    private emotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private notificationService: LiyYdmsNotificationService,
    private taskService: TaskService,
    private guideService: LiyYdmsGuideService
  ) {
  }

  async ngOnInit() {
    try {
      this.authData = await this.authService.getAuthData();
      await this.loadChildren();
      await this.loadDashboardData();
    } catch (error) {
      console.error('ERROR in ngOnInit:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load children data
   * @private
   */
  private async loadChildren(): Promise<void> {
    if (!this.authData?.id) return;

    this.children = await this.resUsersService.getChildrenByParentId(this.authData.id);

    if (this.children.length > 0) {
      this.selectedChild = this.children[0];
    }
  }

  /**
   * Load all dashboard data
   * @private
   */
  private async loadDashboardData(): Promise<void> {
    await Promise.all([
      this.loadLatestEmotions(),
      this.getCountNotifications(),
      this.getCountFamilyActivities(),
      this.getCountExpertGuides()
    ]);
  }

  /**
   * Load latest emotions from children
   * @private
   */
  private async loadLatestEmotions(): Promise<void> {
    this.isLoadingEmotions = true;
    try {
      if (this.children.length > 0) {
        const childrenIds = this.children.map(child => child.id);
        const latestEmotions = await this.emotionalDiaryService.getLatestEmotionsForChildren(childrenIds, 1);
        this.latestEmotions = latestEmotions;
        this.totalEmotions = latestEmotions.length;
      }
    } catch (error) {
      console.error('ERROR loading emotions:', error);
    } finally {
      this.isLoadingEmotions = false;
    }
  }

  /**
   * Handle child selection change
   * @param event
   */
  public onChildSelectionChange(event: any): void {
    const selectedChildId = event.detail.value;
    this.selectedChild = this.children.find(child => child.id === selectedChildId);
    this.loadLatestEmotions();
  }

  /**
   * Navigate to notifications page
   */
  public goToNotifications(): void {
    this.router.navigate([PageRoutes.NOTIFICATIONS]);
  }

  /**
   * Navigate to family activities
   */
  public goToFamilyActivities(): void {
    this.router.navigate([PageRoutes.TASK_EXECUTING], {
      queryParams: {guideType: GuideType.FAMILY_ACTIVITY, showFooter: true}
    });
  }

  /**
   * Navigate to expert guide page
   */
  public goToExpertGuide(): void {
    this.router.navigate([PageRoutes.EXPERT_GUIDE]);
  }

  /**
   * Handle refresh event
   * @param event
   */
  public async handleRefresh(event: any): Promise<void> {
    await this.loadDashboardData();
    event.target.complete();
  }

  /**
   * Lấy số lượng thông báo chưa đọc của parent
   * @private
   */
  private async getCountNotifications(): Promise<void> {
    if (!this.authData?.id || !this.authData?.partner_id?.id) {
      this.totalNotifications = 0;
      return;
    }
    try {
      this.totalNotifications = await this.notificationService.getCountUserUnreadNotification(this.authData.partner_id?.id);
    } catch (error) {
      console.error('ERROR counting notifications:', error);
      this.totalNotifications = 0;
    }
  }

  /**
   * Lấy số lượng hoạt động gia đình
   * @private
   */
  private async getCountFamilyActivities(): Promise<void> {
    if (!this.authData?.id) {
      this.totalFamilyActivities = 0;
      return;
    }
    try {
      this.totalFamilyActivities = await this.taskService.getCountActivatingTaskByAssigneeId(this.authData.id);
    } catch (error) {
      console.error('ERROR counting family activities:', error);
      this.totalFamilyActivities = 0;
    }
  }

  /**
   * Lấy số lượng hướng dẫn kỹ năng chuyên gia mới trong tháng
   * @private
   */
  private async getCountExpertGuides(): Promise<void> {
    try {
      this.totalExpertGuides = await this.guideService.getCountGuideInMonth(GuideType.INSTRUCTION);
    } catch (error) {
      console.error('ERROR counting expert guides:', error);
      this.totalExpertGuides = 0;
    }
  }

  /**
   * Get emotion icon for display
   * @param emotion
   */
  public getEmotionIcon(emotion: ILiyYdmsEmotionalDiary): string {
    return emotion.answer_icon ? CommonConstants.formatBase64ImageUrl(emotion.answer_icon) : '';
  }

  /**
   * Check if emotion has valid icon
   * @param emotion
   */
  public hasEmotionIcon(emotion: ILiyYdmsEmotionalDiary): boolean {
    return !!(emotion.answer_icon);
  }

  /**
   * Get emotion text for display
   * @param emotion
   */
  public getEmotionText(emotion: ILiyYdmsEmotionalDiary): string {
    return emotion.answer_text || '';
  }

  /**
   * Get child name for emotion
   * @param emotion
   */
  public getChildNameForEmotion(emotion: ILiyYdmsEmotionalDiary): string {
    if (emotion.nickname) {
      return emotion.nickname;
    }

    const child = this.children.find(c => c.id === emotion.teenager_id?.id);
    return child?.nickname || child?.name || '';
  }

  /**
   * Get child display name in format "nickname (name)"
   * @param child
   */
  public getChildDisplayName(child: IAuthData): string {
    if (child.nickname && child.name && child.nickname !== child.name) {
      return `${child.nickname} (${child.name})`;
    }
    return child.nickname || child.name || '';
  }

  /**
   * Get area of expertise translation key
   * @param areaOfExpertise
   */
  public getAreaOfExpertiseTranslationKey(areaOfExpertise: string): string {
    switch (areaOfExpertise) {
      case AreaOfExpertise.EMOTION:
        return TranslateKeys.AREA_OF_EXPERTISE_EMOTION;
      case AreaOfExpertise.CONFLICT:
        return TranslateKeys.AREA_OF_EXPERTISE_CONFLICT;
      case AreaOfExpertise.COMMUNICATION:
        return TranslateKeys.AREA_OF_EXPERTISE_COMMUNICATION;
      case AreaOfExpertise.DISCOVERY:
        return TranslateKeys.AREA_OF_EXPERTISE_DISCOVERY;
      default:
        return areaOfExpertise;
    }
  }

  /**
   * Format date for display as dd/MM/yyyy
   * @param dateString
   */
  public formatDate(dateString: string | undefined): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return dateString;
      }

      return formatDate(date, 'dd/MM/yyyy', 'en');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

}
