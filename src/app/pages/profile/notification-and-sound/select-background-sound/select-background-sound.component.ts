import { Component, Input, OnInit } from '@angular/core';

import { AuthService } from '../../../../services/auth/auth.service';
import { SoundService } from '../../../../services/sound/sound.service';
import { ISoundResource } from '../../../../shared/interfaces/settings/assets-resource';
import { CommonConstants } from '../../../../shared/classes/common-constants';

@Component({
  selector: 'app-select-background-sound',
  templateUrl: './select-background-sound.component.html',
  styleUrls: ['./select-background-sound.component.scss'],
  standalone: false
})
export class SelectBackgroundSoundComponent implements OnInit {

  @Input() volume!: number;

  backgroundSounds!: Array<ISoundResource>;
  selectedSound?: ISoundResource;
  playing: boolean = false;

  constructor(
    private soundService: SoundService,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.backgroundSounds = new Array<ISoundResource>();
    this.soundService.getBackgroundSoundGallery().then(backgroundSounds => this.backgroundSounds = backgroundSounds);
  }

  async ionViewDidEnter() {
    await this.soundService.stopBackground();
  }

  ionViewWillLeave() {
    this.stopSound();
    this.soundService.playBackground();
  }

  /**
   * Play sound
   * @param item
   */
  playSound(item: ISoundResource) {
    // Tiếp tu nhạc hiện tại
    if (this.selectedSound?.id === item.id && !this.playing) {
      this.playing = true;
      this.soundService.playSound(
        item.id.toString(),
        this.volume || 1,
        false,
        this.selectedSound.progress
      ).finally(() => this.updateProgress());
      return;
    }

    // Dừng các bản đang chạy
    this.playing = false;
    if (this.selectedSound) this.stopSound();

    // Phát âm thanh
    this.selectedSound = item;
    this.soundService.playSound(item.id.toString()).finally(() => {
      this.playing = true;
      this.updateProgress();
    });
    this.soundService.setBackgroundSound(item.id);
    this.setSelectedSound();
  }

  /**
   * Pause sound
   */
  stopSound(isPause: boolean = false) {
    const soundId = this.selectedSound?.id.toString();
    if (!soundId) return;

    if (!isPause) {
      if (this.selectedSound) {
        this.selectedSound.progress = 0;
        this.selectedSound.currentTime = '0:00';
      }
      this.soundService.stopSound(soundId);
      this.selectedSound = undefined;
    } else {
      this.soundService.pauseSound(soundId);
    }
    this.playing = false;
  }

  /**
   * Xử lý khi người dùng kéo thanh tiến trình
   * @param event
   * @param item
   */
  public onProgressChange(event: any, item: ISoundResource) {
    const newValue = event.detail.value;
    this.soundService.playSound(
      item.id.toString(),
      this.volume || 1,
      false,
      newValue
    );
    item.progress = newValue;
    item.currentTime = CommonConstants.formatTimeSeconds(newValue);
  }

  /**
   * Cập nhật tiến trình
   * @private
   */
  private updateProgress(): void {
    if (this.playing && this.selectedSound) {
      this.soundService.getSoundCurrentTime(this.selectedSound.id.toString())
        .then(currentTime => {
          if (this.selectedSound) {
            this.selectedSound.progress = (currentTime === this.selectedSound.duration) ? 0 : currentTime;
            this.selectedSound.currentTime = CommonConstants.formatTimeSeconds(this.selectedSound.progress);
            if (currentTime === this.selectedSound.duration) this.playing = false;
          }
        });
      setTimeout(() => this.updateProgress(), 100);
    }
  }

  /**
   * Set selected sound
   * @private
   */
  private setSelectedSound(): void {
    this.authService.getSoundSettings().then(soundSettings => {
      if (soundSettings?.background && this.selectedSound && this.selectedSound.id !== soundSettings?.background?.sound?.id) {
        soundSettings.background.sound = {
          id: this.selectedSound.id,
          name: this.selectedSound.name,
          resource_url: this.selectedSound.resource_url,
        }
        this.authService.setSoundSettings(soundSettings).then(() => this.authService.saveAppSettings());
      }
    });
  }
}
