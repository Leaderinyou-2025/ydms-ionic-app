import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth/auth.service';
import { FriendService } from '../../../services/friend/friend.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { IHeaderAnimeImage, IHeaderSearchbar, IHeaderSegment } from '../../../shared/interfaces/header/header';
import { InputTypes } from '../../../shared/enums/input-types';
import { ILiyYdmsFriend } from '../../../shared/interfaces/models/liy.ydms.friend';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { FriendStatus } from '../../../shared/enums/friend-status';

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
  isLoading!: boolean;
  friends: ILiyYdmsFriend[] = [];
  private paged: number = 1;
  private limit: number = 20;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly Array = Array;
  protected readonly FriendStatus = FriendStatus;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private friendService: FriendService,
    private translate: TranslateService
  ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.activeTab = params['activeTab'] || 'friends';
      this.initHeader();
    });
    this.authData = await this.authService.getAuthData();
    if (this.authData) {
      this.friendService.getCountUserFriends(this.authData.id, FriendStatus.ACCEPTED).then(countFriends => this.totalFriends = countFriends);
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
   * Get friend list
   * @private
   */
  private async getFriends() {
    if (this.isLoading || !this.authData) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;

    let results: ILiyYdmsFriend[];
    if (this.activeTab === 'friends') {
      results = await this.friendService.getFriends(
        this.searchTerm, this.authData.id, FriendStatus.ACCEPTED, offset, this.limit
      );
    } else {
      results = await this.friendService.getFriendRequests(this.authData.id, 0, this.limit);
    }

    this.friends = CommonConstants.mergeArrayObjectById(this.friends, results) || [];
    this.lazyLoadAvatarResource(results);
    this.isLoading = false;
  }

  /**
   * Lazy load fried avatar
   * @param friends
   * @private
   */
  private lazyLoadAvatarResource(friends: ILiyYdmsFriend[]): void {
    if (!this.authData) return;
    this.friendService.loadFriendAvatarImage(this.authData.id, friends)
      .then(([teenagerAvatars, avatarResources]) => {
        for (let friend of friends) {
          const existIndex = this.friends.findIndex((f) => f.id === friend.id);
          if (existIndex < 0) continue;

          const friendAvatar = teenagerAvatars.find((user) =>
            (friend.user_id.id !== this.authData?.id && user.id === friend.user_id.id) ||
            (friend.friend_id.id !== this.authData?.id) && user.id === friend.friend_id.id);

          if (!friendAvatar?.avatar?.id) {
            this.friends[existIndex].avatar = CommonConstants.defaultUserAvatarImage;
            if (this.friends[existIndex].user_id.id === this.authData?.id) {
              this.friends[existIndex].friend_id.name = friendAvatar?.nickname || '';
            } else {
              this.friends[existIndex].user_id.name = friendAvatar?.nickname || '';
            }
            continue;
          }

          const avatarImage = avatarResources.find(image => image.id === friendAvatar.avatar?.id);
          this.friends[existIndex].avatar = avatarImage?.resource_url || CommonConstants.defaultUserAvatarImage;
        }
      });
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
}
