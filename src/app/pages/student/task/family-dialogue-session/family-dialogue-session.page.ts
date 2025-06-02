import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonInfiniteScroll, RefresherCustomEvent, ToastButton, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { FamilyDialogueSessionService } from '../../../../services/family-dialogue-session/family-dialogue-session.service';
import { IFamilyDialogueSessionHistory } from '../../../../shared/interfaces/family-dialogue-session/family-dialogue-session.interfaces';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { IHeaderAnimeImage } from "../../../../shared/interfaces/header/header";
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { Position } from '../../../../shared/enums/position';
import { BtnRoles } from '../../../../shared/enums/btn-roles';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { StyleClass } from '../../../../shared/enums/style-class';

@Component({
  selector: 'app-family-dialogue-session',
  templateUrl: './family-dialogue-session.page.html',
  styleUrls: ['./family-dialogue-session.page.scss'],
  standalone: false,
})
export class FamilyDialogueSessionPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  animeImage!: IHeaderAnimeImage;
  sessionHistory: IFamilyDialogueSessionHistory[] = [];
  displayedItems: IFamilyDialogueSessionHistory[] = [];
  isLoading: boolean = true;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  hasMoreItems: boolean = true;

  protected readonly PageRoutes = PageRoutes;
  protected readonly TranslateKeys = TranslateKeys;

  constructor(
    private familyDialogueSessionService: FamilyDialogueSessionService,
    private translate: TranslateService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.initHeader();
    this.loadSessionHistory();
  }

  /**
   * Initialize header
   */
  private initHeader(): void {
    this.animeImage = {
      name: 'family-dialogue',
      imageUrl: '/assets/images/family-communication-quality-survey.png', // Reusing existing image for now
      width: '180px',
      height: 'auto',
      position: {
        position: 'absolute',
        right: '-20px',
        bottom: '-10px'
      }
    };
  }

  /**
   * Load session history
   * @param event Refresh event (optional)
   */
  private async loadSessionHistory(event?: RefresherCustomEvent): Promise<void> {
    this.isLoading = true;
    this.currentPage = 1;
    this.hasMoreItems = true;

    await this.familyDialogueSessionService.loadSessionHistory();
    this.familyDialogueSessionService.getSessionHistory().subscribe(history => {
      this.sessionHistory = history;
      this.loadMoreItems(true);
      this.isLoading = false;

      // Complete the refresh event if it exists
      if (event) {
        event.detail.complete();
      }
    });
  }

  /**
   * Load more items for infinite scroll
   * @param reset Reset displayed items
   */
  public loadMoreItems(reset: boolean = false): void {
    if (reset) {
      this.displayedItems = [];
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const newItems = this.sessionHistory.slice(startIndex, endIndex);

    if (newItems.length > 0) {
      this.displayedItems = [...this.displayedItems, ...newItems];
      this.currentPage++;
    }

    this.hasMoreItems = endIndex < this.sessionHistory.length;

    // Complete the infinite scroll event
    if (this.infiniteScroll) {
      this.infiniteScroll.complete();
    }
  }

  /**
   * Handle infinite scroll
   */
  public onIonInfinite(): void {
    this.loadMoreItems();
  }

  /**
   * Handle pull to refresh
   */
  public handleRefresh(event: RefresherCustomEvent): void {
    // Show loading indicator
    this.isLoading = true;

    // Small delay to show loading state
    setTimeout(() => {
      this.loadSessionHistory(event);
    }, 300);
  }

  /**
   * View session detail
   * @param sessionId Session ID
   */
  public viewSessionDetail(sessionId: number): void {
    this.router.navigate([`/${PageRoutes.FAMILY_DIALOGUE_SESSION}/${sessionId}`]);
  }

  /**
   * Format date
   * @param date Date
   */
  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Show toast message
   * @param message Message
   * @param color Color
   */
  private async showToast(message: string, color: IonicColors): Promise<void> {
    const closeBtn: ToastButton = {
      icon: IonicIcons.CLOSE_CIRCLE_OUTLINE,
      side: Position.END,
      role: BtnRoles.CANCEL,
    }
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      buttons: [closeBtn],
      mode: NativePlatform.IOS,
      cssClass: `${StyleClass.TOAST_ITEM} ${color === IonicColors.DANGER ? StyleClass.TOAST_ERROR : StyleClass.TOAST_SUCCESS}`,
      position: Position.TOP,
      icon: color === IonicColors.DANGER ? IonicIcons.WARNING_OUTLINE : IonicIcons.CHECKMARK_CIRCLE_OUTLINE,
      color,
      keyboardClose: false
    });
    await toast.present();
  }
}
