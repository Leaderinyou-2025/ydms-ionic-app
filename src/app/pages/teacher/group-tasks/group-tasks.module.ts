import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

import { GroupTasksPageRoutingModule } from './group-tasks-routing.module';

import { GroupTasksPage } from './group-tasks.page';
import { SharedModule } from '../../../shared/shared.module';
import { GroupTaskCreateFormComponent } from './group-task-create-form/group-task-create-form.component';
import {
  SelectGroupTaskGuideComponent
} from './group-task-create-form/select-group-task-guide/select-group-task-guide.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroupTasksPageRoutingModule,
    SharedModule,
    TranslatePipe,
    ReactiveFormsModule
  ],
  declarations: [GroupTasksPage, GroupTaskCreateFormComponent, SelectGroupTaskGuideComponent]
})
export class GroupTasksPageModule {
}
