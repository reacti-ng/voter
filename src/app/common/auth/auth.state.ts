import {ApplicationState} from './application.state';
import {InjectionToken} from '@angular/core';

export type AuthState<Apps> = Record<Extract<keyof Apps, string>, ApplicationState>;
export const AUTH_STATE_SELECTOR = new InjectionToken<AuthState<any>>('AUTH_STATE_SELECTOR');




