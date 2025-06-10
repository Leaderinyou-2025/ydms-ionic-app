import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroupTasksPage } from './group-tasks.page';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { GroupTaskCreateFormComponent } from './group-task-create-form/group-task-create-form.component';

const routes: Routes = [
  {
    path: '',
    component: GroupTasksPage
  },
  {
    path: PageRoutes.CREATE_GROUP_TASK,
    component: GroupTaskCreateFormComponent,
  },
  {
    path: ':id',
    component: GroupTaskCreateFormComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupTasksPageRoutingModule {
}
