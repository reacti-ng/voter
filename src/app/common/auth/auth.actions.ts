import {OAuth2Token} from './oauth2-token.model';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';

type AppKey = Extract<keyof any, string>;

export const SET_AUTH_TOKEN = 'common.core: set core token';
export class SetAuthToken {
  readonly type = SET_AUTH_TOKEN;
  readonly useTimestamp?: Date;
  readonly app?: AppKey;
  constructor(readonly token?: OAuth2Token, options?: {useTimestamp?: Date, app?: AppKey}) {
    this.app = options && options.app;
    this.useTimestamp = options && options.useTimestamp;
  }
}

export const SET_LOGIN_REDIRECT = 'common.auth: set login redirect';
export class SetLoginRedirect {
  readonly type = SET_LOGIN_REDIRECT;
  readonly app?: AppKey;
  constructor(readonly redirect: any[], options?: {readonly app?: AppKey}) {
    this.app = options && options.app;
  }
}

// Redirect to the login page, attaching AuthorizationCodeGrantParams to the
// query parameters of the request.
export const AUTHORIZATION_CODE_GRANT_BEGIN = 'common.auth: begin authorization code grant';
export class BeginAuthorizationCodeGrant {
  readonly type = AUTHORIZATION_CODE_GRANT_BEGIN;
  readonly app?: AppKey;
  constructor(readonly request: AuthorizationCodeGrantRequest, options?: {app?: AppKey}) {
    this.app = options && options.app;
  }
}

// Redirect back to the redirect_uri, passing code and state parameters
export const AUTHORIZATION_CODE_GRANT_REDIRECT = 'common.auth: authorization code grant redirect step';
export class AuthorizationCodeGrantRedirect {
  readonly type = AUTHORIZATION_CODE_GRANT_REDIRECT;
  readonly app?: AppKey;

  constructor(readonly redirectUri: string, readonly response: AuthorizationCodeGrantResponse, options?: {app?: AppKey}) {
    this.app = options && options.app;
  }
}

// Exhange the authorization code grant for an access token.
export const AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE = 'common.auth: authorization code grant token exchange';
export class  AuthorizationCodeGrantTokenExchange {
  readonly type = AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE;
  readonly app?: AppKey;
  // The token token code exchange must always be done from a public app
  constructor(readonly response: AuthorizationCodeGrantResponse, options?: {app?: AppKey}) {
    this.app = options && options.app;
  }
}

export const REFRESH_TOKEN = 'common.auth: begin refresh token';
export class RefreshToken {
  readonly type = REFRESH_TOKEN;
  readonly app?: AppKey;
  constructor(options?: {app?: AppKey}) {
    this.app = options && options.app;
  }
}

export const STORE_AUTH_TOKEN = 'common.auth: store access token';
export class StoreAuthToken {
  readonly type = STORE_AUTH_TOKEN;
  readonly app?: AppKey;
  constructor(options?: {readonly app?: AppKey}) {
    this.app = options && options.app;
  }
}

export const SET_TOKEN_PERSISTENCE_IS_ENABLED = 'common.auth: set token persistence is enabled';
export class SetTokenPersistenceIsEnabled {
  readonly type = SET_TOKEN_PERSISTENCE_IS_ENABLED;
  readonly app?: AppKey;
  constructor(readonly isEnabled: boolean, options?: {readonly app?: AppKey}) {
    this.app = options && options.app;
  }
}

export type AuthAction
  = SetAuthToken
  | SetLoginRedirect
  | BeginAuthorizationCodeGrant
  | AuthorizationCodeGrantRedirect
  | AuthorizationCodeGrantTokenExchange
  | RefreshToken
  | StoreAuthToken
  | SetTokenPersistenceIsEnabled;

export function isAuthAction(obj: any): obj is AuthAction {
  return !!obj && [
    SET_AUTH_TOKEN,
    SET_LOGIN_REDIRECT,
    AUTHORIZATION_CODE_GRANT_BEGIN,
    AUTHORIZATION_CODE_GRANT_REDIRECT,
    AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE,
    REFRESH_TOKEN,
    STORE_AUTH_TOKEN,
    SET_TOKEN_PERSISTENCE_IS_ENABLED
  ].includes(obj.type);
}

export function cloneAuthAction(action: AuthAction, update?: {app?: string}) {
  const app = update && update.app;
  switch (action.type) {
    case SET_AUTH_TOKEN:
      return new SetAuthToken(action.token, {useTimestamp: action.useTimestamp, app});
    case SET_LOGIN_REDIRECT:
      return new SetLoginRedirect(action.redirect, {app});
    case AUTHORIZATION_CODE_GRANT_BEGIN:
      return new BeginAuthorizationCodeGrant(action.request, {app});
    case AUTHORIZATION_CODE_GRANT_REDIRECT:
      return new AuthorizationCodeGrantRedirect(action.redirectUri, action.response, {app});
    case AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE:
      return new AuthorizationCodeGrantTokenExchange(action.response, {app});
    case REFRESH_TOKEN:
      return new RefreshToken({app});
    case STORE_AUTH_TOKEN:
      return new StoreAuthToken({app});
    case SET_TOKEN_PERSISTENCE_IS_ENABLED:
      return new SetTokenPersistenceIsEnabled(action.isEnabled, {app});
  }
}
