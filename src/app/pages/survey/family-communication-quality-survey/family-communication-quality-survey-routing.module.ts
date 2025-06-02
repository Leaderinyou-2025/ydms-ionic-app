import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FamilyCommunicationQualitySurveyPage } from './family-communication-quality-survey.page';
import { FamilyCommunicationQualitySurveyDetailComponent } from './family-communication-quality-survey-detail/family-communication-quality-survey-detail.component';

const routes: Routes = [
  {
    path: '',
    component: FamilyCommunicationQualitySurveyPage
  },
  {
    path: ':id',
    component: FamilyCommunicationQualitySurveyDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FamilyCommunicationQualitySurveyPageRoutingModule {}
