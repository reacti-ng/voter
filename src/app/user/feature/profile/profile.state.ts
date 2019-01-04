import {createFeatureSelector, createSelector} from '@ngrx/store';
import {UserState} from '../../user.state';
import {SET_PROFILE_USER, UserProfileAction} from './profile.action';


export interface UserProfileState {
  readonly profileId: string | undefined;
}

export const initialUserProfileState: UserProfileState = { profileId: undefined };

export const selectProfileState = createFeatureSelector<UserProfileState>('user.feature.profile');

export const selectProfileUser = createSelector(
  UserState.fromRoot,
  selectProfileState,
  ({entities}: UserState, {profileId}: UserProfileState) => profileId ? entities[profileId] : undefined
);

export function reduceUserProfileState(state = initialUserProfileState, action: UserProfileAction): UserProfileState {
  switch (action.type) {
    case SET_PROFILE_USER:
      return {...state, profileId: action.user.id };
  }
}
