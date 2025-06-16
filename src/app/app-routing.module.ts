import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { PageRoutes } from './shared/enums/page-routes';

const routes: Routes = [
  {
    path: '',
    redirectTo: PageRoutes.SPLASH,
    pathMatch: 'full'
  },
  {
    path: PageRoutes.SPLASH,
    loadChildren: () => import('./pages/splash/splash.module').then(m => m.SplashPageModule)
  },
  {
    path: PageRoutes.LOGIN,
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: PageRoutes.HOME,
    loadChildren: () => import('./pages/student/home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.PROFILE,
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.PARENT_DASHBOARD,
    loadChildren: () => import('./pages/parent/parent-dashboard/parent-dashboard.module').then(m => m.ParentDashboardPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.TEACHER_DASHBOARD,
    loadChildren: () => import('./pages/teacher/teacher-dashboard/teacher-dashboard.module').then(m => m.TeacherDashboardPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.PERSONAL_DIARY,
    loadChildren: () => import('./pages/student/personal-diary/personal-diary.module').then(m => m.PersonalDiaryPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.FRIENDS,
    loadChildren: () => import('./pages/student/friends/friends.module').then(m => m.FriendsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.CHATBOT,
    loadChildren: () => import('./pages/chatbot/chatbot.module').then(m => m.ChatbotPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.RANK,
    loadChildren: () => import('./pages/student/rank/rank.module').then(m => m.RankPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.NOTIFICATIONS,
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.LIBRARY,
    loadChildren: () => import('./pages/student/library/library.module').then(m => m.LibraryPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.EXPERT_GUIDE,
    loadChildren: () => import('./pages/teacher/expert-guide/expert-guide.module').then(m => m.ExpertGuidePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.TASK,
    loadChildren: () => import('./pages/student/task/task.module').then(m => m.TaskPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.DAILY_EMOTION_JOURNAL,
    loadChildren: () => import('./pages/student/daily-emotion-journal/daily-emotion-journal.module').then(m => m.DailyEmotionJournalPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.FAMILY_CONFLICT_SURVEY,
    loadChildren: () => import('./pages/survey/family-conflict-survey/family-conflict-survey.module').then(m => m.FamilyConflictSurveyPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.FAMILY_COMMUNICATION_QUALITY_SURVEY,
    loadChildren: () => import('./pages/survey/family-communication-quality-survey/family-communication-quality-survey.module').then(m => m.FamilyCommunicationQualitySurveyPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.EMOTIONAL_SURVEY,
    loadChildren: () => import('./pages/survey/emotional-survey/emotional-survey.module').then(m => m.EmotionalSurveyPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.SELF_DISCOVERY_SURVEY,
    loadChildren: () => import('./pages/survey/self-discovery-survey/self-discovery-survey.module').then(m => m.SelfDiscoverySurveyPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.TASK_EXECUTING,
    loadChildren: () => import('./pages/task-executing/task-executing.module').then(m => m.TaskExecutingPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.SHARE_EXPERIENCE,
    loadChildren: () => import('./pages/parent/share-experience/share-experience.module').then(m => m.ShareExperiencePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.CLASS_MANAGEMENT,
    loadChildren: () => import('./pages/teacher/class-management/class-management.module').then(m => m.ClassManagementPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.TEENAGER_SHARED_EMOTION,
    loadChildren: () => import('./pages/teacher/teenager-shared-emotion/teenager-shared-emotion.module').then(m => m.TeenagerSharedEmotionPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: PageRoutes.GROUP_TASK,
    loadChildren: () => import('./pages/teacher/group-tasks/group-tasks.module').then(m => m.GroupTasksPageModule),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
