import { Component, Input, OnInit } from '@angular/core';
import { CheckboxCustomEvent, ModalController, SearchbarCustomEvent } from '@ionic/angular';

import { AuthService } from '../../../services/auth/auth.service';
import { IAuthData } from '../../../shared/interfaces/auth/auth-data';
import { TranslateKeys } from '../../../shared/enums/translate-keys';
import { CommonConstants } from '../../../shared/classes/common-constants';
import { RecipientTypes } from '../../../shared/enums/recipient-types';

@Component({
  selector: 'app-select-recipients',
  templateUrl: './select-recipients.component.html',
  styleUrls: ['./select-recipients.component.scss'],
  standalone: false
})
export class SelectRecipientsComponent implements OnInit {

  @Input() parents!: IAuthData[];
  @Input() students!: IAuthData[];

  authData?: IAuthData;
  searchTerm!: string;
  recipientType: RecipientTypes = RecipientTypes.PARENTS;
  listUsers: IAuthData[] = new Array<IAuthData>();
  selectedUsers: IAuthData[] = new Array<IAuthData>();
  isLoading?: boolean;

  protected readonly CommonConstants = CommonConstants;
  protected readonly TranslateKeys = TranslateKeys;
  protected readonly Array = Array;
  protected readonly RecipientTypes = RecipientTypes;


  constructor(
    private authService: AuthService,
    private modalController: ModalController,
  ) {
  }

  ngOnInit() {
    this.authService.getAuthData().then(authData => {
      this.authData = authData;
      this.loadUserList();
    });
  }

  /**
   * On click cancel
   */
  public cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  /**
   * On click confirm
   */
  public confirm() {
    this.modalController.dismiss(this.selectedUsers, 'confirm');
  }

  /**
   * On search change
   * @param event
   */
  public onSearchChange(event?: SearchbarCustomEvent): void {
    this.searchTerm = event?.detail.value || '';
    setTimeout(() => {
      this.listUsers = new Array<IAuthData>();
      this.loadUserList();
    });
  }

  /**
   * Ion change select friend
   * @param event
   * @param user
   */
  public onChangeSelectUser(
    event: CheckboxCustomEvent,
    user: IAuthData
  ): void {
    const existIndex = this.selectedUsers.findIndex(u => u.id === user.id);
    if ((existIndex < 0 && !event.target.checked) || (existIndex >= 0 && event.target.checked)) {
      return;
    }

    if (event.target.checked) {
      this.selectedUsers.push(user);
      return;
    }

    this.selectedUsers.splice(existIndex, 1);
  }

  /**
   * Loads the list of users based on the current recipient type and search term.
   * It filters users from either the parents or students list depending on the recipient type.
   * Updates the `listUsers` property with the filtered user list.
   *
   * @return {void}
   */
  private loadUserList(): void {
    if (!this.authData || this.isLoading) return;
    this.isLoading = true;
    if (this.recipientType === RecipientTypes.PARENTS) {
      this.listUsers = this.searchByName(this.searchTerm || '', this.parents);
    } else if (this.recipientType === RecipientTypes.STUDENTS) {
      this.listUsers = this.searchByName(this.searchTerm || '', this.students);
    }
    this.isLoading = false;
  }

  /**
   * Searches for users in the provided list whose name or nickname includes the specified keyword.
   *
   * @param {string} keyword - The keyword to search for. It will be trimmed and converted to lowercase for matching.
   * @param {IAuthData[]} userList - The list of user data to search through.
   * @return {IAuthData[]} An array of users whose name or nickname matches the keyword.
   */
  private searchByName(keyword: string, userList: IAuthData[] = []): IAuthData[] {
    if (!keyword?.length || !userList?.length) return userList || [];
    const lowerKeyword = CommonConstants.removeVietnameseTones(keyword.trim().toLowerCase());
    if (!lowerKeyword?.length) return userList || [];
    return userList.filter(s => {
      const normalizedTextName = CommonConstants.removeVietnameseTones(s.name?.toLowerCase() || '');
      const normalizedTextNickname = CommonConstants.removeVietnameseTones(s.nickname?.toLowerCase() || '');
      return normalizedTextName.includes(lowerKeyword) || normalizedTextNickname.includes(lowerKeyword);
    });
  }
}
