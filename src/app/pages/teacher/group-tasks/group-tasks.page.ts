import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';

import { AuthService } from '../../../services/auth/auth.service';
import { TaskService } from '../../../services/task/task.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { GuideType } from '../../../shared/enums/guide-type';
import { ILiyYdmsTask } from '../../../shared/interfaces/models/liy.ydms.task';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { TaskStatus } from '../../../shared/enums/task-status';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { DateFormat } from '../../../shared/enums/date-format';

@Component({
  selector: 'app-group-tasks',
  templateUrl: './group-tasks.page.html',
  styleUrls: ['./group-tasks.page.scss'],
  standalone: false,
})
export class GroupTasksPage implements OnInit {

  authData?: IAuthData;

  taskList!: ILiyYdmsTask[];
  isLoading?: boolean;
  private paged: number = 1;
  private readonly limit: number = 20;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly Array = Array;
  protected readonly TaskStatus = TaskStatus;
  protected readonly PageRoutes = PageRoutes;
  protected readonly DateFormat = DateFormat;
  protected readonly GuideType = GuideType;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private taskService: TaskService,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then((authData) => {
      this.authData = authData;
      this.loadTaskList();
    });
  }

  ionViewDidEnter() {
    if (this.taskList) {
      setTimeout(() => this.doRefresh());
    }
  }

  /**
   * Handle pull-to-refresh
   * @param event Refresh event
   */
  public doRefresh(event?: RefresherCustomEvent): void {
    if (this.isLoading) {
      event?.target.complete();
      return;
    }

    setTimeout(() => {
      this.paged = 1;
      this.taskList = new Array<ILiyYdmsTask>();
      this.loadTaskList().finally(() => event?.target.complete());
    }, 500);
  }

  /**
   * Load more items when scrolling down
   * @param event Infinite scroll event
   */
  public loadMore(event: InfiniteScrollCustomEvent): void {
    if (this.isLoading) {
      event.target.complete();
      return;
    }

    if (this.taskList?.length < ((this.paged - 1) * this.limit)) {
      event.target.complete();
      return;
    }

    this.paged += 1;
    this.loadTaskList().finally(() => event.target.complete());
  }

  /**
   * loadTaskList
   * @private
   */
  private async loadTaskList(): Promise<void> {
    if (this.isLoading || !this.authData) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;
    const results = await this.taskService.getUserTaskList(
      this.authData.id, GuideType.GROUP_ACTIVITY, offset, this.limit
    );

    this.taskList = CommonConstants.mergeArrayObjectById<ILiyYdmsTask>(this.taskList, results) || [];
    this.isLoading = false;
  }
}
