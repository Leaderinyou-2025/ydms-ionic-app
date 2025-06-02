import { Injectable } from '@angular/core';

// Services
import { OdooService, SearchDomain } from '../odoo/odoo.service';

// Enums
import { ModelName } from '../../shared/enums/model-name';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { ExperienceReviewType } from '../../shared/enums/experience-review-type';

// Interfaces
import { ILiyYdmsExperienceReview } from '../../shared/interfaces/models/liy.ydms.experience.review';

/**
 * Service: Quản lý đánh giá bài chia sẻ kinh nghiệm
 * Mô tả: Xử lý các thao tác liên quan đến like/love bài chia sẻ
 * Chức năng: Đếm số lượt like, love, lấy thống kê tương tác
 */
@Injectable({
  providedIn: 'root'
})
export class LiyYdmsExperienceReviewService {

  // Danh sách các trường dữ liệu cần lấy từ backend
  public readonly experienceReviewFields = [
    'experience_id',
    'review',
    'create_uid'
  ];

  /**
   * Constructor: Khởi tạo service
   * @param odooService - Service kết nối với Odoo backend
   */
  constructor(
    private odooService: OdooService
  ) {
  }

  /**
   * Đếm số lượt like của một bài chia sẻ
   * @param experienceId - ID của bài chia sẻ
   * @returns Số lượng like
   */
  public async getLikeCountByExperienceId(experienceId: number): Promise<number> {
    // Tạo điều kiện tìm kiếm like cho bài chia sẻ cụ thể
    const searchDomain: SearchDomain = [
      ['experience_id', OdooDomainOperator.EQUAL, experienceId],
      ['review', OdooDomainOperator.EQUAL, ExperienceReviewType.LIKE]
    ];

    // Gọi API đếm số lượng
    const result = await this.odooService.searchCount(ModelName.EXPERIENCE_REVIEW, searchDomain);
    return result || 0;
  }

  /**
   * Đếm số lượt love của một bài chia sẻ
   * @param experienceId - ID của bài chia sẻ
   * @returns Số lượng love
   */
  public async getLoveCountByExperienceId(experienceId: number): Promise<number> {
    // Tạo điều kiện tìm kiếm love cho bài chia sẻ cụ thể
    const searchDomain: SearchDomain = [
      ['experience_id', OdooDomainOperator.EQUAL, experienceId],
      ['review', OdooDomainOperator.EQUAL, ExperienceReviewType.LOVE]
    ];

    // Gọi API đếm số lượng
    const result = await this.odooService.searchCount(ModelName.EXPERIENCE_REVIEW, searchDomain);
    return result || 0;
  }

  /**
   * Lấy số lượt like và love của một bài chia sẻ
   * Thực hiện song song để tối ưu hiệu suất
   * @param experienceId - ID của bài chia sẻ
   * @returns Object chứa số lượt like và love
   */
  public async getReactionCountsByExperienceId(experienceId: number): Promise<{like: number, love: number}> {
    // Thực hiện song song để giảm thời gian chờ
    const [likeCount, loveCount] = await Promise.all([
      this.getLikeCountByExperienceId(experienceId),
      this.getLoveCountByExperienceId(experienceId)
    ]);

    return {
      like: likeCount,
      love: loveCount
    };
  }

  /**
   * Kiểm tra người dùng đã like/love bài chia sẻ chưa
   * @param experienceId - ID của bài chia sẻ
   * @param userId - ID của người dùng
   * @param reviewType - Loại đánh giá (like hoặc love)
   * @returns Review record nếu đã tồn tại, undefined nếu chưa
   */
  public async getUserReviewForExperience(
    experienceId: number,
    userId: number,
    reviewType?: ExperienceReviewType
  ): Promise<ILiyYdmsExperienceReview | undefined> {
    const searchDomain: SearchDomain = [
      ['experience_id', OdooDomainOperator.EQUAL, experienceId],
      ['create_uid', OdooDomainOperator.EQUAL, userId]
    ];

    if (reviewType) {
      searchDomain.push(['review', OdooDomainOperator.EQUAL, reviewType]);
    }

    const results = await this.odooService.searchRead<ILiyYdmsExperienceReview>(
      ModelName.EXPERIENCE_REVIEW, searchDomain, this.experienceReviewFields, 0, 1
    );

    return results?.length ? results[0] : undefined;
  }

  /**
   * Tạo hoặc cập nhật đánh giá (like/love) cho bài chia sẻ
   * @param experienceId - ID của bài chia sẻ
   * @param userId - ID của người dùng
   * @param reviewType - Loại đánh giá (like hoặc love)
   * @returns ID của review record hoặc false nếu thất bại
   */
  public async createOrUpdateReview(
    experienceId: number,
    userId: number,
    reviewType: ExperienceReviewType
  ): Promise<number | false> {
    try {
      // Kiểm tra xem người dùng đã có đánh giá cho bài này chưa
      const existingReview = await this.getUserReviewForExperience(experienceId, userId);

      if (existingReview) {
        // Nếu đã có đánh giá, cập nhật loại đánh giá
        const updateResult = await this.odooService.write(
          ModelName.EXPERIENCE_REVIEW,
          [existingReview.id],
          { review: reviewType }
        );
        return updateResult ? existingReview.id : false;
      } else {
        // Nếu chưa có, tạo mới
        const reviewData = {
          experience_id: experienceId,
          review: reviewType
        };
        const result = await this.odooService.create(ModelName.EXPERIENCE_REVIEW, reviewData);
        return result || false;
      }
    } catch (error) {
      console.error('ERROR:', error);
      return false;
    }
  }

  /**
   * Xóa đánh giá của người dùng cho bài chia sẻ
   * @param experienceId - ID của bài chia sẻ
   * @param userId - ID của người dùng
   * @returns true nếu xóa thành công, false nếu thất bại
   */
  public async removeUserReview(experienceId: number, userId: number): Promise<boolean> {
    try {
      const existingReview = await this.getUserReviewForExperience(experienceId, userId);

      if (existingReview) {
        const result = await this.odooService.unlink(
          ModelName.EXPERIENCE_REVIEW,
          [existingReview.id]
        );
        return result === true;
      }

      return true; // Nếu không có review nào thì coi như đã xóa thành công
    } catch (error) {
      console.error('ERROR:', error);
      return false;
    }
  }
}
