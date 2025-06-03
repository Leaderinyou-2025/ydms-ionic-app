import { Component, OnInit } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';

import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { IHeaderAnimeImage } from '../../../shared/interfaces/header/header';
import { ILiyYdmsGuide } from '../../../shared/interfaces/models/liy.ydms.guide';
import { LiyYdmsGuideService } from '../../../services/models/liy.ydms.guide.service';
import { GuideType } from '../../../shared/enums/guide-type';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { AreaOfExpertise } from '../../../shared/enums/area-of-expertise';

@Component({
  selector: 'app-expert-guide',
  templateUrl: './expert-guide.page.html',
  styleUrls: ['./expert-guide.page.scss'],
  standalone: false,
})
export class ExpertGuidePage implements OnInit {

  isLoading: boolean = true;
  animeImage!: IHeaderAnimeImage;
  guideList: ILiyYdmsGuide[] = [];
  paged: number = 1;
  limit: number = 20;
  hasMoreData: boolean = true;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly Array = Array;
  protected readonly AreaOfExpertise = AreaOfExpertise;

  constructor(
    private guideService: LiyYdmsGuideService,
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    await this.loadGuideList();
  }

  async ionViewWillEnter() {
    // Tự động refresh dữ liệu khi quay lại trang list
    if (this.guideList.length > 0) {
      this.paged = 1;
      this.hasMoreData = true;
      this.guideList = [];
      await this.loadGuideList(false);
    }
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
   * Tải danh sách hướng dẫn
   */
  private async loadGuideList(showLoading: boolean = true): Promise<void> {
    if (showLoading) {
      this.isLoading = true;
    }

    try {
      const offset = (this.paged - 1) * this.limit;
      const results = await this.guideService.getGuideListByGuideType(
        GuideType.INSTRUCTION, offset, this.limit
      );

      if (results.length < this.limit) {
        this.hasMoreData = false;
      }

      this.guideList = CommonConstants.mergeArrayObjectById(this.guideList, results) || [];
    } catch (error) {
      console.error('ERROR:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Pull to refresh
   */
  async doRefresh(event: RefresherCustomEvent): Promise<void> {
    this.paged = 1;
    this.hasMoreData = true;
    this.guideList = [];
    await this.loadGuideList(false);
    event.target.complete();
  }

  /**
   * Load more data for infinite scroll
   */
  async loadMoreData(event: any): Promise<void> {
    if (!this.hasMoreData) {
      event.target.complete();
      return;
    }

    this.paged++;
    await this.loadGuideList(false);
    event.target.complete();
  }

  /**
   * Lấy tên danh mục
   */
  getCategoryNames(guide: ILiyYdmsGuide): string {
    if (!guide.category_ids || guide.category_ids.length === 0) {
      return '';
    }
    return guide.category_ids.map(cat => cat.name).join(', ');
  }

  /**
   * Lấy translation key cho area of expertise
   */
  getAreaOfExpertiseTranslationKey(areaOfExpertise: string): string {
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
}
