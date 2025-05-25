import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastButton, ToastController, ToastOptions } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { PageRoutes } from '../../enums/page-routes';
import { TranslateKeys } from '../../enums/translate-keys';
import { IonicColors } from '../../enums/ionic-colors';
import { IonicIcons } from '../../enums/ionic-icons';
import { Position } from '../../enums/position';
import { BtnRoles } from '../../enums/btn-roles';
import { NativePlatform } from '../../enums/native-platform';
import { StyleClass } from '../../enums/style-class';
import { ISurveyQuestion } from '../../interfaces/function-data/survey';
import { AnswerType } from '../../enums/answer-type';

@Component({
  selector: 'app-form-assessment',
  templateUrl: './form-assessment.component.html',
  styleUrls: ['./form-assessment.component.scss'],
  standalone: false,
})
export class FormAssessmentComponent {

  @Input() questions!: ISurveyQuestion[];
  @Input() readonly!: boolean;
  @Output() submitForm = new EventEmitter<ISurveyQuestion[]>();

  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;
  protected readonly AnswerType = AnswerType;

  constructor(
    private toastController: ToastController,
    private translate: TranslateService,
  ) {
  }

  /**
   * Complete the task and navigate back
   */
  public onClickSubmitForm(): void {
    const existNoAnswer = this.questions.find(u => !u.answer_id && !u.answer_text);
    if (existNoAnswer) {
      this.showToast(
        this.translate.instant(TranslateKeys.TOAST_ANSWER_ALL_QUESTIONS),
        IonicColors.WARNING
      );
      return;
    }
    this.submitForm.emit(this.questions);
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
