/* tslint:disable: max-line-length */

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list-item of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appBaseHref: 'http://localhost:4200',
  apiBaseHref: 'http://localhost:8000',

  authDefaultAppId: 'org',
  authConfigs: {
    login: {
      type: 'password' as 'password' /* lol type system */,
      tokenUrl: 'http://localhost:8000/auth/token/',

      clientId: 'lTE0qANNhYLsmaIY8Jjbd4ZRLy02a9BXmmNisWNo',
      clientSecret: 'J62KSUsCxHtHyEzybdMGq7VYd2zWGXFrvkRYpVyKCueKpzliwshkloBwwAzNN6HKeWqDJLpfgTfU4QiJF4HT8deZkTeqXXodPQt6e5ycYBNnT2Fv0rcLqtHyagJP1Vjw'
    },
    org: {
      type: 'authorization-code-grant' as 'authorization-code-grant',
      tokenUrl: 'http://localhost:8000/auth/token',
      stateUrl: 'http://localhost:8000/state',
      clientId: 'none-yet',
      apiUrlRegex: '^\/api\/',
      scope: 'user:view'
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
