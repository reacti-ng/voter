import {ApplicationState, reduceApplicationState} from '../../common/auth/application.state';
import {Action, ActionReducerMap, createSelector} from '@ngrx/store';
import {AuthAction, isAuthAction} from '../../common/auth/auth.actions';
import {AuthState} from '../../common/auth/auth.state';


export interface CoreAuthState {
  __public__: ApplicationState;
  login: ApplicationState;
  org: ApplicationState;
}

const initial: CoreAuthState = {
  __public__: ApplicationState.initial('__public__'),
  login: ApplicationState.initial('login'),
  org: ApplicationState.initial('org')
};

export const CoreAuthState = {
};

export function reduceAuthState(state: CoreAuthState = initial, action: Action): CoreAuthState {
  if (isAuthAction(action)) {
    const appKey = action.app as keyof CoreAuthState;
    const appState = state[appKey];
    if (!!appState && (appState as ApplicationState).app === action.app) {
      const appState_ = reduceApplicationState(appState as ApplicationState, action);
      if (appState !== appState_) {
        return {...state, [appKey]: appState_ };
      }
    }
  }
  return state;

}

