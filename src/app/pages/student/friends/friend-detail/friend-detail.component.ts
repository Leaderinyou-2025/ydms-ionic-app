import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';

import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { IFriend } from '../../../../shared/interfaces/friend/friend';
import { FriendService } from '../../../../services/friend/friend.service';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { IHeaderAnimeImage, IHeaderSearchbar } from '../../../../shared/interfaces/header/header';

@Component({
  selector: 'app-friend-detail',
  templateUrl: './friend-detail.component.html',
  styleUrls: ['./friend-detail.component.scss'],
  standalone: false
})
export class FriendDetailComponent implements OnInit {

  friendId: number = 0;
  friend: IFriend | undefined;
  isLoading: boolean = false;
  animeImage!: IHeaderAnimeImage;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private friendService: FriendService
  ) {
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id != null) {
      this.friendId = +id;
      this.initHeader();
      await this.loadFriendDetails();
    } else {
      history.back();
    }
  }

  /**
   * Onclick unfriend button
   */
  public unfriend() {
    // In a real app, this would call a service to remove the friend
    console.log('Unfriending:', this.friend?.name);

    // TODO: Show dialog confirm and handle call API to unfriend

    // After unfriending, navigate back to friends list
    this.navCtrl.navigateBack(`/${PageRoutes.FRIENDS}`);
  }

  /**
   * Get detail friend by id pass to prams
   */
  private async loadFriendDetails() {
    this.isLoading = true;

    // Show loading indicator
    const loading = await this.loadingCtrl.create({mode: NativePlatform.IOS});
    await loading.present();

    // Get friend details from service
    this.friendService.getFriendById(this.friendId).subscribe(
      (friend) => {
        this.friend = friend;
        // Process avatar for the friend
        if (this.friend) {
          this.processFriendAvatar(this.friend);
        }
        loading.dismiss();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading friend details:', error);
        loading.dismiss();
        this.isLoading = false;
      }
    );
  }

  private processFriendAvatar(friend: IFriend): void {
    if (!friend) return;
    friend.avatar = this.friendService.getFriendAvatarImage(friend);
  }

  /**
   * initHeader
   * @private
   */
  private initHeader(): void {
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
