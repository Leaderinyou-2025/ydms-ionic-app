import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, Platform, ToastController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { SharedModule } from '../../../../shared/shared.module';
import { ILiyYdmsEmotionalAnswerOption } from '../../../../shared/interfaces/models/liy.ydms.emotional.answer.option';
import { ILiyYdmsEmotionalQuestion } from '../../../../shared/interfaces/models/liy.ydms.emotional.question';
import { ILiyYdmsEmotionalDiary } from '../../../../shared/interfaces/models/liy.ydms.emotional.diary';
import { IPublicUser, PublicShareTargetType } from '../../../../shared/components/emotion-share/emotion-share.component';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { EmotionIconSelectorComponent } from '../../../../shared/components/emotion-icon-selector/emotion-icon-selector.component';
import { EmotionShareComponent } from '../../../../shared/components/emotion-share/emotion-share.component';
import { LiyYdmsEmotionalQuestionService } from '../../../../services/models/liy.ydms.emotional.question.service';
import { LiyYdmsEmotionalAnswerOptionService } from '../../../../services/models/liy.ydms.emotional.answer.option.service';
import { LiyYdmsEmotionalDiaryService } from '../../../../services/models/liy.ydms.emotional.diary.service';

import { AuthService } from '../../../../services/auth/auth.service';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { OrderBy } from '../../../../shared/enums/order-by';
import {IEmotionJournal} from "../../../../shared/interfaces/function-data/emtion-journal";

