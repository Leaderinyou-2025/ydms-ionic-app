import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonContent, LoadingController, NavController, Platform, ToastButton, ToastController, ToastOptions } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { AvailableResult } from 'capacitor-native-biometric';

import { AuthService } from '../../services/auth/auth.service';
import { LiveUpdateService } from '../../services/live-update/live-update.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { AccountHistoryService } from '../../services/account-history/account-history.service';
import { KeyboardService } from '../../services/keyboard/keyboard.service';
import { NetworkService } from '../../services/network/network.service';
import { PushNotificationService } from '../../services/push-notification/push-notification.service';
import { BiometricService } from '../../services/biometric/biometric.service';
import { StorageKey } from '../../shared/enums/storage-key';
import { TranslateKeys } from '../../shared/enums/translate-keys';
import { SoundService } from '../../services/sound/sound.service';
import { StyleClass } from '../../shared/enums/style-class';
import { NativePlatform } from '../../shared/enums/native-platform';
import { IAccountHistory } from '../../shared/interfaces/function-data/account-history';
import { IonicIcons } from '../../shared/enums/ionic-icons';
import { Position } from '../../shared/enums/position';
import { BtnRoles } from '../../shared/enums/btn-roles';
import { IonicColors } from '../../shared/enums/ionic-colors';
import { CommonConstants } from '../../shared/classes/common-constants';
import { PageRoutes } from '../../shared/enums/page-routes';
import { LanguageKeys } from '../../shared/enums/language-keys';
import { ThemeService } from '../../services/theme/theme.service';
import { TextZoomService } from '../../services/text-zoom/text-zoom.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit, OnDestroy {

  @ViewChild(IonContent, {static: true}) content!: IonContent;
  isReady!: boolean;
  loginForm!: FormGroup;
  defaultLang!: string | undefined;
  appVersion!: string;
  protected readonly TranslateKeys = TranslateKeys;
  protected readonly LanguageKeys = LanguageKeys;
  deviceHeight!: string;

  // Auto complete account
  accountList: Array<IAccountHistory> = [];
  filteredAccounts: Array<IAccountHistory> = [];
  showSuggestions = false;
  private inputSubject = new Subject<string>();

  // Biometric
  biometricAvailable!: AvailableResult | undefined;
  hasCredentials!: boolean;
  isFaceID!: boolean;
  isEnableBiometric!: boolean | undefined;

  // Keyboard
  keyboardSub!: Subscription;


  constructor(
    public platform: Platform,
    private authService: AuthService,
    private translate: TranslateService,
    private localStorageService: LocalStorageService,
    private liveUpdateService: LiveUpdateService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private accountHistoryService: AccountHistoryService,
    private navCtrl: NavController,
    private keyboardService: KeyboardService,
    private pushNotificationService: PushNotificationService,
    private networkService: NetworkService,
    private soundService: SoundService,
    private biometricService: BiometricService,
    private themeService: ThemeService,
    private textZoomService: TextZoomService,
  ) {
  }

  ngOnInit() {
    this.isReady = false;
    this.platform.ready().then(() => this.deviceHeight = `${this.platform.height()}px`);
    this.initializeTranslation();
    this.onKeyboardChangeState();
  }

  ionViewDidEnter() {
    this.isReady = false;
    // Get live update app version
    this.liveUpdateService.getAppVersionString().then(appVersionString => this.appVersion = appVersionString);
    // Initial app
    setTimeout(() => this.initApp(), 500);
    this.soundService.stopBackground();
  }

  ngOnDestroy() {
    this.keyboardSub?.unsubscribe();
  }

  /**
   * Initial app
   * @private
   */
  private async initApp(): Promise<void> {
    // Create loading
    const loading = await this.loadingController.create({
      mode: NativePlatform.IOS,
      message: this.translate.instant(TranslateKeys.TITLE_DATA_UPDATING)
    });
    await loading.present();

    try {
      // Init login form and handle autocomplete input account
      this.initLoginForm();
      this.handleAccountAutocomplete();

      // Check network is online
      const isOnline = await this.networkService.isReallyOnline();
      if (isOnline) {
        // Live update checking
        await this.liveUpdateService.checkUpdateApp();
        // Init firebase
        await this.pushNotificationService.init();

        // Check user is authenticated to redirect home page
        if (this.authService.isAuthenticated()) {
          this.isReady = false;

          // Preload music
          this.soundService.loadUserSounds();

          // Sync user firebase device token to server
          this.pushNotificationService.updateUserFirebaseToken();

          // Check user role and redirect to home page
          this.authService.getAuthData().then(authData => {
            this.navCtrl.navigateRoot(
              `/${authData?.is_teacher ? PageRoutes.TEACHER_DASHBOARD : (authData?.is_parent ? PageRoutes.PARENT_DASHBOARD : PageRoutes.HOME)}`,
              {replaceUrl: true}).finally(() => loading?.dismiss()
            );
          });
        }
      }

      await loading?.dismiss();
      this.isReady = true;
    } finally {
      this.isReady = true;
      await loading?.dismiss();
    }
  }


  /**-------------------- Login form & login handle ------------------------*/

  /**
   * Handle onclick login button
   * @public
   */
  public async onClickLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    await this.handleLogin();
  }

  /**
   * Check has error of control
   * @param controlName
   * @param errorType
   */
  public hasError(controlName: string, errorType: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  /**
   * Initialize login form
   * @private
   */
  private initLoginForm(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      remember: new FormControl(true, []),
    });
    this.textZoomService.initZoom();
    this.themeService.loadTheme();
  }

  /**
   * Handle call api to auth user
   * @private
   */
  private async handleLogin(): Promise<void> {
    // Show loading
    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();
    try {
      // Call API login and get user profile
      const loginResult = await this.authService.login(
        this.loginForm.value.username,
        this.loginForm.value.password
      );

      // Close loading
      await loading.dismiss();

      // Login error, show error toast and end process
      if (!loginResult) {
        this.toastErrorLogin();

        // Clear biometric credentials
        if (this.hasCredentials) {
          this.hasCredentials = false;
          await this.biometricService.deleteCredentials(this.loginForm.value.username);
        }

        // End process
        return;
      }

      /*----------- Login success ------------------*/

      // Preload user music
      await this.soundService.loadUserSounds();
      this.textZoomService.initZoom();
      this.themeService.loadTheme();


      // Remember account handle
      if (this.loginForm.value.remember) {
        const accountHistory: IAccountHistory = {
          username: this.loginForm.value.username,
          created_at: Date.now(),
          updated_at: Date.now()
        }
        await this.accountHistoryService.addAccount(accountHistory);
      }

      // Sync user firebase device token to server
      await this.pushNotificationService.updateUserFirebaseToken();

      // Login success check role to redirect home page
      this.authService.getAuthData().then(authData => {
        this.navCtrl.navigateRoot(
          `/${authData?.is_teacher ? PageRoutes.TEACHER_DASHBOARD : (authData?.is_parent ? PageRoutes.PARENT_DASHBOARD : PageRoutes.HOME)}`,
          {replaceUrl: true}).finally(() => loading?.dismiss()
        );
      });
    } catch (e: any) {
      console.error(e?.message);
      this.loadingController.getTop().then(loading => loading?.dismiss());
    }
  }

  /**
   * Open toast error login
   * @private
   */
  private toastErrorLogin(): void {
    this.toastController.getTop().then(popover => {
      const closeBtn: ToastButton = {
        icon: IonicIcons.CLOSE_CIRCLE_OUTLINE,
        side: Position.END,
        role: BtnRoles.CANCEL,
      }
      const toastOption: ToastOptions = {
        header: this.translate.instant(TranslateKeys.TOAST_WARNING_HEADER),
        message: this.translate.instant(TranslateKeys.TOAST_AUTH_FAILED),
        duration: 5000,
        buttons: [closeBtn],
        mode: NativePlatform.IOS,
        cssClass: `${StyleClass.TOAST_ITEM} ${StyleClass.TOAST_ERROR}`,
        position: Position.TOP,
        icon: IonicIcons.WARNING_OUTLINE,
        color: IonicColors.WARNING,
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

  /**
   * On keyboard change state
   * @private
   */
  private onKeyboardChangeState() {
    this.keyboardSub = this.keyboardService.isKeyboardOpen$.subscribe(isOpen => {
      setTimeout(() => {
        this.toggleScroll(isOpen);
      }, 50);
    });
  }

  /**
   * toggleScroll
   * @param allowScroll
   * @private
   */
  private toggleScroll(allowScroll: boolean) {
    const scrollElement = this.content.getScrollElement();
    scrollElement.then((el) => {
      if (allowScroll) {
        el.style.overflowY = 'auto';
      } else {
        el.style.overflowY = 'hidden';
      }
    });
  }


  /**-------------------- Input account autocomplete ------------------------*/

  /**
   * On username input
   * @param event
   * @public
   */
  public onUsernameInput(event: any): void {
    const value = event.detail.value;
    this.hasCredentials = false;
    this.inputSubject.next(value);
  }

  /**
   * onBlurUsernameInput
   */
  public onBlurUsernameInput(): void {
    setTimeout(() => this.showSuggestions = false, 500);
  }

  /**
   * On select username
   * @param acc
   * @public
   */
  public selectUsername(acc: IAccountHistory): void {
    this.loginForm.get('username')?.setValue(acc?.username || '');
    this.filteredAccounts = [];
    this.showSuggestions = false;
    this.hasCredentials = false;
    if (acc?.username) this.checkBiometricAvailable();
  }

  /**
   * Load and handle account autocomplete
   * @private
   */
  private handleAccountAutocomplete(): void {
    // Load saved account list
    this.accountHistoryService.getAccountHistory().then(accountList => {
      this.accountList = accountList.sort((a, b) => b.updated_at - a.updated_at);
      if (this.accountList.length > 0) {
        this.loginForm.get('username')?.setValue(this.accountList[0].username);
        this.checkBiometricAvailable();
      }
    });

    // Handle subject change input username
    this.inputSubject.pipe(debounceTime(500)).subscribe((input) => {
      if (input) {
        this.filteredAccounts = this.accountList.filter((acc) =>
          acc.username.toLowerCase().includes(input.toLowerCase())
        );
      } else {
        this.filteredAccounts = this.accountList;
      }
      this.showSuggestions = !!this.filteredAccounts.length;
    });
  }


  /**-------------------- TRANSLATION ---------------------------------------*/

  /**
   * On switch language
   * @param lang
   */
  public switchLanguage(lang: string): void {
    if (lang === this.defaultLang) return;
    this.defaultLang = lang;
    this.translate.use(lang);
    this.updateLanguageFlag();
    this.localStorageService.set(StorageKey.LANGUAGE, lang);
  }

  /**
   * Init translation
   * @private
   */
  private initializeTranslation(): void {
    this.defaultLang = this.localStorageService.get<string>(StorageKey.LANGUAGE);
    if (this.defaultLang !== LanguageKeys.VN) setTimeout(() => this.updateLanguageFlag(), 100);
  }

  /**
   * Update flag image icon
   * @private
   */
  private updateLanguageFlag(): void {
    const selectElement = document.querySelector('.switch-lang-container');
    if (selectElement instanceof HTMLElement) {
      const flagUrl = this.defaultLang === LanguageKeys.VN ? CommonConstants.languageFlagImageUrls.vn : CommonConstants.languageFlagImageUrls.en;
      selectElement.style.backgroundImage = `url(${flagUrl})`;
    }
  }


  /**-------------------- BIOMETRIC ---------------------------------------*/

  /**
   * Login with biometric
   * @public
   */
  public async onClickLoginBiometric(): Promise<void> {
    if (!this.biometricAvailable?.isAvailable) return;

    const username: string = this.loginForm.get('username')?.value;

    const verifyResult = await this.biometricService.verifyIdentity();
    if (!verifyResult) {
      this.toastErrorBiometric();
      await this.biometricService.deleteCredentials(username);
      return;
    }

    const certificate = await this.biometricService.getCredentials(username);
    if (!certificate || !certificate?.username || !certificate?.password) {
      this.toastErrorBiometric();
      await this.biometricService.deleteCredentials(username);
      return;
    }

    this.loginForm.get('username')?.setValue(certificate.username);
    this.loginForm.get('password')?.setValue(certificate.password);
    await this.handleLogin();
  }

  /**
   * Check available biometric
   * @private
   */
  private checkBiometricAvailable(): void {
    this.isEnableBiometric = this.biometricService.getBiometricSettingStatus();
    if (this.platform.is(NativePlatform.MOBILEWEB) ||
      (!this.platform.is(NativePlatform.ANDROID) && !this.platform.is(NativePlatform.IOS))) return;

    this.biometricAvailable = this.biometricService.getAvailableResult();
    this.hasCredentials = false;
    this.isFaceID = this.biometricService.isFaceId();

    if (!this.biometricAvailable?.isAvailable) return;

    const username: string = this.loginForm.get('username')?.value;
    this.biometricService.getCredentials(username).then(certificate => {
      this.hasCredentials = (certificate?.username != null && certificate?.username === username && certificate?.password != null);
      if (!this.hasCredentials && certificate) this.biometricService.deleteCredentials(username);
    }).catch(e => console.error(e.message));
  }

  /**
   * Open toast error biometric
   * @private
   */
  private toastErrorBiometric(): void {
    const closeBtn: ToastButton = {
      icon: IonicIcons.CLOSE_CIRCLE_OUTLINE,
      side: Position.END,
      role: BtnRoles.CANCEL,
    }
    const toastOption: ToastOptions = {
      header: this.translate.instant(TranslateKeys.TOAST_ERROR_HEADER),
      message: this.translate.instant(TranslateKeys.TOAST_AUTH_BY_PASSWORD),
      duration: 5000,
      buttons: [closeBtn],
      mode: NativePlatform.IOS,
      cssClass: `${StyleClass.TOAST_ITEM} ${StyleClass.TOAST_ERROR}`,
      position: Position.TOP,
      icon: IonicIcons.WARNING_OUTLINE,
      color: IonicColors.DANGER,
      keyboardClose: false
    }
    this.toastController.create(toastOption).then(toast => toast.present());
  }
}
