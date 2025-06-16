import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, RefresherCustomEvent, AlertController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth/auth.service';
import { IEmotionalDiary } from '../../../shared/interfaces/personal-diary/personal-diary.interfaces';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { ILiyYdmsEmotionalDiary } from '../../../shared/interfaces/models/liy.ydms.emotional.diary';
import { LiyYdmsEmotionalDiaryService } from '../../../services/models/liy.ydms.emotional.diary.service';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { DateFormat } from '../../../shared/enums/date-format';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { ResUsersService } from '../../../services/models/res.users.service';
import { LiyYdmsNotificationService } from '../../../services/models/liy.ydms.notification.service';
import { CreateNotificationBody } from '../../../shared/interfaces/function-data/create-notification-body';
import { NotificationTypes } from '../../../shared/enums/notification-type';


@Component({
  selector: 'app-teenager-shared-emotion',
  templateUrl: './teenager-shared-emotion.page.html',
  styleUrls: ['./teenager-shared-emotion.page.scss'],
  standalone: false
})
export class TeenagerSharedEmotionPage implements OnInit {

  authData?: IAuthData;
  emotionalDiaryList!: IEmotionalDiary[];
  isLoading?: boolean;
  isLoadMore = false;
  private paged: number = 1;
  private readonly limit: number = 20;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly CommonConstants = CommonConstants;
  protected readonly DateFormat = DateFormat;
  protected readonly Array = Array;
  protected readonly PageRoutes = PageRoutes;

  constructor(
    private authService: AuthService,
    private emotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private resUsersService: ResUsersService,
    private notificationService: LiyYdmsNotificationService,
    private alertController: AlertController,
    private toastController: ToastController,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then((authData) => {
      this.authData = authData;
      console.log('authData', authData);
      this.getEmotionalDiaryList();
    });
  }

  ionViewDidEnter() {
    if (this.emotionalDiaryList) this.doRefresh();
  }


  /**
   * Handle pull-to-refresh
   * @param event Refresh event
   */
  public doRefresh(event?: RefresherCustomEvent): void {
    if (this.isLoading) {
      event?.target.complete();
      return;
    }

    setTimeout(() => {
      this.paged = 1;
      this.emotionalDiaryList = new Array<IEmotionalDiary>();
      this.getEmotionalDiaryList().finally(() => event?.target.complete());
    }, 500);
  }


  /**
   * Load more items when scrolling down
   * @param event Infinite scroll event
   */
  public loadMore(event: InfiniteScrollCustomEvent): void {
    if (this.isLoading) {
      event.target.complete();
      return;
    }

    if (this.emotionalDiaryList?.length < ((this.paged - 1) * this.limit)) {
      event.target.complete();
      return;
    }

    this.paged += 1;
    this.isLoadMore = true;
    this.getEmotionalDiaryList().finally(() => {
      event.target.complete();
      this.isLoadMore = false;
    });
  }

  /**
   * Get emotion diary list
   * @private
   */
  private async getEmotionalDiaryList(): Promise<void> {
    if (this.isLoading || !this.authData) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;
    let results: ILiyYdmsEmotionalDiary[];
    results = await this.emotionalDiaryService.getTeenagerSharedEmotionDiaryList(
      this.authData.id, offset, this.limit
    );

    this.emotionalDiaryList = CommonConstants.mergeArrayObjectById(this.emotionalDiaryList, results) || [];
    this.isLoading = false;
  }

  /**
   * Gửi thông báo cho phụ huynh về cảm xúc của học sinh
   * @param emotionDiary
   */
  public async sendNotificationToParent(emotionDiary: IEmotionalDiary): Promise<void> {
    if (!emotionDiary.teenager_id?.id || !this.authData) return;

    // Hiển thị dialog xác nhận
    const alert = await this.alertController.create({
      header: this.translate.instant(TranslateKeys.ALERT_DEFAULT_HEADER),
      message: this.translate.instant(TranslateKeys.NOTIFICATIONS_SEND_TO_PARENT_CONFIRM),
      buttons: [
        {
          text: this.translate.instant(TranslateKeys.BUTTON_CANCEL),
          role: 'cancel'
        },
        {
          text: this.translate.instant(TranslateKeys.BUTTON_CONFIRM),
          handler: () => {
            this.performSendNotificationToParent(emotionDiary);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Thực hiện gửi thông báo cho phụ huynh
   * @param emotionDiary
   * @private
   */
  private async performSendNotificationToParent(emotionDiary: IEmotionalDiary): Promise<void> {
    try {
      // Lấy thông tin học sinh để tìm parent_id
      const student = await this.resUsersService.getUserById(emotionDiary.teenager_id!.id!);
      if (!student?.parent_id?.id) {
        await this.showToast(TranslateKeys.NOTIFICATIONS_SEND_TO_PARENT_ERROR, 'error');
        return;
      }

      // Lấy thông tin parent để có partner_id
      const parent = await this.resUsersService.getUserById(student.parent_id.id);
      if (!parent?.partner_id?.id) {
        await this.showToast(TranslateKeys.NOTIFICATIONS_SEND_TO_PARENT_ERROR, 'error');
        return;
      }

      // Tạo nội dung thông báo
      const childName = emotionDiary.nickname || '';
      const emotionName = emotionDiary.answer_id?.name || '';
      const formattedDate = emotionDiary.create_date;

      const notificationBody: CreateNotificationBody = {
        name: this.translate.instant(TranslateKeys.NOTIFICATIONS_EMOTION_TITLE, { childName }),
        description: this.translate.instant(TranslateKeys.NOTIFICATIONS_EMOTION_DESCRIPTION, { emotionName }),
        body: this.translate.instant(TranslateKeys.NOTIFICATIONS_EMOTION_BODY, {
          childName,
          emotionName,
          date: formattedDate
        }),
        sender_id: this.authData?.id || 0,
        recipient_ids: [parent.partner_id.id],
        notification_type: NotificationTypes.EMOTIONAL
      };

      // Gửi thông báo
      const result = await this.notificationService.createNotification(notificationBody);

      if (result) {
        await this.showToast(TranslateKeys.NOTIFICATIONS_SEND_TO_PARENT_SUCCESS, 'success');
      } else {
        await this.showToast(TranslateKeys.NOTIFICATIONS_SEND_TO_PARENT_ERROR, 'error');
      }
    } catch (error) {
      console.error('ERROR:', error);
      await this.showToast(TranslateKeys.NOTIFICATIONS_SEND_TO_PARENT_ERROR, 'error');
    }
  }

  /**
   * Hiển thị toast message
   * @param message
   * @param type
   * @private
   */
  private async showToast(message: string, type: 'success' | 'error'): Promise<void> {
    const toast = await this.toastController.create({
      message: this.translate.instant(message),
      duration: 3000,
      position: 'top',
      color: type === 'success' ? 'success' : 'danger'
    });
    await toast.present();
  }
}
