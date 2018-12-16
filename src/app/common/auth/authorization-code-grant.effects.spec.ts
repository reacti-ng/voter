import {RouterTestingModule} from '@angular/router/testing';
import {TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {DOCUMENT} from '@angular/common';
import {AuthorizationCodeGrantEffects} from './authorization-code-grant.effects';
import {Action, StoreModule} from '@ngrx/store';
import {TestScheduler} from 'rxjs/testing';
import {Actions, EffectsModule} from '@ngrx/effects';
import {BehaviorSubject, Observable, of, Subject, timer} from 'rxjs';
import {provideMockActions} from '@ngrx/effects/testing';
import {
  AuthorizationCodeGrantRedirect,
  AuthorizationCodeGrantTokenExchange,
  BeginAuthorizationCodeGrant, SetAuthToken,
  SetLoginRedirect
} from './auth.actions';
import {Set} from 'immutable';
import {first, map, tap, toArray} from 'rxjs/operators';
import {AuthState} from './auth.state';
import {reduceAuthState} from '../../core/auth/auth.state';
import {HttpParams} from '@angular/common/http';
import {AuthApplication} from './application.model';
import {AuthorizationCodeGrantResponse} from './authorization-code-grant.model';
import {OAuth2Token} from './oauth2-token.model';

class MockAuthService {
  appForKey(key: any): any {}
}

class MockLocalStorage {
  constructor(readonly storage: {[k: string]: string | null} = {}) {}
  getItem(key: string) { return this.storage[key] || null; }
  setItem(key: string, value: string) {
    this.storage[key] = value;
  }
}

class MockLocation {

  constructor(
  private _href: string
  ) {}

  get href() { return this._href; }
  set href(value: string) { this._href = value; }
}


describe('authorization-code-grant.effects', () => {
  describe('AuthorizationCodeGrantEffects', () => {
    let actionSubject: Subject<Action>;
    let authService: AuthService<any>;
    let effects: AuthorizationCodeGrantEffects;

    let _window: Window;

    beforeEach(() => {
      actionSubject = new Subject();

      _window = {
        localStorage: new MockLocalStorage(),
        location: new MockLocation('http://current.url')
      } as any;

      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([]),
        ],
        providers: [
          {provide: AuthService, useClass: MockAuthService},
          {provide: DOCUMENT, useValue: {defaultView: _window}},
          provideMockActions(actionSubject),
          AuthorizationCodeGrantEffects
        ]
      });

      authService = TestBed.get(AuthService);
      effects = TestBed.get(AuthorizationCodeGrantEffects);
    });

    afterEach(() => {
      actionSubject.complete();
    });

    function spyOnAuthServiceGetApp(app: AuthApplication): jasmine.Spy {
      return spyOn(authService, 'appForKey').and.returnValue(app);
    }

    function expectUrl(url: string, expectUrl: string, options?: { params: HttpParams }): void {
      const [actualUrl, query] = url.split('?', 2);
      const actualParams = query && new HttpParams({fromString: query}) || undefined;

      expect(actualUrl).toEqual(expectUrl);
      if (options && options.params === undefined) {
        expect(actualParams).toEqual(undefined);
      } else {
        expect(actualParams).toEqual(options && options.params);
      }
    }

    it('should redirect when beginning the code flow', async (done: DoneFn) => {
      const actions$ = effects.beginAuthorizationCodeGrantFlow$.pipe(toArray()).toPromise();
      const appForKeySpy = spyOnAuthServiceGetApp({
        type: 'authorization-code-grant',
        loginRedirect$: of(['a', 'b', 'c']),
        name: 'appkey'
      } as AuthApplication);

      actionSubject.next(new BeginAuthorizationCodeGrant({
        redirectUri: 'http://redirect.me/',
        clientId: 'CLIENT_ID',
        scope: Set.of('the', 'scopes'),
        state: 'of the union'
      }, {app: 'test-app'}));
      actionSubject.complete();

      const actions = await actions$;
      expect(actions).toEqual([], 'should not emit actions');

      expect(appForKeySpy).toHaveBeenCalledWith('test-app');
      expect(appForKeySpy).toHaveBeenCalledTimes(1);

      expectUrl(_window.location.href, '/login', {
        params: new HttpParams({
          fromObject: {
            response_type: 'code',
            redirect_uri: 'http://redirect.me/',
            client_id: 'CLIENT_ID',
            scope: 'the scopes',
            state: 'of the union'
          }
        })
      });
      done();
    });

    it('should store the current `loginRedirect` value from the application state when beginning flow', async (done: DoneFn) => {
      expect(_window.localStorage.getItem('common.auth::appkey::loginRedirect')).toEqual(null);
      const appForKeySpy = spyOnAuthServiceGetApp({
        type: 'authorization-code-grant',
        loginRedirect$: of(['a', 'b', 'c']),
        name: 'appkey'
      } as AuthApplication);

      const actions$ = effects.beginAuthorizationCodeGrantFlow$.pipe(toArray()).toPromise();
      actionSubject.next(new BeginAuthorizationCodeGrant({
        redirectUri: 'http://redirect.me/',
        clientId: 'CLIENT_ID',
        scope: Set.of('the', 'scopes'),
        state: 'of the union'
      }, {app: 'test-app'}));
      actionSubject.complete();
      await actions$;
      expect(_window.localStorage.getItem('common.auth::appkey::loginRedirect')).toEqual('["a","b","c"]');
      done();
    });

    it('should redirect back to the callback url', async (done: DoneFn) => {
      const actions$ = effects.authorizationCodeFlowRedirect$.pipe(toArray()).toPromise();

      const appForKeySpy = spyOnAuthServiceGetApp({} as any);

      actionSubject.next(new AuthorizationCodeGrantRedirect('http://redirect.me/', {
        code: 'pad',
        state: 'of the union'
      }, {app: 'test-app'}));
      actionSubject.complete();

      const actions = await actions$;
      expect(actions).toEqual([], 'should not dispatch actions');

      expect(appForKeySpy).toHaveBeenCalledTimes(0);

      expectUrl(_window.location.href, 'http://redirect.me/', {
        params: new HttpParams({
          fromObject: { code: 'pad', state: 'of the union' }
        })
      });
      done();
    });

    it('should exchange the code and state for an access grant', async (done: DoneFn) => {
      const _token: OAuth2Token = {'__id__': 'OAuth2Token'} as any;

      const action$ = effects.authorizationCodeFlowTokenExchange$.pipe(toArray()).toPromise();
      const appForKeySpy = spyOnAuthServiceGetApp({
        type: 'authorization-code-grant',
        name: 'appkey',
        loginRedirect$: of(['/public']),
        authFlowState$: of({authCodeGrantInProgress: undefined}),

        exchangeAuthCodeForToken: function (response: AuthorizationCodeGrantResponse) {
          expect(response.code).toEqual('secret');
          expect(response.state).toEqual('stateful');
          return of(_token);
        }
      } as any);

      actionSubject.next(new AuthorizationCodeGrantTokenExchange({code: 'secret', state: 'stateful'}, {app: 'appkey'}));
      actionSubject.complete();

      expect(appForKeySpy).toHaveBeenCalledWith('appkey');
      const actions = await action$;

      expect(actions).toEqual([
        jasmine.any(SetLoginRedirect) as any,
        new SetAuthToken(_token, {app: 'appkey'}),
      ]);
      done();
    });

    it('should restore the saved loginRedirect$ from the state', async (done: DoneFn) => {

      _window.localStorage.setItem('common.auth::appkey::loginRedirect', '["/path","to","restore"]');

      const action$ = effects.authorizationCodeFlowTokenExchange$.pipe(toArray()).toPromise();
      spyOnAuthServiceGetApp({
        type: 'authorization-code-grant',
        name: 'appkey',
        loginRedirect$: of(['/public']),
        authFlowState$: of({authCodeGrantInProgress: undefined}),
        exchangeAuthCodeForToken: function () {
          return of(undefined);
        }
      } as any);

      actionSubject.next(new AuthorizationCodeGrantTokenExchange({code: 'secret', state: 'stateful'}, {app: 'appkey'}));
      actionSubject.complete();

      const actions = await action$;

      expect(actions).toEqual([
        new SetLoginRedirect(['/path', 'to', 'restore'], {app: 'appkey'}),
        jasmine.any(SetAuthToken) as any
      ]);
      done();
    });

    it('should not exchange the token until the current authGrantResponse has been removed ', async (done: DoneFn) => {
      const progressSubject = new BehaviorSubject<any>({});

      const actions: any[] = [];
      const action$ = effects.authorizationCodeFlowTokenExchange$.pipe(
        tap(dispatched => actions.push(dispatched))
      ).toPromise();
      spyOnAuthServiceGetApp({
        type: 'authorization-code-grant',
        name: 'appkey',
        loginRedirect$: of(['/public']),
        authFlowState$: progressSubject.pipe(
          map(progress => ({authCodeGrantInProgress: progress}))
        ),
        exchangeAuthCodeForToken: function () {
          return of(undefined);
        }
      } as any);

      actionSubject.next(new AuthorizationCodeGrantTokenExchange({code: 'secret', state: 'stateful'}, {app: 'appkey'}));

      // Should only emit the login redirect action until the auth code flow progress has been cleared
      expect(actions).toEqual([jasmine.any(SetLoginRedirect)]);
      progressSubject.next(undefined);

      expect(actions).toEqual([jasmine.any(SetLoginRedirect), jasmine.any(SetAuthToken)]);

      actionSubject.complete();
      progressSubject.complete();
      done();
    });
  });
});
