

// This is the state added to the root selector
import {ControlsState, reduceControlsState} from '../common/control/controls.state';
import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';
import {reduceUserState, UserState} from '../user/user.state';
import {CoreAuthState, reduceAuthState} from './auth/auth.state';

export interface CoreState {
  'common.control': ControlsState;
  'core.auth': CoreAuthState;
  'core.user': UserState;
}

export const selectControlsState = createFeatureSelector<ControlsState>('common.control');
export const selectAuthState = createFeatureSelector<CoreAuthState>('core.auth');

export const coreStateActionReducerMap: ActionReducerMap<CoreState> = {
  'common.control': reduceControlsState,
  'core.auth': reduceAuthState,
  'core.user': reduceUserState
};
