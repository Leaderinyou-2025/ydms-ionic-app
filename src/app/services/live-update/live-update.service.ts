import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { LiveUpdate } from '@capawesome/capacitor-live-update';

import { OdooService, SearchDomain } from '../odoo/odoo.service';
import { StorageService } from '../storage/storage.service';
import { NetworkService } from '../network/network.service';
import { StorageKey } from '../../shared/enums/storage-key';
import { ILiyYdmsAppVersion } from '../../shared/interfaces/models/liy.ydms.app.version';
import { CommonConstants } from '../../shared/classes/common-constants';
import { ModelName } from '../../shared/enums/model-name';
import { OrderBy } from '../../shared/enums/order-by';
import { OdooDomainOperator } from '../../shared/enums/odoo-domain-operator';
import { NativePlatform } from '../../shared/enums/native-platform';

@Injectable({
  providedIn: 'root'
})
export class LiveUpdateService {

  public liveUpdateFields = ['platform', 'version_build', 'version_code', 'public_url'];

  constructor(
    private platform: Platform,
    private odooService: OdooService,
    private storageService: StorageService,
    private networkService: NetworkService
  ) {
  }

  /**
   * Check and live update app
   */
  async checkUpdateApp(): Promise<boolean> {
    if (this.platform.is(NativePlatform.MOBILEWEB) ||
      (!this.platform.is(NativePlatform.IOS) && !this.platform.is(NativePlatform.ANDROID))) {
      return false;
    }

    let localAppVersion = await this.storageService.get<ILiyYdmsAppVersion>(StorageKey.CURRENT_APP_VERSION);
    if (!localAppVersion) {
      const appInfo = await App.getInfo();
      const currentAppVersion = await this.getAppVersionString();
      localAppVersion = {
        id: Math.random(),
        name: appInfo.name,
        app_bundle_id: appInfo.id,
        platform: this.platform.is(NativePlatform.ANDROID) ? NativePlatform.ANDROID : NativePlatform.IOS,
        version_build: currentAppVersion || appInfo.version,
        version_code: appInfo.build,
        public_url: '',
      };
    }

    // Get latest version from server
    const latestVersion = await this.getLatestAppVersion();
    if (!latestVersion || !latestVersion?.version_build || !latestVersion?.public_url) {
      console.error('Can not get app version from server.');
      return false;
    }

    // Check local version with latest version on server
    if (localAppVersion.version_build === latestVersion.version_build) {
      console.error(`The app version ${latestVersion.version_build} is latest.`);
      return false;
    }

    try {
      await LiveUpdate.downloadBundle({url: latestVersion.public_url, bundleId: latestVersion.version_build,});
      await LiveUpdate.setBundle({bundleId: latestVersion.version_build});
      await this.storageService.set<ILiyYdmsAppVersion>(StorageKey.CURRENT_APP_VERSION, latestVersion);
      await LiveUpdate.reload();
      return true;
    } catch (e: any) {
      console.error(e.message);
      return false;
    }
  }

  /**
   * Get latest app version from server
   * @return Promise<ILiyYdmsAppVersion | undefined>
   */
  async getLatestAppVersion(): Promise<ILiyYdmsAppVersion | undefined> {
    if (!this.networkService.isOnline()) return;

    const platformKey: keyof ILiyYdmsAppVersion = 'platform';
    const activeKey: keyof ILiyYdmsAppVersion = 'active';
    const platform = this.platform.is(NativePlatform.ANDROID) ? NativePlatform.ANDROID : NativePlatform.IOS;

    const args: SearchDomain = [
      [platformKey, OdooDomainOperator.EQUAL, platform],
      [activeKey, OdooDomainOperator.EQUAL, true]
    ];
    const appVersions: Array<ILiyYdmsAppVersion> = await this.odooService.searchRead(
      ModelName.APP_VERSIONS, args, this.liveUpdateFields, 0, 1, OrderBy.CREATE_AT_DESC
    );

    return appVersions?.[0];
  }

  /**
   * Get current app version string
   * default version: 1.0.0
   * @return string
   */
  async getAppVersionString(): Promise<string> {
    if (this.platform.is(NativePlatform.MOBILEWEB) || (!this.platform.is(NativePlatform.IOS) && !this.platform.is(NativePlatform.ANDROID))) {
      return '1.0.0';
    }

    let localVersion = await this.storageService.get<ILiyYdmsAppVersion>(StorageKey.CURRENT_APP_VERSION);
    if (localVersion?.version_build) {
      return localVersion.version_build;
    }

    const currentVersion = await LiveUpdate.getVersionName();
    if (currentVersion) {
      return currentVersion.versionName;
    }

    const appInfo = await App.getInfo();
    return appInfo?.version || '1.0.0';
  }
}