@Component({
  selector: 'app-detail',
  templateUrl: './emotion-journal-detail.component.html',
  styleUrls: ['./emotion-journal-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule, FormsModule, SharedModule, EmotionIconSelectorComponent, EmotionShareComponent]
})
export class EmotionJournalDetailComponent implements OnInit {
  emotionAnswerOptions: ILiyYdmsEmotionalAnswerOption[] = [];
  selectedDate: Date = new Date();
  selectedEmotionOption: ILiyYdmsEmotionalAnswerOption | null = null;
  selectedQuestion: ILiyYdmsEmotionalQuestion | null = null;

  // Current user data for context-based filtering
  authData?: IAuthData;

  // Entry data
  existingEntry?: ILiyYdmsEmotionalDiary;

  // Share data from emotion-share component
  shareData: {
    public_emotional: boolean,
    public_emotional_to: PublicShareTargetType,
    public_user_ids: number[]
  } = {
    public_emotional: false,
    public_emotional_to: PublicShareTargetType.FRIENDS,
    public_user_ids: []
  };

  protected readonly TranslateKeys = TranslateKeys;

  constructor(
    private translateService: TranslateService,
    private platform: Platform,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private toastController: ToastController,
    private emotionalQuestionService: LiyYdmsEmotionalQuestionService,
    private emotionalAnswerOptionService: LiyYdmsEmotionalAnswerOptionService,
    private emotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private authService: AuthService
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.cancel();
    });

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.selectedDate = navigation.extras.state['selectedDate'] || new Date();

      if (navigation.extras.state['editEntry']) {
        this.existingEntry = navigation.extras.state['editEntry'];
      }
    }
  }

  async ngOnInit() {
    try {
      this.authData = await this.authService.getAuthData();

      const entryId = this.route.snapshot.paramMap.get('id');
      const navigation = this.router.getCurrentNavigation();
      const routerState = navigation?.extras.state;
      if (entryId && entryId !== 'new') {
        const entryIdNumber = parseInt(entryId, 10);

        if (routerState?.['editEntry']) {
          this.existingEntry = routerState['editEntry'];

          if (this.existingEntry?.write_date) {
            this.selectedDate = new Date(this.existingEntry.write_date);
          }

          await this.populateFormWithExistingData();
        } else {
          console.warn('No entry data in router state, attempting to load by ID:', entryIdNumber);
          await this.loadEntryById(entryIdNumber);
        }
      }
    } catch (error) {
      console.error('ERROR in ngOnInit:', error);
    }
  }

  /**
   * Handle emotion selection from the emotion-icon-selector component
   * @param emotion Selected emotion icon
   */
  onEmotionSelected(emotion: ILiyYdmsEmotionalAnswerOption): void {
    this.selectedEmotionOption = emotion;
  }

  /**
   * Get initial public emotional to value with proper type casting
   * @returns PublicShareTargetType
   */
  getInitialPublicEmotionalTo(): PublicShareTargetType {
    if (!this.existingEntry?.public_emotional_to) {
      return PublicShareTargetType.FRIENDS;
    }

    const value = this.existingEntry.public_emotional_to;
    switch (value) {
      case 'friend':
        return PublicShareTargetType.FRIENDS;
      case 'parent':
        return PublicShareTargetType.PARENT;
      case 'teacher':
        return PublicShareTargetType.TEACHER;
      default:
        return PublicShareTargetType.FRIENDS;
    }
  }

  /**
   * Get public user IDs from existing entry
   * @returns Array of user IDs
   */
  getPublicUserIds(): number[] {
    if (!this.existingEntry?.public_user_ids) {
      return [];
    }

    if (Array.isArray(this.existingEntry.public_user_ids)) {
      const userIds = this.existingEntry.public_user_ids.map(user => {
        if (typeof user === 'number') {
          return user;
        } else if (user && typeof user === 'object' && user.id) {
          return user.id;
        }
        return 0;
      }).filter(id => id > 0);
      return userIds;
    }

    return [];
  }

  /**
   * Load entry by ID as fallback when router state is not available
   * @param entryId ID of the entry to load
   */
  private async loadEntryById(entryId: number): Promise<void> {
    try {
      if (!this.authData?.id) {
        console.error('ERROR: No auth data available');
        this.cancel();
        return;
      }

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const entries = await this.emotionalDiaryService.getUserEmotionDiaryListInMonth(
        this.authData.id,
        0,
        50,
        OrderBy.CREATE_AT_DESC,
        currentMonth,
        currentYear
      );

      const entry = entries.find(e => e.id === entryId);

      if (entry) {
        this.existingEntry = entry;

        if (entry.write_date) {
          this.selectedDate = new Date(entry.write_date);
        }

        await this.populateFormWithExistingData();
      } else {
        console.error('ERROR: Entry not found with ID:', entryId);
        this.cancel();
      }
    } catch (error) {
      console.error('ERROR loading entry by ID:', error);
      this.cancel();
    }
  }

  /**
   * Load question from diary details (for create mode)
   */
  private async loadQuestionFromDiaryDetails(): Promise<void> {
    try {
      if (!this.authData?.id) {
        console.error('ERROR: No auth data available');
        return;
      }

      const pendingEntries = await this.emotionalDiaryService.getUserEmotionDiaryPending(
        this.authData.id,
        0,
        1
      );

      if (pendingEntries.length > 0 && pendingEntries[0].question_id?.id) {
        this.selectedQuestion = await this.emotionalQuestionService.getQuestionById(pendingEntries[0].question_id.id);
      } else {
        const questions = await this.emotionalQuestionService.getQuestionList([], 0, 1);
        if (questions.length > 0) {
          this.selectedQuestion = questions[0];
        }
      }

      if (this.selectedQuestion?.id) {
        await this.loadAnswerOptions();

        if (this.emotionAnswerOptions.length > 0 && !this.selectedEmotionOption) {
          this.selectedEmotionOption = this.emotionAnswerOptions[0];
        }
      }

    } catch (error) {
      console.error('ERROR loading question from diary details:', error);
      this.selectedQuestion = null;
      this.emotionAnswerOptions = [];
    }
  }

  /**
   * Populate form with existing entry data for edit mode
   */
  private async populateFormWithExistingData(): Promise<void> {
    if (!this.existingEntry) return;

    try {
      if (this.existingEntry.question_id?.id) {
        this.selectedQuestion = await this.emotionalQuestionService.getQuestionById(this.existingEntry.question_id.id);

        if (this.selectedQuestion?.id) {
          await this.loadAnswerOptions();

          if (this.existingEntry.answer_id?.id) {
            const matchingOption = this.emotionAnswerOptions.find(
              option => option.id === this.existingEntry?.answer_id?.id
            );
            if (matchingOption) {
              this.selectedEmotionOption = matchingOption;
            } else {
              console.warn('No matching emotion option found for answer_id:', this.existingEntry.answer_id.id);
              console.warn('Available options:', this.emotionAnswerOptions);
            }
          } else {
            if (this.emotionAnswerOptions.length > 0) {
              this.selectedEmotionOption = this.emotionAnswerOptions[0];
            }
          }
        }
      }

    } catch (error) {
      console.error('ERROR populating form with existing data:', error);
    }
  }

  /**
   * Load answer options for the selected question
   */
  private async loadAnswerOptions(): Promise<void> {
    try {
      if (this.selectedQuestion?.id) {
        this.emotionAnswerOptions = await this.emotionalAnswerOptionService.getAnswerOptionsByQuestionId(this.selectedQuestion.id);
      } else {
        this.emotionAnswerOptions = [];
      }
    } catch (error) {
      console.error('ERROR loading answer options:', error);
      this.emotionAnswerOptions = [];
    }
  }

  /**
   * Handle emotion sharing
   * @param shareData Share data from emotion-share component
   */
  onShareEmotion(shareData: {
    public_emotional: boolean,
    public_emotional_to: PublicShareTargetType,
    public_user_ids: number[]
  }): void {
    this.shareData = shareData;
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    sessionStorage.removeItem('emotion-journal-popup-shown');
    this.location.back();
  }

  /**
   * Handle ESC key press
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.cancel();
  }

  /**
   * Save emotion journal entry (create or update)
   */
  async save(): Promise<void> {
    try {
      if (!this.selectedEmotionOption) {
        console.error('ERROR: No emotion selected');
        const message = this.translateService.instant(TranslateKeys.ERROR_NO_EMOTION_SELECTED);
        this.showToast(message);
        return;
      }

      if (!this.authData) {
        console.error('ERROR: No auth data available');
        const message = this.translateService.instant(TranslateKeys.ERROR_NO_AUTH_DATA);
        this.showToast(message);
        return;
      }

      const journalData: Partial<IEmotionJournal> = {
        answer_id: this.selectedEmotionOption.id,
        public_emotional: this.shareData.public_emotional,
        public_emotional_to: this.shareData.public_emotional_to,
        public_user_ids: this.shareData.public_user_ids.map(userId => [4, userId])
      };

      let result: any;
      let successMessage: string;
      let errorMessage: string;

      if (this.existingEntry?.id) {
        result = await this.emotionalDiaryService.updateEmotionDiary(this.existingEntry.id, journalData);
        successMessage = this.translateService.instant(TranslateKeys.DAILY_EMOTION_JOURNAL_ENTRY_UPDATED);
        errorMessage = this.translateService.instant(TranslateKeys.DAILY_EMOTION_JOURNAL_ENTRY_UPDATE_FAILED);
      } else {
        console.error('ERROR: No existing entry to update');
        const message = this.translateService.instant('ERROR.unknown');
        this.showToast(message);
        return;
      }

      if (result) {
        this.showToast(successMessage);
        sessionStorage.removeItem('emotion-journal-popup-shown');
        this.router.navigate(['/daily-emotion-journal']);
      } else {
        this.showToast(errorMessage);
      }
    } catch (error) {
      console.error('ERROR in save:', error);
      const message = this.translateService.instant(TranslateKeys.ERROR_UNKNOWN);
      this.showToast(message);
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
