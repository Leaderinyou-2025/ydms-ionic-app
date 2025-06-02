import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { FamilyCommunicationQualitySurveyPageRoutingModule } from './family-communication-quality-survey-routing.module';
import { FamilyCommunicationQualitySurveyPage } from './family-communication-quality-survey.page';
import { FamilyCommunicationQualitySurveyDetailComponent } from './family-communication-quality-survey-detail/family-communication-quality-survey-detail.component';
import {SharedModule} from "../../../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FamilyCommunicationQualitySurveyPageRoutingModule,
    TranslateModule,
    SharedModule
  ],
  declarations: [
    FamilyCommunicationQualitySurveyPage,
    FamilyCommunicationQualitySurveyDetailComponent
  ]
})
export class FamilyCommunicationQualitySurveyPageModule {}
