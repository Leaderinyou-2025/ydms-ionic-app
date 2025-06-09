import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ClassManagementPageRoutingModule } from './class-management-routing.module';
import { ClassManagementPage } from './class-management.page';
import { SharedModule } from '../../../shared/shared.module';
import { StudentsComponent } from './students/students.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ClassManagementPageRoutingModule,
    SharedModule
  ],
  declarations: [
    ClassManagementPage,
    StudentsComponent,
    StudentDetailComponent
  ]
})
export class ClassManagementPageModule {
}
