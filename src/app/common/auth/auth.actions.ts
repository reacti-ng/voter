import {OAuth2Token} from './oauth2-token.model';
import {Set} from 'immutable';
import {AuthorizationCodeGrantRequest, AuthorizationCodeGrantResponse} from './authorization-code-grant.model';
export const SET_AUTH_TOKEN = 'common.core: set core token';
export class SetAuthToken {
  readonly type = SET_AUTH_TOKEN;
  constructor(readonly token?: OAuth2Token, readonly useTimestamp?: Date) {}
}

export const SET_LOGIN_REDIRECT = 'common.auth: set login redirect';
export class SetLoginRedirect {
  readonly type = SET_LOGIN_REDIRECT;
  constructor(readonly redirectTo: string[]) {}
}

// Redirect to the login page, attaching AuthorizationCodeGrantParams to the
// query parameters of the request.
export const BEGIN_AUTHORIZATION_CODE_GRANT = 'common.auth: begin login';
export class BeginAuthorizationCodeGrant {
  readonly type = BEGIN_AUTHORIZATION_CODE_GRANT;
  constructor(readonly request: AuthorizationCodeGrantRequest) {}
}

// Redirect back to the redirect_uri, passing code and state parameters
export const FINALIZE_AUTHRORIZATION_CODE_GRANT = 'common.auth: finalize authorization code grant';
export class FinalizeAuthorizationCodeGrant {
  readonly type = FINALIZE_AUTHRORIZATION_CODE_GRANT;
  constructor(readonly redirectUri: string, readonly response: AuthorizationCodeGrantResponse) {}
}

export const REFRESH_TOKEN = 'common.auth: begin refresh token';
export class RefreshToken {
  readonly type = REFRESH_TOKEN;
  constructor() {}
}

export const STORE_AUTH_TOKEN = 'common.auth: store access token';
export class StoreAuthToken {
  readonly type = STORE_AUTH_TOKEN;
  constructor() {}
}

export const SET_TOKEN_PERSISTENCE_IS_ENABLED = 'common.auth: set token persistence is enabled';
export class SetTokenPersistenceIsEnabled {
  readonly type = SET_TOKEN_PERSISTENCE_IS_ENABLED;
  constructor(readonly isEnabled: boolean) {}
}

export type AuthAction
  = SetAuthToken
  | SetLoginRedirect
  | BeginAuthorizationCodeGrant
  | FinalizeAuthorizationCodeGrant
  | RefreshToken
  | StoreAuthToken
  | SetTokenPersistenceIsEnabled;

export function isAuthAction(obj: any): obj is AuthAction {
  return !!obj && [
    SET_AUTH_TOKEN,
    SET_LOGIN_REDIRECT,
    BEGIN_AUTHORIZATION_CODE_GRANT,
    FINALIZE_AUTHRORIZATION_CODE_GRANT,
    REFRESH_TOKEN,
    STORE_AUTH_TOKEN,
    SET_TOKEN_PERSISTENCE_IS_ENABLED
  ].includes(obj.type);
}
