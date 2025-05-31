import { Component, OnInit } from '@angular/core';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { IHeaderAnimeImage } from '../../../../shared/interfaces/header/header';
import { IAuthData } from '../../../../shared/interfaces/auth/auth-data';

@Component({
  selector: 'app-emotion-checkin',
  templateUrl: './emotion-checkin.component.html',
  styleUrls: ['./emotion-checkin.component.scss'],
  standalone: false
})
export class EmotionCheckinComponent implements OnInit {

  animeImage!: IHeaderAnimeImage;
  authData?: IAuthData;
  isLoading!: boolean;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;

  constructor() {
  }

  ngOnInit() {
    this.initHeader();
  }


  /**
   * Initialize header configuration
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'daily_emotion_journal',
      imageUrl: '/assets/images/daily_emotion_journal.png',
      width: '160px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '0',
        bottom: '0'
      }
    };
  }
}
