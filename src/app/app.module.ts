import {CUSTOM_ELEMENTS_SCHEMA, enableProdMode, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import localeVi from '@angular/common/locales/vi';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {IonicStorageModule} from '@ionic/storage-angular';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {provideLottieOptions} from 'ngx-lottie';
import player from 'lottie-web';
import {QuillModule} from 'ngx-quill';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {DEFAULT_TIMEOUT, TimeoutInterceptorService} from './core/services/timeout-interceptor.service';
import {defaultAnimation} from './core/animations/default.animaton';
import {SharedModule} from './shared/shared.module';
import {NativePlatform} from './shared/enums/native-platform';

registerLocaleData(localeVi);
enableProdMode();

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json?cb=' + new Date().getTime());
}

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot({navAnimation: defaultAnimation, innerHTMLTemplatesEnabled: true, mode: NativePlatform.IOS}),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    QuillModule.forRoot({
      modules: {
        syntax: false,
        toolbar: true,
      }
    }),
    SharedModule
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    provideHttpClient(withInterceptorsFromDi()),
    provideLottieOptions({player: playerFactory}),
    {provide: LOCALE_ID, useValue: 'vi-VN'},
    [{provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptorService, multi: true}],
    [{provide: DEFAULT_TIMEOUT, useValue: 10000}]
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
