import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { DailyEmotionJournalPageRoutingModule } from './daily-emotion-journal-routing.module';
import { DailyEmotionJournalPage } from './daily-emotion-journal.page';
import { EmotionJournalCalendarComponent } from './calendar/emotion-journal-calendar.component';
import { EmotionJournalStreakComponent } from './streak-status/emotion-journal-streak.component';
import { EmotionJournalDetailComponent } from './detail/emotion-journal-detail.component';
import { SharedModule } from '../../../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DailyEmotionJournalPageRoutingModule,
    TranslateModule,
    SharedModule,
    DailyEmotionJournalPage,
    EmotionJournalDetailComponent,
    EmotionJournalCalendarComponent,
    EmotionJournalStreakComponent
  ],
  declarations: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DailyEmotionJournalPageModule {}
