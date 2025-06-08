import { Component, OnInit } from '@angular/core';
import {
  AlertButton,
  AlertController,
  InfiniteScrollCustomEvent,
  LoadingController,
  ModalController,
  RefresherCustomEvent
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth/auth.service';
import { EmotionFilterType } from '../../../shared/enums/personal-diary/personal-diary.enum';
import { IEmotionalDiary } from '../../../shared/interfaces/personal-diary/personal-diary.interfaces';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { IHeaderAnimeImage, IHeaderSegment } from '../../../shared/interfaces/header/header';
import { ILiyYdmsEmotionalDiary } from '../../../shared/interfaces/models/liy.ydms.emotional.diary';
import { LiyYdmsEmotionalDiaryService } from '../../../services/models/liy.ydms.emotional.diary.service';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { DateFormat } from '../../../shared/enums/date-format';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { PublicEmotionalOption } from '../../../shared/enums/public-emotional-option';
import { NativePlatform } from '../../../shared/enums/native-platform';
import { SelectSuggestionGuideComponent } from './select-suggestion-guide/select-suggestion-guide.component';

@Component({
  selector: 'app-personal-diary',
  templateUrl: './personal-diary.page.html',
  styleUrls: ['./personal-diary.page.scss'],
  standalone: false,
})
export class PersonalDiaryPage implements OnInit {
  // Headers
  segment!: IHeaderSegment;
  animeImage!: IHeaderAnimeImage;
  activeTab: EmotionFilterType = EmotionFilterType.SHARED_ENTRIES;

  authData?: IAuthData;
  emotionalDiaryList!: IEmotionalDiary[];
  isLoading?: boolean;
  isLoadMore = false;
  private paged: number = 1;
  private readonly limit: number = 20;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly EmotionFilterType = EmotionFilterType;
  protected readonly CommonConstants = CommonConstants;
  protected readonly DateFormat = DateFormat;
  protected readonly PageRoutes = PageRoutes;
  protected readonly Array = Array;
  protected readonly PublicEmotionalOption = PublicEmotionalOption;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private modalController: ModalController,
    private translate: TranslateService,
    private emotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private liyYdmsEmotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private loadingController: LoadingController,
  ) {
  }

  ngOnInit() {
    this.initHeader();
    this.authService.getAuthData().then((authData) => {
      this.authData = authData;
      this.getEmotionalDiaryList();
    });
  }

  ionViewDidEnter() {
    if (this.emotionalDiaryList) this.doRefresh();
  }

  /**
   * Handle segment change event
   * @param activeTab
   */
  public segmentChanged(activeTab: string | number): void {
    this.activeTab = activeTab as EmotionFilterType;
    setTimeout(() => {
      this.paged = 1;
      this.emotionalDiaryList = new Array<IEmotionalDiary>();
      this.getEmotionalDiaryList();
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
      this.emotionalDiaryList = new Array<IEmotionalDiary>();
      this.getEmotionalDiaryList().finally(() => event?.target.complete());
    }, 500);
  }

  /**
   * On switch public emotional
   */
  public onClickUnPublicEmotional(emotionalDiary: IEmotionalDiary): void {
    if (!emotionalDiary) return;
    const buttons: Array<AlertButton> = [
      {text: this.translate.instant(TranslateKeys.BUTTON_CANCEL)},
      {
        text: this.translate.instant(TranslateKeys.BUTTON_CONFIRM),
        handler: () => this.handleUnPublicEmotional(emotionalDiary)
      },
    ];
    this.alertController.create({
      mode: NativePlatform.IOS,
      header: this.translate.instant(TranslateKeys.ALERT_DEFAULT_HEADER),
      message: this.translate.instant(TranslateKeys.ALERT_CONFIRM_UN_PUBLIC),
      buttons: buttons
    }).then(alertItem => alertItem.present());
  }

  /**
   * Xử lý đưa gợi ý
   * @param emotionDiary
   */
  public onClickSuggestionGuide(emotionDiary: IEmotionalDiary): void {
    if (!emotionDiary) return;
    this.modalController.create({
      component: SelectSuggestionGuideComponent,
      mode: NativePlatform.IOS,
      initialBreakpoint: 0.8,
      breakpoints: [0, 0.8],
      componentProps: {emotionDiary: emotionDiary}
    }).then(modal => modal.present());
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
    if (this.activeTab === EmotionFilterType.MY_ENTRIES) {
      results = await this.emotionalDiaryService.getUserEmotionDiaryList(
        this.authData.id, offset, this.limit
      );
    } else {
      results = await this.emotionalDiaryService.getTeenagerSharedEmotionDiaryList(
        this.authData.id, offset, this.limit
      );
    }

    this.emotionalDiaryList = CommonConstants.mergeArrayObjectById(this.emotionalDiaryList, results) || [];
    this.isLoading = false;
  }

  /**
   * handleUnPublicEmotional
   * @private
   */
  private handleUnPublicEmotional(emotionalDiary: IEmotionalDiary): void {
    if (!emotionalDiary || !emotionalDiary?.id) return;
    this.loadingController.create({mode: NativePlatform.IOS}).then(loading => {
      loading.present();
      this.liyYdmsEmotionalDiaryService.updateEmotionDiary(emotionalDiary?.id || -1, {public_emotional: false}
      ).then(result => {
        if (result) this.doRefresh();
      }).finally(() => loading.dismiss());
    });
  }

  /**
   * init header
   * @private
   */
  private initHeader(): void {
    this.segment = {
      value: this.activeTab,
      buttons: [
        {value: EmotionFilterType.SHARED_ENTRIES, label: TranslateKeys.PERSONAL_DIARY_SHARED_ENTRIES},
        {value: EmotionFilterType.MY_ENTRIES, label: TranslateKeys.PERSONAL_DIARY_MY_ENTRIES},
      ]
    };
    this.animeImage = {
      name: 'personal_diary',
      imageUrl: '/assets/images/personal_diary.png',
      width: '250px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '-50px',
        bottom: '-10px'
      }
    };
  }
}
