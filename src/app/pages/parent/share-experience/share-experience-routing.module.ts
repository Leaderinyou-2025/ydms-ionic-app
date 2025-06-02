import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ShareExperiencePage } from './share-experience.page';
import { ShareExperienceDetailPage } from './share-experience-detail/share-experience-detail.page';
import { CreateExperiencePage } from './create-experience/create-experience.page';

/**
 * Cấu hình routing cho module chia sẻ kinh nghiệm
 * Bao gồm các route: danh sách, tạo mới, chi tiết
 */
const routes: Routes = [
  {
    path: '',
    component: ShareExperiencePage
  },
  {
    path: 'create',
    component: CreateExperiencePage
  },
  {
    path: 'detail/:id',
    component: ShareExperienceDetailPage
  }
];

/**
 * Module routing cho chia sẻ kinh nghiệm
 * Sử dụng forChild vì đây là feature module
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShareExperiencePageRoutingModule {}
