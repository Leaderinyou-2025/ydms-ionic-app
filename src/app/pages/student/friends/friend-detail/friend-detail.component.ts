import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertButton, AlertController, LoadingController, ToastButton, ToastController, ToastOptions } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { RankService } from '../../../../services/rank/rank.service';
import { TaskService } from '../../../../services/task/task.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { FriendService } from '../../../../services/friend/friend.service';
import { TranslateKeys } from '../../../../shared/enums/translate-keys';
import { PageRoutes } from '../../../../shared/enums/page-routes';
import { NativePlatform } from '../../../../shared/enums/native-platform';
import { ILiyYdmsFriend } from '../../../../shared/interfaces/models/liy.ydms.friend';
import { CommonConstants } from '../../../../shared/classes/common-constants';
import { IonicColors } from '../../../../shared/enums/ionic-colors';
import { IonicIcons } from '../../../../shared/enums/ionic-icons';
import { Position } from '../../../../shared/enums/position';
import { BtnRoles } from '../../../../shared/enums/btn-roles';
import { StyleClass } from '../../../../shared/enums/style-class';

@Component({
  selector: 'app-friend-detail',
  templateUrl: './friend-detail.component.html',
  styleUrls: ['./friend-detail.component.scss'],
  standalone: false
})
export class FriendDetailComponent implements OnInit {

  friend?: ILiyYdmsFriend;
  ranking!: number;
  badgeCount!: number;
  taskCount!: number;
  friendlyPoints?: number;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PageRoutes = PageRoutes;
  protected readonly CommonConstants = CommonConstants;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingCtrl: LoadingController,
    private friendService: FriendService,
    private rankService: RankService,
    private taskService: TaskService,
    private alertController: AlertController,
    private translate: TranslateService,
    private toastController: ToastController,
  ) {
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id != null) {
      await this.loadFriendDetails(+id);
    } else {
      await this.router.navigateByUrl(PageRoutes.FRIENDS);
    }
  }

  /**
   * Onclick unfriend button
   */
  public onClickUnfriend(): void {
    if (!this.friend) return;
    const buttons: Array<AlertButton> = [
      {text: this.translate.instant(TranslateKeys.BUTTON_CANCEL)},
      {
        text: this.translate.instant(TranslateKeys.BUTTON_CONFIRM),
        handler: () => this.handleUnfriend()
      },
    ];
    this.alertController.create({
      mode: NativePlatform.IOS,
      header: this.translate.instant(TranslateKeys.ALERT_DEFAULT_HEADER),
      message: this.translate.instant(TranslateKeys.ALERT_CONFIRM_UNFRIEND),
      buttons: buttons
    }).then(alertItem => alertItem.present());
  }

  /**
   * Get detail friend by id pass to prams
   */
  private async loadFriendDetails(id: number): Promise<void> {
    const loading = await this.loadingCtrl.create({mode: NativePlatform.IOS});
    await loading.present();
    try {
      this.friend = await this.friendService.getFriendById(id);
      if (!this.friend) {
        await this.router.navigateByUrl(PageRoutes.FRIENDS);
        return;
      }
      this.rankService.getCountUserAchievement(this.friend.friend_id.id).then((count) => this.badgeCount = count || 0);
      this.rankService.getLeaderboardByTeenagerId(this.friend.friend_id.id).then(leaderboard => this.ranking = leaderboard?.ranking || 0);
      this.taskService.getCountAllTasksByAssigneeId(this.friend.friend_id.id).then((count) => this.taskCount = count || 0);
      this.authService.getTeenagerTotalFriendlyPointsByIds([this.friend.friend_id.id]).then(users => this.friendlyPoints = users?.[0]?.total_friendly_points || 0);
    } catch (e) {
      console.error(e);
    } finally {
      loading?.dismiss();
    }
  }

  /**
   * Handle unfriend
   * @private
   */
  private async handleUnfriend(): Promise<void> {
    if (!this.friend) return;
    const loading = await this.loadingCtrl.create({mode: NativePlatform.IOS});
    await loading.present();
    try {
      const result = await this.friendService.cancelFriendRequest(this.friend);
      if (result != undefined) {
        this.showToast(this.translate.instant(TranslateKeys.TOAST_CANCEL_REQUEST_SUCCESS), IonicColors.SUCCESS);
        await this.router.navigateByUrl(PageRoutes.FRIENDS);
      } else this.showToast(this.translate.instant(TranslateKeys.TOAST_CANCEL_REQUEST_FAILED), IonicColors.SUCCESS);
    } catch (e: any) {
      console.error(e);
      this.showToast(e.message, IonicColors.DANGER);
    } finally {
      loading?.dismiss();
    }
  }

  /**
   * Show toast message
   * @param message
   * @param color
   * @private
   */
  private showToast(message: string, color: IonicColors.SUCCESS | IonicColors.DANGER): void {
    const closeBtn: ToastButton = {
      icon: IonicIcons.CLOSE_CIRCLE_OUTLINE,
      side: Position.END,
      role: BtnRoles.CANCEL,
    }

    const toastOption: ToastOptions = {
      message,
      duration: 3000,
      buttons: [closeBtn],
      mode: NativePlatform.IOS,
      cssClass: `${StyleClass.TOAST_ITEM} ${color === IonicColors.DANGER ? StyleClass.TOAST_ERROR : StyleClass.TOAST_SUCCESS}`,
      position: Position.TOP,
      icon: color === IonicColors.DANGER ? IonicIcons.WARNING_OUTLINE : IonicIcons.CHECKMARK_CIRCLE_OUTLINE,
      color,
      keyboardClose: false
    }
    this.toastController.create(toastOption).then(toast => toast.present());
  }
}
