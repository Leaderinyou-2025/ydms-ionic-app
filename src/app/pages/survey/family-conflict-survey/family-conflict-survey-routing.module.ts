import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FamilyConflictSurveyPage } from './family-conflict-survey.page';
import { FamilyConflictSurveyDetailComponent } from './family-conflict-survey-detail/family-conflict-survey-detail.component';

const routes: Routes = [
  {
    path: '',
    component: FamilyConflictSurveyPage
  },
  {
    path: ':id',
    component: FamilyConflictSurveyDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FamilyConflictSurveyPageRoutingModule {}
