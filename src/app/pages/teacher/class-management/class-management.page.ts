import { Component, OnInit } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';

import { ILiyYdmsClassroom } from '../../../shared/interfaces/models/liy.ydms.classroom';
import { LiyYdmsClassService } from '../../../services/models/liy.ydms.class.service';
import { AuthService } from '../../../services/auth/auth.service';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../shared/enums/page-routes';

@Component({
  selector: 'app-class-management',
  templateUrl: './class-management.page.html',
  styleUrls: ['./class-management.page.scss'],
  standalone: false,
})
export class ClassManagementPage implements OnInit {

  classes: ILiyYdmsClassroom[] = [];
  isLoading?: boolean;
  authData: IAuthData | undefined;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;

  constructor(
    private classService: LiyYdmsClassService,
    private authService: AuthService,
  ) {
  }

  async ngOnInit() {
    this.authData = await this.authService.getAuthData();
    await this.loadClasses();
  }

  /**
   * Refresh classes
   */
  public doRefresh(event: RefresherCustomEvent) {
    this.classes = new Array<ILiyYdmsClassroom>();
    this.loadClasses().finally(() => event.target.complete());
  }

  /**
   * Load classes for the current teacher
   */
  private async loadClasses() {
    if (!this.authData?.classroom_id && !this.authData?.classroom_ids?.length) return;
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      this.classes = await this.classService.getClassesByUserClassrooms(
        this.authData.classroom_id?.id,
        this.authData.classroom_ids
      );
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
