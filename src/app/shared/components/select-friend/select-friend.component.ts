import { Component, OnInit } from '@angular/core';
import { CheckboxCustomEvent, InfiniteScrollCustomEvent, ModalController, SearchbarCustomEvent } from '@ionic/angular';

import { AuthService } from '../../../services/auth/auth.service';
import { FriendService } from '../../../services/friend/friend.service';
import { IAuthData } from '../../interfaces/auth/auth-data';
import { TranslateKeys } from '../../enums/translate-keys';
import { CommonConstants } from '../../classes/common-constants';
import { FriendStatus } from '../../enums/friend-status';
import { ILiyYdmsFriend } from '../../interfaces/models/liy.ydms.friend';

@Component({
  selector: 'app-select-user',
  templateUrl: './select-friend.component.html',
  styleUrls: ['./select-friend.component.scss'],
  standalone: false
})
export class SelectFriendComponent implements OnInit {

  authData?: IAuthData;
  searchTerm!: string;
  listFriends: ILiyYdmsFriend[] = new Array<ILiyYdmsFriend>();
  selectedFriends: ILiyYdmsFriend[] = new Array<ILiyYdmsFriend>();
  isLoading?: boolean;
  isLoadMore: boolean = false;

  private paged: number = 1;
  private readonly limit = 20;

  protected readonly CommonConstants = CommonConstants;
  protected readonly TranslateKeys = TranslateKeys;
  protected readonly Array = Array;


  constructor(
    private authService: AuthService,
    private friendService: FriendService,
    private modalController: ModalController,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then(authData => {
      this.authData = authData;
      this.loadFriendList();
    });
  }

  /**
   * On click cancel
   */
  public cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  /**
   * On click confirm
   */
  public confirm() {
    this.modalController.dismiss(this.selectedFriends, 'confirm');
  }

  /**
   * On search change
   * @param event
   */
  public onSearchChange(event: SearchbarCustomEvent): void {
    this.searchTerm = event.detail.value || '';
    this.paged = 1;
    setTimeout(() => {
      this.listFriends = new Array<ILiyYdmsFriend>();
      this.loadFriendList();
    });
  }

  /**
   * Ion change select friend
   * @param event
   * @param friend
   */
  public onChangeSelectFriend(
    event: CheckboxCustomEvent,
    friend: ILiyYdmsFriend
  ): void {
    const existFriendIndex = this.selectedFriends.findIndex(f => f.id === friend.id);
    if ((existFriendIndex < 0 && !event.target.checked) || (existFriendIndex >= 0 && event.target.checked)) {
      return;
    }

    if (event.target.checked) {
      this.selectedFriends.push(friend);
      return;
    }

    this.selectedFriends.splice(existFriendIndex, 1);
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
    if (this.listFriends?.length < ((this.paged - 1) * this.limit)) {
      event.target.complete();
      return;
    }

    this.paged += 1;
    this.isLoadMore = true;
    setTimeout(() => {
      this.loadFriendList().finally(() => {
        event.target.complete();
        this.isLoadMore = false;
      })
    }, 500);
  }

  /**
   * Load friend list
   * @private
   */
  private async loadFriendList(): Promise<void> {
    if (!this.authData || this.isLoading) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;
    const results = await this.friendService.getFriends(
      this.searchTerm, this.authData.id, FriendStatus.ACCEPTED, offset, this.limit
    );
    if (results.length > 0) this.listFriends.push(...results);
    this.isLoading = false;
  }
}
