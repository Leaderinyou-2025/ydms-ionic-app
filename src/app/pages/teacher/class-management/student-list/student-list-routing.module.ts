import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentListPage } from './student-list.page';
import { StudentDetailComponent } from './student-detail/student-detail.component';

const routes: Routes = [
  {
    path: '',
    component: StudentListPage
  },
  {
    path: 'detail/:studentId',
    component: StudentDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentListPageRoutingModule {}
