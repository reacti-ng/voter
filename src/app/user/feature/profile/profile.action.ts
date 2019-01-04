import {User} from '../../user.model';

export const SET_PROFILE_USER = 'user.feature.profile: set profile user';
export class SetProfileUser {
  readonly type = SET_PROFILE_USER;
  constructor(readonly user: User) {}
}

export type UserProfileAction = SetProfileUser;
