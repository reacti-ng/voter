import {Set} from 'immutable';
import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient, HttpParams} from '@angular/common/http';
import {
  AuthorizationCodeGrantApplication,
  AuthorizationCodeGrantApplicationConfig,
  PublicGrantApplication,
  ResourceOwnerPasswordGrantApplication,
  ResourceOwnerPasswordGrantApplicationConfig
} from './application.model';
import {BehaviorSubject, Subject} from 'rxjs';
import {ApplicationState, AuthorizationCodeGrantState} from './application.state';


describe('application.model', () => {
  let testController: HttpTestingController;
  let httpClient: HttpClient;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    httpClient = TestBed.get(HttpClient);
    testController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    testController.verify();
  });

  describe('PublicGrantApplication', () => {
    let publicApp: PublicGrantApplication;
    beforeEach(() => {
      publicApp = new PublicGrantApplication(httpClient, 'public-app');
    });

    it('should authorize an application', async (done: DoneFn) => {
      function authorize() {
        return publicApp.getAuthorizeHeaders().toPromise();
      }

      const headers = await authorize();
      expect(headers).toEqual({}, 'not authorized');
      done();
    });
  });

  describe('ResourceOwnerGrantApplication', () => {
    let stateSubject: Subject<ApplicationState>;
    let resourceApp: ResourceOwnerPasswordGrantApplication;

    beforeEach(() => {
      const config: ResourceOwnerPasswordGrantApplicationConfig = {
        type: 'password' as 'password',
        tokenUrl: '/auth/token',
        clientId: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET',
        grantAuthCodeUrl: '/giff-auth-token-plz'
      };
      stateSubject = new BehaviorSubject<ApplicationState>(ApplicationState.initial('resource-app'));
      resourceApp = new ResourceOwnerPasswordGrantApplication(httpClient, 'resource-app', config, stateSubject);
    });

    afterEach(() => {
      stateSubject.complete();
    });

    it('should authorize an application', async (done) => {
      function authorize() {
        return resourceApp.getAuthorizeHeaders().toPromise();
      }

      const headers_one = await authorize();
      expect(headers_one).toEqual({}, 'no authorization token');

      stateSubject.next({token: {accessToken: 'abcdef12345'} } as any);
      const headers_two = await resourceApp.getAuthorizeHeaders().toPromise();
      expect(headers_two).toEqual({'authorization': 'Bearer abcdef12345'});

      done();
    });

    it('should complete a successful resource owner grant request', async (done: DoneFn) => {
      (resourceApp as any).config = {
        type: 'password',
        tokenUrl: '/auth/token',
        clientId: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET'
      };
      const oauthToken$ = resourceApp.requestGrant({username: 'username', password: 'password'}).toPromise();

      const req = testController.expectOne('/auth/token');
      try {
        expect(req.request.method).toEqual('POST');

        const body = new HttpParams({fromString: req.request.body});
        expect(body.get('grant_type')).toEqual('password');
        expect(body.get('username')).toEqual('username');
        expect(body.get('password')).toEqual('password');

        expect(req.request.headers.get('content-type')).toEqual('application/x-www-form-urlencoded');
        expect(req.request.headers.get('authorization')).toEqual('Basic ' + btoa('CLIENT_ID:CLIENT_SECRET'));
      } catch (e) {
        done.fail(e);
      }
      req.flush({
        token_type: 'bearer',
        access_token: 'abcdef12345',
        expires_in: 3600,
        refresh_token: 'refreshme',
        scope: 'read write'
      });

      const oauthToken = await oauthToken$;
      expect(oauthToken && oauthToken.accessToken).toEqual('abcdef12345');
      expect(oauthToken && oauthToken.expiresIn).toEqual(3600);
      expect(oauthToken && oauthToken.refreshToken).toEqual('refreshme');
      expect(oauthToken && oauthToken.scope).toEqual(Set.of('read', 'write'));
      done();
    });

    it('should return undefined on 401 unauthorized', async (done: DoneFn) => {

      const oauthToken$ = resourceApp.requestGrant({username: 'username', password: 'incorrect'}).toPromise();

      const req = testController.expectOne('/auth/token');
      req.error({message: 'test'} as any, {status: 401});

      const oauthToken = await oauthToken$;
      expect(oauthToken).toBeUndefined();
      done();
    });

    it('should be able to request that an authorization code be issued for the user', async (done: DoneFn) => {
      stateSubject.next({token: { accessToken: 'access'} } as any);
      const response$ = resourceApp.requestAuthorizationCodeForClientId({
        redirectUri: 'http://redirect-to.me/',
        clientId: 'CLIENT_ID',
        scope: Set.of('some', 'stuff'),
        state: 'stateful'
      }).toPromise();
      try {
        const req = testController.expectOne('/giff-auth-token-plz');
        expect(req.request.method).toEqual('POST');
        expect(req.request.headers.get('content-type')).toEqual('application/x-www-form-urlencoded');
        expect(req.request.headers.get('authorization')).toEqual('Bearer access');

        const body = req.request.body as HttpParams;
        expect(body.get('response_type')).toEqual('code');
        expect(body.get('redirect_uri')).toEqual('http://redirect-to.me/');
        expect(body.get('client_id')).toEqual('CLIENT_ID');
        expect(body.get('scope')).toEqual('some stuff');
        expect(body.get('state')).toEqual('stateful');

        req.flush({
          code: 'authorize_me',
          state: 'stateful'
        });
      } catch (e) {
        done.fail(e);
      }

      const response = await response$;
      expect(response.code).toEqual('authorize_me');
      expect(response.state).toEqual('stateful');
      done();
    });

  });

  describe('AuthorizationCodeGrantApplication', () => {
    let stateSubject: BehaviorSubject<ApplicationState & AuthorizationCodeGrantState>;
    let authApp: AuthorizationCodeGrantApplication;

    beforeEach(() => {
      const config: AuthorizationCodeGrantApplicationConfig = {
        type: 'authorization-code-grant' as 'authorization-code-grant',
        tokenUrl: '/auth/token',
        redirectUri: 'http://malicious.url',
        clientId: 'CLIENT_ID',
        scope: 'peter piper picked a peck of pickled peppers'
      };

      stateSubject = new BehaviorSubject(ApplicationState.initial('auth-app'));
      authApp = new AuthorizationCodeGrantApplication(httpClient, 'auth-app', config, stateSubject);
    });

    afterEach(() => {
      stateSubject.complete();
    });

    it('should authorize an application', async (done) => {
      (authApp.config as any).apiUrlRegex = '^/api/resource';

      function authorize() {
        return authApp.getAuthorizeHeaders().toPromise();
      }

      const headers_one = await authorize();
      expect(headers_one).toEqual({}, 'no authorization token');

      stateSubject.next({token: {accessToken: 'abcdef12345'}} as any);
      const headers_two = await authorize();
      expect(headers_two).toEqual({'authorization': 'Bearer abcdef12345'});
      done();
    });

    it('should be possible to exchange an authorization code for an access token', async (done: DoneFn) => {
      const grant$ = authApp.exchangeAuthCodeForToken({code: 'tiddly', state: 'winks'}).toPromise();

      try {
        const req = testController.expectOne('/auth/token');
        expect(req.request.method).toEqual('POST');
        const body: HttpParams = req.request.body;
        expect(body.get('code')).toEqual('tiddly');
        expect(body.get('state')).toEqual('winks');

        req.flush({
          token_type: 'bearer',
          access_token: 'server-access',
          expires_in: 25123,
          refresh_token: 'refreshme',
          scope: 'access stuff'
        });
      } catch (err) {
        done.fail(err);
      }

      const grant = await grant$;
      expect(grant).toEqual({
        tokenType: 'Bearer',
        accessToken: 'server-access',
        expiresIn: 25123,
        refreshToken: 'refreshme',
        scope: Set.of('access', 'stuff')
      });
      done();
    });
  });
});
