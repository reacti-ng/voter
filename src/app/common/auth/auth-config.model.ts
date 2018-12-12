import {InjectionToken} from '@angular/core';


export interface AuthServiceConfig {
  readonly authServerHref: string;
  readonly clientId: string;
  readonly requireScopes: string[];
}

export const AUTH_SERVICE_CONFIG = new InjectionToken<AuthServiceConfig>('AUTH_SERVICE_CONFIG');

