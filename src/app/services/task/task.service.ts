import { Injectable } from '@angular/core';

import { LiyYdmsTaskService } from '../models/liy.ydms.task.service';
import { LiyYdmsEmotionalDiaryService } from '../models/liy.ydms.emotional.diary.service';
import { LiyYdmsEmotionalQuestionService } from '../models/liy.ydms.emotional.question.service';
import { LiyYdmsEmotionalAnswerOptionService } from '../models/liy.ydms.emotional.answer.option.service';
import { LiyYdmsGuideService } from '../models/liy.ydms.guide.service';
import { OrderBy } from '../../shared/enums/order-by';
import { ILiyYdmsTask } from '../../shared/interfaces/models/liy.ydms.task';
import { TaskStatus } from '../../shared/enums/task-status';
import { ILiyYdmsEmotionalDiary } from '../../shared/interfaces/models/liy.ydms.emotional.diary';
import { GuideType } from '../../shared/enums/guide-type';
import { IEmotionQuestion } from '../../shared/interfaces/function-data/emotion-question';
import { CommonConstants } from '../../shared/classes/common-constants';
import { ITaskDetail } from '../../shared/interfaces/function-data/task-detail';
import { TaskProgressUpdate } from '../../shared/interfaces/function-data/task-progress-update';
import { CreateTaskBody } from '../../shared/interfaces/function-data/create-task-body';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(
    private liyYdmsTaskService: LiyYdmsTaskService,
    private liyYdmsEmotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private liyYdmsEmotionalQuestionService: LiyYdmsEmotionalQuestionService,
    private liyYdmsEmotionalAnswerOptionService: LiyYdmsEmotionalAnswerOptionService,
    private liyYdmsGuideService: LiyYdmsGuideService
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
    );
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
    );
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

  /**
   * Random an emotion question
   */
  public async getRandomEmotionQuestion(): Promise<IEmotionQuestion | undefined> {
    const countQuestions = await this.liyYdmsEmotionalQuestionService.getCountQuestions();
    if (!countQuestions) return;

    const randomOffset = CommonConstants.randomInt(countQuestions);
    const questions = await this.liyYdmsEmotionalQuestionService.getQuestionList([], randomOffset, 1);
    if (!questions?.length) return;

    const randomQuestions: IEmotionQuestion = {
      ...questions[0],
      answers: [],
    };

    // Lấy danh sách lựa chọn câu trả lời
    if (randomQuestions.answer_ids?.length) {
      randomQuestions.answers = await this.liyYdmsEmotionalAnswerOptionService.getAnswerOptionByIds(randomQuestions.answer_ids);
    }

    return randomQuestions;
  }

  /**
   * Get task detail
   * @param taskId
   */
  public async getTaskDetail(taskId: number): Promise<ITaskDetail | undefined> {
    const task = await this.liyYdmsTaskService.getTaskDetail(taskId);
    if (!task) return;

    const guide = await this.liyYdmsGuideService.getGuideById(task.guide_id.id);
    if (!guide) return;

    return {
      ...task,
      guide: guide
    };
  }

  /**
   * Update task status
   * @param taskId
   * @param status
   */
  public async updateTaskStatus(
    taskId: number,
    status: TaskStatus
  ): Promise<boolean | number> {
    if (!taskId || !status) return false;
    return this.liyYdmsTaskService.updateTask(
      taskId, {status: status}
    );
  }

  /**
   * Update task progress
   * @param taskId
   * @param body
   */
  public async updateTaskProgress(
    taskId: number,
    body: TaskProgressUpdate
  ): Promise<boolean | number> {
    if (!taskId || !body) return false;
    return this.liyYdmsTaskService.updateTask(
      taskId, body
    );
  }

  /**
   * Create task
   * @param body
   */
  public async createTask(body: CreateTaskBody): Promise<number | undefined> {
    return this.liyYdmsTaskService.createTask(body);
  }
}
