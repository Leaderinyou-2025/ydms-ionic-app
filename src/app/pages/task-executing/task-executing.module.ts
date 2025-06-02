import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TaskExecutingPageRoutingModule } from './task-executing-routing.module';

import { TaskExecutingPage } from './task-executing.page';
import { SharedModule } from '../../shared/shared.module';
import { TaskExecutingDetailComponent } from './task-executing-detail/task-executing-detail.component';
import { TranslatePipe } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TaskExecutingPageRoutingModule,
    SharedModule,
    TranslatePipe
  ],
  declarations: [
    TaskExecutingPage,
    TaskExecutingDetailComponent,
  ]
})
export class TaskExecutingPageModule {
}
