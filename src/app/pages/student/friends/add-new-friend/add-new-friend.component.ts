import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, LoadingController, SearchbarCustomEvent, ToastButton, ToastController, ToastOptions } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { FriendService } from '../../../../services/friend/friend.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { CommonConstants } from '../../../../shared/classes/common-constants';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { Position } from '../../../../shared/enums/position';
import { BtnRoles } from '../../../../shared/enums/btn-roles';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { StyleClass } from '../../../../shared/enums/style-class';

@Component({
  selector: 'app-add-new-friend',
  templateUrl: './add-new-friend.component.html',
  styleUrls: ['./add-new-friend.component.scss'],
  standalone: false
})
export class AddNewFriendComponent implements OnInit {

  authData?: IAuthData;
  searchTerm!: string;
  listFriends!: Array<IAuthData>;
  isLoading?: boolean;
  private paged = 1;
  private readonly limit = 20;

  protected readonly CommonConstants = CommonConstants;
  protected readonly TranslateKeys = TranslateKeys;
  protected readonly Array = Array;

  constructor(
    private authService: AuthService,
    private friendService: FriendService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then(authData => {
      this.authData = authData;
      this.getFriends();
    });
  }

  /**
   * On search change
   * @param event
   */
  public onSearchChange(event: SearchbarCustomEvent): void {
    this.searchTerm = event.detail.value || '';
    setTimeout(() => this.reloadFriends());
  }

  /**
   * On click send request friend
   * @param friend
   */
  public async onClickSendRequest(friend: IAuthData): Promise<void> {
    if (!friend || !this.authData) return;
    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();
    try {
      const result = await this.friendService.sendNewFriendRequest(this.authData.id, friend);
      if (result != undefined) this.showToast(this.translate.instant(TranslateKeys.TOAST_SEND_REQUEST_SUCCESS), IonicColors.SUCCESS);
      else this.showToast(this.translate.instant(TranslateKeys.TOAST_SEND_REQUEST_FAILED), IonicColors.SUCCESS);
    } catch (e: any) {
      console.error(e);
      this.showToast(e.message, IonicColors.DANGER);
    } finally {
      loading?.dismiss();
      this.reloadFriends();
    }
  }

  /**
   * Load more data when scrolling
   * @param event Infinite scroll event
   */
  public loadMore(event: InfiniteScrollCustomEvent): void {
    if (this.isLoading) {
      event.target.complete();
      return;
    }

    // No more
    if (this.listFriends?.length < ((this.paged - 1) * this.limit + 1)) {
      event.target.complete();
      return;
    }

    this.paged += 1;
    setTimeout(() => {
      this.getFriends().finally(() => event.target.complete());
    }, 500);
  }

  /**
   * Load friend list
   * @private
   */
  private async getFriends(): Promise<void> {
    if (this.isLoading || !this.authData) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;
    const results = await this.friendService.searchNewFriendsByNickname(
      this.searchTerm, this.authData.id, this.authData.school_id?.id, undefined, offset, this.limit
    );

    this.listFriends = CommonConstants.mergeArrayObjectById(this.listFriends, results) || [];
    this.isLoading = false;
  }

  /**
   * Show toast message
   * @param message
   * @param color
   * @private
   */
  private showToast(message: string, color: IonicColors.SUCCESS | IonicColors.DANGER): void {
    const closeBtn: ToastButton = {
      icon: IonicIcons.CLOSE_CIRCLE_OUTLINE,
      side: Position.END,
      role: BtnRoles.CANCEL,
    }

    const toastOption: ToastOptions = {
      message,
      duration: 3000,
      buttons: [closeBtn],
      mode: NativePlatform.IOS,
      cssClass: `${StyleClass.TOAST_ITEM} ${color === IonicColors.DANGER ? StyleClass.TOAST_ERROR : StyleClass.TOAST_SUCCESS}`,
      position: Position.TOP,
      icon: color === IonicColors.DANGER ? IonicIcons.WARNING_OUTLINE : IonicIcons.CHECKMARK_CIRCLE_OUTLINE,
      color,
      keyboardClose: false
    }
    this.toastController.create(toastOption).then(toast => toast.present());
  }

  /**
   * Reload friend list
   * @private
   */
  private reloadFriends(): void {
    this.paged = 1;
    this.listFriends = new Array<IAuthData>();
    this.getFriends();
  }
}
