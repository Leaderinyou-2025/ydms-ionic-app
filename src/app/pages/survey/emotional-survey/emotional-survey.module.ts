import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

import { EmotionalSurveyPageRoutingModule } from './emotional-survey-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { EmotionalSurveyPage } from './emotional-survey.page';
import { EmotionalSurveyDetailComponent } from './emotional-survey-detail/emotional-survey-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmotionalSurveyPageRoutingModule,
    TranslatePipe,
    SharedModule
  ],
  declarations: [
    EmotionalSurveyPage,
    EmotionalSurveyDetailComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmotionalSurveyPageModule {}
