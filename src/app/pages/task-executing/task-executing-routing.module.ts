import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TaskExecutingPage } from './task-executing.page';
import { TaskExecutingDetailComponent } from './task-executing-detail/task-executing-detail.component';

const routes: Routes = [
  {
    path: '',
    component: TaskExecutingPage
  },
  {
    path: ':id',
    component: TaskExecutingDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskExecutingPageRoutingModule {
}
