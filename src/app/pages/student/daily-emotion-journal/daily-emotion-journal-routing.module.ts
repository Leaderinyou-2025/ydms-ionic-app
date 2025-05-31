import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DailyEmotionJournalPage } from './daily-emotion-journal.page';
import { EmotionCheckinComponent } from './emotion-checkin/emotion-checkin.component';
import { EmotionJournalDetailComponent } from './emotion-journal-detail/emotion-journal-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DailyEmotionJournalPage
  },
  {
    path: 'emotion-checkin',
    component: EmotionCheckinComponent
  },
  {
    path: ':id',
    component: EmotionJournalDetailComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailyEmotionJournalPageRoutingModule {
}
