import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TaskPageRoutingModule } from './task-routing.module';

import { TaskPage } from './task.page';
import { SharedModule } from '../../../shared/shared.module';
import { TranslatePipe } from '@ngx-translate/core';
import { IonInfiniteHorizontalDirective } from '../../../core/directive/ion-infinite-horizontal.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TaskPageRoutingModule,
        SharedModule,
        TranslatePipe,
        IonInfiniteHorizontalDirective
    ],
  declarations: [TaskPage]
})
export class TaskPageModule {}
