import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PageRoutes } from '../../../shared/enums/page-routes';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { IHeaderAnimation, IHeaderAnimeImage } from '../../../shared/interfaces/header/header';
import { GuideType } from '../../../shared/enums/guide-type';
import { ILiyYdmsTask } from '../../../shared/interfaces/models/liy.ydms.task';
import { TaskService } from '../../../services/task/task.service';

@Component({
  selector: 'app-task-executing-detail',
  templateUrl: './task-executing-detail.component.html',
  styleUrls: ['./task-executing-detail.component.scss'],
  standalone: false
})
export class TaskExecutingDetailComponent implements OnInit {

  authData?: IAuthData;
  animeImage!: IHeaderAnimeImage;
  animation!: IHeaderAnimation;
  task?: ILiyYdmsTask;

  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;

  constructor(
    private activeRoute: ActivatedRoute,
    private taskService: TaskService,
  ) {
  }

  ngOnInit() {
    const id = this.activeRoute.snapshot.paramMap.get('id');
    if (!id) return history.back();
    this.initHeader();
    this.loadTaskDetail(+id);
  }

  /**
   * Load task detail
   * @param id
   * @private
   */
  private loadTaskDetail(id: number): void {
    this.taskService.getTaskDetail(id).then(task => {
      if (!task) {
        return history.back();
      } else {
        this.task = task;
      }
    })
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
  }
}
