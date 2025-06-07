import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { LiyYdmsExperienceService } from '../../../../services/models/liy.ydms.experience.service';
import { LiyYdmsExperienceReviewService } from '../../../../services/models/liy.ydms.experience.review.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { DateFormat } from '../../../../shared/enums/date-format';
import { AreaOfExpertise } from '../../../../shared/enums/area-of-expertise';
import { ExperienceStatus } from '../../../../shared/enums/experience-status';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { ILiyYdmsExperience } from '../../../../shared/interfaces/models/liy.ydms.experience';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { ExperienceReviewType } from '../../../../shared/enums/experience-review-type';
import { AlertButton, AlertController, LoadingController } from '@ionic/angular';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { CommonConstants } from '../../../../shared/classes/common-constants';
import { IFileData } from '../../../../shared/interfaces/function-data/file-data';
import { FileService } from '../../../../services/file/file.service';


@Component({
  selector: 'app-share-experience-detail',
  templateUrl: './share-experience-detail.page.html',
  styleUrls: ['./share-experience-detail.page.scss'],
  standalone: false
})
export class ShareExperienceDetailPage implements OnInit {

  // Cấu hình header với hình ảnh anime
  animeImage!: IHeaderAnimeImage;

  authData?: IAuthData;
  experienceDetail?: ILiyYdmsExperience;
  isLoading = false;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly DateFormat = DateFormat;
  protected readonly PageRoutes = PageRoutes;
  protected readonly ExperienceReviewType = ExperienceReviewType;
  protected readonly ExperienceStatus = ExperienceStatus;
  protected readonly CommonConstants = CommonConstants;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private authService: AuthService,
    private translate: TranslateService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private experienceService: LiyYdmsExperienceService,
    private experienceReviewService: LiyYdmsExperienceReviewService,
    private fileService: FileService,
  ) {
    this.animeImage = {
      name: 'Share Experience Detail',
      imageUrl: '/assets/images/share-experience.svg',
      height: '150px',
      width: '150px',
      position: {
        position: 'absolute',
        bottom: '-10px',
        right: '0'
      }
    };
  }

  ngOnInit() {
    this.authService.getAuthData().then(authData => {
      this.authData = authData;
      const id = this.activeRoute.snapshot.paramMap.get('id');
      if (id && Number.isInteger(+id)) this.loadExperienceDetail(+id);
      else history.back();
    });
  }

  /**
   * Return Area Of Expertise color
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
   * Return Area Of Expertise label
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
   * Return status color
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
   * Return status label
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
   * @param reactionType
   */
  public selectReaction(reactionType: ExperienceReviewType): void {
    if (!this.experienceDetail || this.experienceDetail?.create_uid?.id === this.authData?.id) return;

    this.experienceReviewService.createReview(
      this.experienceDetail.id, reactionType
    ).then((review) => {
      if (review != undefined && this.experienceDetail) {
        if (reactionType === ExperienceReviewType.LIKE) this.experienceDetail.total_like = (this.experienceDetail.total_like || 0) + 1;
        else this.experienceDetail.total_love = (this.experienceDetail.total_love || 0) + 1;

        this.experienceService.updateExperience(this.experienceDetail.id, {
          total_like: this.experienceDetail.total_like,
          total_love: this.experienceDetail.total_love,
        });
      }
    });
  }

  /**
   * Xử lý xoá experience
   */
  public onClickRemoveExperience(): void {
    if (!this.experienceDetail) return;
    const buttons: Array<AlertButton> = [
      {text: this.translate.instant(TranslateKeys.BUTTON_CANCEL)},
      {
        text: this.translate.instant(TranslateKeys.BUTTON_CONFIRM),
        handler: () => this.handleRemoveExperience()
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
   * Click download attached file
   */
  public onClickDownloadFile(): void {
    if (!this.experienceDetail ||
      !this.experienceDetail?.attach_file ||
      !this.experienceDetail?.x_attach_file_name ||
      !this.experienceDetail?.x_attach_file_mine_type
    ) return;

    const fileData: IFileData = {
      fileName: this.experienceDetail.x_attach_file_name,
      mimeType: this.experienceDetail.x_attach_file_mine_type,
      base64: this.experienceDetail.attach_file
    };

    this.loadingController.create({mode: NativePlatform.IOS}).then(loading => {
      loading.present();
      this.fileService.downloadFile(fileData).finally(() => loading.dismiss());
    });
  }

  /**
   * loadExperienceDetail
   * @private
   */
  private async loadExperienceDetail(id: number): Promise<void> {
    try {
      this.isLoading = true;
      this.experienceDetail = await this.experienceService.getExperienceDetail(id);
    } catch (error) {
      console.error('ERROR:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * handleRemoveExperience
   * @private
   */
  private handleRemoveExperience(): void {
    this.loadingController.create({mode: NativePlatform.IOS}).then((loading) => {
      loading.present();
      this.experienceService.deleteExperience(this.experienceDetail?.id || -1).finally(() => {
        loading.dismiss();
        this.router.navigateByUrl(PageRoutes.SHARE_EXPERIENCE);
      });
    });
  }
}
