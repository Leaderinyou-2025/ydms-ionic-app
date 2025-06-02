import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Enums và constants
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { DateFormat } from '../../../../shared/enums/date-format';
import { AreaOfExpertise } from '../../../../shared/enums/area-of-expertise';
import { ExperienceStatus } from '../../../../shared/enums/experience-status';

// Interfaces
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { ILiyYdmsExperience } from '../../../../shared/interfaces/models/liy.ydms.experience';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';

// Services
import { LiyYdmsExperienceService } from '../../../../services/models/liy.ydms.experience.service';
import { LiyYdmsExperienceReviewService } from '../../../../services/models/liy.ydms.experience.review.service';
import { AuthService } from '../../../../services/auth/auth.service';

/**
 * Component: Trang chi tiết bài chia sẻ kinh nghiệm
 * Mô tả: Hiển thị thông tin chi tiết của một bài chia sẻ kinh nghiệm
 * Chức năng: Xem nội dung đầy đủ, thông tin tác giả, số lượt tương tác
 */
@Component({
  selector: 'app-share-experience-detail',
  templateUrl: './share-experience-detail.page.html',
  styleUrls: ['./share-experience-detail.page.scss'],
  standalone: false
})
export class ShareExperienceDetailPage implements OnInit {

  // Enums để sử dụng trong template
  TranslateKeys = TranslateKeys;
  DateFormat = DateFormat;

  // Cấu hình header với hình ảnh anime
  animeImage!: IHeaderAnimeImage;

  // Dữ liệu bài chia sẻ kinh nghiệm
  experienceDetail?: ILiyYdmsExperience;
  reactionCounts = { like: 0, love: 0 };

  // Dữ liệu người dùng và trạng thái
  authData?: IAuthData;
  isLoading = false;
  experienceId!: number;

  constructor(
    private route: ActivatedRoute,
    private experienceService: LiyYdmsExperienceService,
    private experienceReviewService: LiyYdmsExperienceReviewService,
    private authService: AuthService
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

  async ngOnInit() {
    this.authData = await this.authService.getAuthData();

    this.route.params.subscribe(params => {
      this.experienceId = +params['id'];
      if (this.experienceId) {
        this.loadExperienceDetail();
      }
    });
  }

  async loadExperienceDetail() {
    try {
      this.isLoading = true;

      const [experienceDetail, reactionCounts] = await Promise.all([
        this.experienceService.getExperienceDetail(this.experienceId),
        this.experienceReviewService.getReactionCountsByExperienceId(this.experienceId)
      ]);

      this.experienceDetail = experienceDetail;
      this.reactionCounts = reactionCounts;

    } catch (error) {
      console.error('ERROR:', error);
    } finally {
      this.isLoading = false;
    }
  }

  isOwnPost(): boolean {
    return this.authData?.id === this.experienceDetail?.parent_id.id;
  }

  getAreaColor(area: AreaOfExpertise): string {
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

  getAreaLabel(area: AreaOfExpertise): string {
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

  getStatusColor(status: ExperienceStatus): string {
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

  getStatusLabel(status: ExperienceStatus): string {
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


}
