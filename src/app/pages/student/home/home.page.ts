import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import {
  AlertButton,
  AlertController,
  AlertInput,
  InfiniteScrollCustomEvent,
  Platform,
  RefresherCustomEvent,
  ToastButton,
  ToastController,
  ToastOptions
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AnimationOptions } from 'ngx-lottie';

import { AuthService } from '../../../services/auth/auth.service';
import { TaskService } from '../../../services/task/task.service';
import { SoundService } from '../../../services/sound/sound.service';
import { LiyYdmsAvatarService } from '../../../services/models/liy.ydms.avatar.service';
import { RankService } from '../../../services/rank/rank.service';
import { SurveyService } from '../../../services/survey/survey.service';
import { LocalStorageService } from '../../../services/local-storage/local-storage.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { BtnRoles } from '../../../shared/enums/btn-roles';
import { IonicIcons } from '../../../shared/enums/ionic-icons';
import { Position } from '../../../shared/enums/position';
import { NativePlatform } from '../../../shared/enums/native-platform';
import { StyleClass } from '../../../shared/enums/style-class';
import { IonicColors } from '../../../shared/enums/ionic-colors';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { ILiyYdmsTask } from '../../../shared/interfaces/models/liy.ydms.task';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { ILiyYdmsAssessmentResult } from '../../../shared/interfaces/models/liy.ydms.assessment.result';
import { StorageKey } from '../../../shared/enums/storage-key';
import { AreaOfExpertise } from '../../../shared/enums/area-of-expertise';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  // User setting background and avatar
  authData?: IAuthData;
  background!: string;
  avatar?: string;
  animationOption: AnimationOptions = {
    path: '/assets/animations/1747072943680.json',
    loop: true,
    autoplay: true,
  };

  // Toolbar total info
  totalBadges!: number;
  ranking!: number;
  totalTask!: number;
  totalFriendly!: number;
  taskCompleted: number = 0;

  // Check show alert emotion checkin task
  isShowAlertEmotionCheckIn!: boolean;

  // Task list
  tasks!: Array<ILiyYdmsTask>;
  surveyList!: Array<ILiyYdmsAssessmentResult>;
  isLoading!: boolean;
  isLoadMore!: boolean;
  private paged: number = 1;
  private readonly limit: number = 20;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly NativePlatform = NativePlatform;

  constructor(
    public platform: Platform,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private translate: TranslateService,
    private router: Router,
    private liyYdmsAvatarService: LiyYdmsAvatarService,
    private taskService: TaskService,
    private soundService: SoundService,
    private rankService: RankService,
    private surveyService: SurveyService,
    private localStorageService: LocalStorageService,
  ) {
  }

  async ngOnInit() {
    // Reload user profile on server for first time
    await this.authService.loadUserProfile();
    this.soundService.playBackground();
  }

  async ionViewDidEnter() {
    if (this.authData) {
      this.handleRefresh();
    } else {
      await this.loadHomeData();
      this.checkShowAlertEmotionCheckIn();
    }
  }

  /**
   * On click open dialog to setting nickname
   */
  public onClickOpenSetNicknameDialog(): void {
    const nicknameInput: AlertInput = {
      type: 'text',
      name: 'nickname',
      placeholder: this.translate.instant(TranslateKeys.RANK_NICKNAME),
    };
    const buttons: Array<AlertButton> = [
      {text: this.translate.instant(TranslateKeys.BUTTON_CANCEL)},
      {
        text: this.translate.instant(TranslateKeys.BUTTON_OK),
        handler: (alertData) => this.updateUserNickname(alertData?.nickname)
      },
    ];
    this.alertController.create({
      header: this.translate.instant(TranslateKeys.TITLE_SETUP_NICKNAME),
      inputs: [nicknameInput],
      buttons: buttons,
    }).then(alert => alert.present());
  }

  /**
   * On click open setting avatar
   */
  public onClickSettingAvatar(): void {
    const navigationExtras: NavigationExtras = {state: {isBackground: false}};
    this.router.navigateByUrl(`${PageRoutes.PROFILE}/${PageRoutes.AVATAR_BACKGROUND}`, navigationExtras);
  }

  /**
   * Reload data
   * @param event
   */
  public handleRefresh(event?: RefresherCustomEvent): void {
    setTimeout(async () => {
      await this.authService.loadUserProfile();
      await this.loadHomeData();
      event?.target.complete();
    }, 500);
  }

  /**
   * Execute the selected survey
   * @param survey
   */
  public onClickExecuteSurvey(survey: ILiyYdmsAssessmentResult): void {
    if (!survey.id) return;

    if (survey.area_of_expertise === AreaOfExpertise.EMOTION) {
      this.router.navigateByUrl(`/${PageRoutes.EMOTIONAL_SURVEY}/${survey.id}`);
      return;
    }

    if (survey.area_of_expertise === AreaOfExpertise.CONFLICT) {
      this.router.navigateByUrl(`/${PageRoutes.FAMILY_CONFLICT_SURVEY}/${survey.id}`);
      return;
    }

    if (survey.area_of_expertise === AreaOfExpertise.COMMUNICATION) {
      this.router.navigateByUrl(`/${PageRoutes.FAMILY_COMMUNICATION_QUALITY_SURVEY}/${survey.id}`);
      return;
    }

    if (survey.area_of_expertise === AreaOfExpertise.DISCOVERY) {
      this.router.navigateByUrl(`/${PageRoutes.SELF_DISCOVERY_SURVEY}/${survey.id}`);
      return;
    }
  }

  /**
   * Load more tasks
   * @param e
   */
  public loadMoreTask(e: InfiniteScrollCustomEvent): void {
    if (this.isLoadMore) return;

    if (this.isLoading) {
      e.target.complete();
      return;
    }

    this.isLoadMore = true;
    this.paged += 1;
    this.getTaskList().then(() => e.target.complete());
  }

  /**
   * Initial task list data pagination
   * @private
   */
  private initTaskDataPaging(): void {
    this.isLoading = false;
    this.paged = 1;
    this.tasks = new Array<ILiyYdmsTask>();
    this.totalTask = 0;
    this.taskCompleted = 0;
  }

  /**
   * Load all home screen data
   */
  private async loadHomeData(): Promise<void> {
    this.authData = await this.authService.getAuthData();
    if (!this.authData) return;

    // Load setting avatar and background image
    this.loadConfigAvatarAndBackground();

    // Get task list and task progress
    this.initTaskDataPaging();
    this.getProgressCompletedTasks();
    this.getSurveyPendingList();
    await this.getTaskList();

    // Get toolbar total data
    this.getToolbarData();
  }

  /**
   * Load user setting background and avatar image
   */
  private loadConfigAvatarAndBackground(): void {
    // Background image
    this.authService.getThemeSettings().then(themeSettings => {
      if (themeSettings?.background?.resource_url)
        this.background = `url(${themeSettings.background.resource_url})`;
    });

    // Avatar image
    this.authService.getAuthData().then(authData => {
      if (authData?.avatar?.id) {
        this.liyYdmsAvatarService.getImageById(authData.avatar.id).then(imageData => {
          this.avatar = imageData?.resource_url;
          authData.avatar_512 = imageData?.resource_url;
          this.authService.setAuthData(authData);
        });
      }
    });
  }

  /**
   * Load toolbar data
   * @private
   */
  private getToolbarData(): void {
    if (this.authData) {
      // Get count user badges
      this.rankService.getCountUserAchievement(this.authData.id).then(totalAchievement => this.totalBadges = totalAchievement);

      // Get user ranking
      this.rankService.getLeaderboardByTeenagerId(this.authData.id).then(leaderboard => this.ranking = leaderboard?.ranking || 0);

      // Total task
      this.taskService.getCountAllTasksByAssigneeId(this.authData.id).then(countTask => this.totalTask += countTask);

      // Emotion diary task
      const lastEmotionCheckin = this.localStorageService.get<string>(StorageKey.LAST_EMOTION_CHECKIN);
      if (lastEmotionCheckin !== CommonConstants.getCurrentDateFormated()) {
        this.totalTask += 1;
      } else {
        this.taskCompleted += 1;
      }

      // Count survey task
      this.surveyService.getCountSurveyInMonth(this.authData?.id || 0).then(countSurvey => this.totalTask += countSurvey);

      // Friendly points
      this.totalFriendly = this.authData.total_friendly_points || 0;
    }
  }

  /**
   * Check and show alert emotion checkin for first time
   * @private
   */
  private checkShowAlertEmotionCheckIn(): void {
    setTimeout(() => {
      const lastEmotionCheckin = this.localStorageService.get<string>(StorageKey.LAST_EMOTION_CHECKIN);
      this.isShowAlertEmotionCheckIn = lastEmotionCheckin !== CommonConstants.getCurrentDateFormated();
    }, 2000);
  }

  /**
   * Load progress task
   * @private
   */
  private getProgressCompletedTasks(): void {
    if (!this.authData) return;
    Promise.all([
      this.taskService.getCountCompletedTaskByAssigneeId(this.authData.id),
      this.surveyService.getCountSurveyCompleteInMonth(this.authData.id),
    ]).then(([completedTask, completeSurvey]) => {
      this.taskCompleted += (completedTask + completeSurvey);
    });
  }

  /**
   * Get task list
   * @private
   */
  private async getTaskList(): Promise<void> {
    if (this.isLoading || !this.authData) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;
    const results = await this.taskService.getActivatingTaskList(this.authData.id, offset, this.limit);
    this.tasks = CommonConstants.mergeArrayObjectById(this.tasks, results) || [];
    this.isLoading = true;
  }

  /**
   * Get Survey Pending List
   * @private
   */
  private getSurveyPendingList(): void {
    if (!this.authData) return;
    this.surveyService.getSurveyPendingListInMonth(this.authData.id).then(
      surveyList => this.surveyList = surveyList
    );
  }

  /**
   * Update user nickname for first time
   * @param nickname
   * @private
   */
  private updateUserNickname(nickname: string): void {
    if (!nickname) {
      return this.toastMessage(this.translate.instant(TranslateKeys.VALIDATE_NICKNAME_REQUIRED), true);
    }

    if (!this.authData) return;
    this.authData.nickname = nickname;
    this.authService.setAuthData(this.authData)
      .then(() => this.authService.saveUserProfile()
        .then((result) => this.toastMessage(
          this.translate.instant(result ? TranslateKeys.TOAST_UPDATE_SUCCESS : TranslateKeys.TOAST_UPDATE_FAILED), !result
        )));
  }

  /**
   * toastWarningMessage
   * @param msg
   * @param isWarning
   * @private
   */
  private toastMessage(msg: string, isWarning: boolean = false): void {
    this.toastController.getTop().then(popover => {
      const closeBtn: ToastButton = {
        icon: IonicIcons.CLOSE_CIRCLE_OUTLINE,
        side: Position.END,
        role: BtnRoles.CANCEL,
      };
      const toastOption: ToastOptions = {
        header: isWarning ? this.translate.instant(TranslateKeys.TOAST_WARNING_HEADER) : this.translate.instant(TranslateKeys.TOAST_SUCCESS_HEADER),
        message: msg,
        duration: 5000,
        buttons: [closeBtn],
        mode: NativePlatform.IOS,
        cssClass: `${StyleClass.TOAST_ITEM} ${isWarning ? StyleClass.TOAST_ERROR : StyleClass.TOAST_SUCCESS}`,
        position: Position.TOP,
        icon: isWarning ? IonicIcons.WARNING_OUTLINE : IonicIcons.CHECKMARK_CIRCLE_OUTLINE,
        color: isWarning ? IonicColors.WARNING : IonicColors.SUCCESS,
        keyboardClose: false
      };

      if (!popover) {
        this.toastController.create(toastOption).then(toast => toast.present());
      } else {
        // Close current toast before show new toast
        this.toastController.dismiss().then(() => this.toastController.create(toastOption).then(toast => toast.present()));
      }
    });
  }
}
