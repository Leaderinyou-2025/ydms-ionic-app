import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalController, RadioGroupCustomEvent } from '@ionic/angular';

import { TranslateKeys } from '../../enums/translate-keys';
import { AuthService } from '../../../services/auth/auth.service';
import { IAuthData } from '../../interfaces/auth/auth-data';
import { PublicEmotionalOption } from '../../enums/public-emotional-option';
import { IEmotionJournal } from '../../interfaces/function-data/emtion-journal';
import { NativePlatform } from '../../enums/native-platform';
import { CommonConstants } from '../../classes/common-constants';
import { SelectFriendComponent } from '../select-friend/select-friend.component';
import { ILiyYdmsFriend } from '../../interfaces/models/liy.ydms.friend';

@Component({
  selector: 'app-emotion-share',
  templateUrl: './emotion-share.component.html',
  styleUrls: ['./emotion-share.component.scss'],
  standalone: false,
})
export class EmotionShareComponent implements OnInit {

  @Output() shareEmotion = new EventEmitter<IEmotionJournal>();

  public_emotional: boolean = false;
  public_emotional_to: PublicEmotionalOption = PublicEmotionalOption.ALL;
  public_user_ids: number[] = [];
  selectedPublicUsers: ILiyYdmsFriend[] = [];
  authData?: IAuthData;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PublicEmotionalOption = PublicEmotionalOption;
  protected readonly CommonConstants = CommonConstants;

  constructor(
    private authService: AuthService,
    private modalController: ModalController,
  ) {
  }

  async ngOnInit() {
    this.authData = await this.authService.getAuthData();
    this.emitShareData();
  }

  /**
   * Handle public sharing toggle
   */
  public async onPublicSharingToggle(): Promise<void> {
    if (!this.public_emotional) {
      this.selectedPublicUsers = [];
      this.public_user_ids = [];
      this.public_emotional_to = PublicEmotionalOption.ALL;
    }
    this.emitShareData();
  }

  /**
   * Handle share type change
   */
  public async onShareTypeChange(event: RadioGroupCustomEvent): Promise<void> {
    this.selectedPublicUsers = [];
    this.public_user_ids = [];
    if (event.detail.value === PublicEmotionalOption.FRIENDS) {
      this.openSelectUserModal();
    } else {
      this.emitShareData();
    }
  }

  /**
   * On click remove a public user
   * @param friend
   */
  public onClickRemovePublicUser(friend: ILiyYdmsFriend): void {
    if (!friend) return;
    const existIndex = this.selectedPublicUsers.findIndex(f => f.id === friend.id);
    if (existIndex < 0) return;
    this.selectedPublicUsers.splice(existIndex, 1);
    if (this.selectedPublicUsers.length === 0) this.public_emotional_to = PublicEmotionalOption.ALL_FRIENDS;
    this.emitShareData();
  }

  /**
   * Handle open dialog to select friends
   * @private
   */
  private openSelectUserModal(): void {
    this.modalController.create({
      mode: NativePlatform.IOS,
      component: SelectFriendComponent,
      initialBreakpoint: 0.8,
      breakpoints: [0, 0.8],
      componentProps: {}
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then((result) => {
        if (!result.data?.length) {
          this.public_emotional_to = PublicEmotionalOption.ALL_FRIENDS;
          this.selectedPublicUsers = new Array<ILiyYdmsFriend>();
        } else {
          this.selectedPublicUsers = result.data;
        }
        this.emitShareData();
      });
    });
  }

  /**
   * Emit share data when changes occur
   */
  private emitShareData(): void {
    const userIds = this.selectedPublicUsers.map(f => f.friend_id.id);
    this.shareEmotion.emit({
      public_emotional: this.public_emotional,
      public_emotional_to: this.public_emotional_to,
      public_user_ids: userIds
    });
  }
}
