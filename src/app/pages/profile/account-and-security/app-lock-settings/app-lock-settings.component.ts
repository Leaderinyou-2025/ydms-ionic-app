import { Component, OnInit } from '@angular/core';
import { ActionSheetButton, ActionSheetController, ModalController, ToggleCustomEvent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AvailableResult } from 'capacitor-native-biometric';

import { AppLockService } from '../../../../services/app-lock/app-lock.service';
import { BiometricService } from '../../../../services/biometric/biometric.service';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PinSetupModalComponent } from '../../../../shared/components/pin-setup-modal/pin-setup-modal.component';
import { PinVerifyModalComponent } from '../../../../shared/components/pin-verify-modal/pin-verify-modal.component';
import { StyleClass } from '../../../../shared/enums/style-class';
import { BtnRoles } from '../../../../shared/enums/btn-roles';

@Component({
  selector: 'app-app-lock-settings',
  templateUrl: './app-lock-settings.component.html',
  styleUrls: ['./app-lock-settings.component.scss'],
  standalone: false
})
export class AppLockSettingsComponent implements OnInit {
  isAppLockEnabled = false;
  isBiometricEnabled = false;
  autoLockTimeout = 0;
  autoLockLabel = '';
  biometricAvailable!: AvailableResult | undefined;
  isFaceId!: boolean;

  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;

  constructor(
    private modalCtrl: ModalController,
    private appLockService: AppLockService,
    private actionSheetCtrl: ActionSheetController,
    private translate: TranslateService,
    private biometricService: BiometricService,
  ) {
  }

  ngOnInit() {
    this.loadSettings();
  }

  /**
   * Toggle app lock
   */
  async toggleAppLock(event: ToggleCustomEvent) {
    const isEnabled = event.detail.checked;

    if (isEnabled) {
      // Enable app lock - need to set up PIN
      const modal = await this.modalCtrl.create({
        component: PinSetupModalComponent,
        cssClass: StyleClass.FULLSCREEN_MODAL,
        backdropDismiss: false
      });

      await modal.present();
      const {data} = await modal.onDidDismiss();

      if (data?.pin) {
        // Save the PIN and enable app lock
        await this.appLockService.setPin(data.pin);
        this.appLockService.setSettingAppLockStatus(true);
        this.isAppLockEnabled = true;
      } else {
        // User cancelled, revert toggle
        this.isAppLockEnabled = false;
        event.target.checked = false;
      }
    } else {
      // Disable app lock - need to verify current PIN
      const modal = await this.modalCtrl.create({
        component: PinVerifyModalComponent,
        cssClass: StyleClass.FULLSCREEN_MODAL
      });

      await modal.present();
      const {data} = await modal.onDidDismiss();

      if (data?.verified) {
        this.appLockService.setSettingAppLockStatus(false);
        this.appLockService.setSettingAppUnlockBiometricStatus(false);
        this.isAppLockEnabled = false;
        this.isBiometricEnabled = false;
      } else {
        // Verification failed or cancelled, revert toggle
        this.isAppLockEnabled = true;
        event.target.checked = true;
      }
    }
  }

  /**
   * Toggle biometric unlock
   */
  async toggleBiometricUnlock(event: ToggleCustomEvent) {
    const verifyBiometricResult = await this.biometricService.verifyIdentity();
    if (!verifyBiometricResult) return;

    const isEnabled: boolean = event.detail.checked || false;
    this.appLockService.setSettingAppUnlockBiometricStatus(isEnabled);
    this.isBiometricEnabled = isEnabled;
  }

  /**
   * Open change PIN screen
   */
  async openChangePIN() {
    if (!this.isAppLockEnabled) {
      return;
    }

    // First verify current PIN
    const verifyModal = await this.modalCtrl.create({
      component: PinVerifyModalComponent,
      cssClass: 'fullscreen-modal'
    });

    await verifyModal.present();
    const verifyResult = await verifyModal.onDidDismiss();

    if (verifyResult.data?.verified) {
      // Current PIN verified, now set new PIN
      const setupModal = await this.modalCtrl.create({
        component: PinSetupModalComponent,
        cssClass: 'fullscreen-modal',
        componentProps: {
          title: this.translate.instant(TranslateKeys.TITLE_ENTER_NEW_PIN),
          confirmTitle: this.translate.instant(TranslateKeys.TITLE_CONFIRM_NEW_PIN)
        }
      });

      await setupModal.present();
      const setupResult = await setupModal.onDidDismiss();

      if (setupResult.data?.pin) {
        // Save the new PIN
        await this.appLockService.setPin(setupResult.data.pin);
      }
    }
  }

