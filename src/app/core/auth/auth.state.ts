import {ApplicationState, reduceApplicationState} from '../../common/auth/application.state';
import {Action, ActionReducerMap, createSelector} from '@ngrx/store';
import {AuthAction, isAuthAction} from '../../common/auth/auth.actions';
import {AuthState} from '../../common/auth/auth.state';
import {isCoreAuthAction} from './auth.actions';


export interface CoreAuthState {
  active: keyof CoreAuthState | undefined;

  __public__: ApplicationState,
  login: ApplicationState;
}

const initial: CoreAuthState = {
  active: undefined,
  __public__: ApplicationState.initial('__public__'),
  login: ApplicationState.initial('login')
};

export const CoreAuthState = {
  selectActiveApp: createSelector((authState: CoreAuthState) => authState.active && authState[authState.active])
};

export function reduceAuthState(state: CoreAuthState = initial, action: Action): CoreAuthState {
  if (isCoreAuthAction(action)) {
    return { ...state, active: action.app };
  }
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

