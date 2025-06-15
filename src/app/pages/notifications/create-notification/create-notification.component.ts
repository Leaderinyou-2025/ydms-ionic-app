import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LoadingController,
  ModalController,
  RadioGroupCustomEvent,
  ToastButton,
  ToastController
} from '@ionic/angular';
import { CameraSource } from '@capacitor/camera';
import { TranslateService } from '@ngx-translate/core';

import { PageRoutes } from '../../../shared/enums/page-routes';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { DateFormat } from '../../../shared/enums/date-format';
import { AuthService } from '../../../services/auth/auth.service';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { IFileData } from '../../../shared/interfaces/function-data/file-data';
import { FileService } from '../../../services/file/file.service';
import { PhotoService } from '../../../services/photo/photo.service';
import { NativePlatform } from '../../../shared/enums/native-platform';
import { IonicColors } from '../../../shared/enums/ionic-colors';
import { IonicIcons } from '../../../shared/enums/ionic-icons';
import { Position } from '../../../shared/enums/position';
import { BtnRoles } from '../../../shared/enums/btn-roles';
import { StyleClass } from '../../../shared/enums/style-class';
import { IRelatedField } from '../../../shared/interfaces/base/related-field';
import { PublicEmotionalOption } from '../../../shared/enums/public-emotional-option';
import { RecipientTypes } from '../../../shared/enums/recipient-types';
import { SelectRecipientsComponent } from '../select-recipients/select-recipients.component';
import { AttachedFileType } from '../../../shared/enums/attached-file-type';
import { ResUsersService } from '../../../services/models/res.users.service';
import { LiyYdmsNotificationService } from '../../../services/models/liy.ydms.notification.service';
import { NotificationTypes } from '../../../shared/enums/notification-type';
import { CreateNotificationBody } from '../../../shared/interfaces/function-data/create-notification-body';

@Component({
  selector: 'app-create-notification',
  templateUrl: './create-notification.component.html',
  styleUrls: ['./create-notification.component.scss'],
  standalone: false
})
export class CreateNotificationComponent implements OnInit {

  createNotificationForm!: FormGroup;
  recipientType!: RecipientTypes;
  attachedImage?: string;
  attachedFile?: IFileData;
  selectedRecipients?: Array<Partial<IAuthData>>;
  authData?: IAuthData;

