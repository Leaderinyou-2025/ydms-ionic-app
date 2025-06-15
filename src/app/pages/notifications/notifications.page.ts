import { Component, OnInit } from '@angular/core';
import { RefresherCustomEvent, SelectCustomEvent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../services/auth/auth.service';
import { LiyYdmsNotificationService } from '../../services/models/liy.ydms.notification.service';
import { TranslateKeys } from '../../shared/enums/translate-keys';
import { PageRoutes } from '../../shared/enums/page-routes';
import { ILiyYdmsNotification } from '../../shared/interfaces/models/liy.ydms.notification';
import { NotificationTypes } from '../../shared/enums/notification-type';
import { IHeaderSearchbar, IHeaderSegment } from '../../shared/interfaces/header/header';
import { InputTypes } from '../../shared/enums/input-types';
import { CommonConstants } from '../../shared/classes/common-constants';
import { DateFormat } from '../../shared/enums/date-format';
import { SearchNotificationParams } from '../../shared/interfaces/notification/notification.interface';
import { IAuthData } from '../../shared/interfaces/auth/auth-data';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: false,
})
export class NotificationsPage implements OnInit {

  // Search form states
  authData?: IAuthData;
  searchForm!: SearchNotificationParams;
  paged!: number;
  limit: number = 20;
  notifications!: ILiyYdmsNotification[];

  // Infinite scroll state
  isLoading!: boolean | undefined;
  isLoadMore!: boolean | undefined;
  isRefresh!: boolean | undefined;

  // Header configuration
  segment: IHeaderSegment = {
    value: 'unread',
    buttons: [
      {value: 'unread', label: TranslateKeys.NOTIFICATIONS_UNREAD},
      {value: 'read', label: TranslateKeys.NOTIFICATIONS_READ}
    ]
  };
  searchbar: IHeaderSearchbar = {
    placeholder: this.translate.instant(TranslateKeys.NOTIFICATIONS_SEARCH),
    type: InputTypes.SEARCH,
    inputmode: InputTypes.SEARCH,
    debounce: 500,
    showClearButton: true
  };

  // Notification types for dropdown
  notificationTypes = [
    {value: NotificationTypes.ALL, label: this.translate.instant(TranslateKeys.RESOURCE_TYPE_ALL)},
    {value: NotificationTypes.EMOTIONAL, label: this.translate.instant(TranslateKeys.NOTIFICATIONS_TYPE_EMOTION)},
    {value: NotificationTypes.TASK, label: this.translate.instant(TranslateKeys.NOTIFICATIONS_TYPE_TASK)},
    {value: NotificationTypes.EXPERIENCE, label: this.translate.instant(TranslateKeys.NOTIFICATIONS_TYPE_EXPERIENCE)},
    {value: NotificationTypes.ASSESSMENT, label: this.translate.instant(TranslateKeys.NOTIFICATIONS_TYPE_ASSESSMENT)},
    {value: NotificationTypes.OTHER, label: this.translate.instant(TranslateKeys.NOTIFICATIONS_TYPE_OTHER)}
  ];

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly NotificationTypes = NotificationTypes;
  protected readonly DateFormat = DateFormat;

  constructor(
    private authService: AuthService,
    private notificationService: LiyYdmsNotificationService,
    private translate: TranslateService
  ) {
  }

  async ngOnInit() {
    this.authData = await this.authService.getAuthData();
    this.initParams();
    await this.loadNotifications();
  }

  ionViewDidEnter() {
    if (this.notifications) setTimeout(() => this.doRefresh());
  }

  /**
   * On change filter
   * @param event
   */
  public async onFilterChange(event: SelectCustomEvent): Promise<void> {
    this.searchForm.notification_type = event.detail.value === NotificationTypes.ALL ? undefined : event.detail.value;
    this.resetSearch();
    await this.loadNotifications();
  }

