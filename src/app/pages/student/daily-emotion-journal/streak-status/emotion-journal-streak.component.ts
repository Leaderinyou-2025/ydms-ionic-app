import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { LiyYdmsEmotionalDiaryService } from '../../../../services/models/liy.ydms.emotional.diary.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { CommonConstants } from '../../../../shared/classes/common-constants';

@Component({
  selector: 'app-emotion-journal-streak',
  templateUrl: './emotion-journal-streak.component.html',
  styleUrls: ['./emotion-journal-streak.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule]
})
export class EmotionJournalStreakComponent implements OnInit {
  protected readonly TranslateKeys = TranslateKeys;

  monthlyCheckIns: number = 0;
  daysInMonth: number = 0;

  constructor(
    private emotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadMonthlyCheckIns();
    this.daysInMonth = CommonConstants.getDaysInMonth();
  }

  private async loadMonthlyCheckIns() {
    try {
      const authData = await this.authService.getAuthData();
      if (authData?.id) {
        this.monthlyCheckIns = await this.emotionalDiaryService.getStreakEmotionDiaryInMonth(authData.id);
      }
    } catch (error) {
      console.error('ERROR loading monthly check-ins:', error);
    }
  }
}
