import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { TeacherDashboardPageRoutingModule } from './teacher-dashboard-routing.module';
import { TeacherDashboardPage } from './teacher-dashboard.page';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        TeacherDashboardPageRoutingModule,
        SharedModule
    ],
  declarations: [TeacherDashboardPage]
})
export class TeacherDashboardPageModule {}
