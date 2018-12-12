import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';


export const API_BASE_HREF = new InjectionToken<string>('API_BASE_HREF');

@Injectable()
export class ApiHostInterceptor implements HttpInterceptor {
  constructor(
    @Inject(API_BASE_HREF) protected readonly apiBaseHref: string
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/api')) {
      req = req.clone({
        url: [this.apiBaseHref, req.url].join('')
      });
    }
    return next.handle(req);
  }
}

