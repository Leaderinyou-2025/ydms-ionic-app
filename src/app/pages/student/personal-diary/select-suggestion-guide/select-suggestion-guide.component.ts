import { Component, Input, OnInit } from '@angular/core';
import {
  InfiniteScrollCustomEvent,
  ModalController,
  RadioGroupCustomEvent,
  SearchbarCustomEvent,
  ToastButton,
  ToastController,
  ToastOptions
} from '@ionic/angular';

import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { IEmotionalDiary } from '../../../../shared/interfaces/personal-diary/personal-diary.interfaces';
import { ILiyYdmsGuide } from '../../../../shared/interfaces/models/liy.ydms.guide';
import { CommonConstants } from '../../../../shared/classes/common-constants';
import { LiyYdmsGuideService } from '../../../../services/models/liy.ydms.guide.service';
import { TaskService } from '../../../../services/task/task.service';
import { CreateTaskBody } from '../../../../shared/interfaces/function-data/create-task-body';
import { GuideType } from '../../../../shared/enums/guide-type';
import { AreaOfExpertise } from '../../../../shared/enums/area-of-expertise';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { AuthService } from '../../../../services/auth/auth.service';
import { TaskStatus } from '../../../../shared/enums/task-status';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { Position } from '../../../../shared/enums/position';
import { BtnRoles } from '../../../../shared/enums/btn-roles';
import { StyleClass } from '../../../../shared/enums/style-class';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-select-suggestion-guide',
  templateUrl: './select-suggestion-guide.component.html',
  styleUrls: ['./select-suggestion-guide.component.scss'],
  standalone: false
})
export class SelectSuggestionGuideComponent implements OnInit {

  @Input() emotionDiary!: IEmotionalDiary;
  selectedGuideId?: number;
  searchTerm!: string;
  listGuides: ILiyYdmsGuide[] = new Array<ILiyYdmsGuide>();
  isLoading?: boolean;
  isLoadMore: boolean = false;

  authData?: IAuthData;

  private paged: number = 1;
  private readonly limit = 20;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly CommonConstants = CommonConstants;
  protected readonly Array = Array;

  constructor(
    private authService: AuthService,
    private modalController: ModalController,
    private liyYdmsGuideService: LiyYdmsGuideService,
    private taskService: TaskService,
    private toastController: ToastController,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    if (!this.emotionDiary) return this.cancel();
    this.authService.getAuthData().then((authData) => {
      this.authData = authData;
      this.loadGuideList();
    });
  }

  /**
   * On click cancel
   */
  public cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  /**
   * On click confirm
   */
  public confirm() {
    if (!this.selectedGuideId || !this.authData || !this.emotionDiary) {
      this.cancel();
      return;
    }

    const selectedGuide = this.listGuides.find(gu => gu.id === this.selectedGuideId);
    if (!selectedGuide) {
      this.cancel();
      return;
    }

    const body: CreateTaskBody = {
      name: selectedGuide.name,
      guide_id: selectedGuide.id,
      guide_type: GuideType.INSTRUCTION,
      area_of_expertise: AreaOfExpertise.EMOTION,
      assignee_ids: [this.emotionDiary.teenager_id.id],
      status: TaskStatus.PENDING,
      rank_point: 5,
      scores: 5
    };

    this.taskService.createTask(body).then((result) => {
      if (result) {
        this.showToast(
          this.translate.instant(TranslateKeys.TOAST_SEND_EMOTION_TIPS_SUCCESS),
          IonicColors.SUCCESS
        );
        this.cancel();
      } else {
        this.showToast(
          this.translate.instant(TranslateKeys.TOAST_SEND_EMOTION_TIPS_FAILED),
          IonicColors.DANGER
        );
      }
    });
  }

  /**
   * On search change
   * @param event
   */
  public onSearchChange(event: SearchbarCustomEvent): void {
    this.searchTerm = event.detail.value || '';
    this.paged = 1;
    setTimeout(() => {
      this.listGuides = new Array<ILiyYdmsGuide>();
      this.loadGuideList();
    });
  }

  /**
   * Load more data when scrolling
   * @param event Infinite scroll event
   */
  public loadMore(event: InfiniteScrollCustomEvent): void {
    if (this.isLoading) {
      event.target.complete();
      return;
    }

    // No more
    if (this.listGuides?.length < ((this.paged - 1) * this.limit)) {
      event.target.complete();
      return;
    }

    this.paged += 1;
    this.isLoadMore = true;
    setTimeout(() => {
      this.loadGuideList().finally(() => {
        event.target.complete();
        this.isLoadMore = false;
      });
    }, 500);
  }

  /**
   * Lấy danh sách guide
   * @private
   */
  private async loadGuideList(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;
    const results = await this.liyYdmsGuideService.getEmotionGuideList(this.searchTerm, offset, this.limit);

    this.listGuides = CommonConstants.mergeArrayObjectById(this.listGuides, results) || [];
    this.isLoading = false;
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
      duration: 3000,
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