  /**
   * Open auto-lock settings
   */
  async openAutoLockSettings() {
    if (!this.isAppLockEnabled) {
      return;
    }

    const buttons: Array<ActionSheetButton> = [
      {
        text: this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_IMMEDIATELY),
        cssClass: this.autoLockTimeout === 0 ? StyleClass.SELECTED_BUTTON : '',
        handler: () => {
          this.autoLockTimeout = 0;
          this.appLockService.setSettingAppLockTime(this.autoLockTimeout);
          this.updateAutoLockLabel();
        },
      },
      {
        text: this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_30_SECONDS),
        cssClass: this.autoLockTimeout === 30 ? StyleClass.SELECTED_BUTTON : '',
        handler: () => {
          this.autoLockTimeout = 30;
          this.appLockService.setSettingAppLockTime(this.autoLockTimeout);
          this.updateAutoLockLabel();
        },
      },
      {
        text: this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_1_MINUTE),
        cssClass: this.autoLockTimeout === 60 ? StyleClass.SELECTED_BUTTON : '',
        handler: () => {
          this.autoLockTimeout = 60;
          this.appLockService.setSettingAppLockTime(this.autoLockTimeout);
          this.updateAutoLockLabel();
        },
      },
      {
        text: this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_5_MINUTES),
        cssClass: this.autoLockTimeout === 300 ? StyleClass.SELECTED_BUTTON : '',
        handler: () => {
          this.autoLockTimeout = 300;
          this.appLockService.setSettingAppLockTime(this.autoLockTimeout);
          this.updateAutoLockLabel();
        },
      },
      {
        text: this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_15_MINUTES),
        cssClass: this.autoLockTimeout === 900 ? StyleClass.SELECTED_BUTTON : '',
        handler: () => {
          this.autoLockTimeout = 900;
          this.appLockService.setSettingAppLockTime(this.autoLockTimeout);
          this.updateAutoLockLabel();
        },
      },
      {
        text: this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_30_MINUTES),
        cssClass: this.autoLockTimeout === 1800 ? StyleClass.SELECTED_BUTTON : '',
        handler: () => {
          this.autoLockTimeout = 1800;
          this.appLockService.setSettingAppLockTime(this.autoLockTimeout);
          this.updateAutoLockLabel();
        },
      },
      {
        text: this.translate.instant(TranslateKeys.BUTTON_CANCEL),
        role: BtnRoles.CANCEL,
      },
    ];

    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_APP),
      buttons: buttons,
      cssClass: 'theme-action-sheet'
    });

    await actionSheet.present();
  }

  /**
   * Load current app lock settings
   */
  private loadSettings() {
    this.biometricAvailable = this.biometricService.getAvailableResult();
    this.isFaceId = this.biometricService.isFaceId();
    this.isAppLockEnabled = this.appLockService.getSettingAppLockStatus();
    this.isBiometricEnabled = this.appLockService.getSettingAppUnlockBiometricStatus();
    this.autoLockTimeout = this.appLockService.getSettingAppLockTime();

    this.updateAutoLockLabel();
  }

  /**
   * Update auto-lock label based on current timeout
   */
  private updateAutoLockLabel() {
    switch (this.autoLockTimeout) {
      case 0:
        this.autoLockLabel = this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_IMMEDIATELY);
        break;
      case 30:
        this.autoLockLabel = this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_30_SECONDS);
        break;
      case 60:
        this.autoLockLabel = this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_1_MINUTE);
        break;
      case 300:
        this.autoLockLabel = this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_5_MINUTES);
        break;
      case 900:
        this.autoLockLabel = this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_15_MINUTES);
        break;
      case 1800:
        this.autoLockLabel = this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_30_MINUTES);
        break;
      default:
        this.autoLockLabel = this.translate.instant(TranslateKeys.TITLE_AUTO_LOCK_IMMEDIATELY);
    }
  }

}
