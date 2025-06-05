import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ILiyYdmsClass } from '../../../shared/interfaces/models/liy.ydms.class';
import { LiyYdmsClassService } from '../../../services/models/liy.ydms.class.service';
import { AuthService } from '../../../services/auth/auth.service';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-class-management',
  templateUrl: './class-management.page.html',
  styleUrls: ['./class-management.page.scss'],
  standalone: false,
})
export class ClassManagementPage implements OnInit {

  classes: ILiyYdmsClass[] = [];
  isLoading = false;
  authData: IAuthData | undefined;

  constructor(
    private router: Router,
    private classService: LiyYdmsClassService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    this.authData = await this.authService.getAuthData();
    await this.loadClasses();
  }

  /**
   * Load classes for the current teacher
   */
  async loadClasses() {
    // Check if user has any classroom data
    if (!this.authData?.classroom_id && !this.authData?.classroom_ids?.length) return;

    this.isLoading = true;
    try {
      this.classes = await this.classService.getClassesByUserClassrooms(
        this.authData.classroom_id?.id,
        this.authData.classroom_ids
      );
    } catch (error) {
      console.error('Error loading classes:', error);
      await this.showErrorToast();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Navigate to student list for a specific class
   */
  viewStudents(classItem: ILiyYdmsClass) {
    if (classItem.id) {
      this.router.navigate(['/class-management/student-list', classItem.id]);
    }
  }

  /**
   * Refresh classes
   */
  async doRefresh(event: any) {
    await this.loadClasses();
    event.target.complete();
  }

  /**
   * Show error toast
   */
  private async showErrorToast() {
    const toast = await this.toastController.create({
      message: this.translate.instant('ALERT.error_system_header'),
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
}
