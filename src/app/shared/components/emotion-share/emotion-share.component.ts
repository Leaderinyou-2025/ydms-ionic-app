import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { TranslateKeys } from '../../enums/translate-keys';
import { ResUserService } from '../../../services/models/res.user.service';
import { AuthService } from '../../../services/auth/auth.service';
import { IAuthData } from '../../interfaces/auth/auth-data';

// Interfaces for public sharing
export interface IPublicUser {
  id: number;
  name: string;
  avatar?: string;
  type: PublicShareTargetType;
}

export enum PublicShareTargetType {
  FRIENDS = 'friend',
  PARENT = 'parent',
  TEACHER = 'teacher'
}

@Component({
  selector: 'app-emotion-share',
  templateUrl: './emotion-share.component.html',
  styleUrls: ['./emotion-share.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, TranslateModule]
})
export class EmotionShareComponent implements OnInit {

  @Input() initialPublicEmotional: boolean = false;
  @Input() initialPublicEmotionalTo: PublicShareTargetType = PublicShareTargetType.FRIENDS;
  @Input() initialPublicUserIds: number[] = [];

  @Output() shareEmotion = new EventEmitter<{
    public_emotional: boolean,
    public_emotional_to: PublicShareTargetType,
    public_user_ids: number[]
  }>();

  public_emotional: boolean = false;
  public_emotional_to: PublicShareTargetType = PublicShareTargetType.FRIENDS;
  public_user_ids: number[] = [];
  selectedPublicUsers: IPublicUser[] = [];

  isLoadingUsers: boolean = false;
  loadedUsers: IPublicUser[] = [];

  authData?: IAuthData;

  protected readonly TranslateKeys = TranslateKeys;
  protected readonly PublicShareTargetType = PublicShareTargetType;

  constructor(
    private resUserService: ResUserService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.authData = await this.authService.getAuthData();

    this.public_emotional = this.initialPublicEmotional;

    this.public_emotional_to = this.mapBackendToFrontendShareType(this.initialPublicEmotionalTo);

    this.public_user_ids = [...this.initialPublicUserIds];

    if (this.public_emotional) {
      await this.loadUsersByType();
      await this.setSelectedUsersFromIds();
    }

    this.emitShareData();
  }

  /**
   * Handle public sharing toggle
   */
  async onPublicSharingToggle(): Promise<void> {
    if (!this.public_emotional) {
      this.selectedPublicUsers = [];
      this.public_user_ids = [];
      this.loadedUsers = [];
    } else {
      await this.loadUsersByType();
      await this.setSelectedUsersFromIds();
    }
    this.emitShareData();
  }

  /**
   * Handle share type change
   */
  async onShareTypeChange(): Promise<void> {
    this.selectedPublicUsers = [];
    this.public_user_ids = [];

    await this.loadUsersByType();

    this.emitShareData();
  }

  /**
   * Check if user is selected
   */
  isUserSelected(user: IPublicUser): boolean {
    return this.selectedPublicUsers.some(u => u.id === user.id);
  }

  /**
   * Toggle user selection
   */
  toggleUserSelection(user: IPublicUser): void {
    if (this.isUserSelected(user)) {
      this.selectedPublicUsers = this.selectedPublicUsers.filter(u => u.id !== user.id);
    } else {
      this.selectedPublicUsers.push(user);
    }
    this.public_user_ids = this.selectedPublicUsers.map(u => u.id);
    this.emitShareData();
  }

  /**
   * Load users based on selected share type
   */
  private async loadUsersByType(): Promise<void> {
    if (!this.public_emotional) return;

    this.isLoadingUsers = true;
    try {
      let users: IAuthData[] = [];

      switch (this.public_emotional_to) {
        case PublicShareTargetType.FRIENDS:
          users = await this.resUserService.getListUser(this.authData, true, false, false);
          break;
        case PublicShareTargetType.PARENT:
          users = await this.resUserService.getListUser(this.authData, false, true, false);
          break;
        case PublicShareTargetType.TEACHER:
          users = await this.resUserService.getListUser(this.authData, false, false, true);
          break;
      }

      this.loadedUsers = users.map(user => this.convertToPublicUser(user));
    } catch (error) {
      console.error('ERROR loading users:', error);
      this.loadedUsers = [];
    } finally {
      this.isLoadingUsers = false;
    }
  }

  /**
   * Convert IAuthData to IPublicUser
   */
  private convertToPublicUser(user: IAuthData): IPublicUser {
    return {
      id: user.id,
      name: user.name || user.nickname || user.login,
      avatar: user.avatar?.name || user.avatar_512 || user.image_128,
      type: this.public_emotional_to
    };
  }

  /**
   * Map backend share type values to frontend enum values
   */
  private mapBackendToFrontendShareType(backendValue: any): PublicShareTargetType {
    if (typeof backendValue === 'string') {
      switch (backendValue.toLowerCase()) {
        case 'friend':
          return PublicShareTargetType.FRIENDS;
        case 'parent':
          return PublicShareTargetType.PARENT;
        case 'teacher':
          return PublicShareTargetType.TEACHER;
        default:
          return PublicShareTargetType.FRIENDS;
      }
    }

    return backendValue || PublicShareTargetType.FRIENDS;
  }

  /**
   * Map frontend enum values to backend string values
   */
  private mapFrontendToBackendShareType(frontendValue: PublicShareTargetType): string {
    switch (frontendValue) {
      case PublicShareTargetType.FRIENDS:
        return 'friend';
      case PublicShareTargetType.PARENT:
        return 'parent';
      case PublicShareTargetType.TEACHER:
        return 'teacher';
      default:
        return 'friend';
    }
  }

  /**
   * Set selected users based on user IDs
   */
  private async setSelectedUsersFromIds(): Promise<void> {
    if (this.public_user_ids.length === 0) {
      this.selectedPublicUsers = [];
      return;
    }

    this.selectedPublicUsers = this.loadedUsers.filter(user =>
      this.public_user_ids.includes(user.id)
    );

    const missingUserIds = this.public_user_ids.filter(id =>
      !this.selectedPublicUsers.some(user => user.id === id)
    );

    if (missingUserIds.length > 0) {
      for (const userId of missingUserIds) {
        try {
          const user = await this.resUserService.getUserById(userId);
          if (user) {
            const publicUser = this.convertToPublicUser(user);
            this.selectedPublicUsers.push(publicUser);
            this.loadedUsers.push(publicUser);
          }
        } catch (error) {
          console.error('ERROR loading user by ID:', userId, error);
        }
      }
    }
  }

  /**
   * Emit share data when changes occur
   */
  private emitShareData(): void {
    const backendShareType = this.mapFrontendToBackendShareType(this.public_emotional_to);

    this.shareEmotion.emit({
      public_emotional: this.public_emotional,
      public_emotional_to: backendShareType as any, // Send backend format
      public_user_ids: this.public_user_ids
    });
  }
}
