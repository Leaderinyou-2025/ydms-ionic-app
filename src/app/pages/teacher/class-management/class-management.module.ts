import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ClassManagementPageRoutingModule } from './class-management-routing.module';
import { ClassManagementPage } from './class-management.page';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ClassManagementPageRoutingModule,
    SharedModule
  ],
  declarations: [ClassManagementPage]
})
export class ClassManagementPageModule {}
