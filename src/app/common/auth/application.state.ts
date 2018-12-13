import {OAuth2Token} from './oauth2-token.model';
import {
  AuthAction,
  AUTHORIZATION_CODE_GRANT_BEGIN, AUTHORIZATION_CODE_GRANT_REDIRECT, AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE,
  SET_AUTH_TOKEN,
  SET_LOGIN_REDIRECT, SET_TOKEN_PERSISTENCE_IS_ENABLED
} from './auth.actions';
import {Action, ActionReducer, createSelector} from '@ngrx/store';
import {addSeconds} from 'date-fns';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';


export interface ApplicationState {
  readonly app: keyof any;

  readonly token?: OAuth2Token;
  readonly refreshedAt: Date;

  // The path components of the page to redirect to after successful login
  readonly loginRedirectTo: string;

  // Should the access token persist across user sessions?
  readonly isTokenPersistenceEnabled: boolean;

  readonly authCodeGrantInProgress?: AuthorizationCodeGrantRequest | AuthorizationCodeGrantResponse;
}

export const ApplicationState = {
  initial: (app: keyof any) => ({
    app,
    loginRedirectTo: '/',
    refreshedAt: new Date(Date.now()),
    isTokenPersistenceEnabled: false
  }),
  selectToken: (authState: ApplicationState) => authState.token,
  selectAccessToken: (authState: ApplicationState) => authState.token && authState.token.accessToken,

  selectTokenRefreshedAt: createSelector(
    (authState: ApplicationState) => authState.token,
    (authState: ApplicationState) => authState.refreshedAt,
    (token, refreshedAt) => ([token, refreshedAt] as [OAuth2Token, Date])
  ),

  selectTokenExpiresAt: createSelector(
    (authState: ApplicationState) => authState.token,
    (authState: ApplicationState) => authState.refreshedAt,
    (token, refreshedAt) => {
      const expiresIn = token && token.expiresIn;
      const expiresAt = expiresIn && addSeconds(refreshedAt, expiresIn) || new Date(Date.now());
      return [token, expiresAt] as [OAuth2Token, Date];
    }
  ),
  isAuthCodeGrantInProgress: (authState: ApplicationState) => authState.authCodeGrantInProgress !== undefined
};

export function reduceApplicationState(state: ApplicationState, action: AuthAction): ApplicationState {
  switch (action.type) {
    case SET_AUTH_TOKEN:
      return {
        ...state,
        token: action.token,
        refreshedAt: action.useTimestamp ? action.useTimestamp : new Date(Date.now()),
        authCodeGrantInProgress: undefined
      };
    case SET_LOGIN_REDIRECT:
      return {...state, loginRedirectTo: action.redirectTo};
    case AUTHORIZATION_CODE_GRANT_BEGIN:
      return {
        ...state,
        token: undefined,
        refreshedAt: new Date(Date.now()),
        authCodeGrantInProgress: action.request
      };
    case AUTHORIZATION_CODE_GRANT_REDIRECT:
      return {...state, authCodeGrantInProgress: action.response};
    case AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE:
      return {...state, authCodeGrantInProgress: action.response};
    case SET_TOKEN_PERSISTENCE_IS_ENABLED:
      return {...state, isTokenPersistenceEnabled: action.isEnabled};
    default:
      return state;
  }
}
