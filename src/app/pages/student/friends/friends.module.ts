import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SharedModule } from '../../../shared/shared.module';
import { FriendsPage } from './friends.page';
import { FriendsPageRoutingModule } from './friends-routing.module';
import { FriendDetailComponent } from './friend-detail/friend-detail.component';
import { AddNewFriendComponent } from './add-new-friend/add-new-friend.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FriendsPageRoutingModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [FriendsPage, FriendDetailComponent, AddNewFriendComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FriendsPageModule {
}
