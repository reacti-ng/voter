import {OAuth2Token} from './oauth2-token.model';
import {
  AuthAction,
  AUTHORIZATION_CODE_GRANT_BEGIN,
  AUTHORIZATION_CODE_GRANT_REDIRECT,
  AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE,
  SET_AUTH_TOKEN,
  SET_LOGIN_REDIRECT,
  SET_TOKEN_PERSISTENCE_IS_ENABLED
} from './auth.actions';
import {createSelector} from '@ngrx/store';
import {addSeconds} from 'date-fns';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';


export interface ApplicationState {
  readonly app: keyof any;

  readonly token?: OAuth2Token;
  readonly refreshedAt: Date;

  // Should the access token persist across user sessions?
  readonly isTokenPersistenceEnabled: boolean;
}

export interface AuthorizationCodeGrantState {
  // Restore the path on successful load
  readonly loginRedirect: any[];
  readonly authCodeGrantInProgress?: AuthorizationCodeGrantRequest | AuthorizationCodeGrantResponse;
}

export function isAuthorizationCodeGrantState(obj: any): obj is AuthorizationCodeGrantState {
  return !!obj && Array.isArray(obj['loginRedirect']);
}

function appStateTokenRefreshedAt(appState: ApplicationState): [OAuth2Token | undefined, Date] {
  return [appState.token, appState.refreshedAt];
}
function appStateTokenExpiresAt(appState: ApplicationState): [OAuth2Token | undefined, Date] {
  const [token, refreshedAt] = appStateTokenRefreshedAt(appState);
  const expiresIn  = token && token.expiresIn;
  const expiresAt = expiresIn && addSeconds(refreshedAt, expiresIn) || new Date(1970, 0, 1);
  return [token, expiresAt];

}


export const ApplicationState = {
  initial: (app: keyof any) => ({
    app,
    refreshedAt: new Date(Date.now()),
    isTokenPersistenceEnabled: false,
    loginRedirect: ['/public']
  } as ApplicationState & AuthorizationCodeGrantState),

  selectToken: (authState: ApplicationState) => authState.token,
  selectAccessToken: (appState: ApplicationState) => appState.token && appState.token.accessToken,


  selectTokenRefreshedAt: appStateTokenRefreshedAt,
  selectTokenExpiresAt: appStateTokenExpiresAt,

  isAuthCodeGrantInProgress: (authState: AuthorizationCodeGrantState) => authState.authCodeGrantInProgress !== undefined
};

export function reduceApplicationState(state: ApplicationState, action: AuthAction): ApplicationState {
  switch (action.type) {
    case SET_AUTH_TOKEN:
      return {
        ...state,
        token: action.token,
        refreshedAt: action.useTimestamp ? action.useTimestamp : new Date(Date.now()),
      };
    case SET_TOKEN_PERSISTENCE_IS_ENABLED:
      return {
        ...state,
        isTokenPersistenceEnabled: action.isEnabled
      };
    case AUTHORIZATION_CODE_GRANT_BEGIN:
      return {
        ...state,
        token: undefined,
        refreshedAt: new Date(Date.now()),
      };
    default:
      return state;
  }
}

type AuthCodeGrantState = ApplicationState & AuthorizationCodeGrantState;


export function reduceCodeGrantApplicationState(state: AuthCodeGrantState, action: AuthAction): AuthCodeGrantState {
 state = reduceApplicationState(state, action) as AuthCodeGrantState;
 switch (action.type) {
    case SET_AUTH_TOKEN:
      return {...state, authCodeGrantInProgress: undefined};
    case SET_LOGIN_REDIRECT:
      return {...state, loginRedirect: action.redirect};
    case AUTHORIZATION_CODE_GRANT_BEGIN:
      return {
        ...state,
        authCodeGrantInProgress: action.request
      };
    case AUTHORIZATION_CODE_GRANT_REDIRECT:
      return {...state, authCodeGrantInProgress: action.response};
    case AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE:
      return {...state, authCodeGrantInProgress: action.response};
    default:
      return state;
  }
}
