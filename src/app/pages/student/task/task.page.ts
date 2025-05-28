import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { IHeaderAnimation, IHeaderAnimeImage } from '../../../shared/interfaces/header/header';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { TaskService } from '../../../services/task/task.service';
import { SurveyService } from '../../../services/survey/survey.service';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { ILiyYdmsEmotionalDiary } from '../../../shared/interfaces/models/liy.ydms.emotional.diary';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { ILiyYdmsAssessmentResult } from '../../../shared/interfaces/models/liy.ydms.assessment.result';
import { AreaOfExpertise } from '../../../shared/enums/area-of-expertise';
import { ILiyYdmsTask } from '../../../shared/interfaces/models/liy.ydms.task';
import { GuideType } from '../../../shared/enums/guide-type';
import { IonInfiniteHorizontalDirective } from '../../../core/directive/ion-infinite-horizontal.directive';
import { TaskStatus } from '../../../shared/enums/task-status';
import { DateFormat } from '../../../shared/enums/date-format';

@Component({
  selector: 'app-task',
  templateUrl: './task.page.html',
  styleUrls: ['./task.page.scss'],
  standalone: false
})
export class TaskPage implements OnInit {

  authData?: IAuthData;
  animeImage!: IHeaderAnimeImage;
  animation!: IHeaderAnimation;
  daysOfMonths: number = CommonConstants.getDaysInMonth();

  // Emotion diary
  emotionDiaryList?: ILiyYdmsEmotionalDiary[];
  emotionStreak: number = 0;

  // Survey
  surveyList!: ILiyYdmsAssessmentResult[];
  surveyPending: number = 0;

  // Group tasks
  groupTaskList!: ILiyYdmsTask[];
  groupTaskPaged: number = 1;
  groupTaskLoading!: boolean;

  // Family tasks
  familyTaskList!: ILiyYdmsTask[];
  familyTaskPaged: number = 1;
  familyTaskLoading!: boolean;

  // Instruction task
  instructionTaskList!: ILiyYdmsTask[];
  instructionTaskPaged: number = 1;
  instructionTaskLoading!: boolean;

  // Exercise task
  exerciseTaskList!: ILiyYdmsTask[];
  exerciseTaskPaged: number = 1;
  exerciseTaskLoading!: boolean;

  private limit: number = 20;

  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;
  protected readonly AreaOfExpertise = AreaOfExpertise;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private surveyService: SurveyService,
    private router: Router,
    private translate: TranslateService,
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    this.authData = await this.authService.getAuthData();

