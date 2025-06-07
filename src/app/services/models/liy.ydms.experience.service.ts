import { Injectable } from '@angular/core';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ModelName } from '../../shared/enums/model-name';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { AreaOfExpertise } from '../../shared/enums/area-of-expertise';
import { ExperienceStatus } from '../../shared/enums/experience-status';
import { ILiyYdmsExperience } from '../../shared/interfaces/models/liy.ydms.experience';
import { CommonConstants } from '../../shared/classes/common-constants';
import { ICreateExperienceBody } from '../../shared/interfaces/function-data/create-experience-body';

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
    const results = await this.odooService.searchRead<ILiyYdmsExperience>(
      ModelName.EXPERIENCE, searchDomain, this.experienceFields, offset, limit, order,
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Lấy thông tin chi tiết bài chia sẻ kinh nghiệm theo ID
   * @param id - ID của bài chia sẻ
   * @returns Thông tin chi tiết bài chia sẻ hoặc undefined nếu không tìm thấy
   */
  public async getExperienceDetail(id: number): Promise<ILiyYdmsExperience | undefined> {
    let results = await this.odooService.read<ILiyYdmsExperience>(
      ModelName.EXPERIENCE, [id], this.experienceFields
    );
    if (!results?.length) return undefined;
    results = CommonConstants.convertArr2ListItem(results);
    return results[0];
  }

  /**
   * Đếm số lượng bài chia sẻ kinh nghiệm
   * @param searchDomain - Điều kiện tìm kiếm
   * @returns Số lượng bài chia sẻ thỏa mãn điều kiện
   */
  public async getCountExperience(searchDomain: SearchDomain = []): Promise<number> {
    return this.odooService.searchCount(ModelName.EXPERIENCE, searchDomain);
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
  public async createExperience(
    experienceData: ICreateExperienceBody
  ): Promise<number | undefined> {
    return this.odooService.create<ILiyYdmsExperience>(
      ModelName.EXPERIENCE, experienceData
    );
  }

  /**
   * Cập nhật thông tin bài chia sẻ kinh nghiệm
   * @param id - ID của bài chia sẻ cần cập nhật
   * @param experienceData - Dữ liệu cần cập nhật
   * @returns true nếu cập nhật thành công, false nếu thất bại
   */
  public async updateExperience(
    id: number,
    experienceData: Partial<ILiyYdmsExperience>
  ): Promise<boolean> {
    const result = await this.odooService.write(
      ModelName.EXPERIENCE, [id], experienceData
    );
    return result === true;
  }

  /**
   * Xóa bài chia sẻ kinh nghiệm
   * @param id - ID của bài chia sẻ cần xóa
   * @returns true nếu xóa thành công, false nếu thất bại
   */
  public async deleteExperience(id: number): Promise<boolean> {
    return this.odooService.unlink(ModelName.EXPERIENCE, [id]);
  }
}
