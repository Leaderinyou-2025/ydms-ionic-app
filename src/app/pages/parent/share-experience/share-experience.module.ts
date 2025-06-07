import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { QuillModule } from 'ngx-quill';

import { ShareExperiencePageRoutingModule } from './share-experience-routing.module';
import { ShareExperiencePage } from './share-experience.page';
import { ShareExperienceDetailPage } from './share-experience-detail/share-experience-detail.page';
import { CreateExperiencePage } from './create-experience/create-experience.page';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    QuillModule.forRoot({
      modules: {
        syntax: true
      }
    }),
    ShareExperiencePageRoutingModule,
    SharedModule
  ],
  declarations: [
    ShareExperiencePage,
    ShareExperienceDetailPage,
    CreateExperiencePage
  ]
})
export class ShareExperiencePageModule {}
