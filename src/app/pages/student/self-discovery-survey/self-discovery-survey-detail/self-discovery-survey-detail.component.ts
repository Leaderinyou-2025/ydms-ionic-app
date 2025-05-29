import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { ISurvey, ISurveyQuestion } from '../../../../shared/interfaces/function-data/survey';
import { SurveyService } from '../../../../services/survey/survey.service';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { IonicColors } from '../../../../shared/enums/ionic-colors';

@Component({
  selector: 'app-self-discovery-survey-detail',
  templateUrl: './self-discovery-survey-detail.component.html',
  styleUrls: ['./self-discovery-survey-detail.component.scss'],
  standalone: false,
})
export class SelfDiscoverySurveyDetailComponent implements OnInit {

  isLoading: boolean = true;
  animeImage!: IHeaderAnimeImage;
  readonly!: boolean;
  selfDiscoverySurveyDetail?: ISurvey;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly structuredClone = structuredClone;
  protected readonly Array = Array;

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
    if (!questions.length || !this.selfDiscoverySurveyDetail) return;
    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();

    try {
      const result = await this.surveyService.updateAnswer(this.selfDiscoverySurveyDetail.assessment_result.id, questions);
      if (result) {
        this.showToast(
          this.translate.instant(TranslateKeys.TOAST_UPDATE_SUCCESS),
          IonicColors.SUCCESS
        );
        await this.router.navigateByUrl(PageRoutes.SELF_DISCOVERY_SURVEY);
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
    this.selfDiscoverySurveyDetail = await this.surveyService.getSurveyDetail(+id);
    this.readonly = this.selfDiscoverySurveyDetail?.assessment_result?.is_posted || false;
    this.isLoading = false;
  }

  /**
   * Navigate back to the survey list
   */
  private async navigateBack(): Promise<void> {
    await this.router.navigateByUrl(PageRoutes.SELF_DISCOVERY_SURVEY);
  }

  /**
   * Show toast
   * @param message
   * @param color
   * @private
   */
  private async showToast(message: string, color: IonicColors): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
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
      imageUrl: '/assets/images/self-discovery-survey.png',
      width: '200px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '-50px',
        bottom: '-5px'
      }
    };
  }
}
