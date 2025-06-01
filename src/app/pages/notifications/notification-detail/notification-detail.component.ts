import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, Platform } from '@ionic/angular';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { ILiyYdmsNotification } from '../../../shared/interfaces/models/liy.ydms.notification';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { NativePlatform } from '../../../shared/enums/native-platform';
import { DateFormat } from '../../../shared/enums/date-format';
import { LiyYdmsNotificationService } from '../../../services/models/liy.ydms.notification.service';

@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
  standalone: false
})
export class NotificationDetailComponent implements OnInit {

  notification!: ILiyYdmsNotification;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly DateFormat = DateFormat;

  constructor(
    private route: ActivatedRoute,
    private notificationService: LiyYdmsNotificationService,
    private platform: Platform,
    private loadingController: LoadingController,
  ) {
  }

  ngOnInit() {
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
