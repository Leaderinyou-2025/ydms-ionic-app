import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShareExperiencePage } from './share-experience.page';
import { ShareExperienceDetailPage } from './share-experience-detail/share-experience-detail.page';
import { CreateExperiencePage } from './create-experience/create-experience.page';
import { PageRoutes } from '../../../shared/enums/page-routes';

const routes: Routes = [
  {
    path: '',
    component: ShareExperiencePage
  },
  {
    path: PageRoutes.CREATE_EXPERIENCE,
    component: CreateExperiencePage
  },
  {
    path: `${PageRoutes.CREATE_EXPERIENCE}/:id`,
    component: CreateExperiencePage
  },
  {
    path: ':id',
    component: ShareExperienceDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShareExperiencePageRoutingModule {
}
