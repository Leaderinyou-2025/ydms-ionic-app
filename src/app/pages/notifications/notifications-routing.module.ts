import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationsPage } from './notifications.page';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { PageRoutes } from '../../shared/enums/page-routes';
import { CreateNotificationComponent } from './create-notification/create-notification.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationsPage
  },
  {
    path: PageRoutes.CREATE_NOTIFICATION,
    component: CreateNotificationComponent,
  },
  {
    path: ':id',
    component: NotificationDetailComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsPageRoutingModule {
}
