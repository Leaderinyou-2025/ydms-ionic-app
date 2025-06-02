import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { FamilyConflictSurveyPageRoutingModule } from './family-conflict-survey-routing.module';
import { FamilyConflictSurveyPage } from './family-conflict-survey.page';
import { FamilyConflictSurveyDetailComponent } from './family-conflict-survey-detail/family-conflict-survey-detail.component';
import {SharedModule} from "../../../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FamilyConflictSurveyPageRoutingModule,
    TranslateModule,
    SharedModule
  ],
  declarations: [
    FamilyConflictSurveyPage,
    FamilyConflictSurveyDetailComponent
  ]
})
export class FamilyConflictSurveyPageModule {}
