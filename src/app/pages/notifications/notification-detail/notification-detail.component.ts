import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, Platform } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

import { AuthService } from '../../../services/auth/auth.service';
import { LiyYdmsNotificationService } from '../../../services/models/liy.ydms.notification.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { ILiyYdmsNotification } from '../../../shared/interfaces/models/liy.ydms.notification';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { NativePlatform } from '../../../shared/enums/native-platform';
import { DateFormat } from '../../../shared/enums/date-format';
import { NotificationTypes } from '../../../shared/enums/notification-type';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { GuideType } from '../../../shared/enums/guide-type';

@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
  standalone: false
})
export class NotificationDetailComponent implements OnInit {

  notification!: ILiyYdmsNotification;

  private authData?: IAuthData;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly DateFormat = DateFormat;
  protected readonly NotificationTypes = NotificationTypes;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private platform: Platform,
    private loadingController: LoadingController,
    private authService: AuthService,
    private notificationService: LiyYdmsNotificationService,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then(authData => this.authData = authData);
    const id = this.route.snapshot.paramMap.get('id');
    if (id != null) {
      this.getDetailNotification(+id);
    } else {
      history.back();
    }
  }

  /**
   * On click download attachment file
   */
  public onClickDownloadAttachment() {
    if (!this.notification?.attachment_id || !this.notification?.attachment_name) return;
    const attachmentNames = this.notification.attachment_name.split('.');
    const fileExtension = attachmentNames[attachmentNames.length - 1];
    this.downloadAttachmentHandle(fileExtension);
  }

  public onClickViewDetailAction(): void {
    if (!this.notification || !this.authData) return;

    const {notification_type} = this.notification;
    const {is_parent, is_teacher, is_teenager} = this.authData;

    // Trường hợp thông báo chia sẻ cảm xúc
    if (notification_type === NotificationTypes.EMOTIONAL) {
      const route = is_parent
        ? PageRoutes.PARENT_DASHBOARD : is_teacher
          ? PageRoutes.TEENAGER_SHARED_EMOTION : PageRoutes.PERSONAL_DIARY;

      this.router.navigateByUrl(`/${route}`);
      return;
    }

    // Trường hợp thông báo hoạt động/nhiệm vụ
    if (notification_type === NotificationTypes.TASK) {
      if (is_parent) {
        const url = `/${PageRoutes.TASK_EXECUTING}?guideType=${GuideType.FAMILY_ACTIVITY}&showFooter=true`;
        this.router.navigateByUrl(url);
      } else {
        const route = is_teacher ? PageRoutes.GROUP_TASK : PageRoutes.TASK;
        this.router.navigateByUrl(`/${route}`);
      }
      return;
    }

    // Thông báo chia sẻ kinh nghiệm
    if (notification_type === NotificationTypes.EXPERIENCE) {
      if (is_parent) {
        this.router.navigateByUrl(`/${PageRoutes.SHARE_EXPERIENCE}`);
      }
      return;
    }

    // Thông báo khảo sát định kỳ
    if (notification_type === NotificationTypes.ASSESSMENT) {
      this.router.navigateByUrl(`/${is_teenager ? PageRoutes.TASK : PageRoutes.FAMILY_COMMUNICATION_QUALITY_SURVEY}`);
      return;
    }
  }

  /**
   * Load notification detail
   * @param id
   * @private
   */
  private getDetailNotification(id: number): void {
    if (!id) return;
    this.notificationService.getNotificationDetail(id).then(notification => {
      if (notification) {
        this.notification = notification;
        this.maskAsRead();
      }
    });
  }

  /**
   * mask notification as read state
   * @private
   */
  private async maskAsRead(): Promise<void> {
    if (!this.notification) return;
    await this.notificationService.markAsRead([this.notification.id]);
  }

  /**
   * Handle download file from base64
   * @param extension
   * @private
   */
  private downloadAttachmentHandle(extension: string): void {
    let fileMIMEType = CommonConstants.getMimeType(extension);
    if (this.platform.is(NativePlatform.CAPACITOR)) {
      this.loadingController.create({mode: NativePlatform.IOS}).then(loading => {
        Filesystem.writeFile({
          path: this.notification.attachment_name || '',
          directory: Directory.Documents,
          data: this.notification.attachment_id || ''
        }).then(result => {
          if (result.uri) FileOpener.open({filePath: result.uri, contentType: fileMIMEType});
        }).finally(() => loading?.dismiss());
      });
    } else {
      let a = document.createElement('a');
      a.href = `data:${fileMIMEType};base64,${this.notification.attachment_id}`;
      a.download = this.notification.attachment_name || '';
      a.click();
    }
  }
}
