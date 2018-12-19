import {ApplicationBaseState} from './base.model';
import {AuthorizationCodeGrantApplicationConfig} from '../application.model';
import {AUTHORIZATION_CODE_GRANT_TOKEN_EXCHANGE} from '../auth.actions';

export type AuthorizationCodeFlowStep = 'begin'
                                      | 'store_redirect_commands'
                                      | 'issue_request'
                                      | 'navigate_to_login_app'
                                      | 'issuing-grant'
                                      | 'handle-response-redirect'
                                      | 'exchange_tokens'
                                      | 'navigate_to_redirect'
                                      | 'end';

export const BEGIN_FLOW                 = 'common.auth: authorization code grant flow: begin';
export const STORE_REDIRECT_COMMANDS    = 'common.auth: authorization code grant flow: save redirect commands';
export const NAVIGATE_TO_LOGIN_APP      = 'common.auth: authorization code grant flow: navigate to login app';
export const REQUEST_GRANT_CODE         = 'common.auth: authorization code grant flow: request grant code';
export const ISSUE_GRANT_CODE           = 'common.auth: authorization code grant flow: issue grant code';
export const HANDLE_LOGIN_REDIRECT      = 'common.auth: authorization code grant flow: handle login redirect';
export const LOAD_REDIRECT_COMMANDS     = 'common.auth: authorization code grant flow: load redirect commands';
export const EXCHANGE_CODE_FOR_TOKEN    = 'common.auth: authorization code grant flow: exchange code for token';
export const NAVIGATE_REDIRECT_COMMANDS = 'common.auth: authorization code grant flow: navigate redirect commands';
export const END_FLOW                   = 'common.auth: authorization code grant flow: end';

export class Begin {
  readonly type = BEGIN_FLOW;
  constructor(readonly options?: {app?: string}) {}
}

export class StoreRedirectCommands {
  readonly type = STORE_REDIRECT_COMMANDS;
  constructor(readonly app: string, readonly redirectCommands: any[]) {}
}
export class NavigateToLoginApp {
  readonly type = NAVIGATE_TO_LOGIN_APP;

  // The app to use as the login app. Must be loaded by auth
  constructor(
    readonly app: string,
    readonly loginApp: string,
  ) {}
}
export class RequestGrantCode {
  readonly type = REQUEST_GRANT_CODE;
  // The application that is logged into while issuing the app
  constructor(
    readonly app: string,
    readonly loginApp: string
  ) {}
}
export class IssueGrantCode {
  readonly type = ISSUE_GRANT_CODE;
  constructor(
    readonly app: string,
    readonly code: string,
    readonly state: string,
  ) {}
}
export class HandleLoginRedirect {
  readonly type = HANDLE_LOGIN_REDIRECT;
  constructor(
    readonly app: string,
    readonly code: string,
    readonly state: string
  ) {}
}
export class LoadRedirectCommands {
  readonly type = LOAD_REDIRECT_COMMANDS;
  constructor(readonly app: string) {}
}
export class ExchangeCodeForAuthToken {
  readonly type = EXCHANGE_CODE_FOR_TOKEN;
  constructor(readonly app: string) {}
}

export class NavigateRedirectCommands {
  readonly type = NAVIGATE_REDIRECT_COMMANDS;
  constructor(readonly app: string) {}
}

export class EndFlow {
  readonly type = END_FLOW;
  constructor(readonly app: string) {}
}



export interface AuthorizationCodeGrantState {
  readonly navigateAfterGrant: any[];

  readonly flowStep: AuthorizationCodeFlowStep | undefined;
  readonly flowData: object;
}
