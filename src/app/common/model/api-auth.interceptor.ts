import {Inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {AuthService} from '../auth/auth.service';
import {request} from 'https';
import {AUTH_STATE_SELECTOR, AuthState} from '../auth/auth.state';
import {createSelector, select, Selector, Store} from '@ngrx/store';
import {API_BASE_HREF} from './api-host.interceptor';
import {concatMap, first, flatMap, map, switchMap} from 'rxjs/operators';


@Injectable()
export class ApiAuthInterceptor implements HttpInterceptor {
  constructor(
    @Inject(API_BASE_HREF) protected readonly apiBaseHref: string,
    protected readonly store: Store<object>,
    @Inject(AUTH_STATE_SELECTOR) protected readonly authStateSelector: Selector<object, AuthState>
  ) {}

  readonly accessToken$: Observable<string | undefined> = this.store.pipe(
    select(createSelector(this.authStateSelector, AuthState.selectAccessToken))
  );


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authRequest$ = of(req);
    if (req.url.startsWith('/api') || req.url.startsWith(this.apiBaseHref)) {
      authRequest$ = this.accessToken$.pipe(
        first(),
        map(accessToken => req.clone({
            setHeaders: {'Authorization': `Bearer ${accessToken}`}
        }))
      );
    }
    return authRequest$.pipe(flatMap((authReq) => next.handle(authReq)));
  }

}
