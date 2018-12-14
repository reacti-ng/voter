import {
  ApplicationState,
  AuthorizationCodeGrantState,
  reduceApplicationState,
  reduceCodeGrantApplicationState
} from '../../common/auth/application.state';
import {Action, ActionReducerMap, createSelector} from '@ngrx/store';
import {AuthAction, isAuthAction} from '../../common/auth/auth.actions';
import {AuthState} from '../../common/auth/auth.state';


export interface CoreAuthState {
  __public__: ApplicationState;
  login: ApplicationState;
  org: ApplicationState & AuthorizationCodeGrantState
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
    switch (appKey) {
      case '__public__':
      case 'login':
        return {...state, [appKey]: reduceApplicationState(state[appKey], action)};
      case 'org':
        return {...state, [appKey]: reduceCodeGrantApplicationState(state[appKey], action)};
    }
  }
  return state;

}

