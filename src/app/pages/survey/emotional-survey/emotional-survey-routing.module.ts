import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmotionalSurveyPage } from './emotional-survey.page';
import { EmotionalSurveyDetailComponent } from './emotional-survey-detail/emotional-survey-detail.component';

const routes: Routes = [
  {
    path: '',
    component: EmotionalSurveyPage
  },
  {
    path: ':id',
    component: EmotionalSurveyDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmotionalSurveyPageRoutingModule {}
