import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, LoadingController, SelectCustomEvent, ToastButton, ToastController, ToastOptions } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NavigationExtras, Router } from '@angular/router';

import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { AuthService } from '../../../../services/auth/auth.service';
import { PhotoService } from '../../../../services/photo/photo.service';
import { LiyYdmsAvatarService } from '../../../../services/models/liy.ydms.avatar.service';
import { AddressService } from '../../../../services/address/address.service';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { ILiyYdmsAvatar } from '../../../../shared/interfaces/models/liy.ydms.avatar';
import { CommonConstants } from '../../../../shared/classes/common-constants';
import { IResCountryState } from '../../../../shared/interfaces/models/res.country.state';
import { ILiyYdmsDistrict } from '../../../../shared/interfaces/models/liy.ydms.district';
import { ILiyYdmsPrecint } from '../../../../shared/interfaces/models/liy.ydms.precint';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { Position } from '../../../../shared/enums/position';
import { BtnRoles } from '../../../../shared/enums/btn-roles';
import { StyleClass } from '../../../../shared/enums/style-class';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { IAssetsResource } from '../../../../shared/interfaces/settings/assets-resource';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'],
  standalone: false
})
export class PersonalInfoComponent implements OnInit {

  authData!: IAuthData | undefined;
  avatar?: IAssetsResource;
  profileForm!: FormGroup;
  userImage!: string;

  stateList!: Array<IResCountryState>;
  districtList!: Array<ILiyYdmsDistrict>;
  precintList!: Array<ILiyYdmsPrecint>;
  maxYear = new Date().getFullYear() - 6;

  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;
  protected readonly CommonConstants = CommonConstants;

  constructor(
    private authService: AuthService,
    private liyYdmsAvatarService: LiyYdmsAvatarService,
    private addressService: AddressService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private translate: TranslateService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private photoService: PhotoService
  ) {
  }

  ngOnInit() {
    this.loadStateList();
  }

  ionViewDidEnter() {
    this.authService.getAuthData().then(authData => {
      this.authData = authData;
      this.initProfileForm();
      this.loadAvatarImage();
      this.userImage = this.getUserImage();
    });
  }

  /**
   * Check has error of control
   * @param controlName
   * @param errorType
   */
  public hasError(controlName: string, errorType: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  /**
   * On select date of birth
   * @param dateString
   */
  public onSelectDateOfBirth(dateString: string | Array<string> | null): void {
    if (!this.authData) return;
    if (!dateString || typeof dateString === 'string') {
      this.authData.dob = dateString || undefined;
    }
  }

  /**
   * On select state, load district list
   * @param event
   */
  public onSelectState(event: SelectCustomEvent) {
    this.precintList = new Array<ILiyYdmsPrecint>();
    this.districtList = new Array<ILiyYdmsDistrict>();

    if (!event.detail.value) return;

    this.addressService.getDistrictList(event.detail.value)
      .then(districtList => this.districtList = districtList);

    if (!this.authData) return;
    const selectState = this.stateList.find(u => u.id === event.detail.value);
    if (!selectState) return;
    this.authData.state_id = {id: selectState.id, name: selectState.name || ''};
    this.authData.district_id = undefined;
  }

  /**
   * On select district, load precint list
   * @param event
   */
  public onSelectDistrict(event: SelectCustomEvent) {
    this.precintList = new Array<ILiyYdmsPrecint>();

    if (!event.detail.value) return;

    this.addressService.getPrecintList(this.profileForm.value.state_id, event.detail.value)
      .then(precintList => this.precintList = precintList);

    if (!this.authData) return;
    const selectDistrict = this.districtList.find(u => u.id === event.detail.value);
    if (!selectDistrict) return;
    this.authData.district_id = {id: selectDistrict.id, name: selectDistrict.name || ''};
    this.authData.precint_id = undefined;
  }

  /**
   * On select precint
   * @param event
   */
  public onSelectPrecint(event: SelectCustomEvent) {
    if (!this.authData) return;
    const selectPrecint = this.precintList.find(u => u.id === event.detail.value);
    if (!selectPrecint) return;
    this.authData.precint_id = {id: selectPrecint.id, name: selectPrecint.name || ''};
  }

  /**
   * On click open setting avatar
   */
  public onClickSettingAvatar(): void {
    const navigationExtras: NavigationExtras = {state: {isBackground: false}};
    this.router.navigateByUrl(`${PageRoutes.PROFILE}/${PageRoutes.AVATAR_BACKGROUND}`, navigationExtras);
  }

  /**
   * On click change user image
   */
  public onClickChangeUserImage(): void {
    this.actionSheetController.create({
      header: this.translate.instant(TranslateKeys.TITLE_IMAGE),
      mode: NativePlatform.IOS,
      buttons: [
        {
          text: this.translate.instant(TranslateKeys.TITLE_TAKE_NEW_IMAGE),
          handler: () => {
            this.photoService.pickImage(1, 0, false).then(() => {
              const image = this.photoService.getImageResourceBase64();
              if (image) this.updateUserImage(image);
            });
          }
        },
        {
          text: this.translate.instant(TranslateKeys.TITLE_SELECT_GALLERY),
          handler: () => {
            this.photoService.pickImage(0, 0, false).then(() => {
              const image = this.photoService.getImageResourceBase64();
              if (image) this.updateUserImage(image);
            });
          }
        },
        {
          text: this.translate.instant(TranslateKeys.BUTTON_CANCEL),
          role: BtnRoles.CANCEL,
        }
      ]
    }).then(actionSheet => actionSheet.present());
  }

  /**
   * On click update profile
   */
  public async onClickUpdate() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    if (!this.authData) return;

    this.authData.name = this.profileForm.value.name;
    this.authData.nickname = this.profileForm.value.nickname;
    this.authData.email = this.profileForm.value.email;
    this.authData.phone = this.profileForm.value.phone;
    this.authData.gender = this.profileForm.value.gender;
    this.authData.street = this.profileForm.value.street;

    const loading = await this.loadingController.create({mode: NativePlatform.IOS})
    await loading.present();
    try {
      await this.authService.setAuthData(this.authData);
      const result = await this.authService.saveUserProfile();
      await loading?.dismiss();
      this.toastUpdateProfileResult(result);
    } catch (e: any) {
      console.error(e?.message);
      await loading?.dismiss();
    }
  }

  /**
   * Load avatar image
   * @private
   */
  private loadAvatarImage(): void {
    if (!this.authData?.is_teenager) return;

    if (!this.authData?.avatar?.id) {
      this.avatar = {
        id: -1,
        name: this.translate.instant(TranslateKeys.TITLE_NOT_SET_NICKNAME),
        image_url: '/assets/images/avatar/conan_no_set.png',
        image_512: '',
        resource_url: ''
      };
      return;
    }
    this.liyYdmsAvatarService.getImageById(this.authData.avatar.id).then(avatar => this.avatar = avatar);
  }

  /**
   * Get user avatar image
   */
  public getUserImage(imageBase64?: string): string {
    if (!this.authData) return '/assets/icons/svg/avatar.svg';
    if (!this.authData.image_128) return '/assets/icons/svg/avatar.svg';
    const prefix = CommonConstants.detectMimeType(imageBase64 || this.authData.image_128);
    if (!prefix) return '/assets/icons/svg/avatar.svg';
    return `${prefix}${imageBase64 ?? this.authData.image_128}`;
  }

  /**
   * Initialize login form
   * @private
   */
  private initProfileForm(): void {
    if (!this.authData) return;

    const validateNickname = [];
    const validateName = [];
    if (this.authData.is_teenager) validateNickname.push(Validators.required);
    else validateName.push(Validators.required);

    this.profileForm = new FormGroup({
      name: new FormControl(this.authData.name, validateName),
      nickname: new FormControl(this.authData.nickname, validateNickname),
      phone: new FormControl(this.authData.phone, []),
      email: new FormControl(this.authData.email, [Validators.required, Validators.email]),
      gender: new FormControl(this.authData.gender, []),
      dob: new FormControl(this.authData.dob, []),
      state_id: new FormControl(this.authData.state_id?.id, []),
      district_id: new FormControl(this.authData.district_id?.id, []),
      precint_id: new FormControl(this.authData.precint_id?.id, []),
      street: new FormControl(this.authData.street, []),
    });

    if (this.authData.state_id?.id) {
      this.addressService.getDistrictList(this.authData.state_id?.id).then(districtList => this.districtList = districtList)
    }

    if (this.authData.state_id?.id && this.authData.district_id?.id) {
      this.addressService.getPrecintList(
        this.authData.state_id.id,
        this.authData.district_id.id
      ).then(precintList => this.precintList = precintList)
    }
  }

  /**
   * Load state list
   * @private
   */
  private loadStateList(): void {
    this.addressService.getStateList().then(stateList => this.stateList = stateList);
  }

  /**
   * updateUserImage
   * @param imageBase64
   * @private
   */
  private updateUserImage(imageBase64: string): void {
    if (!this.authData) return;
    this.authData.image_128 = imageBase64;
    this.userImage = this.getUserImage(imageBase64);
    this.authService.setAuthData(this.authData).then(() => this.authService.saveUserImage());
  }

  /**
   * Show toast profile update result
   * @param result
   * @private
   */
  private toastUpdateProfileResult(result: boolean | number): void {
    this.toastController.getTop().then(popover => {
      const closeBtn: ToastButton = {
        icon: IonicIcons.CLOSE_CIRCLE_OUTLINE,
        side: Position.END,
        role: BtnRoles.CANCEL,
      }

      const toastOption: ToastOptions = {
        header: this.translate.instant(result ? TranslateKeys.TOAST_SUCCESS_HEADER : TranslateKeys.TOAST_WARNING_HEADER),
        message: this.translate.instant(result ? TranslateKeys.TOAST_UPDATE_SUCCESS : TranslateKeys.TOAST_UPDATE_FAILED),
        duration: 5000,
        buttons: [closeBtn],
        mode: NativePlatform.IOS,
        cssClass: `${StyleClass.TOAST_ITEM} ${result ? StyleClass.TOAST_SUCCESS : StyleClass.TOAST_ERROR}`,
        position: Position.TOP,
        icon: result ? IonicIcons.CHECKMARK_CIRCLE_OUTLINE : IonicIcons.WARNING_OUTLINE,
        color: result ? IonicColors.SUCCESS : IonicColors.WARNING,
        keyboardClose: false
      }

      if (!popover) {
        this.toastController.create(toastOption).then(toast => toast.present());
      } else {
        // Close current toast before show new toast
        this.toastController.dismiss().then(() => this.toastController.create(toastOption).then(toast => toast.present()))
      }
    });
  }
}
