import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchbarCustomEvent, SegmentCustomEvent } from '@ionic/angular';

import { PageRoutes } from '../../enums/page-routes';
import { AuthService } from '../../../services/auth/auth.service';
import { UserRoles } from '../../enums/user-roles';
import { TranslateKeys } from '../../enums/translate-keys';
import { IHeaderAnimation, IHeaderAnimeImage, IHeaderSearchbar, IHeaderSegment } from '../../interfaces/header/header';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit {

  @Input() defaultBackHref!: string;
  @Input() pageTitle?: TranslateKeys;
  @Input() pageTitleString?: string;
  @Input() caption!: TranslateKeys;
  @Input() backgroundImageUrl!: string;
  @Input() backgroundColor!: string;
  @Input() animation!: IHeaderAnimation;
  @Input() animeImage!: IHeaderAnimeImage;

  @Input() searchbar!: IHeaderSearchbar;
  @Output() inputSearch = new EventEmitter<string>();

  @Input() segment?: IHeaderSegment;
  @Output() changeSegment = new EventEmitter<string | number>();

  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;

  constructor(
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.loadDefaultBackHref();

  }

  /**
   * On input search, emit event output search value for parent
   * @param event
   */
  public onInputSearch(event: SearchbarCustomEvent): void {
    this.inputSearch.emit(event.detail.value || '');
  }

  /**
   * On change segment, emit event output change segment value for parent
   * @param event
   */
  public onChangeSegment(event: SegmentCustomEvent): void {
    this.changeSegment.emit(event.detail.value || '');
  }

  /**
   * Style background of header
   */
  public getBackgroundStyle(): { [key: string]: string } {
    if (this.backgroundColor?.startsWith('linear-gradient')) {
      return {
        'background-image': this.backgroundColor,
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
        'background-position': 'center'
      };
    } else if (this.backgroundColor) {
      return {
        'background': this.backgroundColor
      };
    } else if (this.backgroundImageUrl) {
      return {
        'background-image': 'url(' + this.backgroundImageUrl + ')',
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
        'background-position': 'right bottom'
      };
    } else {
      return {
        'background': '#fff'
      };
    }
  }

  /**
   * Set defaultBackHref by user role
   * @private
   */
  private loadDefaultBackHref(): void {
    if (!this.defaultBackHref) {
      if (this.authService.getRole() === UserRoles.STUDENT) {
        this.defaultBackHref = `/${PageRoutes.HOME}`;
      } else if (this.authService.getRole() === UserRoles.PARENT) {
        this.defaultBackHref = `/${PageRoutes.PARENT_DASHBOARD}`;
      } else {
        this.defaultBackHref = `/${PageRoutes.TEACHER_DASHBOARD}`;
      }
    }
  }

  /**
   * Get Safe Top on native device
   * @param top
   */
  public getSafeTop(top?: string): string {
    if (!top) return 'auto';

    if (top.trim() === '0') {
      return 'env(safe-area-inset-top)';
    }

    const match = top.match(/^(-?\d*\.?\d+)([a-zA-Z%]+)$/);
    if (match) {
      const value = match[1];
      const unit = match[2];
      return `calc(env(safe-area-inset-top) + ${value}${unit})`;
    }

    return top;
  }
}