  /**
   * Handle segment change from header component
   * @param value The selected segment value
   */
  public async onSegmentChange(value: string | number): Promise<void> {
    if (typeof value !== 'string' || !this.searchForm) return;
    this.searchForm.is_viewed = value === 'read';
    this.resetSearch();
    await this.loadNotifications();
  }

  /**
   * Handle search input from header component
   * @param searchText The search text
   */
  public async onSearchInput(searchText: string): Promise<void> {
    if (!this.searchForm) return;
    this.searchForm.name = searchText;
    this.resetSearch();
    await this.loadNotifications();
  }

  /**
   * Load more notifications when scrolling
   * @param event The infinite scroll event
   */
  public async loadMoreNotifications(event: any): Promise<void> {
    if (this.isLoadMore) return event.target.complete();

    const hasMore = this.notifications?.length === ((this.paged - 1) * this.limit);
    if (!hasMore) return event.target.complete();

    this.isLoadMore = true;
    this.paged += 1;
    this.loadNotifications().finally(() => {
      this.isLoadMore = false;
      event.target.complete();
    });
  }

  /**
   * On selected start date
   * @param value
   */
  public async onSelectStartDate(value?: string | Array<string> | null): Promise<void> {
    if (!this.searchForm) return;
    if (!value || typeof (value) === 'string') this.searchForm.start_date = value || undefined;
    this.resetSearch();
    return this.loadNotifications();
  }

  /**
   * On selected end date
   * @param value
   */
  public async onSelectEndDate(value?: string | Array<string> | null): Promise<void> {
    if (!this.searchForm) return;
    if (!value || typeof (value) === 'string') this.searchForm.end_date = value || undefined;
    this.resetSearch();
    return this.loadNotifications();
  }

  /**
   * Handle pull-to-refresh event
   * @param event The refresh event
   */
  public doRefresh(event?: RefresherCustomEvent): void {
    if (this.isRefresh) return;
    this.isRefresh = true;
    this.resetSearch();
    this.loadNotifications().finally(() => {
      this.isRefresh = false;
      event?.detail.complete();
    });
  }

  /**
   * Return notification type label
   * @param notification
   */
  public getNotificationTypeLabel(notification: ILiyYdmsNotification): string {
    if (!notification) return '';
    const type = this.notificationTypes.find(type => type.value === notification.notification_type);
    return type?.label || this.translate.instant(TranslateKeys.NOTIFICATIONS_TYPE_OTHER);
  }

  /**
   * Get bg class for notification type
   * @param notification
   */
  public getTypeBackground(notification: ILiyYdmsNotification): string {
    if (!notification) return 'bg-gray-600';
    if (notification.notification_type === NotificationTypes.EMOTIONAL) return 'bg-sky-600';
    if (notification.notification_type === NotificationTypes.TASK) return 'bg-orange-600';
    if (notification.notification_type === NotificationTypes.EXPERIENCE) return 'bg-emerald-600';
    if (notification.notification_type === NotificationTypes.ASSESSMENT) return 'bg-pink-600';
    return 'bg-gray-600';
  }

  /**
   * Load notifications
   * @private
   */
  private async loadNotifications(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    const offset = ((this.paged - 1) * this.limit) || 0;
    const results: ILiyYdmsNotification[] = await this.notificationService.getNotificationList(this.searchForm, offset, this.limit);
    this.notifications = CommonConstants.mergeArrayObjectById(this.notifications, results) || [];
    this.isLoading = false;
  }

  /**
   * Init all params
   * @private
   */
  private initParams() {
    this.searchForm = {
      name: '',
      is_viewed: false,
      notification_type: undefined,
      start_date: undefined,
      end_date: undefined,
      user_id: this.authData?.partner_id?.id
    };
    this.resetSearch();
  }

  /**
   * Reset pages and notification list
   * @private
   */
  private resetSearch(): void {
    this.paged = 1;
    this.notifications = new Array<ILiyYdmsNotification>();
  }
}
