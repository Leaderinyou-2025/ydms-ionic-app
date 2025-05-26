import { Injectable } from '@angular/core';

import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsTask } from '../../shared/interfaces/models/liy.ydms.task';
import { TaskStatus } from '../../shared/enums/task-status';
import { LiyYdmsTaskService } from '../models/liy.ydms.task.service';
import { LiyYdmsEmotionalDiaryService } from '../models/liy.ydms.emotional.diary.service';
import { ILiyYdmsEmotionalDiary } from '../../shared/interfaces/models/liy.ydms.emotional.diary';
import { GuideType } from '../../shared/enums/guide-type';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(
    private liyYdmsTaskService: LiyYdmsTaskService,
    private liyYdmsEmotionalDiaryService: LiyYdmsEmotionalDiaryService
  ) {
  }

  /**
   * Get task list by assigneeId
   * @param assigneeId
   * @param guideType
   * @param offset
   * @param limit
   * @param order
   */
  public async getUserTaskList(
    assigneeId: number,
    guideType: GuideType,
    offset: number = 0,
    limit: number = 20,
    order?: OrderBy
  ): Promise<ILiyYdmsTask[]> {
    return this.liyYdmsTaskService.getUserTaskList(assigneeId, guideType, offset, limit, order);
  }

  /**
   * getCountAllTask
   */
  public async getCountAllTasksByAssigneeId(assigneeId: number): Promise<number> {
    return this.liyYdmsTaskService.getCountUserTask(assigneeId);
  }

  /**
   * getCountActivatingTasks
   */
  public async getCountActivatingTaskByAssigneeId(assigneeId: number): Promise<number> {
    return this.liyYdmsTaskService.getCountActivatingTasks(assigneeId);
  }

  /**
   * getCountCompletedTasks
   */
  public async getCountCompletedTaskByAssigneeId(assigneeId: number): Promise<number> {
    return this.liyYdmsTaskService.getCountCompletedTasks(assigneeId);
  }

  /**
   *  Get all task with pending and inprogress status
   * @param assigneeId
   * @param offset
   * @param limit
   * @param order
   */
  public async getActivatingTaskList(
    assigneeId: number,
    offset: number = 0,
    limit: number = 20,
    order?: OrderBy
  ): Promise<ILiyYdmsTask[]> {
    return this.liyYdmsTaskService.getTaskListByStatus(
      [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
      assigneeId,
      offset,
      limit,
      order
    );
  }


  /**
   * getEmotionDiaryList
   * @param teenagerId
   * @param offset
   * @param limit
   * @param order
   */
  public async getEmotionDiaryList(
    teenagerId: number,
    offset: number = 0,
    limit: number = 20,
    order?: OrderBy
  ): Promise<ILiyYdmsEmotionalDiary[]> {
    return this.liyYdmsEmotionalDiaryService.getUserEmotionDiaryList(
      teenagerId, offset, limit, order
    )
  }

  /**
   *
   * @param teenagerId
   * @param offset
   * @param limit
   * @param order
   */
  public async getEmotionDiaryPending(
    teenagerId: number,
    offset: number = 0,
    limit: number = 20,
    order?: OrderBy
  ): Promise<ILiyYdmsEmotionalDiary[]> {
    return this.liyYdmsEmotionalDiaryService.getUserEmotionDiaryPending(
      teenagerId, offset, limit, order
    )
  }

  /**
   * getCountEmotionDiaryPending
   * @param teenagerId
   */
  public async getCountEmotionDiaryPending(teenagerId: number): Promise<number> {
      return this.liyYdmsEmotionalDiaryService.getCountUserEmotionDiaryPending(teenagerId);
  }

  /**
   * getCountEmotionDiaryInMonth
   * @param teenagerId
   * @param month
   * @param year
   */
  public async getCountEmotionDiaryInMonth(
    teenagerId: number,
    month?: number,
    year?: number
  ): Promise<number> {
    return this.liyYdmsEmotionalDiaryService.getStreakEmotionDiaryInMonth(teenagerId, month, year);
  }
}
