import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LiyYdmsClassService } from '../../../services/models/liy.ydms.class.service';
import { AuthService } from '../../../services/auth/auth.service';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { PageRoutes } from '../../../shared/enums/page-routes';
import { ResUserService } from '../../../services/models/res.user.service';
import { TranslateKeys } from '../../../shared/enums/translate-keys';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.page.html',
  styleUrls: ['./teacher-dashboard.page.scss'],
  standalone: false,
})
export class TeacherDashboardPage implements OnInit {

  totalStudents = 0;
  totalTasks = 0;
  totalNotifications = 0;
  authData?: IAuthData;

  protected readonly CommonConstants = CommonConstants;
  protected readonly PageRoutes = PageRoutes;

  constructor(
    private router: Router,
    private classService: LiyYdmsClassService,
    private resUserService: ResUserService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then((authData) => {
      this.authData = authData;
      this.getCountStudentsByClassroomId();
    });
  }

  private getCountStudentsByClassroomId(): void {
    if (!this.authData || !this.authData?.classroom_id) return;
    this.resUserService.getCountTeenagerByClassroomId(this.authData.classroom_id.id).then(totalStudents => this.totalStudents = totalStudents);
  }

  protected readonly TranslateKeys = TranslateKeys;
}
