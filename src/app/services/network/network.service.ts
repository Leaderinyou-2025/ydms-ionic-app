import { Injectable, NgZone } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { IonicColors } from '../../shared/enums/ionic-colors';
import { TranslateKeys } from '../../shared/enums/translate-keys';
import { HttpClientMethods } from '../../shared/enums/http-client-methods';
import { environment } from '../../../environments/environment';
import { Position } from '../../shared/enums/position';
import { NativePlatform } from '../../shared/enums/native-platform';
import { StyleClass } from '../../shared/enums/style-class';
import { IonicIcons } from '../../shared/enums/ionic-icons';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  // Trạng thái mạng hiện tại: true = online, false = offline
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();
  private isOnlineStatus!: boolean;

  constructor(
    private ngZone: NgZone,
    private toastController: ToastController,
    private translate: TranslateService,
  ) {
    this.startListening();
  }

  /**
   * Bắt đầu theo dõi trạng thái mạng
   * @private
   */
  private startListening() {
    window.addEventListener('online', () => {
      this.ngZone.run(() => {
        this.isReallyOnline().then(() => {
          this.isOnlineSubject.next(true);
          this.presentToast(
            this.translate.instant(TranslateKeys.TOAST_NETWORK_ONLINE),
            IonicColors.PRIMARY
          );
        });
      });
    });

    window.addEventListener('offline', () => {
      this.ngZone.run(() => {
        this.isOnlineSubject.next(false);
        this.presentToast(
          this.translate.instant(TranslateKeys.TOAST_NETWORK_OFFLINE),
          IonicColors.DANGER
        );
      });
    });
  }

  /**
   * Hiện toast thông báo trạng thái mạng
   * @param message
   * @param color
   * @private
   */
  private async presentToast(message: string, color: IonicColors.PRIMARY | IonicColors.DANGER) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 5000,
      mode: NativePlatform.IOS,
      cssClass: `${StyleClass.TOAST_ITEM} ${color === IonicColors.DANGER ? StyleClass.TOAST_ERROR : StyleClass.TOAST_INFO}`,
      position: Position.TOP,
      icon: IonicIcons.WARNING_OUTLINE,
      keyboardClose: false
    });
    toast.present();
  }

  /**
   * Kiểm tra nhanh: thiết bị đang kết nối wifi/4G hay không
   */
  public isOnline(): boolean {
    return this.isOnlineStatus;
  }

  /**
   * Kiểm tra thực sự có Internet hay không
   */
  public async isReallyOnline(): Promise<boolean> {
    if (!navigator.onLine) {
      this.isOnlineStatus = false;
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(environment.checkInternetConnectionUrl, {
        method: HttpClientMethods.GET,
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      this.isOnlineStatus = response.ok;
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
