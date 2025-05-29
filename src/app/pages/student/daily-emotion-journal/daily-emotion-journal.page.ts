import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, take, BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

import { EmotionJournalCalendarComponent } from './calendar/emotion-journal-calendar.component';
import { EmotionJournalStreakComponent } from './streak-status/emotion-journal-streak.component';
import { SharedModule } from '../../../shared/shared.module';

import { ILiyYdmsEmotionalDiary } from '../../../shared/interfaces/models/liy.ydms.emotional.diary';

import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { IHeaderAnimeImage } from '../../../shared/interfaces/header/header';
import { LiyYdmsEmotionalDiaryService } from '../../../services/models/liy.ydms.emotional.diary.service';
import { AuthService } from '../../../services/auth/auth.service';

import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { OrderBy } from '../../../shared/enums/order-by';

@Component({
  selector: 'app-daily-emotion-journal',
  templateUrl: './daily-emotion-journal.page.html',
  styleUrls: ['./daily-emotion-journal.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    EmotionJournalCalendarComponent,
    EmotionJournalStreakComponent,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DailyEmotionJournalPage implements OnInit {
  // Header configuration
  animeImage!: IHeaderAnimeImage;

  // Journal entries
  journalEntries$!: ILiyYdmsEmotionalDiary[];

  // Loading status
  isLoading$!: Observable<boolean>;

  // Selected date
  selectedDate: Date = new Date();

  // Loading state
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  // Current user data
  private currentUser: IAuthData | undefined;

  // Flag to track if this is the first time entering the page
  private isFirstTimeEntering: boolean = true;

  // Expose TranslateKeys to template
  protected readonly TranslateKeys = TranslateKeys;

  constructor(
    private emotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private authService: AuthService,
    private toastController: ToastController,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  ngOnInit() {
    this.initHeader();
    this.loadData();
  }

  /**
   * Handle page lifecycle when entering
   */
  ionViewWillEnter() {
    if (!this.isFirstTimeEntering) {
      this.refreshData();
    }
  }

  /**
   * Initialize header configuration
   */
  private initHeader(): void {

    this.animeImage = {
      name: 'daily_emotion_journal',
      imageUrl: '/assets/images/daily_emotion_journal.png',
      width: '250px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '-50px',
        bottom: '10px'
      }
    };
  }

  /**
   * Load data from service (includes auto-navigation logic for first time)
   */
  private async loadData(): Promise<void> {
    try {
      this.isLoadingSubject.next(true);
      this.currentUser = await this.authService.getAuthData();
      if (!this.currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      await this.loadEmotionDiaryEntries(this.currentUser.id, currentMonth, currentYear);

      if (this.isFirstTimeEntering) {
        await this.checkAndShowTodayEntryIfNeeded();
        this.isFirstTimeEntering = false;
      }

    } catch (error) {
      console.error('ERROR:', error);
      const message = this.translateService.instant('ERROR.unknown');
      this.showToast(message);
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Check if today has incomplete entry and automatically show detail page for first-time users
   */
  private async checkAndShowTodayEntryIfNeeded(): Promise<void> {
    try {
      const today = new Date();
      const todayEntry = this.findEntryForDate(today);

      if (todayEntry && todayEntry.id && !this.hasValidAnswerId(todayEntry)) {

        setTimeout(async () => {
          const navigationResult = await this.router.navigate(['detail', todayEntry.id], {
            relativeTo: this.route,
            state: {
              editEntry: todayEntry,
              selectedDate: today,
              isAutoShow: true
            }
          });

        }, 100);
      }
    } catch (error) {
      console.error('ERROR in checkAndShowTodayEntryIfNeeded:', error);
    }
  }

  /**
   * Load emotion diary entries for a specific month
   * @param teenagerId User ID
   * @param month Month (1-12)
   * @param year Year
   */
  private async loadEmotionDiaryEntries(teenagerId: number, month: number, year: number): Promise<void> {
    try {
      const daysInMonth = new Date(year, month, 0).getDate();
      const emotionDiaryEntries = await this.emotionalDiaryService.getUserEmotionDiaryListInMonth(
        teenagerId,
        0,
        daysInMonth,
        OrderBy.CREATE_AT_DESC,
        month,
        year
      );

      let filteredEntries = emotionDiaryEntries;

      this.journalEntries$ = filteredEntries;

    } catch (error) {
      console.error('ERROR loading emotion diary entries:', error);
      throw error;
    }
  }

  /**
   * Refresh data from service (without auto-navigation logic)
   */
  public async refreshData(): Promise<void> {
    if (!this.currentUser?.id) {
      try {
        this.currentUser = await this.authService.getAuthData();
        if (!this.currentUser?.id) {
          throw new Error('User not authenticated');
        }
      } catch (error) {
        console.error('ERROR getting user data in refreshData:', error);
        return;
      }
    }

    try {
      this.isLoadingSubject.next(true);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      await this.loadEmotionDiaryEntries(this.currentUser.id, currentMonth, currentYear);

    } catch (error) {
      console.error('ERROR:', error);
      const message = this.translateService.instant('ERROR.unknown');
      this.showToast(message);
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Handle refresh event
   * @param event Refresh event
   */
  public async handleRefresh(event: any): Promise<void> {
    try {
      await this.refreshData();
    } catch (error) {
      console.error('ERROR in handleRefresh:', error);
    } finally {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    }
  }

  /**
   * Handle date selection from calendar
   * @param date Selected date
   */
  public async onDateSelected(date: Date): Promise<void> {
    this.selectedDate = date;

    const existingEntry = this.findEntryForDate(date);

    try {
      if (existingEntry && existingEntry.id) {
        this.router.navigate(['detail', existingEntry.id], {
          relativeTo: this.route,
          state: {
            editEntry: existingEntry,
            selectedDate: date
          }
        });
      } else {
        const message = this.translateService.instant(TranslateKeys.DAILY_EMOTION_JOURNAL_NO_ENTRY_FOR_DATE);
        this.showToast(message);
      }
    } catch (error) {
      console.error('ERROR navigating to emotion journal detail:', error);
      const message = this.translateService.instant('ERROR.unknown');
      this.showToast(message);
    }
  }

  /**
   * Find journal entry for a specific date
   * @param date Date to check
   * @returns Journal entry or undefined
   */
  private findEntryForDate(date: Date): ILiyYdmsEmotionalDiary | undefined {
    if (!this.journalEntries$ || this.journalEntries$.length === 0) return undefined;

    return this.journalEntries$.find(entry => {
      if (!entry.create_date) return false;

      const entryDate = new Date(entry.create_date);
      return entryDate.getDate() === date.getDate() &&
             entryDate.getMonth() === date.getMonth() &&
             entryDate.getFullYear() === date.getFullYear();
    });
  }

  /**
   * Check if entry has valid answer_id
   * @param entry Journal entry
   * @returns True if entry has valid answer_id
   */
  private hasValidAnswerId(entry?: ILiyYdmsEmotionalDiary): boolean {
    return !!(entry && entry.answer_id && entry.answer_id.id);
  }

  /**
   * Handle month change from calendar
   * @param event Month change event with month and year
   */
  public async onMonthChanged(event: { month: number, year: number }): Promise<void> {
    if (!this.currentUser?.id) {
      console.warn('User not authenticated, cannot load month data');
      return;
    }

    try {
      this.isLoadingSubject.next(true);

      await this.loadEmotionDiaryEntries(
        this.currentUser.id,
        event.month,
        event.year
      );

    } catch (error) {
      console.error('ERROR loading entries for month:', error);
      const message = this.translateService.instant('ERROR.unknown');
      this.showToast(message);
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Show toast message
   * @param message Message to show
   */
  private async showToast(message: string): Promise<void> {
    try {
      const toast = await this.toastController.create({
        message,
        duration: 2000,
        position: 'top',
        cssClass: 'font-comic-sans'
      });
      await toast.present();
    } catch (error) {
      console.error('ERROR showing toast:', error);
    }
  }


}
