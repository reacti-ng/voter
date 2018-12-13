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

      clientId: 'lTE0qANNhYLsmaIY8Jjbd4ZRLy02a9BXmmNisWNo',
      clientSecret: 'J62KSUsCxHtHyEzybdMGq7VYd2zWGXFrvkRYpVyKCueKpzliwshkloBwwAzNN6HKeWqDJLpfgTfU4QiJF4HT8deZkTeqXXodPQt6e5ycYBNnT2Fv0rcLqtHyagJP1Vjw'
    },
    org: {
      type: 'authorization-code-grant' as 'authorization-code-grant',
      tokenUrl: 'http://localhost:8000/auth/token',
      stateUrl: 'http://localhost:8000/state',
      clientId: 'none-yet',
      apiUrlRegex: '^\/api\/'
    }
  }
};
