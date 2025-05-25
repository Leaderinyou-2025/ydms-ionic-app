import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AvailableResult } from 'capacitor-native-biometric';

import { BiometricService } from '../../../services/biometric/biometric.service';
import { AppLockService } from '../../../services/app-lock/app-lock.service';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { Theme } from '../../../shared/enums/theme';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { NativePlatform } from '../../../shared/enums/native-platform';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { DateFormat } from '../../../shared/enums/date-format';

@Component({
  selector: 'app-account-and-security',
  templateUrl: './account-and-security.component.html',
  styleUrls: ['./account-and-security.component.scss'],
  standalone: false
})
export class AccountAndSecurityComponent implements OnInit {

  authData!: IAuthData | undefined;
  isAppLockEnabled = false;
  enableBiometric!: boolean;
  biometricAvailable!: AvailableResult | undefined;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly Theme = Theme;
  protected readonly DateFormat = DateFormat;

  constructor(
    public router: Router,
    private authService: AuthService,
    private appLockService: AppLockService,
    private biometricService: BiometricService,
    private platform: Platform,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then(authData => this.authData = authData);
    this.loadAppLockStatus();
  }

  /**
   * Get user avatar image
   */
  public getUserAvatarImage(): string | undefined {
    if (!this.authData) return;
    if (this.authData.is_teenager) {
      if (!this.authData.avatar_512) return '/assets/images/avatar/conan_no_set.png';
      const prefix = CommonConstants.detectMimeType(this.authData.avatar_512);
      if (!prefix) return '/assets/images/avatar/conan_no_set.png';
      return prefix + this.authData.avatar_512;
    } else {
      if (!this.authData.image_128) return '/assets/icons/svg/avatar.svg';
      const prefix = CommonConstants.detectMimeType(this.authData.image_128);
      if (!prefix) return '/assets/icons/svg/avatar.svg';
      return prefix + this.authData.image_128;
    }
  }

  /**
   * On toggle biometric
   * @param event
   */
  public async toggleBiometric(event: any): Promise<void> {
    const verifyResult = await this.biometricService.verifyIdentity();
    if (!verifyResult || !this.authData) return;

    const isEnabled = event.detail.checked;
    this.biometricService.setBiometricSettingStatus(isEnabled || false);
    this.enableBiometric = isEnabled;

    // Update credentials on native device
    if (!this.platform.is(NativePlatform.MOBILEWEB) &&
      (this.platform.is(NativePlatform.ANDROID) || this.platform.is(NativePlatform.IOS))) {
      if (!isEnabled) {
        await this.biometricService.deleteCredentials(this.authData.login);
      } else {
        const password = await this.authService.getAuthToken() || '';
        await this.biometricService.setCredentials({username: this.authData.login, password: password});
      }
    }
  }

  /**
   * Load app lock status
   */
  private loadAppLockStatus() {
    this.isAppLockEnabled = this.appLockService.getSettingAppLockStatus();
    this.biometricAvailable = this.biometricService.getAvailableResult();
    this.enableBiometric = this.biometricService.getBiometricSettingStatus();
  }
}
