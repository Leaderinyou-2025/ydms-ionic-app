import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClassManagementPage } from './class-management.page';
import { StudentsComponent } from './students/students.component';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { StudentDetailComponent } from './student-detail/student-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ClassManagementPage
  },
  {
    path: `:id/${PageRoutes.STUDENTS}`,
    component: StudentsComponent
  },
  {
    path: `:classId/${PageRoutes.STUDENTS}/:id`,
    component: StudentDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassManagementPageRoutingModule {
}
