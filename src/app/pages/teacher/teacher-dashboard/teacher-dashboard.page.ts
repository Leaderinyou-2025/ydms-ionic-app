import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LiyYdmsClassService } from '../../../services/models/liy.ydms.class.service';
import { AuthService } from '../../../services/auth/auth.service';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { ResUsersService } from '../../../services/models/res.users.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { LiyYdmsEmotionalDiaryService } from '../../../services/models/liy.ydms.emotional.diary.service';
import { LiyYdmsNotificationService } from '../../../services/models/liy.ydms.notification.service';
import { TaskService } from '../../../services/task/task.service';
import { LiyYdmsGuideService } from '../../../services/models/liy.ydms.guide.service';
import { GuideType } from '../../../shared/enums/guide-type';
import { RefresherCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.page.html',
  styleUrls: ['./teacher-dashboard.page.scss'],
  standalone: false,
})
export class TeacherDashboardPage implements OnInit {

  totalStudents = 0;
  totalSharedEmotions = 0;
  totalNotifications = 0;
  totalTasks = 0;
  totalGuide = 0;

  authData?: IAuthData;

  protected readonly CommonConstants = CommonConstants;
  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;

  constructor(
    private router: Router,
    private authService: AuthService,
    private classService: LiyYdmsClassService,
    private resUsersService: ResUsersService,
    private liyYdmsEmotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private liyYdmsNotificationService: LiyYdmsNotificationService,
    private taskService: TaskService,
    private liyYdmsGuideService: LiyYdmsGuideService,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then((authData) => {
      this.authData = authData;
      this.loadDashboardData();
    });
  }

  /**
   * Reload data
   * @param event
   */
  public handleRefresh(event?: RefresherCustomEvent): void {
    setTimeout(async () => {
      this.loadDashboardData();
      event?.target.complete();
    }, 500);
  }

  /**
   * Load dashboard data
   * @private
   */
  private loadDashboardData(): void {
    this.getCountStudentsByClassroomId();
    this.getCountEmotionsShared();
    this.getCountNotifications();
    this.getCountGroupTasks();
    this.getCountGuide();
  }

  /**
   * Lấy số lượng học sinh của lớp
   * @private
   */
  private getCountStudentsByClassroomId(): void {
    if (!this.authData || !this.authData?.classroom_id) return;
    this.resUsersService.getCountTeenagerByClassroomId(this.authData.classroom_id.id)
      .then(totalStudents => this.totalStudents = totalStudents);
  }

  /**
   * Lấy số lượng chia sẻ cảm xúc trong ngày
   * @private
   */
  private getCountEmotionsShared(): void {
    if (!this.authData) return;
    this.liyYdmsEmotionalDiaryService.getCountNewEmotionSharedWithUserId(this.authData.id)
      .then(totalSharedEmotions => this.totalSharedEmotions = totalSharedEmotions);
  }

  /**
   * Lấy số lượng thông báo chưa đọc của user
   * @private
   */
  private getCountNotifications(): void {
    if (!this.authData || !this.authData?.parent_id?.id) return;
    this.liyYdmsNotificationService.getCountUserUnreadNotification(this.authData.parent_id?.id)
      .then(totalNotifications => this.totalNotifications = totalNotifications);
  }

  /**
   * Lấy số lượng các hoạt động nhóm lớp
   * @private
   */
  private getCountGroupTasks(): void {
    if (!this.authData) return;
    this.taskService.getCountActivatingTaskByAssigneeId(this.authData.id)
      .then(totalTasks => this.totalTasks = totalTasks);
  }

  /**
   * Lấy số lượng các hướng dẫn kỹ năng chuyên giá mới trong tháng
   * @private
   */
  private getCountGuide(): void {
    if (!this.authData) return;
    this.liyYdmsGuideService.getCountGuideInMonth(GuideType.INSTRUCTION)
      .then((totalGuideInMonth) => this.totalGuide = totalGuideInMonth);
  }
}
