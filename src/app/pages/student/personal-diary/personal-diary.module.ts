import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { PersonalDiaryPageRoutingModule } from './personal-diary-routing.module';

import { PersonalDiaryPage } from './personal-diary.page';
import { SharedModule } from '../../../shared/shared.module';
import { SelectSuggestionGuideComponent } from './select-suggestion-guide/select-suggestion-guide.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonalDiaryPageRoutingModule,
    TranslateModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [PersonalDiaryPage, SelectSuggestionGuideComponent]
})
export class PersonalDiaryPageModule {
}
