import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

import { DailyEmotionJournalPageRoutingModule } from './daily-emotion-journal-routing.module';
import { DailyEmotionJournalPage } from './daily-emotion-journal.page';
import { SharedModule } from '../../../shared/shared.module';
import { EmotionJournalCalendarComponent } from './emotion-journal-calendar/emotion-journal-calendar.component';
import { EmotionCheckinComponent } from './emotion-checkin/emotion-checkin.component';
import { EmotionJournalDetailComponent } from './emotion-journal-detail/emotion-journal-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DailyEmotionJournalPageRoutingModule,
    TranslatePipe,
    SharedModule
  ],
  declarations: [
    DailyEmotionJournalPage,
    EmotionJournalCalendarComponent,
    EmotionJournalDetailComponent,
    EmotionCheckinComponent
  ]
})
export class DailyEmotionJournalPageModule {
}
