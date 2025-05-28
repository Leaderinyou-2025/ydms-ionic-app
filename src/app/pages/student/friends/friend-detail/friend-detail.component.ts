import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';

import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { IFriend } from '../../../../shared/interfaces/friend/friend';
import { FriendService } from '../../../../services/friend/friend.service';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { ILiyYdmsFriend } from '../../../../shared/interfaces/models/liy.ydms.friend';

@Component({
  selector: 'app-friend-detail',
  templateUrl: './friend-detail.component.html',
  styleUrls: ['./friend-detail.component.scss'],
  standalone: false
})
export class FriendDetailComponent implements OnInit {

  animeImage!: IHeaderAnimeImage;
  isLoading: boolean = false;
  friend?: any;

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
