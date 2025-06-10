import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeenagerSharedEmotionPageRoutingModule } from './teenager-shared-emotion-routing.module';

import { TeenagerSharedEmotionPage } from './teenager-shared-emotion.page';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TeenagerSharedEmotionPageRoutingModule,
        SharedModule
    ],
  declarations: [TeenagerSharedEmotionPage]
})
export class TeenagerSharedEmotionPageModule {}
