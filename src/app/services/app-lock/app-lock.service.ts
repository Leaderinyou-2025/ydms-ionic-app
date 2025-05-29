import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';

import { StorageService } from '../storage/storage.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { StateService } from '../state/state.service';
import { BiometricService } from '../biometric/biometric.service';
import { StorageKey } from '../../shared/enums/storage-key';
import { NativePlatform } from '../../shared/enums/native-platform';

@Injectable({
  providedIn: 'root'
})
export class AppLockService {

  private locked = false;
  private backgroundTime: number | null = null;
  private skipNextAppResume = false;


  constructor(
    private storageService: StorageService,
    private localStorageService: LocalStorageService,
    private platform: Platform,
    private stateService: StateService,
    private biometricService: BiometricService
  ) {
    this.stateService.verifyByBiometric$.subscribe(() => this.skipNextAppResume = !this.platform.is(NativePlatform.IOS));
  }

  /**
   * Return app lock status on localStorage
   */
  public getSettingAppLockStatus(): boolean {
    return this.localStorageService.get<boolean>(StorageKey.APP_LOCK_ENABLE) || false;
  }

  /**
   * Return app unlock by biometric status on localStorage
   */
  public getSettingAppUnlockBiometricStatus(): boolean {
    return this.localStorageService.get<boolean>(StorageKey.APP_UNLOCK_BIOMETRIC_ENABLE) || false;
  }

  /**
   * Return setting delay time (seconds) to app lock
   */
  public getSettingAppLockTime(): number {
    return this.localStorageService.get<number>(StorageKey.APP_LOCK_TIMEOUT) || 0;
  }

  /**
   * Save app lock status
   * @param status
   */
  public setSettingAppLockStatus(status: boolean): void {
    this.localStorageService.set<boolean>(StorageKey.APP_LOCK_ENABLE, status);
  }

  /**
   * Save app unlock by biometric status
   * @param status
   */
  public setSettingAppUnlockBiometricStatus(status: boolean): void {
    this.localStorageService.set<boolean>(StorageKey.APP_UNLOCK_BIOMETRIC_ENABLE, status);
  }

  /**
   * Mở khóa ứng dụng: ưu tiên biometric, fallback là PIN
   */
  public async unlockAppByBiometric(): Promise<boolean> {
    const allowBiometric = this.getSettingAppUnlockBiometricStatus();
    if (!allowBiometric) {
      return false;
    }

    this.skipNextAppResume = true;
    return this.biometricService.verifyIdentity();
  }

  /**
   * Trạng thái ứng dụng hiện tại có bị khóa không
   */
  public isLocked(): boolean {
    return this.locked;
  }

  /**
   * Kiểm tra mã PIN do người dùng nhập
   * @param pin
   */
  public async verifyPin(pin: string): Promise<boolean> {
    const saved = await this.storageService.get<string>(StorageKey.APP_LOCK_PIN)
    return pin === saved;
  }

  /**
   * Lưu mã PIN mới
   * @param pin
   */
  public async setPin(pin: string) {
    await this.storageService.set<string>(StorageKey.APP_LOCK_PIN, pin);
  }

  /**
   * Theo dõi trạng thái app (foreground/background)
   */
  public monitorAppState() {
    if (!this.platform.is(NativePlatform.MOBILEWEB) &&
      (this.platform.is(NativePlatform.ANDROID) || this.platform.is(NativePlatform.IOS))) {
      App.addListener('pause', () => this.handleAppPause());
      App.addListener('resume', () => this.handleAppResume());
    } else {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.handleAppPause();
        } else {
          this.handleAppResume();
        }
      });
    }
  }

  /**
   * Save delay time to app auto lock
   * @param timeSeconds
   */
  public setSettingAppLockTime(timeSeconds: number): void {
    this.localStorageService.set<number>(StorageKey.APP_LOCK_TIMEOUT, timeSeconds);
  }

  /**
   * handleAppPause
   * @private
   */
  private handleAppPause() {
    if (!this.getSettingAppLockStatus()) return;
    this.backgroundTime = Date.now();
  }

  /**
   * handleAppResume
   * @private
   */
  private handleAppResume() {
    if (!this.getSettingAppLockStatus() || this.skipNextAppResume) {
      this.skipNextAppResume = false;
      return;
    }

    const timeout = this.localStorageService.get<number>(StorageKey.APP_LOCK_TIMEOUT) || 0;
    if (timeout === 0) {
      this.locked = true;
      this.stateService.setShowLockScreen(true);
      return;
    }

    const now = Date.now();
    const elapsed = (now - (this.backgroundTime || 0)) / 1000;
    if (elapsed >= timeout) {
      this.locked = true;
      this.stateService.setShowLockScreen(true);
    }
  }
}
