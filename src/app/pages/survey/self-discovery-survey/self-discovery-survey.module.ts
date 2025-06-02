import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { SelfDiscoverySurveyPageRoutingModule } from './self-discovery-survey-routing.module';
import { SelfDiscoverySurveyPage } from './self-discovery-survey.page';
import { SelfDiscoverySurveyDetailComponent } from './self-discovery-survey-detail/self-discovery-survey-detail.component';
import {SharedModule} from "../../../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelfDiscoverySurveyPageRoutingModule,
    TranslateModule,
    SharedModule
  ],
  declarations: [
    SelfDiscoverySurveyPage,
    SelfDiscoverySurveyDetailComponent
  ]
})
export class SelfDiscoverySurveyPageModule {}
