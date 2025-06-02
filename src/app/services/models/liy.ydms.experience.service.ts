import { Injectable } from '@angular/core';

// Services
import { OdooService, SearchDomain } from '../odoo/odoo.service';

// Enums
import { OrderBy } from '../../shared/enums/order-by';
import { ModelName } from '../../shared/enums/model-name';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { AreaOfExpertise } from '../../shared/enums/area-of-expertise';
import { ExperienceStatus } from '../../shared/enums/experience-status';

// Interfaces và classes
import { ILiyYdmsExperience, ICreateExperience } from '../../shared/interfaces/models/liy.ydms.experience';
import { CommonConstants } from '../../shared/classes/common-constants';

/**
 * Service: Quản lý dữ liệu chia sẻ kinh nghiệm
 * Mô tả: Xử lý các thao tác CRUD với model liy.ydms.experience
 * Chức năng: Tạo, đọc, cập nhật, xóa bài chia sẻ kinh nghiệm
 */
@Injectable({
  providedIn: 'root'
})
export class LiyYdmsExperienceService {

  public readonly experienceFields = [
    'name',
    'area_of_expertise',
    'parent_id',
    'experience_content',
    'review_ids',
    'active',
    'total_like',
    'total_love',
    'status',
    'create_date',
    'write_date'
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
   * Lấy danh sách bài chia sẻ kinh nghiệm
   * @param searchDomain - Điều kiện tìm kiếm
   * @param offset - Vị trí bắt đầu (cho phân trang)
   * @param limit - Số lượng bản ghi tối đa
   * @param order - Thứ tự sắp xếp
   * @returns Danh sách bài chia sẻ kinh nghiệm
   */
  public async getExperienceList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<Array<ILiyYdmsExperience>> {
    // Gọi API search_read để lấy danh sách
    const results = await this.odooService.searchRead<ILiyYdmsExperience>(
      ModelName.EXPERIENCE, searchDomain, this.experienceFields, offset, limit, order,
    );
    // Chuyển đổi dữ liệu thành format chuẩn
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Lấy thông tin chi tiết bài chia sẻ kinh nghiệm theo ID
   * @param id - ID của bài chia sẻ
   * @returns Thông tin chi tiết bài chia sẻ hoặc undefined nếu không tìm thấy
   */
  public async getExperienceDetail(id: number): Promise<ILiyYdmsExperience | undefined> {
    // Gọi API read để lấy thông tin chi tiết
    let results = await this.odooService.read<ILiyYdmsExperience>(
      ModelName.EXPERIENCE, [id], this.experienceFields
    );

    // Kiểm tra kết quả trả về
    if (!results?.length) return undefined;

    // Chuyển đổi dữ liệu và trả về phần tử đầu tiên
    results = CommonConstants.convertArr2ListItem(results);
    return results[0];
  }

  /**
   * Đếm số lượng bài chia sẻ kinh nghiệm
   * @param searchDomain - Điều kiện tìm kiếm
   * @returns Số lượng bài chia sẻ thỏa mãn điều kiện
   */
  public async getCountExperience(searchDomain: SearchDomain = []): Promise<number> {
    const results = await this.odooService.searchCount(ModelName.EXPERIENCE, searchDomain);
    return results || 0;
  }

  /**
   * Lấy danh sách bài chia sẻ theo lĩnh vực chuyên môn
   * @param areaOfExpertise - Lĩnh vực chuyên môn cần lọc
   * @param offset - Vị trí bắt đầu
   * @param limit - Số lượng bản ghi tối đa
   * @param order - Thứ tự sắp xếp
   * @returns Danh sách bài chia sẻ thuộc lĩnh vực đã chọn
   */
  public async getExperienceListByArea(
    areaOfExpertise: AreaOfExpertise,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<Array<ILiyYdmsExperience>> {
    // Tạo điều kiện tìm kiếm theo lĩnh vực
    const searchDomain: SearchDomain = [
      ['area_of_expertise', OdooDomainOperator.EQUAL, areaOfExpertise]
    ];
    return this.getExperienceList(searchDomain, offset, limit, order);
  }

  /**
   * Lấy danh sách bài chia sẻ theo trạng thái
   * @param status - Trạng thái cần lọc (chờ duyệt, đã duyệt, bị từ chối)
   * @param offset - Vị trí bắt đầu
   * @param limit - Số lượng bản ghi tối đa
   * @param order - Thứ tự sắp xếp
   * @returns Danh sách bài chia sẻ có trạng thái đã chọn
   */
  public async getExperienceListByStatus(
    status: ExperienceStatus,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<Array<ILiyYdmsExperience>> {
    // Tạo điều kiện tìm kiếm theo trạng thái
    const searchDomain: SearchDomain = [
      ['status', OdooDomainOperator.EQUAL, status]
    ];
    return this.getExperienceList(searchDomain, offset, limit, order);
  }

  /**
   * Lấy danh sách bài chia sẻ theo phụ huynh
   * @param parentId - ID của phụ huynh
   * @param offset - Vị trí bắt đầu
   * @param limit - Số lượng bản ghi tối đa
   * @param order - Thứ tự sắp xếp
   * @returns Danh sách bài chia sẻ của phụ huynh đã chọn
   */
  public async getExperienceListByParent(
    parentId: number,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<Array<ILiyYdmsExperience>> {
    // Tạo điều kiện tìm kiếm theo ID phụ huynh
    const searchDomain: SearchDomain = [
      ['parent_id', OdooDomainOperator.EQUAL, parentId]
    ];
    return this.getExperienceList(searchDomain, offset, limit, order);
  }

  /**
   * Lấy danh sách bài chia sẻ đang hoạt động
   * @param offset - Vị trí bắt đầu
   * @param limit - Số lượng bản ghi tối đa
   * @param order - Thứ tự sắp xếp
   * @returns Danh sách bài chia sẻ đang hoạt động
   */
  public async getActiveExperienceList(
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<Array<ILiyYdmsExperience>> {
    // Tạo điều kiện tìm kiếm chỉ lấy bài đang hoạt động
    const searchDomain: SearchDomain = [
      ['active', OdooDomainOperator.EQUAL, true]
    ];
    return this.getExperienceList(searchDomain, offset, limit, order);
  }

  /**
   * Tạo bài chia sẻ kinh nghiệm mới
   * @param experienceData - Dữ liệu bài chia sẻ cần tạo
   * @returns ID của bài chia sẻ mới hoặc false nếu thất bại
   */
  public async createExperience(experienceData: ICreateExperience): Promise<number | false> {
    return this.odooService.callKw(ModelName.EXPERIENCE, 'create', [experienceData]);
  }

  /**
   * Cập nhật thông tin bài chia sẻ kinh nghiệm
   * @param id - ID của bài chia sẻ cần cập nhật
   * @param experienceData - Dữ liệu cần cập nhật
   * @returns true nếu cập nhật thành công, false nếu thất bại
   */
  public async updateExperience(id: number, experienceData: Partial<ILiyYdmsExperience>): Promise<boolean> {
    const result = await this.odooService.callKw(ModelName.EXPERIENCE, 'write', [[id], experienceData]);
    return result === true;
  }

  /**
   * Xóa bài chia sẻ kinh nghiệm
   * @param id - ID của bài chia sẻ cần xóa
   * @returns true nếu xóa thành công, false nếu thất bại
   */
  public async deleteExperience(id: number): Promise<boolean> {
    const result = await this.odooService.callKw(ModelName.EXPERIENCE, 'unlink', [[id]]);
    return result === true;
  }

  /**
   * Cập nhật số lượng like/love cho bài chia sẻ
   * @param experienceId - ID của bài chia sẻ
   * @returns true nếu cập nhật thành công
   */
  public async updateLikeLoveCount(experienceId: number): Promise<boolean> {
    try {
      // Đếm số lượng like và love từ bảng review
      const likeCount = await this.odooService.searchCount(
        ModelName.EXPERIENCE_REVIEW,
        [
          ['experience_id', OdooDomainOperator.EQUAL, experienceId],
          ['review', OdooDomainOperator.EQUAL, 'like']
        ]
      );

      const loveCount = await this.odooService.searchCount(
        ModelName.EXPERIENCE_REVIEW,
        [
          ['experience_id', OdooDomainOperator.EQUAL, experienceId],
          ['review', OdooDomainOperator.EQUAL, 'love']
        ]
      );

      // Cập nhật vào bảng experience
      const result = await this.odooService.write(
        ModelName.EXPERIENCE,
        [experienceId],
        {
          total_like: likeCount || 0,
          total_love: loveCount || 0
        }
      );

      return result === true;
    } catch (error) {
      console.error('ERROR updating like/love count:', error);
      return false;
    }
  }
}
