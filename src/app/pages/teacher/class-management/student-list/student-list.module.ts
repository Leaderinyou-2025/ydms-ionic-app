import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { StudentListPageRoutingModule } from './student-list-routing.module';
import { StudentListPage } from './student-list.page';
import { StudentDetailComponent } from './student-detail/student-detail.component';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    StudentListPageRoutingModule,
    SharedModule
  ],
  declarations: [StudentListPage, StudentDetailComponent]
})
export class StudentListPageModule {}
