import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LottieComponent } from 'ngx-lottie';

import { SelectDatetimeComponent } from './components/select-datetime/select-datetime.component';
import { PinUnlockComponent } from './components/pin-unlock/pin-unlock.component';
import { PinSetupModalComponent } from './components/pin-setup-modal/pin-setup-modal.component';
import { PinVerifyModalComponent } from './components/pin-verify-modal/pin-verify-modal.component';
import { FooterComponent } from './components/footer/footer.component';
import { ImageCarouselSelectComponent } from './components/image-carousel-select/image-carousel-select.component';
import { SoundClickDirective } from '../core/directive/sound-click.directive';
import { HeaderComponent } from './components/header/header.component';
import { ResourceViewerComponent } from './components/resource-viewer/resource-viewer.component';
import { EmotionDiaryModalComponent } from '../pages/student/personal-diary/emotion-diary-modal/emotion-diary-modal.component';
import { ResourceListComponent } from './components/resource-list/resource-list.component';
import { EmotionIconSelectorComponent } from './components/emotion-icon-selector/emotion-icon-selector.component';
import { EmotionShareComponent } from './components/emotion-share/emotion-share.component';
import { FormAssessmentComponent } from './components/form-assessment/form-assessment.component';
import { AlertEmotionCheckinComponent } from './components/alert-emotion-checkin/alert-emotion-checkin.component';
import { SelectFriendComponent } from './components/select-friend/select-friend.component';
import { SafeHtmlViewerComponent } from './components/safe-html-viewer/safe-html-viewer.component';

@NgModule({
  declarations: [
    SelectDatetimeComponent,
    PinUnlockComponent,
    PinSetupModalComponent,
    PinVerifyModalComponent,
    FooterComponent,
    ImageCarouselSelectComponent,
    HeaderComponent,
    ResourceViewerComponent,
    EmotionDiaryModalComponent,
    ResourceListComponent,
    FormAssessmentComponent,
    AlertEmotionCheckinComponent,
    EmotionIconSelectorComponent,
    EmotionShareComponent,
    SelectFriendComponent,
    SafeHtmlViewerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslatePipe,
    SoundClickDirective,
    RouterLink,
    RouterLinkActive,
    LottieComponent,
  ],
  exports: [
    SelectDatetimeComponent,
    PinUnlockComponent,
    PinSetupModalComponent,
    PinVerifyModalComponent,
    FooterComponent,
    ImageCarouselSelectComponent,
    HeaderComponent,
    ResourceViewerComponent,
    EmotionDiaryModalComponent,
    ResourceListComponent,
    FormAssessmentComponent,
    AlertEmotionCheckinComponent,
    EmotionIconSelectorComponent,
    EmotionShareComponent,
    SelectFriendComponent,
    SafeHtmlViewerComponent,
  ]
})
export class SharedModule {
}
