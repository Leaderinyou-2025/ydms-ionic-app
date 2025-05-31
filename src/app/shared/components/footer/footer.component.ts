import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';

import { PageRoutes } from '../../enums/page-routes';
import { KeyboardService } from '../../../services/keyboard/keyboard.service';
import { TranslateKeys } from '../../enums/translate-keys';
import { AuthService } from '../../../services/auth/auth.service';
import { UserRoles } from '../../enums/user-roles';
import { NativePlatform } from '../../enums/native-platform';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: false
})
export class FooterComponent implements OnInit, OnDestroy {

  isKeyboardShowing!: boolean;
  activePage!: string | undefined;
  userRole!: UserRoles | undefined;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly UserRoles = UserRoles;
  protected readonly PageRoutes = PageRoutes;
  private keyboardSubscription!: Subscription;

  constructor(
    public platform: Platform,
    private router: Router,
    private keyboardService: KeyboardService,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.keyboardSubscription = this.keyboardService.isKeyboardOpen$.subscribe((isKeyboardShowing) => this.isKeyboardShowing = isKeyboardShowing);
    this.userRole = this.authService.getRole();

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.activePage = event.urlAfterRedirects.split('/')?.pop();
    });
  }

  ngOnDestroy() {
    this.keyboardSubscription?.unsubscribe();
  }

  /**
   * Check path is active
   * @param path
   */
  public isActive(path: string): boolean {
    return this.activePage === path;
  }

  protected readonly NativePlatform = NativePlatform;
}
