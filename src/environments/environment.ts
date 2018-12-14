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

      clientId: 'bnha97rsOV4HEpUPtbBwLLQSdptDPLhIEE5dnfXR',
      clientSecret: 'IErRaaFBTXj9YoksHi5EVto8MGPkjtf0zvdTBmVb8K0uEzZ1OEdkDNShrJDg2xJBHXRLiXgRuCQhbjqqPOjWdcBS1SGE9XdB41KcEtMz5nMWzYx8tVzCUxp7MPKaZEPs'
    },
    org: {
      type: 'authorization-code-grant' as 'authorization-code-grant',
      tokenUrl: 'http://localhost:8000/auth/token/',
      redirectUri: 'http://localhost:4200/',
      clientId: 'EnxDClOfU2BVV1Ze6zwM0uxcwi6l9nRX9yvfS2hB',
      apiUrlRegex: '^\/api\/',
      scope: 'user org read write edit'
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
