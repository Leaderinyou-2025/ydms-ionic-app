import {Injectable} from '@angular/core';
import {AlertController, AlertOptions} from '@ionic/angular';
import {Camera, CameraDirection, CameraResultType, CameraSource, ImageOptions} from '@capacitor/camera';
import {AndroidSettings, IOSSettings, NativeSettings} from 'capacitor-native-settings';
import {TranslateService} from '@ngx-translate/core';

import {TranslateKeys} from '../../shared/enums/translate-keys';
import {StyleClass} from '../../shared/enums/style-class';
import {NativePlatform} from '../../shared/enums/native-platform';


@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  croppedImagePath = '';

  constructor(
    private alertController: AlertController,
    private translate: TranslateService,
  ) {
  }

  /**
   * Pick an image from camera or gallery
   * @param sourceType
   * @param cameraDirection
   * @param saveToGallery
   * @param targetWidth
   * @param targetHeight
   */
  public async pickImage(
    sourceType: CameraSource = CameraSource.Camera,
    cameraDirection: CameraDirection = CameraDirection.Rear,
    saveToGallery = false,
    targetWidth = 768,
    targetHeight = 1366
  ): Promise<void> {
    const permissionResult = await Camera.checkPermissions();

    if (permissionResult.camera === 'denied' || permissionResult.photos === 'denied') {
      await this.showOpenSettingAlert();
    }

    const options: ImageOptions = {
      quality: 90,
      resultType: CameraResultType.Base64,
      width: targetWidth,
      height: targetHeight,
      correctOrientation: true,
      source: sourceType,
      saveToGallery: saveToGallery,
      direction: cameraDirection
    };
    const imageData = await Camera.getPhoto(options);
    this.croppedImagePath = imageData?.base64String || '';
  }

  /**
   * Return image resource base64 string
   */
  public getImageResourceBase64() {
    return this.croppedImagePath;
  }

  /**
   * Show alert to open settings
   * @private
   */
  private async showOpenSettingAlert() {
    const buttons = [
      {
        text: this.translate.instant(TranslateKeys.BUTTON_OPEN_SETTING),
        handler: () => this.openNativeSettings()
      },
      {text: this.translate.instant(TranslateKeys.BUTTON_CANCEL)}
    ];

    const alertOption: AlertOptions = {
      header: this.translate.instant(TranslateKeys.ALERT_DEFAULT_HEADER),
      message: this.translate.instant(TranslateKeys.ALERT_ACCESS_PERMISSION_GALLERY),
      buttons,
      animated: true,
      cssClass: StyleClass.INFO_ALERT,
      mode: NativePlatform.IOS
    };

    const alertItem = await this.alertController.create(alertOption);
    await alertItem.present();
  }

  /**
   * Open native setting
   * @private
   */
  private async openNativeSettings() {
    await NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App
    });
  }
}
