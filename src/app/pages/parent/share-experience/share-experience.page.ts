import { Component, OnInit } from '@angular/core';
import {
  AlertButton,
  AlertController,
  InfiniteScrollCustomEvent,
  LoadingController,
  RefresherCustomEvent,
  ViewWillEnter
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { LiyYdmsExperienceService } from '../../../services/models/liy.ydms.experience.service';
import { LiyYdmsExperienceReviewService } from '../../../services/models/liy.ydms.experience.review.service';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { DateFormat } from '../../../shared/enums/date-format';
import { AreaOfExpertise } from '../../../shared/enums/area-of-expertise';
import { ExperienceStatus } from '../../../shared/enums/experience-status';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { IHeaderAnimeImage, IHeaderSegment } from '../../../shared/interfaces/header/header';
import { ILiyYdmsExperience } from '../../../shared/interfaces/models/liy.ydms.experience';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { NativePlatform } from '../../../shared/enums/native-platform';
import { ExperienceReviewType } from '../../../shared/enums/experience-review-type';

@Component({
  selector: 'app-share-experience',
  templateUrl: './share-experience.page.html',
  styleUrls: ['./share-experience.page.scss'],
  standalone: false
})
export class ShareExperiencePage implements OnInit, ViewWillEnter {

  // Header data
  animeImage!: IHeaderAnimeImage;
  segment!: IHeaderSegment;
  currentTab: 'community' | 'family' = 'community';

  authData?: IAuthData;

  experienceList!: ILiyYdmsExperience[];
  isLoading?: boolean;
  isLoadMore!: boolean;
  private paged = 1;
  private limit = 20;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly DateFormat = DateFormat;
  protected readonly PageRoutes = PageRoutes;
  protected readonly Array = Array;
  protected readonly ExperienceStatus = ExperienceStatus;
  protected readonly ExperienceReviewType = ExperienceReviewType;
  protected readonly CommonConstants = CommonConstants;

  constructor(
    private authService: AuthService,
    private experienceService: LiyYdmsExperienceService,
    private experienceReviewService: LiyYdmsExperienceReviewService,
    private translate: TranslateService,
    private alertController: AlertController,
    private loadingController: LoadingController,
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    this.authData = await this.authService.getAuthData();
    await this.loadExperienceList();
  }

  ionViewWillEnter() {
    if (this.experienceList) this.handleRefresh();
  }

  /**
   * Handle refresh data
   * @param event
   */
  public handleRefresh(event?: RefresherCustomEvent): void {
    if (this.isLoading) return;
    setTimeout(() => {
      this.experienceList = new Array<ILiyYdmsExperience>();
      this.paged = 1;
      this.loadExperienceList().finally(() => event?.target.complete());
    });
  }

  /**
   * Load more data when scrolling
   * @param event Infinite scroll event
   */
  public loadMore(event: InfiniteScrollCustomEvent): void {
    if (this.isLoading) {
      event.target.complete();
      return;
    }

    // No more
    if (this.experienceList?.length < ((this.paged - 1) * this.limit + 1)) {
      event.target.complete();
      return;
    }

    setTimeout(() => {
      this.paged += 1;
      this.isLoadMore = true;
      this.loadExperienceList().finally(() => {
        event.target.complete();
        this.isLoadMore = false;
      });
    }, 500);
  }

  /**
   * Xử lý sự kiện thay đổi tab
   * @param tabValue - Giá trị tab được chọn
   */
  public onTabChange(tabValue: string | number): void {
    this.currentTab = tabValue as 'community' | 'family';
    if (!this.currentTab) return;
    setTimeout(() => this.handleRefresh());
  }

  /**
   * getAreaColor
   * @param area
   */
  public getAreaColor(area: AreaOfExpertise): string {
    switch (area) {
      case AreaOfExpertise.EMOTION:
        return 'primary';
      case AreaOfExpertise.CONFLICT:
        return 'warning';
      case AreaOfExpertise.COMMUNICATION:
        return 'success';
      case AreaOfExpertise.DISCOVERY:
        return 'secondary';
      default:
        return 'medium';
    }
  }

  /**
   * getAreaLabel
   * @param area
   */
  public getAreaLabel(area: AreaOfExpertise): string {
    switch (area) {
      case AreaOfExpertise.EMOTION:
        return TranslateKeys.AREA_OF_EXPERTISE_EMOTION;
      case AreaOfExpertise.CONFLICT:
        return TranslateKeys.AREA_OF_EXPERTISE_CONFLICT;
      case AreaOfExpertise.COMMUNICATION:
        return TranslateKeys.AREA_OF_EXPERTISE_COMMUNICATION;
      case AreaOfExpertise.DISCOVERY:
        return TranslateKeys.AREA_OF_EXPERTISE_DISCOVERY;
      default:
        return '';
    }
  }

  /**
   * getStatusColor
   * @param status
   */
  public getStatusColor(status: ExperienceStatus): string {
    switch (status) {
      case ExperienceStatus.WAIT_ACCEPT:
        return 'warning';
      case ExperienceStatus.ACCEPTED:
        return 'success';
      case ExperienceStatus.REJECTED:
        return 'danger';
      default:
        return 'medium';
    }
  }

  /**
   * getStatusLabel
   * @param status
   */
  public getStatusLabel(status: ExperienceStatus): string {
    switch (status) {
      case ExperienceStatus.WAIT_ACCEPT:
        return TranslateKeys.SHARE_EXPERIENCE_STATUS_WAIT_ACCEPT;
      case ExperienceStatus.ACCEPTED:
        return TranslateKeys.SHARE_EXPERIENCE_STATUS_ACCEPTED;
      case ExperienceStatus.REJECTED:
        return TranslateKeys.SHARE_EXPERIENCE_STATUS_REJECTED;
      default:
        return '';
    }
  }

  /**
   * Xử lý chọn reaction (like hoặc love)
   * @param experience
   * @param reactionType
   */
  public selectReaction(
    experience: ILiyYdmsExperience,
    reactionType: ExperienceReviewType
  ): void {
    if (experience.create_uid?.id === this.authData?.id) return;
    this.experienceReviewService.createReview(experience.id, reactionType).then((review) => {
      if (review != undefined) {
        if (reactionType === ExperienceReviewType.LIKE) experience.total_like = (experience.total_like || 0) + 1;
        else experience.total_love = (experience.total_love || 0) + 1;

        this.experienceService.updateExperience(experience.id, {
          total_like: experience.total_like,
          total_love: experience.total_love,
        });
      }
    });
  }

  /**
   * Xử lý xoá experience
   * @param experience
   */
  public onClickRemoveExperience(
    experience: ILiyYdmsExperience
  ): void {
    if (!experience) return;
    const buttons: Array<AlertButton> = [
      {text: this.translate.instant(TranslateKeys.BUTTON_CANCEL)},
      {
        text: this.translate.instant(TranslateKeys.BUTTON_CONFIRM),
        handler: () => this.handleRemoveExperience(experience)
      },
    ];
    this.alertController.create({
      mode: NativePlatform.IOS,
      header: this.translate.instant(TranslateKeys.ALERT_DEFAULT_HEADER),
      message: this.translate.instant(TranslateKeys.ALERT_CONFIRM_DELETE),
      buttons: buttons
    }).then(alertItem => alertItem.present());
  }

  /**
   * handleRemoveExperience
   * @private
   */
  private handleRemoveExperience(experience: ILiyYdmsExperience): void {
    this.loadingController.create({mode: NativePlatform.IOS}).then((loading) => {
      loading.present();
      this.experienceService.deleteExperience(experience.id).finally(() => {
        loading.dismiss();
        this.handleRefresh();
      });
    });
  }

  /**
   * Load experience list
   * @private
   */
  private async loadExperienceList() {
    if (this.isLoading || !this.authData) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;
    let results: ILiyYdmsExperience[];

    // Lấy dữ liệu theo tab hiện tại
    if (this.currentTab === 'family') {
      results = await this.experienceService.getExperienceListByParent(
        this.authData.id, offset, this.limit
      );
    } else {
      results = await this.experienceService.getExperienceListByStatus(
        ExperienceStatus.ACCEPTED, offset, this.limit
      );
    }

    this.experienceList = CommonConstants.mergeArrayObjectById(this.experienceList, results) || [];
    this.isLoading = false;
  }

  /**
   * Init headers
   * @private
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'Share Experience',
      imageUrl: '/assets/images/share-experience.svg',
      height: '150px',
      width: '150px',
      position: {
        position: 'absolute',
        right: '0',
        bottom: '20px'
      }
    };

    // Cấu hình segment cho tab
    this.segment = {
      value: 'community',
      buttons: [
        {
          value: 'community',
          label: TranslateKeys.SHARE_EXPERIENCE_TAB_COMMUNITY
        },
        {
          value: 'family',
          label: TranslateKeys.SHARE_EXPERIENCE_TAB_FAMILY
        }
      ]
    };
  }
}
