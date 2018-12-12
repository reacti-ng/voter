import {OAuth2Token} from './oauth2-token.model';
import {
  BEGIN_AUTHORIZATION_CODE_GRANT,
  isAuthAction,
  SET_AUTH_TOKEN,
  SET_LOGIN_REDIRECT, SET_TOKEN_PERSISTENCE_IS_ENABLED
} from './auth.actions';
import {InjectionToken} from '@angular/core';
import {Action, createSelector, Selector} from '@ngrx/store';
import {addSeconds} from 'date-fns';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';


export interface AuthState {
  readonly token?: OAuth2Token;
  readonly refreshedAt: Date;

  // The path components of the page to redirect to after successful login
  readonly loginRedirectTo: string[];

  // Should the access token persist across user sessions?
  readonly isTokenPersistenceEnabled: boolean;

  readonly authCodeGrantInProgress?: AuthorizationCodeGrantRequest | AuthorizationCodeGrantResponse;
}

export const AUTH_STATE_SELECTOR = new InjectionToken<Selector<object, AuthState>>('AUTH_STATE_SELECTOR');

export const AuthState = {
  initial: {
    loginRedirectTo: ['public'],
    refreshedAt: new Date(Date.now()),
    isTokenPersistenceEnabled: false
  },
  selectToken: (authState: AuthState) => authState.token,
  selectAccessToken: (authState: AuthState) => authState.token && authState.token.accessToken,

  selectTokenRefreshedAt: createSelector(
    (authState: AuthState) => authState.token,
    (authState: AuthState) => authState.refreshedAt,
    (token, refreshedAt) => ([token, refreshedAt] as [OAuth2Token, Date])
  ),

  selectTokenExpiresAt: createSelector(
    (authState: AuthState) => authState.token,
    (authState: AuthState) => authState.refreshedAt,
    (token, refreshedAt) => {
      const expiresIn = token && token.expiresIn;
      const expiresAt = expiresIn && addSeconds(refreshedAt, expiresIn) || new Date(Date.now());
      return [token, expiresAt] as [OAuth2Token, Date];
    }
  )
};

export function reduceAuthState(state: AuthState = AuthState.initial, action: Action): AuthState {
  if (!isAuthAction(action)) { return state; }
  switch (action.type) {
    case SET_AUTH_TOKEN:
      return {...state,
        token: action.token,
        refreshedAt: action.useTimestamp ? action.useTimestamp : new Date(Date.now())
      };
    case SET_LOGIN_REDIRECT:
      return {...state, loginRedirectTo: action.redirectTo};
    case BEGIN_AUTHORIZATION_CODE_GRANT:
      return {
        ...state,
        token: undefined,
        refreshedAt: new Date(Date.now())
      };
    case SET_TOKEN_PERSISTENCE_IS_ENABLED:
      return {...state, isTokenPersistenceEnabled: action.isEnabled};
    default:
      return state;
  }
}
