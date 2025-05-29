import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, LoadingController, ModalController, RefresherCustomEvent, ToastButton, ToastController, ToastOptions } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth/auth.service';
import { FriendService } from '../../../services/friend/friend.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { IHeaderAnimeImage, IHeaderSearchbar, IHeaderSegment } from '../../../shared/interfaces/header/header';
import { InputTypes } from '../../../shared/enums/input-types';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { FriendStatus } from '../../../shared/enums/friend-status';
import { ILiyYdmsFriend } from '../../../shared/interfaces/models/liy.ydms.friend';
import { NativePlatform } from '../../../shared/enums/native-platform';
import { AddNewFriendComponent } from './add-new-friend/add-new-friend.component';
import { IonicColors } from '../../../shared/enums/ionic-colors';
import { IonicIcons } from '../../../shared/enums/ionic-icons';
import { Position } from '../../../shared/enums/position';
import { BtnRoles } from '../../../shared/enums/btn-roles';
import { StyleClass } from '../../../shared/enums/style-class';
import { DateFormat } from '../../../shared/enums/date-format';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: false
})
export class FriendsPage implements OnInit {

  authData?: IAuthData;
  searchbar!: IHeaderSearchbar;
  animeImage!: IHeaderAnimeImage;
  segment!: IHeaderSegment;
  activeTab!: 'friends' | 'requests';

