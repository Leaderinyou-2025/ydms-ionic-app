import {Component, OnInit} from '@angular/core';
import {AlertController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";

import {AuthService} from '../../services/auth/auth.service';
import {CommonConstants} from '../../shared/classes/common-constants';
import {TranslateKeys} from '../../shared/enums/translate-keys';
import {IHeaderAnimeImage} from '../../shared/interfaces/header/header';
import {NativePlatform} from "../../shared/enums/native-platform";

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
  standalone: false
})
export class ChatbotPage implements OnInit {

  animeImage!: IHeaderAnimeImage;
  inputText: string = '';
  messages: { sender: 'me' | 'bot', text: string, time: string }[] = [];
  userAvatarImg!: string;
  botAvatarImg!: string;

  protected readonly TranslateKeys = TranslateKeys;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.alertController.create({
      mode: NativePlatform.IOS,
      header: this.translate.instant(TranslateKeys.ALERT_DEFAULT_HEADER),
      message: this.translate.instant(TranslateKeys.ALERT_FEATURE_DEVELOPING),
      buttons: [{text: this.translate.instant(TranslateKeys.BUTTON_CLOSE)}]
    }).then(alertItem => {
      alertItem.present();
      alertItem.onDidDismiss().then(() => history.back());
    });
    this.intiApp();
  }

  onInputChange() {
  }

  onActionButtonClick() {
    if (this.inputText.trim().length > 0) {
      this.sendMessage();
    } else {
      this.startVoiceRecognition();
    }
  }

  sendMessage() {
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    this.messages.push({
      sender: 'me',
      text: this.inputText,
      time,
    });
    this.inputText = '';

    // Trigger Angular to animate element
    setTimeout(() => this.scrollToBottom(), 100);
  }

  startVoiceRecognition() {
  }

  scrollToBottom() {
    const content = document.querySelector('ion-content');
    content?.scrollToBottom(300);
  }

  private intiApp() {
    this.authService.getAuthData().then((authData) => {
      this.userAvatarImg = authData?.avatar_512 && CommonConstants.detectMimeType(authData.avatar_512) ?
        `${CommonConstants.detectMimeType(authData.avatar_512)}${authData?.avatar_512}`
        : '/assets/icons/svg/avatar.svg'
    });
    this.botAvatarImg = '/assets/images/chatbot/chatbot-avatar.png';

    this.animeImage = {
      name: 'Chatbot',
      imageUrl: '/assets/images/chatbot/chat-bot-icon.png',
      width: '100px',
      height: 'auto'
    };

    // this.messages = [
    //   {
    //     sender: 'bot',
    //     text: 'Rapidly build stunning Web Apps with Frest 🚀\nDeveloper friendly, Highly customizable & Carefully crafted HTML Admin Dashboard Template.',
    //     time: '7:20',
    //   },
    //   {
    //     sender: 'me',
    //     text: 'Minimum text check, Hide check icon',
    //     time: '7:20',
    //   },
    //   {
    //     sender: 'bot',
    //     text: 'Rapidly build stunning Web Apps with Frest 🚀\nDeveloper friendly, Highly customizable & Carefully crafted HTML Admin Dashboard Template.',
    //     time: '7:20',
    //   },
    //   {
    //     sender: 'me',
    //     text: 'More no. of lines text and showing complete list of features like time stamp + check icon READ',
    //     time: '7:20',
    //   }
    // ];
  }
}
