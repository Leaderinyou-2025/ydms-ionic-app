import { Injectable } from '@angular/core';
import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsTask } from '../../shared/interfaces/models/liy.ydms.task';
import { ModelName } from '../../shared/enums/model-name';
import { CommonConstants } from '../../shared/classes/common-constants';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { TaskStatus } from '../../shared/enums/task-status';
import { AreaOfExpertise } from '../../shared/enums/area-of-expertise';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  taskFields = [
    'name', 'guide_id', 'guide_type', 'assignee_ids', 'area_of_expertise', 'status',
    'rank_point', 'scores', 'task_image_result', 'task_percentage_result', 'task_text_result',
    'create_date', 'write_date'
  ]

  constructor(
    private odooService: OdooService,
  ) {
  }

  /**
   * Get task list
   * @param searchDomain
   * @param offset
   * @param limit
   * @param order
   */
  public async getTaskList(
    searchDomain: SearchDomain = [],
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<Array<ILiyYdmsTask>> {
    const results = await this.odooService.searchRead<ILiyYdmsTask>(
      ModelName.TASK, searchDomain, this.taskFields, offset, limit, order,
    );
    return CommonConstants.convertArr2ListItem(results);
  }

  /**
   * Get task detail by id
   * @param id
   */
  public async getTaskDetail(id: number): Promise<ILiyYdmsTask | undefined> {
    let results = await this.odooService.read<ILiyYdmsTask>(
      ModelName.TASK, [id], this.taskFields
    );
    if (!results?.length) return undefined;
    results = CommonConstants.convertArr2ListItem(results);
    return results[0];
  }

  /**
   * Get count task
   * @param searchDomain
   */
  public async getCountTask(searchDomain: SearchDomain = []): Promise<number> {
    const results = await this.odooService.searchCount(ModelName.TASK, searchDomain);
    return results || 0;
  }

  /**
   * Get count pending and inprogress task
   */
  public async getCountActivatingTasks(): Promise<number> {
    const searchDomain: SearchDomain = [['status', OdooDomainOperator.IN, [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]]];
    return this.getCountTask(searchDomain);
  }

  /**
   * Get count completed task
   */
  public async getCountCompletedTasks(): Promise<number> {
    return this.getCountTask([['status', OdooDomainOperator.EQUAL, TaskStatus.COMPLETED]]);
  }

  /**
   * Get task list by area of expertise
   * @param areaId
   * @param offset
   * @param limit
   * @param order
   */
  public async getTaskListByAreaOfExpertise(
    areaId: AreaOfExpertise,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsTask[]> {
    const searchDomain: SearchDomain = [['area_of_expertise', OdooDomainOperator.EQUAL, areaId]];
    return this.getTaskList(searchDomain, offset, limit, order);
  }

  /**
   * Get task list by status
   * @param statuses
   * @param offset
   * @param limit
   * @param order
   */
  public async getTaskListByStatus(
    statuses: Array<TaskStatus>,
    offset: number = 0,
    limit: number = 20,
    order: OrderBy = OrderBy.CREATE_AT_DESC,
  ): Promise<ILiyYdmsTask[]> {
    const searchDomain: SearchDomain = [[
      'status',
      statuses.length === 1 ? OdooDomainOperator.EQUAL : OdooDomainOperator.IN,
      statuses.length === 1 ? statuses[0] : statuses
    ]];
    return this.getTaskList(searchDomain, offset, limit, order);
  }

}
