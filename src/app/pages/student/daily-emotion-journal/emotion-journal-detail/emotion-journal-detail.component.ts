import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertButton, AlertController, LoadingController, ToastButton, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../../services/auth/auth.service';
import { LiyYdmsEmotionalDiaryService } from '../../../../services/models/liy.ydms.emotional.diary.service';
import {
  LiyYdmsEmotionalAnswerOptionService
} from '../../../../services/models/liy.ydms.emotional.answer.option.service';
import { ResUsersService } from '../../../../services/models/res.users.service';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { DateFormat } from '../../../../shared/enums/date-format';
import { CommonConstants } from '../../../../shared/classes/common-constants';
import { ILiyYdmsEmotionalDiary } from '../../../../shared/interfaces/models/liy.ydms.emotional.diary';
import { ILiyYdmsEmotionalAnswerOption } from '../../../../shared/interfaces/models/liy.ydms.emotional.answer.option';
import { ILiyYdmsGuide } from '../../../../shared/interfaces/models/liy.ydms.guide';
import { LiyYdmsGuideService } from '../../../../services/models/liy.ydms.guide.service';
import { ILiyYdmsCategory } from '../../../../shared/interfaces/models/liy.ydms.category';
import { LiyYdmsCategoryService } from '../../../../services/models/liy.ydms.category.service';
import { PublicEmotionalOption } from '../../../../shared/enums/public-emotional-option';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { Position } from '../../../../shared/enums/position';
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { StyleClass } from '../../../../shared/enums/style-class';
import { BtnRoles } from '../../../../shared/enums/btn-roles';

@Component({
  selector: 'app-detail',
  templateUrl: './emotion-journal-detail.component.html',
  styleUrls: ['./emotion-journal-detail.component.scss'],
  standalone: false
})
export class EmotionJournalDetailComponent implements OnInit {

  animeImage!: IHeaderAnimeImage;
  authData?: IAuthData;
  isLoading!: boolean;
  emotionalDiary?: Partial<ILiyYdmsEmotionalDiary>;
  answerOption?: ILiyYdmsEmotionalAnswerOption;
  instructionCategories?: Partial<ILiyYdmsCategory>[];
  emotionGuides?: ILiyYdmsGuide[];
  sharedFriends?: Array<Partial<IAuthData>>;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly DateFormat = DateFormat;
  protected readonly CommonConstants = CommonConstants;
  protected readonly PublicEmotionalOption = PublicEmotionalOption;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private liyYdmsEmotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private liyYdmsEmotionalAnswerOptionService: LiyYdmsEmotionalAnswerOptionService,
    private liyYdmsGuideService: LiyYdmsGuideService,
    private liyYdmsCategoryService: LiyYdmsCategoryService,
    private resUsersService: ResUsersService,
    private alertController: AlertController,
    private translate: TranslateService,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) {
  }

  ngOnInit() {
    this.initHeader();
    const entryId = this.route.snapshot.paramMap.get('id');
    if (!entryId) {
      this.router.navigateByUrl(PageRoutes.DAILY_EMOTION_JOURNAL);
      return;
    }

    this.isLoading = true;
    this.authService.getAuthData().then(authData => {
      this.authData = authData;
      setTimeout(() => this.loadEntryById(+entryId).finally(() => this.isLoading = false), 1000);
    });
  }

  /**
   * On switch public emotional
   */
  public onClickUnPublicEmotional(): void {
    if (!this.emotionalDiary) return;
    const buttons: Array<AlertButton> = [
      {text: this.translate.instant(TranslateKeys.BUTTON_CANCEL)},
      {
        text: this.translate.instant(TranslateKeys.BUTTON_CONFIRM),
        handler: () => this.handleUnPublicEmotional()
      },
    ];
    this.alertController.create({
      mode: NativePlatform.IOS,
      header: this.translate.instant(TranslateKeys.ALERT_DEFAULT_HEADER),
      message: this.translate.instant(TranslateKeys.ALERT_CONFIRM_UN_PUBLIC),
      buttons: buttons
    }).then(alertItem => alertItem.present());
  }

  /**
   * On click execute emotion guide
   * @param guide
   */
  public onClickExecuteEmotionGuide(guide: ILiyYdmsGuide): void {
    if (!guide?.id) return;
    this.router.navigateByUrl(`${PageRoutes.EXPERT_GUIDE}/${guide.id}`);
  }

  /**
   * Load entry by ID as fallback when router state is not available
   * @param entryId ID of the entry to load
   */
  private async loadEntryById(entryId: number): Promise<void> {
    if (!this.authData?.id || !entryId) return;
    this.emotionalDiary = await this.liyYdmsEmotionalDiaryService.getEmotionDiary(entryId);
    if (this.emotionalDiary?.public_emotional && this.emotionalDiary?.public_user_ids?.length) {
      this.resUsersService.getFriendListByIds(this.emotionalDiary.public_user_ids).then(friendList => this.sharedFriends = friendList);
    }
    await this.loadInstructions();
  }

  /**
   * Load instruction guides
   * @private
   */
  private async loadInstructions(): Promise<void> {
    if (!this.emotionalDiary || !this.emotionalDiary?.answer_id?.id) return;
    this.answerOption = await this.liyYdmsEmotionalAnswerOptionService.getAnswerOptionById(this.emotionalDiary.answer_id.id);
    if (!this.answerOption || !this.answerOption?.guide_category_ids) return;
    const [emotionGuides, instructionCategories] = await Promise.all([
      this.liyYdmsGuideService.getGuideListByCategoryIds(this.answerOption.guide_category_ids),
      this.liyYdmsCategoryService.getCategoryByIds(this.answerOption.guide_category_ids)
    ]);
    this.emotionGuides = emotionGuides;
    this.instructionCategories = instructionCategories;
  }

  /**
   * handleUnPublicEmotional
   * @private
   */
  private handleUnPublicEmotional(): void {
    if (!this.emotionalDiary || !this.emotionalDiary?.id) return;
    this.loadingController.create({mode: NativePlatform.IOS})
      .then(loading => {
        loading.present();
        this.liyYdmsEmotionalDiaryService.updateEmotionDiary(
          this.emotionalDiary?.id || -1, {public_emotional: false}
        ).then(result => {
          if (result) {
            this.showToast(this.translate.instant(TranslateKeys.TOAST_UPDATE_SUCCESS), IonicColors.SUCCESS);
            if (this.emotionalDiary) this.emotionalDiary.public_emotional = false;
          } else {
            this.showToast(this.translate.instant(TranslateKeys.TOAST_UPDATE_FAILED), IonicColors.DANGER);
          }
        }).finally(() => loading.dismiss());
      });
  }

  /**
   * Initialize header configuration
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'daily_emotion_journal',
      imageUrl: '/assets/images/daily_emotion_journal.png',
      width: '160px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '0',
        bottom: '0'
      }
    };
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
