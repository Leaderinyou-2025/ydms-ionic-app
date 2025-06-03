import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { ILiyYdmsGuide } from '../../../../shared/interfaces/models/liy.ydms.guide';
import { LiyYdmsGuideService } from '../../../../services/models/liy.ydms.guide.service';
import { AreaOfExpertise } from '../../../../shared/enums/area-of-expertise';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-expert-guide-detail',
  templateUrl: './expert-guide-detail.component.html',
  styleUrls: ['./expert-guide-detail.component.scss'],
  standalone: false,
})
export class ExpertGuideDetailComponent implements OnInit {

  isLoading: boolean = true;
  animeImage!: IHeaderAnimeImage;
  guideDetail?: ILiyYdmsGuide;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly AreaOfExpertise = AreaOfExpertise;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private guideService: LiyYdmsGuideService,
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    await this.loadGuideDetail();
  }

  /**
   * Khởi tạo header
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'expert-guide',
      imageUrl: '/assets/images/self-discovery-survey.png',
      width: '200px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '-50px',
        bottom: '-5px'
      }
    };
  }



  /**
   * Tải chi tiết hướng dẫn từ service
   */
  private async loadGuideDetail(): Promise<void> {
    const id = this.activeRoute.snapshot.paramMap.get('id');
    if (!id) {
      return this.navigateBack();
    }

    try {
      this.guideDetail = await this.guideService.getGuideById(+id);
    } catch (error) {
      console.error('ERROR:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Quay lại danh sách hướng dẫn
   */
  private async navigateBack(): Promise<void> {
    await this.router.navigateByUrl(PageRoutes.EXPERT_GUIDE);
  }

  /**
   * Lấy tên danh mục
   */
  getCategoryNames(): string {
    if (!this.guideDetail?.category_ids || this.guideDetail.category_ids.length === 0) {
      return '';
    }
    return this.guideDetail.category_ids.map(cat => cat.name).join(', ');
  }

  /**
   * Lấy translation key cho area of expertise
   */
  getAreaOfExpertiseTranslationKey(): string {
    if (!this.guideDetail?.area_of_expertise) return '';

    switch (this.guideDetail.area_of_expertise) {
      case AreaOfExpertise.EMOTION:
        return TranslateKeys.AREA_OF_EXPERTISE_EMOTION;
      case AreaOfExpertise.CONFLICT:
        return TranslateKeys.AREA_OF_EXPERTISE_CONFLICT;
      case AreaOfExpertise.COMMUNICATION:
        return TranslateKeys.AREA_OF_EXPERTISE_COMMUNICATION;
      case AreaOfExpertise.DISCOVERY:
        return TranslateKeys.AREA_OF_EXPERTISE_DISCOVERY;
      default:
        return this.guideDetail.area_of_expertise;
    }
  }

}