  private parentsList!: Array<IAuthData>;
  private studentList!: Array<IAuthData>;

  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;
  protected readonly DateFormat = DateFormat;
  protected readonly CommonConstants = CommonConstants;
  protected readonly PublicEmotionalOption = PublicEmotionalOption;
  protected readonly RecipientTypes = RecipientTypes;
  protected readonly AttachedFileType = AttachedFileType;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService,
    private translateService: TranslateService,
    private loadingController: LoadingController,
    private fileService: FileService,
    private photoService: PhotoService,
    private modalController: ModalController,
    private resUsersService: ResUsersService,
    private notificationService: LiyYdmsNotificationService,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then(authData => {
      this.authData = authData;
      this.preLoadRecipientData();
      this.initForm();
    });
  }

  /**
   * Check has error of control
   * @param controlName
   * @param errorType
   */
  public hasError(controlName: string, errorType: string): boolean {
    const control = this.createNotificationForm.get(controlName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  /**
   * Handle share type change
   */
  public async onRecipientTypeChange(event: RadioGroupCustomEvent): Promise<void> {
    if (event.detail.value === RecipientTypes.SPECIFIC_USERS) {
      return this.openSelectedRecipientsModal();
    } else if (event.detail.value === RecipientTypes.ALL) {
      this.selectedRecipients = [...this.parentsList, ...this.studentList];
    } else if (event.detail.value === RecipientTypes.PARENTS) {
      this.selectedRecipients = [...this.parentsList];
    } else if (event.detail.value === RecipientTypes.STUDENTS) {
      this.selectedRecipients = [...this.studentList];
    }
    this.recipientType = event.detail.value;
  }

  /**
   * Handles the action of removing a recipient when a click event occurs.
   *
   * @param {Partial<IAuthData>} user - The user data object containing optional authentication information.
   * Must include the 'id' field to proceed with removal.
   * @return {void} Does not return any value.
   */
  public onClickRemoveRecipient(user: Partial<IAuthData>): void {
    if (!user?.id) return;
    const existIndex = this.selectedRecipients?.findIndex(u => u.id === user.id);
    if (existIndex != undefined && existIndex >= 0) this.selectedRecipients?.splice(existIndex, 1);
    if (this.selectedRecipients?.length === 0) {
      this.recipientType = RecipientTypes.ALL;
      this.createNotificationForm.get('recipientType')?.setValue(RecipientTypes.ALL);
      this.selectedRecipients = [...this.parentsList, ...this.studentList];
    }
  }

  /**
   * On click select an attached file
   * @param type
   */
  public async onClickSelectAttachedFile(type: AttachedFileType): Promise<void> {
    if (!type) return;
    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();

    try {
      if (type === AttachedFileType.DOCUMENTS) {
        this.attachedImage = undefined;
        this.fileService.selectFile().then(file => {
          this.attachedFile = file;
        });
      } else {
        this.attachedFile = undefined;
        this.photoService.pickImage(
          type === AttachedFileType.GALLERY ? CameraSource.Photos : CameraSource.Camera
        ).then(() => {
          this.attachedImage = this.photoService.getImageResourceBase64();
        });
      }
    } catch (e: any) {
      console.error(e);
      this.showToast(e?.message, IonicColors.DANGER);
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Handles the form submission for sending notifications. Validates the form,
   * checks for recipients, and sends notification requests to the selected recipients.
   * Displays appropriate success or error messages based on the result of the operation.
   *
   * @return {Promise<void>} A promise that resolves when the method completes its operation,
   * either by successfully sending notifications or encountering an error.
   */
  public async onSubmitForm(): Promise<void> {
    if (this.createNotificationForm.invalid) {
      this.createNotificationForm.markAllAsTouched();
      return;
    }

    // Check no recipient
    if (!this.selectedRecipients?.length) return;

    // Send notification
    return this.sendNotifications();
  }

  /**
   * Sends notifications to the selected recipients based on the provided form data.
   * The method filters out invalid recipients, constructs the notification payload,
   * and sends notifications for all valid recipients. Includes error handling and displays
   * appropriate success or error messages.
   *
   * @return {Promise<void>} A promise that resolves when all notifications are sent or rejects if an error occurs.
   */
  private async sendNotifications(): Promise<void> {
    if (!this.selectedRecipients?.length) return;

    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();

    try {
      const name = this.createNotificationForm.get('name')?.value;
      const description = this.createNotificationForm.get('description')?.value;
      const body = this.createNotificationForm.get('body')?.value;
      const senderId = this.authData?.id || -1;
      const attachmentId = this.attachedImage || this.attachedFile?.base64 || '';
      const attachmentName = this.attachedFile?.fileName || '';
      const mimeType = this.attachedFile?.mimeType || '';

      const validRecipients = this.selectedRecipients.filter(u => u.partner_id?.id);

      if (!validRecipients.length) {
        return;
      }

      // Chia thành từng lô (batch size = 5)
      const batchSize = 5;
      for (let i = 0; i < validRecipients.length; i += batchSize) {
        const batch = validRecipients.slice(i, i + batchSize);
        const requests = batch.map(recipient => {
          const notificationBody: CreateNotificationBody = {
            name,
            description,
            sender_id: senderId,
            recipient_ids: [recipient.partner_id?.id || -1],
            body,
            notification_type: NotificationTypes.OTHER,
            attachment_id: attachmentId,
            attachment_name: attachmentName,
            x_attach_file_mine_type: mimeType,
          };
          return this.notificationService.createNotification(notificationBody);
        });

        const results = await Promise.allSettled(requests);

        const failed = results.filter(r => !r);
        if (failed?.length) throw this.translateService.instant(TranslateKeys.ERROR_UNKNOWN);
      }

      this.showToast(
        this.translateService.instant(TranslateKeys.TOAST_SEND_NOTIFICATION_SUCCESS),
        IonicColors.SUCCESS
      );
      this.router.navigateByUrl(PageRoutes.NOTIFICATIONS);
    } catch (e: any) {
      this.showToast(e?.message || this.translateService.instant(TranslateKeys.ERROR_UNKNOWN), IonicColors.DANGER);
    } finally {
      loading.dismiss();
    }
  }

  /**
   * Opens a modal to select recipients. The modal is configured with specific properties
   * such as the mode, component, initial breakpoint, and other settings. Once the modal
   * is presented, it handles the dismissal event to process the result data.
   *
   * @return {Promise<void>} A promise that resolves when the modal operation completes.
   */
  private openSelectedRecipientsModal(): void {
    this.modalController.create({
      mode: NativePlatform.IOS,
      component: SelectRecipientsComponent,
      initialBreakpoint: 0.8,
      breakpoints: [0, 0.8],
      componentProps: {parents: this.parentsList, students: this.studentList}
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then((result) => {
        if (!result.data?.length) {
          this.createNotificationForm.get('recipientType')?.setValue(this.recipientType || RecipientTypes.ALL);
        } else {
          this.selectedRecipients = result.data;
          this.recipientType = RecipientTypes.SPECIFIC_USERS;
        }
      });
    });
  }

  /**
   * Init form
   * @private
   */
  private initForm(): void {
    this.selectedRecipients = new Array<IRelatedField>();
    this.recipientType = RecipientTypes.ALL;
    this.createNotificationForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      body: new FormControl('', [Validators.required]),
      recipientType: new FormControl(RecipientTypes.ALL, [Validators.required]),
    });
  }

  /**
   * Preloads recipient data including student list and their associated parent list based on the current classroom ID.
   * Fetches the students in the classroom and subsequently fetches their parent's data if available.
   *
   * @return {void} Does not return any value.
   */
  private preLoadRecipientData(): void {
    if (!this.authData?.classroom_id?.id) return;
    this.resUsersService.getTeenagersByClassroomId(this.authData.classroom_id.id, 0, 0)
      .then((students) => {
        this.studentList = students || [];
        const parentIds = Array.from(new Set(students.map(s => s.parent_id?.id).filter(id => id !== undefined)));
        if (parentIds.length) this.resUsersService.getListUserByIds(parentIds)
          .then(parents => {
            this.parentsList = parents;
            this.selectedRecipients = [...this.parentsList, ...this.studentList];
          });
      });
  }

  /**
   * Show toast message
   * @param message Message
   * @param color Color
   */
  private async showToast(message: string, color: IonicColors): Promise<void> {
    const closeBtn: ToastButton = {
      icon: IonicIcons.CLOSE_CIRCLE_OUTLINE,
      side: Position.END,
      role: BtnRoles.CANCEL,
    };
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      buttons: [closeBtn],
      mode: NativePlatform.IOS,
      cssClass: `${StyleClass.TOAST_ITEM} ${color === IonicColors.DANGER ? StyleClass.TOAST_ERROR : StyleClass.TOAST_SUCCESS}`,
      position: Position.TOP,
      icon: color === IonicColors.DANGER ? IonicIcons.WARNING_OUTLINE : IonicIcons.CHECKMARK_CIRCLE_OUTLINE,
      color,
      keyboardClose: false
    });
    await toast.present();
  }
}
