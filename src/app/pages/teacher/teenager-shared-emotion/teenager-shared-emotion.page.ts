import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';

import { AuthService } from '../../../services/auth/auth.service';
import { IEmotionalDiary } from '../../../shared/interfaces/personal-diary/personal-diary.interfaces';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { ILiyYdmsEmotionalDiary } from '../../../shared/interfaces/models/liy.ydms.emotional.diary';
import { LiyYdmsEmotionalDiaryService } from '../../../services/models/liy.ydms.emotional.diary.service';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { DateFormat } from '../../../shared/enums/date-format';
import { PageRoutes } from '../../../shared/enums/page-routes';


@Component({
  selector: 'app-teenager-shared-emotion',
  templateUrl: './teenager-shared-emotion.page.html',
  styleUrls: ['./teenager-shared-emotion.page.scss'],
  standalone: false
})
export class TeenagerSharedEmotionPage implements OnInit {

  authData?: IAuthData;
  emotionalDiaryList!: IEmotionalDiary[];
  isLoading?: boolean;
  isLoadMore = false;
  private paged: number = 1;
  private readonly limit: number = 20;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly CommonConstants = CommonConstants;
  protected readonly DateFormat = DateFormat;
  protected readonly Array = Array;
  protected readonly PageRoutes = PageRoutes;

  constructor(
    private authService: AuthService,
    private emotionalDiaryService: LiyYdmsEmotionalDiaryService,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then((authData) => {
      this.authData = authData;
      this.getEmotionalDiaryList();
    });
  }

  ionViewDidEnter() {
    if (this.emotionalDiaryList) this.doRefresh();
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
      this.emotionalDiaryList = new Array<IEmotionalDiary>();
      this.getEmotionalDiaryList().finally(() => event?.target.complete());
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

    if (this.emotionalDiaryList?.length < ((this.paged - 1) * this.limit)) {
      event.target.complete();
      return;
    }

    this.paged += 1;
    this.isLoadMore = true;
    this.getEmotionalDiaryList().finally(() => {
      event.target.complete();
      this.isLoadMore = false;
    });
  }

  /**
   * Get emotion diary list
   * @private
   */
  private async getEmotionalDiaryList(): Promise<void> {
    if (this.isLoading || !this.authData) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;
    let results: ILiyYdmsEmotionalDiary[];
    results = await this.emotionalDiaryService.getTeenagerSharedEmotionDiaryList(
      this.authData.id, offset, this.limit
    );

    this.emotionalDiaryList = CommonConstants.mergeArrayObjectById(this.emotionalDiaryList, results) || [];
    this.isLoading = false;
  }
}
