import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController, ToastButton, ToastController, ToastOptions } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../../services/auth/auth.service';
import { LiyYdmsEmotionalDiaryService } from '../../../../services/models/liy.ydms.emotional.diary.service';
import { LiyYdmsEmotionalQuestionService } from '../../../../services/models/liy.ydms.emotional.question.service';
import { LiyYdmsEmotionalAnswerOptionService } from '../../../../services/models/liy.ydms.emotional.answer.option.service';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { CommonConstants } from '../../../../shared/classes/common-constants';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { ILiyYdmsEmotionalQuestion } from '../../../../shared/interfaces/models/liy.ydms.emotional.question';
import { ILiyYdmsEmotionalAnswerOption } from '../../../../shared/interfaces/models/liy.ydms.emotional.answer.option';
import { IEmotionJournal } from '../../../../shared/interfaces/function-data/emtion-journal';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { Position } from '../../../../shared/enums/position';
import { BtnRoles } from '../../../../shared/enums/btn-roles';
import { StyleClass } from '../../../../shared/enums/style-class';

@Component({
  selector: 'app-emotion-checkin',
  templateUrl: './emotion-checkin.component.html',
  styleUrls: ['./emotion-checkin.component.scss'],
  standalone: false
})
export class EmotionCheckinComponent implements OnInit {

  animeImage!: IHeaderAnimeImage;
  authData?: IAuthData;
  isLoading!: boolean;
  emotionalQuestion!: ILiyYdmsEmotionalQuestion;
  emotionalAnswerOptions!: ILiyYdmsEmotionalAnswerOption[];
  selectedAnswer!: ILiyYdmsEmotionalAnswerOption;
  emotionJournal!: IEmotionJournal;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private liyYdmsEmotionalQuestionService: LiyYdmsEmotionalQuestionService,
    private liyYdmsEmotionalAnswerOptionService: LiyYdmsEmotionalAnswerOptionService,
    private liyYdmsEmotionalDiaryService: LiyYdmsEmotionalDiaryService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private translate: TranslateService,
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    this.authData = await this.authService.getAuthData();
    await this.getRandomEmotionalQuestion();
  }

  /**
   * On click submit emotion checkin
   */
  public onClickSubmit(): void {
    if (!this.authData || !this.selectedAnswer || !this.emotionalQuestion) return;
    const body: Partial<IEmotionJournal> = {
      ...this.emotionJournal,
      question_id: this.emotionalQuestion.id,
      answer_id: this.selectedAnswer.id,
      teenager_id: this.authData.id
    }

    this.loadingController.create({mode: NativePlatform.IOS}).then(loading => {
      loading.present();
      this.liyYdmsEmotionalDiaryService.createEmotionDiary(body).then(result => {
        if (result) {
          this.showToast(this.translate.instant(TranslateKeys.TOAST_CHECKIN_EMOTION_SUCCESS), IonicColors.SUCCESS);
          this.navCtrl.navigateRoot(`${PageRoutes.DAILY_EMOTION_JOURNAL}/${result}`);
        } else {
          this.showToast(this.translate.instant(TranslateKeys.TOAST_CHECKIN_EMOTION_FAILED), IonicColors.DANGER);
        }
      }).catch((e) => {
        console.log(e);
      }).finally(() => loading.dismiss());
    });
  }

  /**
   * Load random a emotion question
   * @private
   */
  private async getRandomEmotionalQuestion(): Promise<void> {
    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();
    try {
      const countQuestions = await this.liyYdmsEmotionalQuestionService.getCountQuestions();
      if (countQuestions === 0) {
        await this.navCtrl.navigateRoot(`/${PageRoutes.DAILY_EMOTION_JOURNAL}`);
        return;
      }

      const randomOffset = CommonConstants.randomInt(countQuestions);
      const randomQuestions = await this.liyYdmsEmotionalQuestionService.getQuestionList([], randomOffset, 1);
      this.emotionalQuestion = randomQuestions?.[0];

      if (!this.emotionalQuestion) {
        await this.navCtrl.navigateRoot(`/${PageRoutes.DAILY_EMOTION_JOURNAL}`);
        return;
      }

      this.emotionalAnswerOptions = await this.liyYdmsEmotionalAnswerOptionService.getAnswerOptionsByQuestionId(this.emotionalQuestion.id);
    } catch (e) {
      console.error(e);
    } finally {
      loading?.dismiss();
    }
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
   * @param message
   * @param color
   * @private
   */
  private showToast(message: string, color: IonicColors.SUCCESS | IonicColors.DANGER | IonicColors.WARNING): void {
    const closeBtn: ToastButton = {
      icon: IonicIcons.CLOSE_CIRCLE_OUTLINE,
      side: Position.END,
      role: BtnRoles.CANCEL,
    }
    const toastOption: ToastOptions = {
      message,
      duration: 3000,
      buttons: [closeBtn],
      mode: NativePlatform.IOS,
      cssClass: `${StyleClass.TOAST_ITEM} ${(color === IonicColors.DANGER || color === IonicColors.WARNING) ? StyleClass.TOAST_ERROR : StyleClass.TOAST_SUCCESS}`,
      position: Position.TOP,
      icon: (color === IonicColors.DANGER || color === IonicColors.WARNING) ? IonicIcons.WARNING_OUTLINE : IonicIcons.CHECKMARK_CIRCLE_OUTLINE,
      color,
      keyboardClose: false
    }
    this.toastController.create(toastOption).then(toast => toast.present());
  }
}
