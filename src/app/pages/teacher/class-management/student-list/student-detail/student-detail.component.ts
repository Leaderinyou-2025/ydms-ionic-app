import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { IAuthData } from '../../../../../shared/interfaces/auth/auth-data';
import { ResUsersService } from '../../../../../services/models/res.users.service';
import { TranslateKeys } from '../../../../../shared/enums/translate-keys';
import { CommonConstants } from '../../../../../shared/classes/common-constants';
import { PageRoutes } from '../../../../../shared/enums/page-routes';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss'],
  standalone: false,
})
export class StudentDetailComponent implements OnInit {

  student?: IAuthData;
  classId: number = 0;
  studentId: number = 0;
  isLoading = false;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly CommonConstants = CommonConstants;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resUsersService: ResUsersService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    this.classId = Number(this.route.snapshot.paramMap.get('classId'));
    this.studentId = Number(this.route.snapshot.paramMap.get('studentId'));
    
    if (this.classId && this.studentId) {
      await this.loadStudentDetail();
    } else {
      await this.navigateBack();
    }
  }

  /**
   * Load student detail information
   */
  async loadStudentDetail() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: this.translate.instant('CLASS_MANAGEMENT.loading_students')
    });
    await loading.present();

    try {
      this.student = await this.resUsersService.getUserById(this.studentId);
      if (!this.student) {
        await this.showErrorToast('Không tìm thấy thông tin học sinh');
        await this.navigateBack();
      }
    } catch (error) {
      console.error('Error loading student detail:', error);
      await this.showErrorToast('Có lỗi xảy ra khi tải thông tin học sinh');
      await this.navigateBack();
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  /**
   * Get avatar URL using base64 avatar_512
   */
  getAvatarUrl(student: IAuthData): string {
    if (!student.avatar_512) return 'assets/images/default-avatar.png';
    return CommonConstants.formatBase64ImageUrl(student.avatar_512);
  }

  /**
   * Get gender translation key
   */
  getGenderKey(gender?: string): string {
    switch (gender) {
      case 'male': return TranslateKeys.CLASS_MANAGEMENT_MALE;
      case 'female': return TranslateKeys.CLASS_MANAGEMENT_FEMALE;
      case 'other': return TranslateKeys.CLASS_MANAGEMENT_OTHER;
      default: return '';
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString?: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  }

  /**
   * Navigate back to student list
   */
  async navigateBack() {
    await this.router.navigate(['/class-management/student-list', this.classId]);
  }

  /**
   * Show error toast
   */
  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  /**
   * Refresh student data
   */
  async doRefresh(event: any) {
    await this.loadStudentDetail();
    event.target.complete();
  }
}
