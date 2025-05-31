import { Component, OnInit } from '@angular/core';
import { ModalController, ToggleCustomEvent } from '@ionic/angular';

import { AuthService } from '../../../services/auth/auth.service';
import { SoundService } from '../../../services/sound/sound.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { Theme } from '../../../shared/enums/theme';
import { ISoundSettings } from '../../../shared/interfaces/settings/sound-settings';
import { INotificationSettings } from '../../../shared/interfaces/settings/notification-settings';
import { SoundKeys } from '../../../shared/enums/sound-keys';
import { SelectBackgroundSoundComponent } from './select-background-sound/select-background-sound.component';
import { NativePlatform } from '../../../shared/enums/native-platform';

@Component({
  selector: 'app-notification-and-sound',
  templateUrl: './notification-and-sound.component.html',
  styleUrls: ['./notification-and-sound.component.scss'],
  standalone: false
})
export class NotificationAndSoundComponent implements OnInit {

  soundSettings!: ISoundSettings | undefined;
  notificationSettings!: INotificationSettings | undefined;

  private isChangeSoundSettings!: boolean;
  private isChangeNotificationSettings!: boolean;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly Theme = Theme;
  protected readonly SoundKeys = SoundKeys;

  constructor(
    public soundService: SoundService,
    private authService: AuthService,
    private modalController: ModalController,
  ) {
  }

  ngOnInit() {
    this.loadSoundSettings();
  }

  ionViewDidEnter() {
    this.isChangeSoundSettings = false;
    this.isChangeNotificationSettings = false;
  }

  async ionViewWillLeave() {
    await this.saveUserSettings();
    this.soundService.playBackground();
  }

  /**
   * onSwitchNotificationEnable
   * @param event
   */
  public onSwitchNotificationEnable(event: ToggleCustomEvent) {
    if (this.notificationSettings) this.notificationSettings.enabled = event.detail.checked;
    this.isChangeNotificationSettings = true;
  }

  /**
   * onSwitchSoundEnable
   * @param event
   */
  public onSwitchSoundEnable(event: ToggleCustomEvent) {
    if (this.soundSettings) this.soundSettings.enabled = event.detail.checked;
    this.isChangeSoundSettings = true;
  }

  /**
   * onSwitchBackgroundEnable
   * @param event
   */
  public onSwitchBackgroundEnable(event: ToggleCustomEvent) {
    if (this.soundSettings?.background) this.soundSettings.background.enabled = event.detail.checked;
    this.isChangeSoundSettings = true;
  }

  /**
   * onChangeBackgroundVolume
   * @param event
   */
  public onChangeBackgroundVolume(event: CustomEvent) {
    this.soundService.setVolume(SoundKeys.BACKGROUND, event.detail.value);
    this.soundService.playBackground();
    this.isChangeSoundSettings = true;
    if (this.soundSettings?.background) this.soundSettings.background.volume = +event.detail.value;
  }

  /**
   * onSwitchBackgroundMusic
   */
  public onSwitchBackgroundMusic() {
    this.modalController.create({
      component: SelectBackgroundSoundComponent,
      mode: NativePlatform.IOS,
      initialBreakpoint: 0.8,
      breakpoints: [0, 0.8],
      componentProps: {volume: this.soundSettings?.background?.volume}
    }).then(modal => {
      modal.present();
    });
  }

  /**
   * onSwitchEffects
   * @param event
   * @param effectType
   */
  public onSwitchEffects(event: CustomEvent, effectType: SoundKeys) {
    if (!this.soundSettings) return;
    if (!this.soundSettings[effectType]) this.soundSettings[effectType] = {enabled: event.detail.checked};
    else this.soundSettings[effectType].enabled = event.detail.checked;
  }

  /**
   * loadSoundSettings
   */
  private loadSoundSettings() {
    this.authService.getUserSettings().then(userSetting => {
      this.soundSettings = userSetting?.sound;
      this.notificationSettings = userSetting?.notification;
    });
  }

  /**
   * Save sound and notification setting to user
   * @private
   */
  private async saveUserSettings() {
    if (this.soundSettings && this.isChangeSoundSettings)
      await this.authService.setSoundSettings(this.soundSettings);

    if (this.notificationSettings && this.isChangeNotificationSettings)
      await this.authService.setNotificationSettings(this.notificationSettings);

    if (this.isChangeSoundSettings || this.isChangeNotificationSettings)
      await this.authService.saveAppSettings();
  }
}
