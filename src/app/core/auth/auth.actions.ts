import {AuthAction, isAuthAction} from '../../common/auth/auth.actions';
import {CoreAuthState} from './auth.state';

export const SET_CURRENT_APPLICATION = 'core.auth: set current application';
export class SetCurrentApplication {
  readonly type = SET_CURRENT_APPLICATION;
  constructor(readonly app: keyof CoreAuthState) {}
}

export type CoreAuthAction = SetCurrentApplication;
export function isCoreAuthAction(obj: any): obj is CoreAuthAction {
  return !!obj && obj.type === SET_CURRENT_APPLICATION;
}
