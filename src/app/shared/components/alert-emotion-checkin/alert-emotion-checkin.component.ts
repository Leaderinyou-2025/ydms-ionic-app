import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateKeys } from '../../enums/translate-keys';
import { PageRoutes } from '../../enums/page-routes';

@Component({
  selector: 'app-alert-emotion-checkin',
  templateUrl: './alert-emotion-checkin.component.html',
  styleUrls: ['./alert-emotion-checkin.component.scss'],
  standalone: false
})
export class AlertEmotionCheckinComponent {
  protected readonly TranslateKeys = TranslateKeys;

  @Output() closeEvent = new EventEmitter<void>();

  protected readonly PageRoutes = PageRoutes;

  constructor() {
  }

  onClickClose(delay?: number): void {
    setTimeout(() => this.closeEvent.emit(), delay || 0);
  }

}
