import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, ToastButton, ToastController, ToastOptions } from '@ionic/angular';

import { AuthService } from '../../../../services/auth/auth.service';
import { TaskService } from '../../../../services/task/task.service';
import { ResUsersService } from '../../../../services/models/res.users.service';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { ITaskDetail } from '../../../../shared/interfaces/function-data/task-detail';
import { IRelatedField } from '../../../../shared/interfaces/base/related-field';
import { areaOfExpertiseData } from '../../../../shared/data/area-of-experties.data';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { SelectGroupTaskGuideComponent } from './select-group-task-guide/select-group-task-guide.component';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { Position } from '../../../../shared/enums/position';
import { BtnRoles } from '../../../../shared/enums/btn-roles';
import { StyleClass } from '../../../../shared/enums/style-class';
import { CreateTaskBody } from '../../../../shared/interfaces/function-data/create-task-body';
import { GuideType } from '../../../../shared/enums/guide-type';
import { AreaOfExpertise } from '../../../../shared/enums/area-of-expertise';
import { TaskStatus } from '../../../../shared/enums/task-status';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-group-task-create-form',
  templateUrl: './group-task-create-form.component.html',
  styleUrls: ['./group-task-create-form.component.scss'],
  standalone: false
})
export class GroupTaskCreateFormComponent implements OnInit {

  taskId?: number;
  groupTaskDetail?: ITaskDetail;
  authData?: IAuthData;

  groupTaskForm!: FormGroup;
  selectedGuide?: IRelatedField;
  teenagerIds!: Array<number>;
  private isModalVisible = false;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly AreaOfExpertiseData = areaOfExpertiseData;

  constructor(
    private activeRoute: ActivatedRoute,
    private modalController: ModalController,
    private authService: AuthService,
    private taskService: TaskService,
    private resUsersService: ResUsersService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    const id = this.activeRoute.snapshot.paramMap.get('id');
    this.authService.getAuthData().then((authData) => {
      this.authData = authData;
      if (id && Number.isInteger(+id)) {
        this.taskId = +id;
        this.loadGroupTaskDetail().then(() => this.initForm());
      } else {
        this.initForm();
      }
      this.loadAllClassroomTeenagerIds();
    });
  }

  /**
   * Xử lý lựa chọn guide
   */
  public onSelectGuide(): void {
    if (this.isModalVisible) return;

    this.modalController.create({
      component: SelectGroupTaskGuideComponent,
      mode: NativePlatform.IOS,
      initialBreakpoint: 0.8,
      breakpoints: [0, 0.8],
    }).then((modal) => {
      modal.present();
      this.isModalVisible = true;

      modal.onDidDismiss().then((result) => {
        if (result.data?.id) {
          this.selectedGuide = result.data as IRelatedField;
          this.groupTaskForm.get('guide')?.setValue(this.selectedGuide?.name);
        }
      }).finally(() => this.isModalVisible = false);
    });
  }

  /**
   * Xử lý submit form
   */
  public onSubmit(): void {
    if (this.groupTaskForm.invalid || !this.selectedGuide || !this.authData) {
      this.groupTaskForm.markAllAsTouched();
      return;
    }

    const body: CreateTaskBody = {
      name: this.groupTaskForm.value.name,
      guide_id: this.selectedGuide.id,
      guide_type: GuideType.GROUP_ACTIVITY,
      area_of_expertise: this.groupTaskForm.value.area_of_expertise,
      assignee_ids: [this.authData.id, ...this.teenagerIds],
      status: TaskStatus.IN_PROGRESS,
    };

    this.loadingController.create({mode: NativePlatform.IOS}).then(loading => {
      loading.present();
      this.taskService.createTask(body).then((result) => {
        if (result) {
          this.showToast(
            this.translate.instant(TranslateKeys.TOAST_CREATE_GROUP_TASK_SUCCESS),
            IonicColors.SUCCESS
          );
          history.back();
        } else {
          this.showToast(
            this.translate.instant(TranslateKeys.TOAST_CREATE_GROUP_TASK_FAILED),
            IonicColors.DANGER
          );
        }
      }).finally(() => loading.dismiss());
    });
  }

  /**
   * Check if form control has error
   * @param controlName
   * @param errorType
   */
  public hasError(controlName: 'name' | 'guide' | 'area_of_expertise', errorType: string): boolean {
    if (!this.groupTaskForm) return false;
    const control = this.groupTaskForm.get(controlName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  /**
   * Init form
   * @private
   */
  private initForm(): void {
    this.groupTaskForm = new FormGroup({
      name: new FormControl(this.groupTaskDetail?.name || '', [Validators.required]),
      guide: new FormControl(this.groupTaskDetail?.guide_id?.name || '', [Validators.required]),
      area_of_expertise: new FormControl(this.groupTaskDetail?.area_of_expertise || '', [Validators.required]),
    });
    this.selectedGuide = this.groupTaskDetail?.guide_id;
  }

  /**
   * Load group task detail
   * @private
   */
  private async loadGroupTaskDetail(): Promise<void> {
    if (!this.taskId) return;
    this.groupTaskDetail = await this.taskService.getTaskDetail(this.taskId);
    if (!this.groupTaskDetail) return history.back();
  }

  /**
   * Lấy danh sách id của học sinh trong lớp
   * @private
   */
  private loadAllClassroomTeenagerIds(): void {
    if (!this.authData?.classroom_id?.id) return;
    this.resUsersService.getTeenagerIdsByClassroomId(this.authData.classroom_id.id)
      .then((teenagers) => {
        if (teenagers?.length) {
          this.teenagerIds = teenagers.map(u => u.id);
        }
      });
  }

  /**
   * Show toast message
   * @param message
   * @param color
   * @private
   */
  private showToast(message: string, color: IonicColors.SUCCESS | IonicColors.DANGER): void {
    const closeBtn: ToastButton = {
      icon: IonicIcons.CLOSE_CIRCLE_OUTLINE,
      side: Position.END,
      role: BtnRoles.CANCEL,
    };
    const toastOption: ToastOptions = {
      message,
      duration: 5000,
      buttons: [closeBtn],
      mode: NativePlatform.IOS,
      cssClass: `${StyleClass.TOAST_ITEM} ${color === IonicColors.DANGER ? StyleClass.TOAST_ERROR : StyleClass.TOAST_SUCCESS}`,
      position: Position.TOP,
      icon: color === IonicColors.DANGER ? IonicIcons.WARNING_OUTLINE : IonicIcons.CHECKMARK_CIRCLE_OUTLINE,
      color,
      keyboardClose: false
    };
    this.toastController.create(toastOption).then(toast => toast.present());
  }
}
