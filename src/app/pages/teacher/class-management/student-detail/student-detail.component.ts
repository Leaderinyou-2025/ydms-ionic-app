import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';
import { ResUsersService } from '../../../../services/models/res.users.service';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { CommonConstants } from '../../../../shared/classes/common-constants';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { DateFormat } from '../../../../shared/enums/date-format';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss'],
  standalone: false,
})
export class StudentDetailComponent implements OnInit {

  student?: IAuthData;
  parent?: IAuthData;
  isLoading?: boolean;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly CommonConstants = CommonConstants;
  protected readonly DateFormat = DateFormat;

  constructor(
    private route: ActivatedRoute,
    private resUsersService: ResUsersService,
  ) {
  }

  ngOnInit() {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (!studentId || !Number.isInteger(+studentId)) {
      return history.back();
    }

    this.loadStudentDetails(+studentId);
  }

  /**
   * Load student detail and parent
   * @param studentId
   * @private
   */
  private async loadStudentDetails(studentId: number): Promise<void> {
    if (!studentId) return;
    this.student = await this.resUsersService.getUserById(studentId);

    if (!this.student) return history.back();

    if (this.student.parent_id?.id) {
      this.parent = await this.resUsersService.getUserById(this.student.parent_id.id);
    }
  }
}
