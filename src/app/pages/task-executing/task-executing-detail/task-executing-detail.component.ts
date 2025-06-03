import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AlertButton, AlertController, LoadingController, ToastButton, ToastController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {CameraSource} from "@capacitor/camera";

import {PhotoService} from "../../../services/photo/photo.service";
import {TaskService} from '../../../services/task/task.service';
import {PageRoutes} from '../../../shared/enums/page-routes';
import {TranslateKeys} from '../../../shared/enums/translate-keys';
import {IAuthData} from '../../../shared/interfaces/auth/auth-data';
import {IHeaderAnimation, IHeaderAnimeImage} from '../../../shared/interfaces/header/header';
import {GuideType} from '../../../shared/enums/guide-type';
import {ITaskDetail} from '../../../shared/interfaces/function-data/task-detail';
import {DateFormat} from '../../../shared/enums/date-format';
import {TaskStatus} from '../../../shared/enums/task-status';
import {IonicColors} from '../../../shared/enums/ionic-colors';
import {IonicIcons} from '../../../shared/enums/ionic-icons';
import {Position} from '../../../shared/enums/position';
import {NativePlatform} from '../../../shared/enums/native-platform';
import {BtnRoles} from '../../../shared/enums/btn-roles';
import {StyleClass} from '../../../shared/enums/style-class';
import {TaskProgressUpdate} from "../../../shared/interfaces/function-data/task-progress-update";
import {CommonConstants} from "../../../shared/classes/common-constants";

@Component({
  selector: 'app-task-executing-detail',
  templateUrl: './task-executing-detail.component.html',
  styleUrls: ['./task-executing-detail.component.scss'],
  standalone: false
})
export class TaskExecutingDetailComponent implements OnInit {

  authData?: IAuthData;
  pageTitle!: TranslateKeys;
  animeImage!: IHeaderAnimeImage;
  animation!: IHeaderAnimation;
  task?: ITaskDetail;
  taskProgressUpdate!: TaskProgressUpdate

  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;
  protected readonly DateFormat = DateFormat;
  protected readonly TaskStatus = TaskStatus;
  protected readonly GuideType = GuideType;
  protected readonly CommonConstants = CommonConstants;
  protected readonly CameraSource = CameraSource;

  constructor(
    private activeRoute: ActivatedRoute,
    private taskService: TaskService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private photoService: PhotoService,
    private alertController: AlertController
  ) {
  }

  ngOnInit() {
    const id = this.activeRoute.snapshot.paramMap.get('id');
    if (!id) return history.back();
    this.initHeader();
    this.loadTaskDetail(+id);
  }


  /**
   * Cập nhật trạng thái task
   * @param status
   */
  public onCLickExecuting(status: TaskStatus): void {
    if (!this.task || !status) {
      return;
    }
    this.loadingController.create({mode: NativePlatform.IOS}).then(loading => {
      loading.present();
      this.taskService.updateTaskStatus((this.task?.id || -1), status).then((result) => {
        if (result) {
          this.showToast(this.translate.instant(TranslateKeys.TOAST_UPDATE_SUCCESS), IonicColors.SUCCESS);
          history.back();
        } else {
          this.showToast(this.translate.instant(TranslateKeys.TOAST_UPDATE_FAILED), IonicColors.DANGER);
        }
      }).finally(() => loading.dismiss());
    });
  }

  /**
   * On click add image button
   * @param sourceType
   */
  public onClickAddImage(sourceType: CameraSource = CameraSource.Camera): void {
    this.photoService.pickImage(sourceType).then(() => {
      this.taskProgressUpdate.task_image_result = this.photoService.getImageResourceBase64();
    });
  }

  /**
   * Cập nhật tiến độ hoàn thành nhiệm vụ
   */
  public onClickUpdateTaskProgress(): void {
    if (!this.taskProgressUpdate || !this.task) return;
    this.loadingController.create({mode: NativePlatform.IOS}).then(loading => {
      loading.present();
      this.taskProgressUpdate.task_percentage_result = (this.taskProgressUpdate.task_percentage_result || 0) * 100;
      if (this.taskProgressUpdate.task_percentage_result === 100) this.taskProgressUpdate.status = TaskStatus.COMPLETED;
      this.taskService.updateTaskProgress(this.task?.id || -1, this.taskProgressUpdate)
        .then((result) => {
          if (result) {
            this.showToast(this.translate.instant(TranslateKeys.TOAST_UPDATE_SUCCESS), IonicColors.SUCCESS);
            history.back();
          } else {
            this.showToast(this.translate.instant(TranslateKeys.TOAST_UPDATE_FAILED), IonicColors.DANGER);
          }
        }).finally(() => loading.dismiss());
    });
  }

  /**
   * Kết thúc task giữa chừng
   */
  public onCLickEndTask(): void {
    const buttons: Array<AlertButton> = [
      {text: this.translate.instant(TranslateKeys.BUTTON_CANCEL)},
      {
        text: this.translate.instant(TranslateKeys.BUTTON_CONFIRM),
        handler: () => this.onCLickExecuting(TaskStatus.IGNORE)
      },
    ];
    this.alertController.create({
      mode: NativePlatform.IOS,
      header: this.translate.instant(TranslateKeys.ALERT_DEFAULT_HEADER),
      message: this.translate.instant(TranslateKeys.ALERT_CONFIRM_END_TASK),
      buttons: buttons
    }).then(alertItem => alertItem.present());
  }

  /**
   * Load task detail
   * @param id
   * @private
   */
  private loadTaskDetail(id: number): void {
    this.taskService.getTaskDetail(id).then(task => {
      if (!task) {
        return history.back();
      } else {
        this.task = task;
        this.getPageTitle();
        this.initTaskProgressUpdateParams();
      }
    })
  }

  /**
   * Get page title
   * @private
   */
  private getPageTitle(): void {
    if (this.task?.guide_type === GuideType.GROUP_ACTIVITY) {
      this.pageTitle = TranslateKeys.TITLE_GROUP_CHALLENGE;
    } else if (this.task?.guide_type === GuideType.FAMILY_ACTIVITY) {
      this.pageTitle = TranslateKeys.TITLE_FAMILY_ACTIVITY;
    } else if (this.task?.guide_type === GuideType.EXERCISE) {
      this.pageTitle = TranslateKeys.TITLE_SELF_DISCOVERY_PROGRESS;
    } else {
      this.pageTitle = TranslateKeys.TITLE_INSTRUCTION;
    }
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
    }
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

  /**
   * init header
   * @private
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'rank',
      imageUrl: '/assets/images/rank/ranking.png',
      width: '130px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '-20px'
      }
    };
    this.animation = {
      animation: {
        path: '/assets/animations/1747072943679.json',
        loop: true,
        autoplay: true,
      },
      width: '130px',
      height: '130px',
      position: {
        position: 'absolute',
        top: '-30px',
        right: '50px',
      }
    };
  }

  /**
   * Init param to update task progress
   * @private
   */
  private initTaskProgressUpdateParams(): void {
    if (!this.task || this.task?.status !== TaskStatus.IN_PROGRESS
      || this.task.guide_type === GuideType.GROUP_ACTIVITY
      || this.task.guide_type === GuideType.INSTRUCTION
    ) return;

    this.taskProgressUpdate = {
      status: TaskStatus.IN_PROGRESS,
      task_percentage_result: this.task.task_percentage_result ? (this.task.task_percentage_result / 100) : 0,
      task_text_result: this.task.task_text_result || '',
      task_image_result: this.task.task_image_result || '',
    }
  }
}
