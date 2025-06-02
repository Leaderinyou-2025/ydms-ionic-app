import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { FamilyDialogueSessionPageRoutingModule } from './family-dialogue-session-routing.module';
import { FamilyDialogueSessionPage } from './family-dialogue-session.page';
import { FamilyDialogueSessionDetailComponent } from './family-dialogue-session-detail/family-dialogue-session-detail.component';
import { SharedModule } from "../../../../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FamilyDialogueSessionPageRoutingModule,
    TranslateModule,
    SharedModule
  ],
  declarations: [
    FamilyDialogueSessionPage,
    FamilyDialogueSessionDetailComponent
  ]
})
export class FamilyDialogueSessionPageModule {}
