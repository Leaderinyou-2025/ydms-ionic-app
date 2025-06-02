import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FamilyDialogueSessionPage } from './family-dialogue-session.page';
import { FamilyDialogueSessionDetailComponent } from './family-dialogue-session-detail/family-dialogue-session-detail.component';

const routes: Routes = [
  {
    path: '',
    component: FamilyDialogueSessionPage
  },
  {
    path: ':id',
    component: FamilyDialogueSessionDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FamilyDialogueSessionPageRoutingModule {}
