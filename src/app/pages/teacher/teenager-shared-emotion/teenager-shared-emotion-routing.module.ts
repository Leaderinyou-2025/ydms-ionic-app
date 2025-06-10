import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeenagerSharedEmotionPage } from './teenager-shared-emotion.page';

const routes: Routes = [
  {
    path: '',
    component: TeenagerSharedEmotionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeenagerSharedEmotionPageRoutingModule {}
