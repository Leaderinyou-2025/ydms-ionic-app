import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ParentDashboardPageRoutingModule } from './parent-dashboard-routing.module';
import { ParentDashboardPage } from './parent-dashboard.page';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        ParentDashboardPageRoutingModule,
        SharedModule
    ],
  declarations: [ParentDashboardPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ParentDashboardPageModule {}
