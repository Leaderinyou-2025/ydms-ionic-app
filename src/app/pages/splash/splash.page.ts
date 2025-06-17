import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';

import { NetworkService } from '../../services/network/network.service';
import { LiveUpdateService } from '../../services/live-update/live-update.service';
import { PageRoutes } from '../../shared/enums/page-routes';
import { NativePlatform } from '../../shared/enums/native-platform';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false
})
export class SplashPage implements OnInit {

  isLoading!: boolean;

  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private networkService: NetworkService,
    private liveUpdateService: LiveUpdateService,
  ) {
  }

  async ngOnInit() {
    await this.platform.ready();

    // Thiết lập status bar cho android
    if (this.platform.is(NativePlatform.CAPACITOR) && this.platform.is(NativePlatform.ANDROID)) {
      await StatusBar.setOverlaysWebView({overlay: true});
    }

    // Check network is online, check a new app version
    const isOnline = await this.networkService.isReallyOnline();
    if (isOnline) {
      this.isLoading = true;
      await this.liveUpdateService.checkUpdateApp();
    }

    // Wait 2 seconds to redirect to the login page
    setTimeout(() =>
        this.resetStatusBar()
          .then(() => this.navCtrl.navigateRoot(`/${PageRoutes.LOGIN}`, {replaceUrl: true}))
      , 3000
    );
  }

  /**
   * Resets the status bar configurations on supported platforms.
   * Specifically disables the overlay for the webview and ensures the status bar is displayed
   * when running on a Capacitor-powered Android platform. Also updates the loading state.
   *
   * @return {Promise<void>} Resolves when the status bar is successfully reset and the loading state is updated.
   */
  private async resetStatusBar(): Promise<void> {
    if (this.platform.is(NativePlatform.CAPACITOR) && this.platform.is(NativePlatform.ANDROID)) {
      await StatusBar.setOverlaysWebView({overlay: false});
    }
    this.isLoading = false;
  }

}
