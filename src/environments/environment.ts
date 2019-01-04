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

      // FIXME: login page need to be supplied these more securely.
      // OK for development purposes to have them here.
      clientId: 'cbQIAngGxMs3wuoNxuXmGnB24UmUcCmXhVrvz3PM',
      clientSecret: 'qxb86oO1fGbzMkRIM00fnR3sdlX2X1TVnleVTBRCe9LPxsP6Lbu0NZDro1cz3lmYK5veTCa0o9nOiJ3h0JCyuiH9UfsdfHmFnjmH8JeXGWskQQAAgKS3KYyrIQWWOKUU',

      grantAuthCodeUrl: '/api/user/grant_auth_code/',
    },
    org: {
      type: 'authorization-code-grant' as 'authorization-code-grant',
      tokenUrl: 'http://localhost:8000/auth/token/',
      redirectUri: 'http://localhost:4200/',
      clientId: 'b8mp7QxBTe6Cm2UEufhlGrOyfGI62riREa3huGbS',
      scope: 'user org read write'
    }
  },

  features: {
    user: {
      defaultAvatarHref: '/assets/images/default-avatar.png'
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
