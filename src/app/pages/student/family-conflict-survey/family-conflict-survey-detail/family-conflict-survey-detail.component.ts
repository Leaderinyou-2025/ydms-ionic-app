import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastButton, ToastController, ToastOptions } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { ISurvey, ISurveyQuestion } from '../../../../shared/interfaces/function-data/survey';
import { SurveyService } from '../../../../services/survey/survey.service';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { Position } from '../../../../shared/enums/position';
import { BtnRoles } from '../../../../shared/enums/btn-roles';
import { StyleClass } from '../../../../shared/enums/style-class';

@Component({
  selector: 'app-family-conflict-survey-detail',
  templateUrl: './family-conflict-survey-detail.component.html',
  styleUrls: ['./family-conflict-survey-detail.component.scss'],
  standalone: false,
})
export class FamilyConflictSurveyDetailComponent implements OnInit {

  isLoading: boolean = true;
  animeImage!: IHeaderAnimeImage;
  readonly!: boolean;
  conflictSurveyDetail?: ISurvey;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly structuredClone = structuredClone;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private translate: TranslateService,
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    await this.loadSurveyDetail();
  }

  /**
   * Submit form
   * @param questions
   */
  public async onSubmitForm(questions: ISurveyQuestion[]): Promise<void> {
    if (!questions.length) return;
    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();

    try {
      const result = await this.surveyService.updateAnswer(questions);
      if (result) {
        this.showToast(
          this.translate.instant(TranslateKeys.TOAST_UPDATE_SUCCESS),
          IonicColors.SUCCESS
        );
        await this.router.navigateByUrl(PageRoutes.FAMILY_CONFLICT_SURVEY);
      } else {
        this.showToast(
          this.translate.instant(TranslateKeys.TOAST_UPDATE_FAILED),
          IonicColors.SUCCESS
        );
      }
    } catch (e: any) {
      console.error(e.message);
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Load survey detail from the service
   */
  private async loadSurveyDetail(): Promise<void> {
    const id = this.activeRoute.snapshot.paramMap.get('id');
    if (!id) {
      return this.navigateBack();
    }
    this.conflictSurveyDetail = await this.surveyService.getSurveyDetail(+id);
    this.readonly = this.conflictSurveyDetail?.assessment_result.create_date !== this.conflictSurveyDetail?.assessment_result.write_date ||
      this.conflictSurveyDetail?.assessment_result['create_time'] !== this.conflictSurveyDetail?.assessment_result['write_time'];
    this.isLoading = false;
  }

  /**
   * Navigate back to the survey list
   */
  private async navigateBack(): Promise<void> {
    await this.router.navigateByUrl(PageRoutes.FAMILY_CONFLICT_SURVEY);
  }

  /**
   * init header
   * @private
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'rank',
      imageUrl: '/assets/images/family-conflict-survey.webp',
      width: '130px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '-20px',
        bottom: '-10px'
      }
    };
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
    }

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
    }
    this.toastController.create(toastOption).then(toast => toast.present());
  }
}