    this.loadEmotionDiaryData();
    this.loadSurveyData();
    await this.loadDataTask();
  }

  /**
   * Handle refresh
   * @param event
   */
  public handleRefresh(event?: CustomEvent): void {
    setTimeout(async () => {
      this.loadEmotionDiaryData();
      this.loadSurveyData();
      await this.loadDataTask();
      if (event) await (event.target as HTMLIonRefresherElement).complete();
    }, 500);
  }

  /**
   * On click do survey
   * @param survey
   */
  public onClickDoSurvey(survey: ILiyYdmsAssessmentResult): void {
    if (!survey.id) return;

    if (survey.area_of_expertise === AreaOfExpertise.EMOTION) {
      this.router.navigateByUrl(`/${PageRoutes.EMOTIONAL_SURVEY}/${survey.id}`);
      return;
    }

    if (survey.area_of_expertise === AreaOfExpertise.CONFLICT) {
      this.router.navigateByUrl(`/${PageRoutes.FAMILY_CONFLICT_SURVEY}/${survey.id}`);
      return;
    }

    if (survey.area_of_expertise === AreaOfExpertise.COMMUNICATION) {
      this.router.navigateByUrl(`/${PageRoutes.FAMILY_COMMUNICATION_QUALITY_SURVEY}/${survey.id}`);
      return;
    }

    if (survey.area_of_expertise === AreaOfExpertise.DISCOVERY) {
      this.router.navigateByUrl(`/${PageRoutes.SELF_DISCOVERY_SURVEY}/${survey.id}`);
      return;
    }
  }

  /**
   * loadMoreFamilyTask
   * @param event
   */
  public loadMoreFamilyTask(event: IonInfiniteHorizontalDirective): void {
    if (this.familyTaskLoading) {
      event.complete();
      return;
    }

    if (this.familyTaskList.length < ((this.familyTaskPaged - 1) * this.limit)) {
      event.complete();
      return;
    }

    setTimeout(() => {
      this.familyTaskPaged += 1;
      this.loadFamilyTasks().finally(() => event.complete());
    }, 500);
  }

  /**
   * On loading data task
   * @private
   */
  private async loadDataTask(): Promise<void> {
    await Promise.all([
      this.loadGroupTasks(),
      this.loadFamilyTasks(),
      this.loadInstructionTasks(),
      this.loadExerciseTasks()
    ]);
  }

  /**
   * Load emotion data
   * @private
   */
  private loadEmotionDiaryData(): void {
    if (!this.authData) return;
    this.taskService.getEmotionDiaryPending(this.authData.id).then((results) => this.emotionDiaryList = results);
    this.taskService.getCountEmotionDiaryInMonth(this.authData.id).then((results) => this.emotionStreak = results);
  }

  /**
   * Load survey data
   * @private
   */
  private loadSurveyData(): void {
    if (!this.authData) return;
    this.surveyService.getSurveyListInMonth(this.authData.id).then((results) => {
      this.surveyList = results;
      this.surveyList = this.surveyList.sort((a, b) => {
        if (a.is_posted === b.is_posted) return 0;
        return a.is_posted ? 1 : -1;
      });
      const pendingSurvey = this.surveyList.filter(u => !u.is_posted);
      this.surveyPending = pendingSurvey.length;
    });
  }

  /**
   * Load group task
   * @private
   */
  private async loadGroupTasks(): Promise<void> {
    if (this.groupTaskLoading || !this.authData) return;
    this.groupTaskLoading = true;

    const offset = (this.groupTaskPaged - 1) * this.limit;
    const results = await this.taskService.getUserTaskList(
      this.authData.id, GuideType.GROUP_ACTIVITY, offset, this.limit
    );
    this.groupTaskList = CommonConstants.mergeArrayObjectById(this.groupTaskList, results) || [];
    this.groupTaskLoading = false;
  }

  /**
   * Load family task
   * @private
   */
  private async loadFamilyTasks(): Promise<void> {
    if (this.familyTaskLoading || !this.authData) return;
    this.familyTaskLoading = true;

    const offset = (this.familyTaskPaged - 1) * this.limit;
    const results = await this.taskService.getUserTaskList(
      this.authData.id, GuideType.FAMILY_ACTIVITY, offset, this.limit
    );
    this.familyTaskList = CommonConstants.mergeArrayObjectById(this.familyTaskList, results) || [];
    this.familyTaskLoading = false;
  }

  /**
   * Load instruction task
   * @private
   */
  private async loadInstructionTasks(): Promise<void> {
    if (this.instructionTaskLoading || !this.authData) return;
    this.instructionTaskLoading = true;

    const offset = (this.instructionTaskPaged - 1) * this.limit;
    const results = await this.taskService.getUserTaskList(
      this.authData.id, GuideType.INSTRUCTION, offset, this.limit
    );
    this.instructionTaskList = CommonConstants.mergeArrayObjectById(this.instructionTaskList, results) || [];
    this.instructionTaskLoading = false;
  }

  /**
   * Load exercise task
   * @private
   */
  private async loadExerciseTasks(): Promise<void> {
    if (this.exerciseTaskLoading || !this.authData) return;
    this.exerciseTaskLoading = true;

    const offset = (this.exerciseTaskPaged - 1) * this.limit;
    const results = await this.taskService.getUserTaskList(
      this.authData.id, GuideType.EXERCISE, offset, this.limit
    );
    this.exerciseTaskList = CommonConstants.mergeArrayObjectById(this.exerciseTaskList, results) || [];
    this.exerciseTaskLoading = false;
  }

  /**
   * init header
   * @private
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'rank',
      imageUrl: '/assets/images/rank/ranking.png',
      width: '130px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '-20px'
      }
    };
    this.animation = {
      animation: {
        path: '/assets/animations/1747072943679.json',
        loop: true,
        autoplay: true,
      },
      width: '130px',
      height: '130px',
      position: {
        position: 'absolute',
        top: '-30px',
        right: '50px',
      }
    }
  }

  protected readonly TaskStatus = TaskStatus;
  protected readonly DateFormat = DateFormat;
}
