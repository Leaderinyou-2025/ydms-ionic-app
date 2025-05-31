import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { RefresherCustomEvent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { ILiyYdmsEmotionalDiary } from '../../../shared/interfaces/models/liy.ydms.emotional.diary';

import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { IHeaderAnimeImage } from '../../../shared/interfaces/header/header';
import { LiyYdmsEmotionalDiaryService } from '../../../services/models/liy.ydms.emotional.diary.service';
import { AuthService } from '../../../services/auth/auth.service';

import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { OrderBy } from '../../../shared/enums/order-by';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { DateFormat } from '../../../shared/enums/date-format';
import { LanguageKeys } from '../../../shared/enums/language-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';

@Component({
  selector: 'app-daily-emotion-journal',
  templateUrl: './daily-emotion-journal.page.html',
  styleUrls: ['./daily-emotion-journal.page.scss'],
  standalone: false
})
export class DailyEmotionJournalPage implements OnInit {

  animeImage!: IHeaderAnimeImage;

  monthlyCheckIns: number = 0;
  journalEntries!: ILiyYdmsEmotionalDiary[];
  isLoading!: boolean;
  selectedMonth!: number;
  selectYear!: number;
  monthNames = new CommonConstants(this.translate).monthNames;

  private authData?: IAuthData;

  showCheckinModal = false;
  private isFirstTimeEntering!: boolean;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly CommonConstants = CommonConstants;
  protected readonly PageRoutes = PageRoutes;

  constructor(
    private emotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.initHeader();
    this.authService.getAuthData().then(authData => {
      this.authData = authData;
      this.loadMonthlyCheckIns();
      this.loadEmotionDiaryEntries().finally(() => this.checkFirstTimeEntering());
    });
  }

  /**
   * Handle page lifecycle when entering
   */
  ionViewDidEnter() {
    if (this.journalEntries) this.handleRefresh();
  }

  /**
   * Handle refresh event
   * @param event Refresh event
   */
  public handleRefresh(event?: RefresherCustomEvent): void {
    if (this.isLoading || !this.authData) {
      event?.target.complete();
      return;
    }
    this.loadEmotionDiaryEntries().finally(() => event?.target.complete());
  }

  /**
   * Handle date selection from calendar
   * @param day
   */
  public onDateSelected(day: { date: Date, entry?: ILiyYdmsEmotionalDiary, isToday?: boolean }): void {
    if (day.entry) {
      this.router.navigateByUrl(`${PageRoutes.DAILY_EMOTION_JOURNAL}/${day.entry.id}`);
      return;
    }
    if (!day.isToday) return;
    this.router.navigateByUrl(`${PageRoutes.DAILY_EMOTION_JOURNAL}/${PageRoutes.EMOTION_CHECKIN}`)
  }

  /**
   * Handle month change from calendar
   * @param data Month change event with month and year
   */
  public async onMonthChanged(data: { month: number, year: number }): Promise<void> {
    this.selectedMonth = data?.month;
    this.selectYear = data?.year;
    await this.loadEmotionDiaryEntries();
  }

  /**
   * Load emotion diary entries for a specific month
   */
  private async loadEmotionDiaryEntries(): Promise<void> {
    if (!this.authData || this.isLoading) return;
    this.isLoading = true;

    this.journalEntries = await this.emotionalDiaryService.getUserEmotionDiaryListInMonth(
      this.authData.id, 0, 31, OrderBy.CREATE_AT_DESC, this.selectedMonth, this.selectYear
    );

    this.isLoading = false;
  }

  /**
   * Load streak check on month
   * @private
   */
  private loadMonthlyCheckIns(): void {
    if (!this.authData) return;
    this.emotionalDiaryService.getStreakEmotionDiaryInMonth(this.authData.id)
      .then((monthlyCheckIns) => this.monthlyCheckIns = monthlyCheckIns || 0);
  }

  /**
   * Initialize header configuration
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'daily_emotion_journal',
      imageUrl: '/assets/images/daily_emotion_journal.png',
      width: '160px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '0',
        bottom: '0'
      }
    };
  }

  /**
   * Checking first time entering to show checkin dialog
   * @private
   */
  private checkFirstTimeEntering(): void {
    setTimeout(() => {
      if (this.isFirstTimeEntering) return;
      this.isFirstTimeEntering = true;
      const today = new Date();
      const todayEntry = this.findEntryForDate(today);
      this.showCheckinModal = !todayEntry;
    }, 1000);
  }

  /**
   * Find journal entry for a specific date
   * @param date Date to check
   * @returns Journal entry or undefined
   */
  private findEntryForDate(date: Date): ILiyYdmsEmotionalDiary | undefined {
    if (!this.journalEntries || this.journalEntries.length === 0) return undefined;
    const entryDateStr = formatDate(date.toString(), DateFormat.SERVER_DATE, LanguageKeys.EN);
    return this.journalEntries.find(entry => entryDateStr === entry.create_date);
  }
}
