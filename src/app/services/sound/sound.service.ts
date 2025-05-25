import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { NativeAudio } from '@capacitor-community/native-audio'

import { AuthService } from '../auth/auth.service';
import { SoundKeys } from '../../shared/enums/sound-keys';
import { CommonConstants } from '../../shared/classes/common-constants';
import { ISoundResource } from '../../shared/interfaces/settings/assets-resource';
import { AssetResourceCategory } from '../../shared/enums/asset-resource-category';
import { NativePlatform } from '../../shared/enums/native-platform';
import { StorageKey } from '../../shared/enums/storage-key';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  public backgroundSoundGallery: Array<ISoundResource> = [];
  private soundsManager: Map<string, string> = new Map<string, string>();

  constructor(
    private authService: AuthService,
    private platform: Platform,
    private localStorageService: LocalStorageService,
  ) {
  }

  /**
   * Set background sound
   * @param soundId
   */
  public setBackgroundSound(soundId: number) {
    if (!soundId) return;
    this.soundsManager.set(SoundKeys.BACKGROUND, soundId.toString());
  }

  /**
   * Preload sound music on user config
   */
  public async loadUserSounds(): Promise<void> {
    for (const sound of CommonConstants.sound_gallery) {
      const prefixUrl = `${!this.platform.is(NativePlatform.CAPACITOR) ? '' : 'public/'}`;
      try {
        await NativeAudio.preload({
          assetId: sound.id.toString(),
          assetPath: prefixUrl + sound.resource_url,
          audioChannelNum: 1,
          isUrl: false
        });
        if (sound['key']) this.soundsManager.set(sound['key'], sound.id.toString());
      } catch (e: any) {
        console.error(e.message);
      }
    }

    this.authService.getSoundSettings().then(settings => {
      if (settings?.background?.sound?.id) this.soundsManager.set(SoundKeys.BACKGROUND, settings.background.sound.id.toString());
    });
  }

  /**
   * Play background music
   */
  public playBackground(): void {
    this.authService.getSoundSettings().then(settings => {
      if (settings?.background?.enabled && settings?.background?.sound?.resource_url) {
        this.playEffect(SoundKeys.BACKGROUND);
      }
    });
  }

  /**
   * Stop background music
   */
  public async stopBackground(): Promise<void> {
    return this.stopEffect(SoundKeys.BACKGROUND);
  }

  /**
   * Play music by name
   */
  public async playEffect(
    name: SoundKeys,
    time?: number
  ): Promise<void> {
    const settings = await this.authService.getSoundSettings();
    if (!settings || !settings?.enabled) return;

    const soundId = this.soundsManager.get(name);
    if (!soundId) {
      console.warn(`[SoundService] Sound effect "${name}" not found`);
      return;
    }

    return this.playSound(
      soundId,
      name === SoundKeys.BACKGROUND ? (settings.background?.volume || 0.5) : 1,
      name === SoundKeys.BACKGROUND,
      time,
      name === SoundKeys.BACKGROUND
    );
  }

  /**
   * Stop music by name
   */
  public async stopEffect(
    name: string
  ): Promise<void> {
    const soundId = this.soundsManager.get(name);
    if (soundId) {
      return this.stopSound(soundId);
    } else {
      console.warn(`Sound effect "${name}" not found`);
    }
  }

  /**
   * Set volume music by name
   */
  public async setVolume(
    name: string,
    volume: number = 1
  ): Promise<void> {
    const soundId = this.soundsManager.get(name);
    if (soundId) return this.setSoundVolume(soundId, volume);
  }

  /**
   * playSound
   * @param assetId
   * @param volume
   * @param loop
   * @param time
   * @param stopAfterPlay
   */
  public async playSound(
    assetId: string,
    volume: number = 1,
    loop: boolean = false,
    time: number = 0,
    stopAfterPlay: boolean = true
  ): Promise<void> {
    if (stopAfterPlay) {
      const isPlaying = await NativeAudio.isPlaying({assetId: assetId});
      if (isPlaying) await this.stopSound(assetId);
    }
    await NativeAudio.play({assetId: assetId, time: time});
    await NativeAudio.setVolume({assetId: assetId, volume: volume});
    if (loop) await NativeAudio.loop({assetId: assetId});
  }

  /**
   * stopSound
   * @param assetId
   */
  public async stopSound(assetId: string): Promise<void> {
    await NativeAudio.stop({assetId: assetId});
  }

  /**
   * Set sound volume
   * @param assetId
   * @param volume
   */
  public async setSoundVolume(assetId: string, volume: number = 1): Promise<void> {
    await NativeAudio.setVolume({assetId: assetId, volume: volume});
  }

  /**
   * getSoundCurrentTime
   * @param assetId
   */
  public async getSoundCurrentTime(assetId: string): Promise<number> {
    const time = await NativeAudio.getCurrentTime({assetId: assetId});
    return time.currentTime;
  }

  /**
   * Pause sound
   */
  public async pauseSound(assetId: string): Promise<void> {
    await NativeAudio.pause({assetId: assetId});
  }

  /**
   * getBackgroundSoundGallery
   */
  public async getBackgroundSoundGallery(): Promise<Array<ISoundResource>> {
    await this.loadBgSoundGallery();
    return [...this.backgroundSoundGallery];
  }

  /**
   * load background sound gallery
   * @private
   */
  private async loadBgSoundGallery(): Promise<void> {
    if (this.backgroundSoundGallery?.length) return;
    const bgSounds = CommonConstants.sound_gallery.filter(u => u['category'] === AssetResourceCategory.BACKGROUND);
    for (const sound of bgSounds) {
      const soundDuration = await NativeAudio.getDuration({assetId: sound.id.toString()});
      const bgSoundItem = {
        id: sound.id,
        name: sound.name,
        resource_url: sound.resource_url,
        progress: 0,
        duration: soundDuration.duration,
        durationTime: CommonConstants.formatTimeSeconds(soundDuration.duration),
        currentTime: CommonConstants.formatTimeSeconds(0)
      };
      this.backgroundSoundGallery.push(bgSoundItem);
    }
  }
}
