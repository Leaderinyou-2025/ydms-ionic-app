import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

import { ExpertGuidePageRoutingModule } from './expert-guide-routing.module';

import { ExpertGuidePage } from './expert-guide.page';
import { ExpertGuideDetailComponent } from './expert-guide-detail/expert-guide-detail.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ExpertGuidePageRoutingModule,
        SharedModule,
        TranslatePipe
    ],
  declarations: [ExpertGuidePage, ExpertGuideDetailComponent]
})
export class ExpertGuidePageModule {}
