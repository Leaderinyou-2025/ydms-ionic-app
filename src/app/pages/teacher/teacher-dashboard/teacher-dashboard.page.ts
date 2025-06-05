import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LiyYdmsClassService } from '../../../services/models/liy.ydms.class.service';
import { AuthService } from '../../../services/auth/auth.service';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.page.html',
  styleUrls: ['./teacher-dashboard.page.scss'],
  standalone: false,
})
export class TeacherDashboardPage implements OnInit {

  totalClasses = 0;
  totalStudents = 0;
  totalTasks = 0;
  totalNotifications = 0;
  authData: IAuthData | undefined;

  constructor(
    private router: Router,
    private classService: LiyYdmsClassService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.authData = await this.authService.getAuthData();
    await this.loadStatistics();
  }

  /**
   * Navigate to class management
   */
  navigateToClassManagement() {
    this.router.navigate(['/class-management']);
  }

  /**
   * Navigate to expert guide
   */
  navigateToExpertGuide() {
    this.router.navigate(['/expert-guide']);
  }

  /**
   * Load dashboard statistics
   */
  private async loadStatistics() {
    // Check if user has any classroom data
    if (!this.authData?.classroom_id && !this.authData?.classroom_ids?.length) return;

    try {
      // Load total classes by classroom_id and classroom_ids from user data
      this.totalClasses = await this.classService.getCountClassesByUserClassrooms(
        this.authData.classroom_id?.id,
        this.authData.classroom_ids
      );

      // TODO: Load other statistics when services are available
      // this.totalStudents = await this.studentService.getCountStudentsByClassIds(this.authData.classroom_ids);
      // this.totalTasks = await this.taskService.getCountTasksByUserId(this.authData.id);
      // this.totalNotifications = await this.notificationService.getCountNotificationsByUserId(this.authData.id);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }
}
