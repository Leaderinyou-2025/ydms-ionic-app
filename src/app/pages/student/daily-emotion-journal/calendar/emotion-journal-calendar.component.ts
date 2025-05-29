import { Component, EventEmitter, Input, OnChanges, OnInit, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import {ILiyYdmsEmotionalDiary} from "../../../../shared/interfaces/models/liy.ydms.emotional.diary";

@Component({
  selector: 'app-emotion-journal-calendar',
  templateUrl: './emotion-journal-calendar.component.html',
  styleUrls: ['./emotion-journal-calendar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmotionJournalCalendarComponent implements OnInit, OnChanges {
  @Input() journalEntries: ILiyYdmsEmotionalDiary[] = [];
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() monthChanged = new EventEmitter<{ month: number, year: number }>();

  currentDate: Date = new Date();
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: Array<{ date: Date, entry?: ILiyYdmsEmotionalDiary }> = [];

  weekdays: string[] = [];
  monthNames: string[] = [];

  protected readonly TranslateKeys = TranslateKeys;

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.initializeLocalization();
    this.generateCalendar();
  }

  ngOnChanges() {
    this.generateCalendar();
  }

  /**
   * Initialize localization for weekdays and month names
   */
  private initializeLocalization(): void {
    // Get localized weekday names
    this.weekdays = [
      this.translate.instant('CALENDAR.sunday_short'),
      this.translate.instant('CALENDAR.monday_short'),
      this.translate.instant('CALENDAR.tuesday_short'),
      this.translate.instant('CALENDAR.wednesday_short'),
      this.translate.instant('CALENDAR.thursday_short'),
      this.translate.instant('CALENDAR.friday_short'),
      this.translate.instant('CALENDAR.saturday_short')
    ];

    // Get localized month names
    this.monthNames = [
      this.translate.instant('CALENDAR.january'),
      this.translate.instant('CALENDAR.february'),
      this.translate.instant('CALENDAR.march'),
      this.translate.instant('CALENDAR.april'),
      this.translate.instant('CALENDAR.may'),
      this.translate.instant('CALENDAR.june'),
      this.translate.instant('CALENDAR.july'),
      this.translate.instant('CALENDAR.august'),
      this.translate.instant('CALENDAR.september'),
      this.translate.instant('CALENDAR.october'),
      this.translate.instant('CALENDAR.november'),
      this.translate.instant('CALENDAR.december')
    ];
  }

  /**
   * Generate calendar days for current month
   */
  private generateCalendar(): void {
    this.calendarDays = [];

    // Get first day of month
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const startingDayOfWeek = firstDay.getDay();

    // Get last day of month
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const totalDays = lastDay.getDate();

    // Get days from previous month to fill first week
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevMonthLastDay - i);
      this.calendarDays.push({ date });
    }

    // Add days of current month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const entry = this.findEntryForDate(date);
      this.calendarDays.push({ date, entry });
    }

    // Add days from next month to complete the grid (6 rows x 7 columns = 42 cells)
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.calendarDays.push({ date });
    }
  }

  /**
   * Find journal entry for a specific date
   * @param date Date to check
   * @returns Journal entry or undefined
   */
  private findEntryForDate(date: Date): ILiyYdmsEmotionalDiary | undefined {
    if (!this.journalEntries || this.journalEntries.length === 0) return undefined;

    return this.journalEntries.find(entry => {
      if (!entry.create_date) return false;

      const entryDate = new Date(entry.create_date);
      return entryDate.getDate() === date.getDate() &&
             entryDate.getMonth() === date.getMonth() &&
             entryDate.getFullYear() === date.getFullYear();
    });
  }

  /**
   * Check if date is in current month
   * @param date Date to check
   * @returns True if date is in current month
   */
  public isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth;
  }

  /**
   * Check if date is today
   * @param date Date to check
   * @returns True if date is today
   */
  public isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  /**
   * Check if today has no entry or incomplete entry (for warning display)
   * @param date Date to check
   * @returns True if date is today and has no entry or incomplete entry
   */
  public isTodayWithoutEntry(date: Date): boolean {
    if (!this.isToday(date)) {
      return false;
    }

    const entry = this.findEntryForDate(date);

    // No entry at all
    if (!entry) {
      return true;
    }

    // Entry exists but no answer selected (answer_id is null/undefined or has no id)
    // IRelatedField has structure {id: number, name: string}, when empty the id is falsy
    if (!entry.answer_id || !entry.answer_id.id) {
      return true;
    }

    return false;
  }

  /**
   * Check if entry has valid answer_id
   * @param entry Journal entry
   * @returns True if entry has valid answer_id
   */
  public hasValidAnswerId(entry?: ILiyYdmsEmotionalDiary): boolean {
    return !!(entry && entry.answer_id && entry.answer_id.id);
  }

  /**
   * Check if today entry is complete
   * @param date Date to check
   * @param entry Entry for the date
   * @returns True if today and entry is complete
   */
  public isTodayComplete(date: Date, entry?: ILiyYdmsEmotionalDiary): boolean {
    return this.isToday(date) && this.hasValidAnswerId(entry);
  }

  /**
   * Select a date from calendar
   * @param day Calendar day
   */
  public selectDate(day: { date: Date, entry?: ILiyYdmsEmotionalDiary }): void {
    this.dateSelected.emit(day.date);
  }



  /**
   * Get base64 icon for display
   * @param entry Journal entry
   * @returns Base64 icon string or empty string
   */
  public getEntryIcon(entry?: ILiyYdmsEmotionalDiary): string {
    if (!entry?.answer_icon) return '';

    // If the base64 string already includes the data URL prefix, return as is
    if (entry.answer_icon.startsWith('data:')) {
      return entry.answer_icon;
    }

    // Otherwise, add the SVG data URL prefix
    return `data:image/svg+xml;base64,${entry.answer_icon}`;
  }

  /**
   * Go to previous month
   */
  public previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
    this.emitMonthChanged();
  }

  /**
   * Go to next month
   */
  public nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
    this.emitMonthChanged();
  }

  /**
   * Go to current month
   */
  public goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar();
    this.emitMonthChanged();
  }

  /**
   * Emit month changed event
   */
  private emitMonthChanged(): void {
    this.monthChanged.emit({
      month: this.currentMonth + 1, // Convert to 1-12 format
      year: this.currentYear
    });
  }
}
