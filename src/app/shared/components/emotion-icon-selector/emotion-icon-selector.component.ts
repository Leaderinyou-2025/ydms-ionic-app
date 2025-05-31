import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import Swiper from 'swiper';

import { ILiyYdmsEmotionalAnswerOption } from '../../interfaces/models/liy.ydms.emotional.answer.option';
import { TranslateKeys } from '../../enums/translate-keys';
import { CommonConstants } from '../../classes/common-constants';

@Component({
  selector: 'app-emotion-icon-selector',
  templateUrl: './emotion-icon-selector.component.html',
  styleUrls: ['./emotion-icon-selector.component.scss'],
  standalone: false,
})
export class EmotionIconSelectorComponent implements AfterViewInit, OnDestroy {

  @Input() emotionAnswerOptions: ILiyYdmsEmotionalAnswerOption[] = [];
  @Input() selectedEmotionOption: ILiyYdmsEmotionalAnswerOption | null = null;
  @Input() questionText: string = '';
  @Output() emotionSelected = new EventEmitter<ILiyYdmsEmotionalAnswerOption>();

  currentSlideIndex = 0;
  private swiper: Swiper | null = null;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly CommonConstants = CommonConstants;

  constructor() {
  }

  ngAfterViewInit() {
    this.initializeSwiper();
    this.emotionSelected.emit(this.emotionAnswerOptions?.[0]);
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }
  }

  /**
   * Initial swiper
   * @private
   */
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
}
