import {OAuth2Token} from './oauth2-token.model';
import {Set} from 'immutable';



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

export const BEGIN_LOGIN = 'common.auth: begin login';
export class BeginLogin {
  readonly type = BEGIN_LOGIN;
  constructor() {}
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
  | BeginLogin
  | RefreshToken
  | StoreAuthToken
  | SetTokenPersistenceIsEnabled;

export function isAuthAction(obj: any): obj is AuthAction {
  return !!obj && [
    SET_AUTH_TOKEN,
    SET_LOGIN_REDIRECT,
    BEGIN_LOGIN,
    REFRESH_TOKEN,
    STORE_AUTH_TOKEN,
    SET_TOKEN_PERSISTENCE_IS_ENABLED
  ].includes(obj.type);
}
