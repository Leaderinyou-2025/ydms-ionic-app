import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastButton, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { LiyYdmsExperienceService } from '../../../../services/models/liy.ydms.experience.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { FileService } from '../../../../services/file/file.service';
import { PhotoService } from '../../../../services/photo/photo.service';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { ExperienceStatus } from '../../../../shared/enums/experience-status';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { ICreateExperienceBody } from '../../../../shared/interfaces/function-data/create-experience-body';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { areaOfExpertiseData } from '../../../../shared/data/area-of-experties.data';
import { IAreaOfExpertiseOption } from '../../../../shared/interfaces/function-data/area-of-expertise-option';
import { IFileData } from '../../../../shared/interfaces/function-data/file-data';
import { CameraSource } from '@capacitor/camera';
import { CommonConstants } from '../../../../shared/classes/common-constants';
import { ILiyYdmsExperience } from '../../../../shared/interfaces/models/liy.ydms.experience';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { Position } from '../../../../shared/enums/position';
import { BtnRoles } from '../../../../shared/enums/btn-roles';
import { StyleClass } from '../../../../shared/enums/style-class';


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
  experience?: ILiyYdmsExperience;
  experienceForm!: FormGroup;
  areaOfExpertiseOptions: IAreaOfExpertiseOption[] = areaOfExpertiseData;
  attachedImage?: string;
  attachedFile?: IFileData;
  private authData?: IAuthData;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly CommonConstants = CommonConstants;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private toastController: ToastController,
    private experienceService: LiyYdmsExperienceService,
    private authService: AuthService,
    private translateService: TranslateService,
    private loadingController: LoadingController,
    private fileService: FileService,
    private photoService: PhotoService,
  ) {
  }

  async ngOnInit() {
    this.initHeader();
    this.authData = await this.authService.getAuthData();
    const id = this.activeRoute.snapshot.paramMap.get('id');
    if (id) {
      this.loadExperienceDetail(+id).finally(() => this.initializeForm());
    } else {
      this.initializeForm();
    }
  }

  /**
   * Check has error of control
   * @param controlName
   * @param errorType
   */
  public hasError(controlName: string, errorType: string): boolean {
    const control = this.experienceForm.get(controlName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  /**
   * On click select attached file
   * @param type
   */
  public async onClickSelectAttachedFile(type: 'doc' | 'gallery' | 'camera'): Promise<void> {
    if (!type) return;
    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();

    try {
      if (type === 'doc') {
        this.attachedImage = undefined;
        this.fileService.selectFile().then(file => {
          this.attachedFile = file;
        });
      } else {
        this.attachedFile = undefined;
        this.photoService.pickImage(
          type === 'gallery' ? CameraSource.Photos : CameraSource.Camera
        ).then(() => {
          this.attachedImage = this.photoService.getImageResourceBase64();
        });
      }
    } catch (e: any) {
      console.error(e);
      this.showToast(e?.message, IonicColors.DANGER);
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * On submit form
   */
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
        total_love: 0,
        attach_file: this.attachedFile?.base64 || this.attachedImage || '',
        x_attach_file_name: this.attachedFile?.fileName || '',
        x_attach_file_mine_type: this.attachedFile?.mimeType || ''
      };

      let result: any;
      if (!this.experience?.id) {
        result = await this.experienceService.createExperience(experienceData);
      } else {
        result = await this.experienceService.updateExperience(this.experience.id, experienceData);
      }

      if (result) {
        this.showToast(this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_SUCCESS_MESSAGE), IonicColors.SUCCESS);
        await this.router.navigateByUrl(PageRoutes.SHARE_EXPERIENCE);
      } else {
        this.showToast(this.translateService.instant(TranslateKeys.CREATE_EXPERIENCE_ERROR_CREATE), IonicColors.DANGER);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      await loading.dismiss();
    }
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
      name: [this.experience?.name || '', [Validators.required]],
      area_of_expertise: [this.experience?.area_of_expertise || '', [Validators.required]],
      experience_content: [this.experience?.experience_content || '', [Validators.required, Validators.minLength(20)]]
    });

    if (this.experience?.attach_file) {
      if (!this.experience.x_attach_file_name ||
        !this.experience.x_attach_file_mine_type) {
        this.attachedImage = this.experience.attach_file;
      } else {
        this.attachedFile = {
          fileName: this.experience.x_attach_file_name,
          mimeType: this.experience.x_attach_file_mine_type,
          base64: this.experience.attach_file
        };
      }
    }
  }

  /**
   * loadExperienceDetail
   * @private
   */
  private async loadExperienceDetail(id: number): Promise<void> {
    if (!Number.isInteger(id)) return;
    const loading = await this.loadingController.create({mode: NativePlatform.IOS});
    await loading.present();
    try {
      this.experience = await this.experienceService.getExperienceDetail(id);
    } finally {
      await loading.dismiss();
    }
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
