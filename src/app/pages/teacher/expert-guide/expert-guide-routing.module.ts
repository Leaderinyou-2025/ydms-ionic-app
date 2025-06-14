import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpertGuidePage } from './expert-guide.page';
import { ExpertGuideDetailComponent } from './expert-guide-detail/expert-guide-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ExpertGuidePage
  },
  {
    path: ':id',
    component: ExpertGuideDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpertGuidePageRoutingModule {}
