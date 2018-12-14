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

      // FIXME: login page need to be supplied these more securely.
      // OK for development purposes to have them here.
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
