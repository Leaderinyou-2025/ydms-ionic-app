import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelfDiscoverySurveyPage } from './self-discovery-survey.page';
import { SelfDiscoverySurveyDetailComponent } from './self-discovery-survey-detail/self-discovery-survey-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SelfDiscoverySurveyPage
  },
  {
    path: ':id',
    component: SelfDiscoverySurveyDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelfDiscoverySurveyPageRoutingModule {}
