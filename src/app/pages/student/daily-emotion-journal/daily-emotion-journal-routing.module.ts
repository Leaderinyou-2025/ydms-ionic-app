import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DailyEmotionJournalPage } from './daily-emotion-journal.page';
import { EmotionJournalDetailComponent } from './detail/emotion-journal-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DailyEmotionJournalPage
  },
  {
    path: 'detail/:id',
    component: EmotionJournalDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailyEmotionJournalPageRoutingModule {}
