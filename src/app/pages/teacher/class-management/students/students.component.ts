import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { ResUsersService } from '../../../../services/models/res.users.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { IHeaderSearchbar } from '../../../../shared/interfaces/header/header';
import { InputTypes } from '../../../../shared/enums/input-types';
import { CommonConstants } from '../../../../shared/classes/common-constants';
import { DateFormat } from '../../../../shared/enums/date-format';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
  standalone: false
})
export class StudentsComponent implements OnInit {

  pageTitle!: string;
  searchbar!: IHeaderSearchbar;
  authData?: IAuthData;

  classId!: number;
  students: IAuthData[] = [];
  filteredStudents: IAuthData[] = [];
  searchText: string = '';
  isLoading?: boolean;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly CommonConstants = CommonConstants;
  protected readonly Array = Array;
  protected readonly DateFormat = DateFormat;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private resUsersService: ResUsersService,
    private toastController: ToastController,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    const classId = this.route.snapshot.paramMap.get('id');
    if (!classId || !Number.isInteger(+classId)) {
      return history.back();
    }

    // Init header
    this.authService.getAuthData().then(authData => {
      this.authData = authData;
      this.initHeader();
    });

    // Load students
    this.classId = +classId;
    this.loadStudents();
  }

  /**
   * Search students by name or nickname
   */
  public async onSearchChange(event: string) {
    this.searchText = event || '';

    if (this.searchText.trim() === '') {
      this.filteredStudents = [...this.students];
      return;
    }

    this.filteredStudents = this.students.filter(student =>
      student.name?.toLowerCase().includes(this.searchText) ||
      student.nickname?.toLowerCase().includes(this.searchText)
    );
  }

  /**
   * Refresh students
   */
  public async doRefresh(event: any) {
    await this.loadStudents();
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

  /**
   * initHeader
   * @private
   */
  private initHeader(): void {
    this.pageTitle = `${this.translate.instant(TranslateKeys.CLASS_MANAGEMENT_STUDENT_LIST)} ${this.authData?.classroom_id?.name}`;
    this.searchbar = {
      type: InputTypes.SEARCH,
      inputmode: InputTypes.TEXT,
      placeholder: this.translate.instant(TranslateKeys.NOTIFICATIONS_SEARCH),
      animated: true,
      showClearButton: true,
    };
  }

  /**
   * Load students for the class
   */
  private async loadStudents() {
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
}
