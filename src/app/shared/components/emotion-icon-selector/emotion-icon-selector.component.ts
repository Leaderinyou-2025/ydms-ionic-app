import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import Swiper from 'swiper';

import { ILiyYdmsEmotionalAnswerOption } from '../../interfaces/models/liy.ydms.emotional.answer.option';
import { TranslateKeys } from '../../enums/translate-keys';

@Component({
  selector: 'app-emotion-icon-selector',
  templateUrl: './emotion-icon-selector.component.html',
  styleUrls: ['./emotion-icon-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule, FormsModule]
})
export class EmotionIconSelectorComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() emotionAnswerOptions: ILiyYdmsEmotionalAnswerOption[] = [];
  @Input() selectedEmotionOption: ILiyYdmsEmotionalAnswerOption | null = null;
  @Input() questionText: string = '';
  @Output() emotionSelected = new EventEmitter<ILiyYdmsEmotionalAnswerOption>();

  currentSlideIndex = 0;
  private swiper: Swiper | null = null;
  protected readonly TranslateKeys = TranslateKeys;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initializeSwiper();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['emotionAnswerOptions'] && this.swiper) {
      setTimeout(() => {
        this.updateSwiper();
      }, 100);
    }

    if (changes['selectedEmotionOption'] && this.swiper && this.selectedEmotionOption) {
      setTimeout(() => {
        this.setSlideToSelectedOption();
      }, 100);
    }
  }

  private initializeSwiper(): void {
    setTimeout(() => {
      try {
        if (this.swiper) {
          this.swiper.destroy(true, true);
        }

        this.swiper = new Swiper('.emotion-swiper-container', {
          slidesPerView: 1,
          spaceBetween: 10,
          centeredSlides: true,
          loop: false,
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          on: {
            slideChange: (swiper: Swiper) => {
              this.currentSlideIndex = swiper.activeIndex;
              if (this.emotionAnswerOptions.length > 0 && this.currentSlideIndex < this.emotionAnswerOptions.length) {
                this.selectedEmotionOption = this.emotionAnswerOptions[this.currentSlideIndex];
                this.emotionSelected.emit(this.selectedEmotionOption);
              }
            }
          }
        });

        if (this.selectedEmotionOption && this.emotionAnswerOptions.length > 0) {
          setTimeout(() => {
            this.setSlideToSelectedOption();
          }, 50);
        }

      } catch (error) {
        console.error('ERROR initializing Swiper:', error);
      }
    }, 200);
  }

  private updateSwiper(): void {
    if (this.swiper) {
      try {
        this.swiper.update();
        this.swiper.updateSlides();
        this.swiper.updateProgress();
        this.swiper.updateSlidesClasses();

        if (this.emotionAnswerOptions.length > 0) {
          if (this.selectedEmotionOption) {
            this.setSlideToSelectedOption();
          } else {
            this.swiper.slideTo(0, 0);
            this.currentSlideIndex = 0;
          }
        }
      } catch (error) {
        console.error('ERROR updating Swiper:', error);
        this.initializeSwiper();
      }
    } else {
      this.initializeSwiper();
    }
  }

  /**
   * Set slide to the selected emotion option
   */
  private setSlideToSelectedOption(): void {
    if (!this.swiper || !this.selectedEmotionOption || this.emotionAnswerOptions.length === 0) {
      return;
    }

    const selectedIndex = this.emotionAnswerOptions.findIndex(
      option => option.id === this.selectedEmotionOption?.id
    );

    if (selectedIndex >= 0 && selectedIndex < this.emotionAnswerOptions.length) {
      this.swiper.slideTo(selectedIndex, 0);
      this.currentSlideIndex = selectedIndex;
    }
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
  }
}
