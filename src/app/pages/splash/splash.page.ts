import { Component, OnInit } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { NavController, Platform } from '@ionic/angular';
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

    // Ẩn status bar
    if (this.platform.is(NativePlatform.CAPACITOR) && this.platform.is(NativePlatform.ANDROID)) {
      await StatusBar.hide();
    }


    // Check network is online, check a new app version
    const isOnline = await this.networkService.isReallyOnline();
    if (isOnline) {
      this.isLoading = true;
      await this.liveUpdateService.checkUpdateApp();
      this.isLoading = false;
    }

    // Wait 2 seconds to redirect to the login page
    setTimeout(() =>
        this.navCtrl.navigateRoot(`/${PageRoutes.LOGIN}`, {replaceUrl: true})
          .then(() => {
            if (this.platform.is(NativePlatform.CAPACITOR) && this.platform.is(NativePlatform.ANDROID)) {
              StatusBar.show();
            }
          })
      , 2000
    );
  }

}