  searchTerm: string = '';
  totalFriends: number = 0;
  isLoading?: boolean;
  friends: ILiyYdmsFriend[] = [];
  private paged: number = 1;
  private limit: number = 20;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly Array = Array;
  protected readonly FriendStatus = FriendStatus;
  protected readonly CommonConstants = CommonConstants;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private friendService: FriendService,
    private translate: TranslateService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.activeTab = params['activeTab'] || 'friends';
      this.initHeader();
    });
    this.authData = await this.authService.getAuthData();
    if (this.authData) {
      this.loadCountFriend();
      await this.getFriends();
    }
  }

  /**
   * On change active tab
   * @param activeTab
   */
  public onChangeActiveTab(activeTab: string | number): void {
    if (typeof activeTab !== 'string' || (activeTab !== 'friends' && activeTab !== 'requests')) return;
    setTimeout(() => {
      this.activeTab = activeTab;
      this.doRefresh();
    });
  }

  /**
   * Handle search input changes
   */
  public async onSearchChange(searchTerm: string): Promise<void> {
    this.searchTerm = searchTerm || '';
    this.paged = 1;
    this.friends = new Array<ILiyYdmsFriend>();
    await this.getFriends();
  }

  /**
   * Handle pull-to-refresh
   * @param event Refresh event
   */
  public doRefresh(event?: RefresherCustomEvent): void {
    if (this.isLoading) {
      event?.target.complete();
      return;
    }
    this.paged = 1;
    this.friends = new Array<ILiyYdmsFriend>();
    this.loadCountFriend();
    this.getFriends().finally(() => event?.target.complete());
  }

  /**
   * Load more data when scrolling
   * @param event Infinite scroll event
   */
  public loadMore(event: InfiniteScrollCustomEvent): void {
    if (this.isLoading || this.friends?.length < ((this.paged - 1) * this.limit)) {
      event.target.complete();
      return;
    }
    this.paged += 1;
    this.getFriends().finally(() => event.target.complete());
  }

  /**
   * On click friend detail
   * @param friend
   */
  public onClickFriendDetail(friend: ILiyYdmsFriend): void {
    if (friend.status !== FriendStatus.ACCEPTED) return;
    this.router.navigateByUrl(`${PageRoutes.FRIENDS}/${friend.id}`);
  }

  /**
   * Handle accept friend request
   * @param friend
   */
  public async onClickAcceptFriend(friend: ILiyYdmsFriend): Promise<void> {
    if (!friend) return;
    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();
    try {
      const result = await this.friendService.acceptFriendRequest(friend);
      if (result != undefined) this.showToast(this.translate.instant(TranslateKeys.TOAST_ACCEPT_REQUEST_SUCCESS), IonicColors.SUCCESS);
      else this.showToast(this.translate.instant(TranslateKeys.TOAST_ACCEPT_REQUEST_FAILED), IonicColors.SUCCESS);
    } catch (e: any) {
      console.error(e);
      this.showToast(e.message, IonicColors.DANGER);
    } finally {
      loading?.dismiss();
      this.doRefresh();
    }
  }

  /**
   * Handle cancel friend request
   * @param friend
   */
  public async onClickCancelFriend(friend: ILiyYdmsFriend): Promise<void> {
    if (!friend) return;
    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();
    try {
      const result = await this.friendService.cancelFriendRequest(friend);
      if (result != undefined) this.showToast(this.translate.instant(TranslateKeys.TOAST_CANCEL_REQUEST_SUCCESS), IonicColors.SUCCESS);
      else this.showToast(this.translate.instant(TranslateKeys.TOAST_CANCEL_REQUEST_FAILED), IonicColors.SUCCESS);
    } catch (e: any) {
      console.error(e);
      this.showToast(e.message, IonicColors.DANGER);
    } finally {
      loading?.dismiss();
      this.doRefresh();
    }
  }

  /**
   * On click add new friend
   */
  public onClickAddNewFriend(): void {
    this.modalController.create({
      component: AddNewFriendComponent,
      mode: NativePlatform.IOS,
      initialBreakpoint: 0.8,
      breakpoints: [0, 0.8],
      componentProps: {}
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then(() => this.doRefresh());
    });
  }

  /**
   * Get friend list
   * @private
   */
  private async getFriends() {
    if (this.isLoading || !this.authData) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;

    let results: ILiyYdmsFriend[];
    results = await this.friendService.getFriends(
      this.searchTerm, this.authData.id, this.activeTab === 'friends' ? FriendStatus.ACCEPTED : FriendStatus.NEW, offset, this.limit
    );

    this.friends = CommonConstants.mergeArrayObjectById(this.friends, results) || [];
    this.lazyLoadTotalFriendPoints(results);
    this.isLoading = false;
  }

  /**
   * Get friend total friendly point from res.user model
   * @param friends
   * @private
   */
  private lazyLoadTotalFriendPoints(friends: ILiyYdmsFriend[]): void {
    if (!friends?.length) return;
    const friendUserIds = friends.map((friend) => friend.friend_id.id);
    this.authService.getTeenagerTotalFriendlyPointsByIds(friendUserIds).then(results => {
      for (const friend of friends) {
        const friendListIndex = this.friends.findIndex(f => f.id === friend.id);
        if (friendListIndex < 0) continue;

        const friendTotalFriendlyPoints = results.find(u => u.id === friend.friend_id.id);
        this.friends[friendListIndex].friendly_point = friendTotalFriendlyPoints?.total_friendly_points || 0;
      }
    });
  }

  /**
   * loadCountFriend
   * @private
   */
  private loadCountFriend(): void {
    if (!this.authData) return;
    this.friendService.getCountUserFriends(this.authData.id, FriendStatus.ACCEPTED).then(countFriends => this.totalFriends = countFriends);
  }

  /**
   * initHeader
   * @private
   */
  private initHeader(): void {
    this.searchbar = {
      type: InputTypes.SEARCH,
      inputmode: InputTypes.TEXT,
      placeholder: this.translate.instant(TranslateKeys.TITLE_SEARCH_FRIENDS),
      animated: true,
      showClearButton: true,
    };
    this.segment = {
      value: this.activeTab,
      buttons: [
        {value: 'friends', label: TranslateKeys.TITLE_FRIENDS},
        {value: 'requests', label: TranslateKeys.TITLE_FRIEND_REQUESTS}
      ]
    };
    this.animeImage = {
      imageUrl: '/assets/images/owl_img.png',
      width: '100px',
      height: 'auto',
      position: {
        position: 'absolute',
        top: '-10px'
      }
    }
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

  protected readonly DateFormat = DateFormat;
}
