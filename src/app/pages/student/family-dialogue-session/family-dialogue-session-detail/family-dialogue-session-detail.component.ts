import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastButton, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { IFamilyDialogueSessionDetail, IFamilyDialogueSessionQuestion } from '../../../../shared/interfaces/family-dialogue-session/family-dialogue-session.interfaces';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { FamilyDialogueSessionService } from '../../../../services/family-dialogue-session/family-dialogue-session.service';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { Position } from '../../../../shared/enums/position';
import { BtnRoles } from '../../../../shared/enums/btn-roles';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { StyleClass } from '../../../../shared/enums/style-class';

@Component({
  selector: 'app-family-dialogue-session-detail',
  templateUrl: './family-dialogue-session-detail.component.html',
  styleUrls: ['./family-dialogue-session-detail.component.scss'],
  standalone: false,
})
export class FamilyDialogueSessionDetailComponent implements OnInit {
  sessionDetail!: IFamilyDialogueSessionDetail;
  suggestedQuestions: IFamilyDialogueSessionQuestion[] = [];
  parentQuestions: IFamilyDialogueSessionQuestion[] = [];
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private familyDialogueSessionService: FamilyDialogueSessionService,
    private toastController: ToastController,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.loadSessionDetail();
  }

  /**
   * Load session detail
   */
  private async loadSessionDetail(): Promise<void> {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const sessionId = parseInt(id, 10);
      const sessionDetail = await this.familyDialogueSessionService.getSessionDetail(sessionId);
      if (sessionDetail) {
        this.sessionDetail = sessionDetail;
        this.filterQuestions();
      } else {
        this.navigateBack();
      }
    } else {
      this.navigateBack();
    }
    this.isLoading = false;
  }

  /**
   * Navigate back to the session list
   */
  public navigateBack(): void {
    this.router.navigate([`/${PageRoutes.FAMILY_DIALOGUE_SESSION}`]);
  }

  /**
   * Format date
   * @param date Date
   */
  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Submit answers
   */
  public async submitAnswers(): Promise<void> {
    // Check if all questions have answers
    const unansweredQuestions = this.sessionDetail.questions.filter(q => !q.answer || q.answer.trim() === '');

    if (unansweredQuestions.length > 0) {
      this.showToast(this.translate.instant(TranslateKeys.TOAST_ANSWER_ALL_QUESTIONS), IonicColors.WARNING);
      return;
    }

    this.isSubmitting = true;

    const success = await this.familyDialogueSessionService.submitSessionAnswers(
      this.sessionDetail.id,
      this.sessionDetail.questions
    );

    if (success) {
      this.showToast(this.translate.instant(TranslateKeys.TOAST_SUCCESS_HEADER), IonicColors.SUCCESS);
      this.sessionDetail.status = 'completed';
    } else {
      this.showToast(this.translate.instant(TranslateKeys.TOAST_ERROR_HEADER), IonicColors.DANGER);
    }

    this.isSubmitting = false;
  }

  /**
   * Filter questions by type
   */
  private filterQuestions(): void {
    if (this.sessionDetail && this.sessionDetail.questions) {
      this.suggestedQuestions = this.sessionDetail.questions.filter(q => q.type === 'suggested');
      this.parentQuestions = this.sessionDetail.questions.filter(q => q.type === 'parent');
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
}
