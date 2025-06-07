import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent, RefresherCustomEvent, ViewWillEnter } from '@ionic/angular';

import { LiyYdmsExperienceService } from '../../../services/models/liy.ydms.experience.service';
import { LiyYdmsExperienceReviewService } from '../../../services/models/liy.ydms.experience.review.service';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { DateFormat } from '../../../shared/enums/date-format';
import { AreaOfExpertise } from '../../../shared/enums/area-of-expertise';
import { ExperienceStatus } from '../../../shared/enums/experience-status';
import { ExperienceReviewType } from '../../../shared/enums/experience-review-type';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { IHeaderAnimeImage, IHeaderSegment } from '../../../shared/interfaces/header/header';
import { ILiyYdmsExperience } from '../../../shared/interfaces/models/liy.ydms.experience';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';

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

  experienceList: ILiyYdmsExperience[] = [];

  // Track trạng thái like/love của user hiện tại
  userLikeStatus: { [experienceId: number]: boolean } = {};
  userLoveStatus: { [experienceId: number]: boolean } = {};

  // Track trạng thái hiển thị menu reaction
  showReactionMenu: { [experienceId: number]: boolean } = {};

  // Trạng thái loading và phân trang
  isLoading = false;
  hasMoreItems = true;
  currentPage = 1;
  pageSize = 20;

  protected TranslateKeys = TranslateKeys;
  protected DateFormat = DateFormat;
  protected PageRoutes = PageRoutes;

  constructor(
    private router: Router,
    private experienceService: LiyYdmsExperienceService,
    private experienceReviewService: LiyYdmsExperienceReviewService,
    private authService: AuthService
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    this.authData = await this.authService.getAuthData();
  }

  async ionViewWillEnter() {
    const showLoading = this.experienceList.length === 0;
    await this.loadExperienceList(true, showLoading);
  }

  async loadExperienceList(refresh = false, showLoading = true) {
    try {
      if (refresh) {
        this.currentPage = 1;
        this.hasMoreItems = true;
        this.experienceList = [];
      }

      if (showLoading) {
        this.isLoading = true;
      }

      const offset = (this.currentPage - 1) * this.pageSize;
      let results: ILiyYdmsExperience[];

      // Lấy dữ liệu theo tab hiện tại
      if (this.currentTab === 'family') {
        // Tab "Tin gia đình" - chỉ hiển thị bài của chính mình
        if (this.authData?.id) {
          results = await this.experienceService.getExperienceListByParent(
            this.authData.id,
            offset,
            this.pageSize
          );
        } else {
          results = [];
        }
      } else {
        // Tab "Tin cộng đồng" - hiển thị tất cả bài đã được duyệt
        results = await this.experienceService.getExperienceListByStatus(
          ExperienceStatus.ACCEPTED,
          offset,
          this.pageSize
        );
      }

      if (refresh) {
        this.experienceList = results;
      } else {
        this.experienceList.push(...results);
      }

      // Load trạng thái like/love của user cho các bài mới
      await this.loadUserLikeStatus(results);

      this.hasMoreItems = results.length === this.pageSize;
      this.currentPage++;

    } catch (error) {
      console.error('ERROR:', error);
    } finally {
      if (showLoading) {
        this.isLoading = false;
      }
    }
  }

  async handleRefresh(event: RefresherCustomEvent) {
    await this.loadExperienceList(true, false);
    event.target.complete();
  }

  async onIonInfinite(event?: InfiniteScrollCustomEvent) {
    if (this.hasMoreItems) {
      await this.loadExperienceList();
    }
    event?.target.complete();
  }

  onExperienceClick(experience: ILiyYdmsExperience) {
    this.router.navigate([`/${PageRoutes.SHARE_EXPERIENCE}/detail`, experience.id]);
  }

  onCreateExperience() {
    this.router.navigate([`/${PageRoutes.SHARE_EXPERIENCE}/create`]);
  }

  /**
   * Xử lý sự kiện thay đổi tab
   * @param tabValue - Giá trị tab được chọn
   */
  async onTabChange(tabValue: string | number) {
    this.currentTab = tabValue as 'community' | 'family';
    this.segment.value = tabValue;

    // Tải lại dữ liệu cho tab mới
    await this.loadExperienceList(true, true);
  }

  isOwnPost(experience: ILiyYdmsExperience): boolean {
    return this.authData?.id === experience.parent_id.id;
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

  /**
   * Load trạng thái like/love của user cho danh sách bài chia sẻ
   * @param experiences - Danh sách bài chia sẻ cần kiểm tra
   */
  async loadUserLikeStatus(experiences: ILiyYdmsExperience[]) {
    if (!this.authData?.id) return;

    try {
      for (const experience of experiences) {
        // Kiểm tra trạng thái like
        const likeReview = await this.experienceReviewService.getUserReviewForExperience(
          experience.id,
          this.authData.id,
          ExperienceReviewType.LIKE
        );
        this.userLikeStatus[experience.id] = !!likeReview;

        // Kiểm tra trạng thái love
        const loveReview = await this.experienceReviewService.getUserReviewForExperience(
          experience.id,
          this.authData.id,
          ExperienceReviewType.LOVE
        );
        this.userLoveStatus[experience.id] = !!loveReview;
      }
    } catch (error) {
      console.error('ERROR loading user like status:', error);
    }
  }

  /**
   * Toggle hiển thị menu reaction
   * @param experienceId - ID của bài chia sẻ
   */
  toggleReactionMenu(experienceId: number) {
    // Đóng tất cả menu khác
    Object.keys(this.showReactionMenu).forEach(id => {
      if (parseInt(id) !== experienceId) {
        this.showReactionMenu[parseInt(id)] = false;
      }
    });

    // Toggle menu hiện tại
    this.showReactionMenu[experienceId] = !this.showReactionMenu[experienceId];
  }

  /**
   * Xử lý chọn reaction (like hoặc love)
   * @param experience - Bài chia sẻ
   * @param reactionType - Loại reaction ('like' hoặc 'love')
   */
  async selectReaction(experience: ILiyYdmsExperience, reactionType: 'like' | 'love') {
    if (!this.authData?.id) return;

    // Đóng menu
    this.showReactionMenu[experience.id] = false;

    try {
      const currentLikeStatus = this.userLikeStatus[experience.id];
      const currentLoveStatus = this.userLoveStatus[experience.id];

      // Kiểm tra trạng thái hiện tại
      if (reactionType === 'like') {
        if (currentLikeStatus) {
          // Nếu đã like rồi thì xóa (unlike)
          await this.removeReaction(experience);
        } else {
          // Nếu chưa like hoặc đang love thì chuyển sang like
          await this.setReaction(experience, ExperienceReviewType.LIKE);
        }
      } else {
        if (currentLoveStatus) {
          // Nếu đã love rồi thì xóa (unlove)
          await this.removeReaction(experience);
        } else {
          // Nếu chưa love hoặc đang like thì chuyển sang love
          await this.setReaction(experience, ExperienceReviewType.LOVE);
        }
      }
    } catch (error) {
      console.error('ERROR:', error);
    }
  }

  /**
   * Thực hiện set reaction mới (tạo hoặc cập nhật)
   * @param experience - Bài chia sẻ
   * @param reactionType - Loại reaction
   */
  async setReaction(experience: ILiyYdmsExperience, reactionType: ExperienceReviewType) {
    if (!this.authData?.id) return;

    const result = await this.experienceReviewService.createOrUpdateReview(
      experience.id,
      this.authData.id,
      reactionType
    );

    if (result) {
      await this.updateExperienceData(experience);
    }
  }

  /**
   * Xóa reaction của user
   * @param experience - Bài chia sẻ
   */
  async removeReaction(experience: ILiyYdmsExperience) {
    if (!this.authData?.id) return;

    const result = await this.experienceReviewService.removeUserReview(
      experience.id,
      this.authData.id
    );

    if (result) {
      await this.updateExperienceData(experience);
    }
  }

  /**
   * Cập nhật dữ liệu experience sau khi thay đổi reaction
   * @param experience - Bài chia sẻ
   */
  async updateExperienceData(experience: ILiyYdmsExperience) {
    if (!this.authData?.id) return;

    // Cập nhật số lượng like/love trên backend
    // const updateCountResult = await this.experienceService.updateLikeLoveCount(experience.id);

    // if (updateCountResult) {
    //   // Lấy dữ liệu mới nhất sau khi cập nhật
    //   const updatedExperience = await this.experienceService.getExperienceDetail(experience.id);
    //   if (updatedExperience) {
    //     const index = this.experienceList.findIndex(exp => exp.id === experience.id);
    //     if (index !== -1) {
    //       // Cập nhật cả total_like và total_love
    //       this.experienceList[index].total_like = updatedExperience.total_like;
    //       this.experienceList[index].total_love = updatedExperience.total_love;
    //     }
    //   }
    //
    //   // Cập nhật trạng thái like/love của user
    //   await this.loadUserLikeStatus([experience]);
    // }
  }

  /**
   * Lấy icon hiển thị cho button chính
   * @param experienceId - ID của bài chia sẻ
   * @returns Tên icon
   */
  getUserReactionIcon(experienceId: number): string {
    if (this.userLoveStatus[experienceId]) {
      return 'heart';
    } else if (this.userLikeStatus[experienceId]) {
      return 'thumbs-up';
    } else {
      return 'thumbs-up'; // Icon mặc định (like)
    }
  }

  /**
   * Lấy màu cho icon button chính
   * @param experienceId - ID của bài chia sẻ
   * @returns Màu icon
   */
  getUserReactionColor(experienceId: number): string {
    if (this.userLoveStatus[experienceId]) {
      return 'danger';
    } else if (this.userLikeStatus[experienceId]) {
      return 'primary';
    } else {
      return 'medium';
    }
  }

  /**
   * Lấy class opacity cho icon (mờ đi nếu chưa có reaction)
   * @param experienceId - ID của bài chia sẻ
   * @returns Class CSS
   */
  getUserReactionOpacity(experienceId: number): string {
    if (this.userLoveStatus[experienceId] || this.userLikeStatus[experienceId]) {
      return 'reaction-icon-active';
    } else {
      return 'reaction-icon-inactive';
    }
  }

  /**
   * Lấy màu cho button chính
   * @param experienceId - ID của bài chia sẻ
   * @returns Màu button
   */
  getMainButtonColor(experienceId: number): string {
    return 'clear'; // Luôn dùng clear để không bị override background
  }

  /**
   * Kiểm tra xem user đã có reaction chưa (dùng cho CSS class)
   * @param experienceId - ID của bài chia sẻ
   * @returns true nếu đã có reaction
   */
  hasUserReaction(experienceId: number): boolean {
    return this.userLoveStatus[experienceId] || this.userLikeStatus[experienceId];
  }

  /**
   * Lấy tổng số reaction
   * @param experience - Bài chia sẻ
   * @returns Tổng số like + love
   */
  getTotalReactionCount(experience: ILiyYdmsExperience): number {
    return (experience.total_like || 0) + (experience.total_love || 0);
  }


  /**
   * Đóng tất cả menu reaction khi click ra ngoài
   */
  @HostListener('document:click', ['$event'])
  closeReactionMenus(event: Event) {
    // Đóng tất cả menu reaction
    Object.keys(this.showReactionMenu).forEach(id => {
      this.showReactionMenu[parseInt(id)] = false;
    });
  }

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
