import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';

import { SurveyService } from '../../../services/survey/survey.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { IHeaderAnimeImage } from '../../../shared/interfaces/header/header';
import { DateFormat } from '../../../shared/enums/date-format';
import { ILiyYdmsAssessmentResult } from '../../../shared/interfaces/models/liy.ydms.assessment.result';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { AreaOfExpertise } from '../../../shared/enums/area-of-expertise';

@Component({
  selector: 'app-emotional-survey',
  templateUrl: './emotional-survey.page.html',
  styleUrls: ['./emotional-survey.page.scss'],
  standalone: false,
})
export class EmotionalSurveyPage implements OnInit {

  animeImage!: IHeaderAnimeImage;
  surveyHistory!: ILiyYdmsAssessmentResult[];

  isLoading!: boolean;
  paged: number = 1;
  limit: number = 20;

  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;
  protected readonly Array = Array;
  protected readonly DateFormat = DateFormat;

  constructor(
    private surveyService: SurveyService
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    await this.loadSurveyHistory();
  }

  /**
   * Handle pull-to-refresh
   * @param event Refresh event
   */
  public doRefresh(event: RefresherCustomEvent): void {
    if (this.isLoading) {
      event.target.complete();
      return;
    }

    setTimeout(() => {
      this.paged = 1;
      this.surveyHistory = new Array<ILiyYdmsAssessmentResult>();
      this.loadSurveyHistory().finally(() => event.target.complete());
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

    if (this.surveyHistory?.length < ((this.paged - 1) * this.limit)) {
      event.target.complete();
      return;
    }

    this.paged += 1;
    this.loadSurveyHistory().finally(() => event.target.complete());
  }

  /**
   * Load survey history
   */
  private async loadSurveyHistory(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;
    const results = await this.surveyService.getSurveyHistoryByAreaOfExpertise(
      AreaOfExpertise.EMOTION, offset, this.limit
    );

    this.surveyHistory = CommonConstants.mergeArrayObjectById(this.surveyHistory, results) || [];
    this.isLoading = false;
  }

  /**
   * init header
   * @private
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'emotional-survey',
      imageUrl: '/assets/images/emotional-survey.png',
      width: '100px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '0',
        bottom: '0'
      }
    };
  }
}
