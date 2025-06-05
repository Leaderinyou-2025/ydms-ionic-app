import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ILiyYdmsClass } from '../../../../shared/interfaces/models/liy.ydms.class';
import { LiyYdmsClassService } from '../../../../services/models/liy.ydms.class.service';
import { ResUsersService } from '../../../../services/models/res.users.service';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CommonConstants } from '../../../../shared/classes/common-constants';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.page.html',
  styleUrls: ['./student-list.page.scss'],
  standalone: false,
})
export class StudentListPage implements OnInit {

  classId: number = 0;
  classInfo: ILiyYdmsClass | undefined;
  students: IAuthData[] = [];
  filteredStudents: IAuthData[] = [];
  searchText: string = '';
  isLoading = false;
  isSearching = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resUsersService: ResUsersService,
    private classService: LiyYdmsClassService,
    private toastController: ToastController,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    this.classId = Number(this.route.snapshot.paramMap.get('classId'));
    if (this.classId) {
      await this.loadClassInfo();
      await this.loadStudents();
    }
  }

  /**
   * Load class information
   */
  async loadClassInfo() {
    try {
      this.classInfo = await this.classService.getClassById(this.classId);
    } catch (error) {
      console.error('Error loading class info:', error);
    }
  }

  /**
   * Load students for the class
   */
  async loadStudents() {
    this.isLoading = true;
    try {
      this.students = await this.resUsersService.getTeenagersByClassroomId(this.classId);
      this.filteredStudents = [...this.students];
    } catch (error) {
      console.error('Error loading students:', error);
      await this.showErrorToast();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Search students by name or nickname
   */
  async onSearchChange(event: any) {
    const searchText = event.target.value?.toLowerCase() || '';
    this.searchText = searchText;

    if (searchText.trim() === '') {
      this.filteredStudents = [...this.students];
      return;
    }

    this.isSearching = true;
    try {
      // Filter locally first for better UX
      this.filteredStudents = this.students.filter(student =>
        student.name?.toLowerCase().includes(searchText) ||
        student.nickname?.toLowerCase().includes(searchText) ||
        student.edu_id?.toLowerCase().includes(searchText)
      );
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      this.isSearching = false;
    }
  }

  /**
   * Clear search
   */
  clearSearch() {
    this.searchText = '';
    this.filteredStudents = [...this.students];
  }

  /**
   * Refresh students
   */
  async doRefresh(event: any) {
    await this.loadStudents();
    event.target.complete();
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
      case 'male': return 'CLASS_MANAGEMENT.male';
      case 'female': return 'CLASS_MANAGEMENT.female';
      case 'other': return 'CLASS_MANAGEMENT.other';
      default: return '';
    }
  }

  /**
   * Navigate to student detail
   */
  viewStudentDetail(student: IAuthData) {
    if (student.id) {
      this.router.navigate(['/class-management/student-list', this.classId, 'detail', student.id]);
    }
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
