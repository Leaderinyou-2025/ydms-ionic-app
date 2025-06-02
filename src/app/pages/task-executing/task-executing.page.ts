import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';

import { AuthService } from '../../services/auth/auth.service';
import { TaskService } from '../../services/task/task.service';
import { TranslateKeys } from '../../shared/enums/translate-keys';
import { IAuthData } from '../../shared/interfaces/auth/auth-data';
import { IHeaderAnimation, IHeaderAnimeImage } from '../../shared/interfaces/header/header';
import { GuideType } from '../../shared/enums/guide-type';
import { ILiyYdmsTask } from '../../shared/interfaces/models/liy.ydms.task';
import { CommonConstants } from '../../shared/classes/common-constants';
import { TaskStatus } from '../../shared/enums/task-status';
import { PageRoutes } from '../../shared/enums/page-routes';
import { DateFormat } from '../../shared/enums/date-format';

@Component({
  selector: 'app-task-executing',
  templateUrl: './task-executing.page.html',
  styleUrls: ['./task-executing.page.scss'],
  standalone: false
})
export class TaskExecutingPage implements OnInit {

  authData?: IAuthData;
  animeImage!: IHeaderAnimeImage;
  animation!: IHeaderAnimation;
  guideType!: GuideType;
  pageTitle!: TranslateKeys;

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
    this.route.queryParams.subscribe(params => {
      this.guideType = params['guideType'] || GuideType.INSTRUCTION;
      this.initHeader();
      this.authService.getAuthData().then((authData) => {
        this.authData = authData;
        this.loadTaskList();
      });
    });
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
    }, 500)
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
      this.authData.id, this.guideType, offset, this.limit
    );

    this.taskList = CommonConstants.mergeArrayObjectById<ILiyYdmsTask>(this.taskList, results) || [];
    this.isLoading = false;
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
    };

    if (this.guideType === GuideType.GROUP_ACTIVITY) {
      this.pageTitle = TranslateKeys.TITLE_GROUP_CHALLENGE;
    } else if (this.guideType === GuideType.FAMILY_ACTIVITY) {
      this.pageTitle = TranslateKeys.TITLE_FAMILY_ACTIVITY;
    } else if (this.guideType === GuideType.EXERCISE) {
      this.pageTitle = TranslateKeys.TITLE_SELF_DISCOVERY_PROGRESS;
    } else {
      this.pageTitle = TranslateKeys.TITLE_INSTRUCTION;
    }
  }
}
