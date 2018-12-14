/* tslint:disable: max-line-length */

export const environment = {
  production: true,

  appBaseHref: 'http://localhost:4200',
  apiBaseHref: 'http://localhost:8000',

  authDefaultAppId: 'org',
  authConfigs: {
    login: {
      type: 'password' as 'password' /* lol type system */,
      tokenUrl: 'http://localhost:8000/auth/token/',

      clientId: '{{login_client_id}}',
      clientSecret: '{{login_password}}'
    },
    org: {
      type: 'authorization-code-grant' as 'authorization-code-grant',
      tokenUrl: 'http://localhost:8000/auth/token',
      redirectUri: 'http://localhost:4200/',
      stateUrl: 'http://localhost:8000/state',
      clientId: '{{org_client_id}}',
      apiUrlRegex: '^\/api\/'
    }
  }
};
