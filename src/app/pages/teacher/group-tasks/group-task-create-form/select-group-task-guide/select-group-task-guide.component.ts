import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, ModalController, SearchbarCustomEvent } from '@ionic/angular';

import { TranslateKeys } from '../../../../../shared/enums/translate-keys';
import { ILiyYdmsGuide } from '../../../../../shared/interfaces/models/liy.ydms.guide';
import { CommonConstants } from '../../../../../shared/classes/common-constants';
import { LiyYdmsGuideService } from '../../../../../services/models/liy.ydms.guide.service';
import { GuideType } from '../../../../../shared/enums/guide-type';
import { IAuthData } from '../../../../../shared/interfaces/auth/auth-data';
import { AuthService } from '../../../../../services/auth/auth.service';

@Component({
  selector: 'app-select-group-task-guide',
  templateUrl: './select-group-task-guide.component.html',
  styleUrls: ['./select-group-task-guide.component.scss'],
  standalone: false
})
export class SelectGroupTaskGuideComponent implements OnInit {

  selectedGuideId?: number;
  searchTerm!: string;
  listGuides: ILiyYdmsGuide[] = new Array<ILiyYdmsGuide>();
  isLoading?: boolean;
  isLoadMore: boolean = false;

  authData?: IAuthData;

  private paged: number = 1;
  private readonly limit = 20;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly CommonConstants = CommonConstants;
  protected readonly Array = Array;

  constructor(
    private authService: AuthService,
    private modalController: ModalController,
    private liyYdmsGuideService: LiyYdmsGuideService,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then((authData) => {
      this.authData = authData;
      this.loadGuideList();
    });
  }

  /**
   * On click cancel
   */
  public cancel() {
    this.modalController.dismiss(undefined, 'cancel');
  }

  /**
   * On click confirm
   */
  public confirm() {
    if (!this.selectedGuideId) {
      this.cancel();
      return;
    }

    const selectedGuide = this.listGuides.find(gu => gu.id === this.selectedGuideId);
    if (!selectedGuide) {
      this.cancel();
      return;
    }

    this.modalController.dismiss(selectedGuide, 'cancel');
  }

  /**
   * On search change
   * @param event
   */
  public onSearchChange(event: SearchbarCustomEvent): void {
    this.searchTerm = event.detail.value || '';
    this.paged = 1;
    setTimeout(() => {
      this.listGuides = new Array<ILiyYdmsGuide>();
      this.loadGuideList();
    });
  }

  /**
   * Load more data when scrolling
   * @param event Infinite scroll event
   */
  public loadMore(event: InfiniteScrollCustomEvent): void {
    if (this.isLoading) {
      event.target.complete();
      return;
    }

    // No more
    if (this.listGuides?.length < ((this.paged - 1) * this.limit)) {
      event.target.complete();
      return;
    }

    this.paged += 1;
    this.isLoadMore = true;
    setTimeout(() => {
      this.loadGuideList().finally(() => {
        event.target.complete();
        this.isLoadMore = false;
      });
    }, 500);
  }

  /**
   * Lấy danh sách guide
   * @private
   */
  private async loadGuideList(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    const offset = (this.paged - 1) * this.limit;
    const results = await this.liyYdmsGuideService.getGuideListByGuideType(
      this.searchTerm || '', GuideType.GROUP_ACTIVITY, offset, this.limit
    );

    this.listGuides = CommonConstants.mergeArrayObjectById(this.listGuides, results) || [];
    this.isLoading = false;
  }
}
