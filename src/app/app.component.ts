import { Component, OnDestroy, OnInit } from '@angular/core';
import { Device } from '@capacitor/device';
import { TranslateService } from '@ngx-translate/core';

import { LocalStorageService } from './services/local-storage/local-storage.service';
import { AppLockService } from './services/app-lock/app-lock.service';
import { StateService } from './services/state/state.service';
import { ThemeService } from './services/theme/theme.service';
import { AuthService } from './services/auth/auth.service';
import { SoundService } from './services/sound/sound.service';
import { TextZoomService } from './services/text-zoom/text-zoom.service';
import { StorageService } from './services/storage/storage.service';
import { BiometricService } from './services/biometric/biometric.service';
import { CommonConstants } from './shared/classes/common-constants';
import { StorageKey } from './shared/enums/storage-key';
import { LanguageKeys } from './shared/enums/language-keys';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  showLockScreen = false;
  private showLockScreenSubscribe: any;

  constructor(
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private appLockService: AppLockService,
    private stateService: StateService,
    private themeService: ThemeService,
    private textZoomService: TextZoomService,
    private authService: AuthService,
    private soundService: SoundService,
    private storageService: StorageService,
    private biometricService: BiometricService
  ) {
  }

  ngOnInit() {
    // Load device ID
    Device.getId().then(deviceId => CommonConstants.deviceId = deviceId.identifier);
    // Set text zoom
    this.textZoomService.initZoom();
    // Check available biometric
    this.biometricService.checkAvailable();
    // Init checking app lock
    this.checkLock();
    // Initial translation
    this.initializeTranslation();
    // Initial storage
    this.storageService.init();
    // Load theme setting
    this.themeService.loadTheme();
    // Initial sound
    this.initializeSound();
  }

  ngOnDestroy() {
    this.showLockScreenSubscribe?.unsubscribe();
  }

  /**
   * Check lock app
   */
  private checkLock() {
    this.appLockService.monitorAppState();
    this.showLockScreen = this.appLockService.getSettingAppLockStatus();

    // On lock screen state change from monitorAppState function of AppLockService
    this.showLockScreenSubscribe = this.stateService.showLockScreen$.subscribe((showLockScreen) => {
      this.showLockScreen = showLockScreen;
    });
  }

  /**
   * Init translation
   * @private
   */
  private initializeTranslation(): void {
    const defaultLanguage = this.localStorageService.get<string>(StorageKey.LANGUAGE) || LanguageKeys.VN;
    this.localStorageService.set(StorageKey.LANGUAGE, defaultLanguage);
    if (this.translate.getLangs()?.length) return;
    this.translate.addLangs([LanguageKeys.EN, LanguageKeys.VN]);
    this.translate.resetLang(defaultLanguage);
    this.translate.use(defaultLanguage);
  }

  /**
   * initializeSound
   * @private
   */
  private initializeSound(): void {
    setTimeout(() => {
      if (this.authService.isAuthenticated()) {
        this.soundService.loadUserSounds();
      }
    }, 500);
  }
}
