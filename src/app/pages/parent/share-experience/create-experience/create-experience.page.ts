import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

// Enums và constants
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { AreaOfExpertise } from '../../../../shared/enums/area-of-expertise';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { ExperienceStatus } from '../../../../shared/enums/experience-status';

// Interfaces và data
import { areaOfExpertiesData, AreaOfExpertiseOption } from '../../../../shared/data/area-of-experties.data';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { ICreateExperience } from '../../../../shared/interfaces/models/liy.ydms.experience';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';

// Services
import { LiyYdmsExperienceService } from '../../../../services/models/liy.ydms.experience.service';
import { AuthService } from '../../../../services/auth/auth.service';

/**
 * Component: Trang tạo bài chia sẻ kinh nghiệm
 * Mô tả: Cho phép phụ huynh tạo bài chia sẻ kinh nghiệm mới
 * Chức năng: Nhập thông tin, chọn lĩnh vực, viết nội dung và gửi để duyệt
 */
@Component({
  selector: 'app-create-experience',
  templateUrl: './create-experience.page.html',
  styleUrls: ['./create-experience.page.scss'],
  standalone: false
})
export class CreateExperiencePage implements OnInit, AfterViewInit {



  // Enums để sử dụng trong template
  TranslateKeys = TranslateKeys;

  // Cấu hình header với hình ảnh anime
  animeImage!: IHeaderAnimeImage;

  // Form và dữ liệu
  experienceForm!: FormGroup;
  areaOfExpertiseOptions: AreaOfExpertiseOption[] = areaOfExpertiesData;
  authData?: IAuthData;
  isSubmitting = false;

  // Cấu hình Quill editor
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'size': ['small', false, 'large'] }],
      [{ 'align': [] }],
      ['link']
    ]
  };

  // Styles cho Quill editor
  quillStyles = {
    height: '200px'
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private experienceService: LiyYdmsExperienceService,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
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

  ngOnInit() {
    this.loadAuthData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeForm();
    }, 0);
  }

  private async loadAuthData() {
    this.authData = await this.authService.getAuthData();
  }

  initializeForm() {
    try {
      this.experienceForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(5)]],
        area_of_expertise: ['', [Validators.required]],
        experience_content: ['', [Validators.required, Validators.minLength(20)]]
      });
    } catch (error) {
      console.error('ERROR initializing form:', error);
      setTimeout(() => {
        this.initializeForm();
      }, 100);
    }
  }



  async onSubmit() {
    if (this.experienceForm.valid && !this.isSubmitting) {
      await this.showConfirmDialog();
    } else {
      this.markFormGroupTouched();
    }
  }

  async showConfirmDialog() {
    const alert = await this.alertController.create({
      header: this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_CONFIRM_SUBMIT_HEADER),
      message: this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_CONFIRM_SUBMIT_MESSAGE),
      buttons: [
        {
          text: this.translateService.instant(TranslateKeys.BUTTON_CANCEL),
          role: 'cancel'
        },
        {
          text: this.translateService.instant(TranslateKeys.BUTTON_CONFIRM),
          handler: () => {
            this.submitExperience();
          }
        }
      ]
    });

    await alert.present();
  }

  async submitExperience() {
    try {
      this.isSubmitting = true;

      if (!this.authData) {
        await this.loadAuthData();
      }

      if (!this.authData) {
        await this.showErrorToast(this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_ERROR_AUTH));
        return;
      }

      const formValue = this.experienceForm.value;
      const experienceData: ICreateExperience = {
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

      if (result && typeof result === 'number') {
        await this.showSuccessToast();
        this.router.navigate([`/${PageRoutes.SHARE_EXPERIENCE}`]);
      } else {
        await this.showErrorToast(this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_ERROR_CREATE));
      }

    } catch (error) {
      console.error('ERROR:', error);
      await this.showErrorToast(this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_ERROR_CREATE));
    } finally {
      this.isSubmitting = false;
    }
  }

  async showSuccessToast() {
    const toast = await this.toastController.create({
      message: this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_SUCCESS_MESSAGE),
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  async onCancel() {
    if (this.hasUnsavedChanges()) {
      const alert = await this.alertController.create({
        header: this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_CONFIRM_CANCEL_HEADER),
        message: this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_CONFIRM_CANCEL_MESSAGE),
        buttons: [
          {
            text: this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_STAY_BUTTON),
            role: 'cancel'
          },
          {
            text: this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_EXIT_BUTTON),
            handler: () => {
              this.router.navigate([`/${PageRoutes.SHARE_EXPERIENCE}`]);
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.router.navigate([`/${PageRoutes.SHARE_EXPERIENCE}`]);
    }
  }

  hasUnsavedChanges(): boolean {
    const formValue = this.experienceForm.value;
    return !!(formValue.name || formValue.area_of_expertise || formValue.experience_content);
  }

  markFormGroupTouched() {
    Object.keys(this.experienceForm.controls).forEach(key => {
      this.experienceForm.get(key)?.markAsTouched();
    });
  }
}
