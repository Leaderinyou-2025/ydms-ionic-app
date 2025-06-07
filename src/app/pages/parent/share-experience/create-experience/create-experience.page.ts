import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { LiyYdmsExperienceService } from '../../../../services/models/liy.ydms.experience.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { ExperienceStatus } from '../../../../shared/enums/experience-status';
import { areaOfExpertiseData, AreaOfExpertiseOption } from '../../../../shared/data/area-of-experties.data';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { ICreateExperienceBody } from '../../../../shared/interfaces/function-data/create-experience-body';
import { NativePlatform } from '../../../../shared/enums/native-platform';


@Component({
  selector: 'app-create-experience',
  templateUrl: './create-experience.page.html',
  styleUrls: ['./create-experience.page.scss'],
  standalone: false
})
export class CreateExperiencePage implements OnInit {

  // Headers
  animeImage!: IHeaderAnimeImage;

  // Form và dữ liệu
  experienceForm!: FormGroup;
  areaOfExpertiseOptions: AreaOfExpertiseOption[] = areaOfExpertiseData;
  authData?: IAuthData;

  protected TranslateKeys = TranslateKeys;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private experienceService: LiyYdmsExperienceService,
    private authService: AuthService,
    private translateService: TranslateService,
    private loadingController: LoadingController,
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    this.authData = await this.authService.getAuthData();
  }

  ionViewDidEnter() {
    this.initializeForm();
  }

  public async onSubmit(): Promise<void> {
    if (!this.experienceForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    await this.submitExperience();
  }

  /**
   * Submit create experience
   */
  private async submitExperience(): Promise<void> {
    if (!this.authData) return;

    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();

    try {
      const formValue = this.experienceForm.value;
      const experienceData: ICreateExperienceBody = {
        name: formValue.name,
        area_of_expertise: formValue.area_of_expertise,
        experience_content: formValue.experience_content,
        parent_id: this.authData.id,
        active: true,
        status: ExperienceStatus.WAIT_ACCEPT,
        total_like: 0,
        total_love: 0
      };
      const result = await this.experienceService.createExperience(experienceData);

      if (result) {
        this.showSuccessToast();
        await this.router.navigateByUrl(PageRoutes.SHARE_EXPERIENCE);
      } else {
        this.showErrorToast(this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_ERROR_CREATE));
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Show success toast
   * @private
   */
  private showSuccessToast(): void {
    this.toastController.create({
      message: this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_SUCCESS_MESSAGE),
      duration: 3000,
      color: 'success',
      position: 'top'
    }).then(toast => toast.present());
  }

  /**
   * Show error message
   * @param message
   * @private
   */
  private showErrorToast(message: string): void {
    this.toastController.create({
      message: message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    }).then(toast => toast.present());
  }

  /**
   * Mark all field touched
   * @private
   */
  private markFormGroupTouched() {
    Object.keys(this.experienceForm.controls).forEach(key => {
      this.experienceForm.get(key)?.markAsTouched();
    });
  }

  /**
   * initializeForm
   * @private
   */
  private initializeForm(): void {
    this.experienceForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      area_of_expertise: ['', [Validators.required]],
      experience_content: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  /**
   * init headers
   * @private
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'Create Experience',
      imageUrl: '/assets/images/share-experience.svg',
      height: '150px',
      width: '150px',
      position: {
        position: 'absolute',
        right: '0',
        bottom: '20px'
      }
    };
  }
}
