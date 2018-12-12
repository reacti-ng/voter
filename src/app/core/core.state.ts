

// This is the state added to the root selector
import {ControlsState, reduceControlsState} from '../common/control/controls.state';
import {ActionReducerMap, createFeatureSelector} from '@ngrx/store';
import {AuthState, reduceAuthState} from '../common/auth/auth.state';
import {reduceUserState, UserState} from '../user/user.state';

export interface CoreState {
  'common.control': ControlsState;
  'common.auth': AuthState;
  'core.user': UserState;
}

export const selectControlsState = createFeatureSelector<ControlsState>('common.control');
export const selectAuthState = createFeatureSelector<AuthState>('common.auth');

export const coreStateActionReducerMap: ActionReducerMap<CoreState> = {
  'common.control': reduceControlsState,
  'common.auth': reduceAuthState,
  'core.user': reduceUserState
};
