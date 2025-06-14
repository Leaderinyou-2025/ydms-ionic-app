import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { NotificationsPageRoutingModule } from './notifications-routing.module';
import { NotificationsPage } from './notifications.page';
import { SharedModule } from '../../shared/shared.module';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { CreateNotificationComponent } from './create-notification/create-notification.component';
import { QuillEditorComponent } from 'ngx-quill';
import { SelectRecipientsComponent } from './select-recipients/select-recipients.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationsPageRoutingModule,
    TranslateModule,
    SharedModule,
    ReactiveFormsModule,
    QuillEditorComponent
  ],
  declarations: [
    NotificationsPage,
    NotificationDetailComponent,
    CreateNotificationComponent,
    SelectRecipientsComponent,
  ]
})
export class NotificationsPageModule {
}
