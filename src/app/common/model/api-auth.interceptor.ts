import {Inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {API_BASE_HREF} from './api-host.interceptor';
import {concatMap, flatMap, reduce} from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';
import {fromArray} from 'rxjs/internal/observable/fromArray';


@Injectable()
export class ApiAuthInterceptor implements HttpInterceptor {
  constructor(
    @Inject(API_BASE_HREF) protected readonly apiBaseHref: string,
    readonly authService: AuthService<any>
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authRequest$ = of(req);
    if (req.url.startsWith('/api') && req.headers.get('authorization') == null) {
      authRequest$ = fromArray(this.authService.appKeys).pipe(
        concatMap(appKey => this.authService.apps[appKey].getAuthorizeHeaders(req)),
        reduce((request: HttpRequest<any>, authHeaders: {[k: string]: string} | undefined) => {
          return request.clone({setHeaders: authHeaders});
        }, req)
      );
    }
    return authRequest$.pipe(flatMap((authReq) => next.handle(authReq)));
  }
}
