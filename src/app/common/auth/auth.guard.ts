import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';
import {RouterData} from '../router.types';
import {AuthorizationCodeGrantResponse} from './authorization-code-grant.model';
import {AuthorizationCodeGrantTokenExchange} from './auth.actions';
import {first, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {ApplicationState} from './application.state';


@Injectable()
export class IsAuthorizedGuard implements CanActivate, CanActivateChild {
  constructor(
    readonly store: Store<any>,
    readonly authService: AuthService<any>,
  ) {}

  appForRouteData(data: RouterData) {
    const authData = data['common.auth'];
    return this.authService.appForKey(authData && authData.app);
  }

  canActivate(snapshot: ActivatedRouteSnapshot) {
    const data = RouterData.fromActivatedRouteSnapshot(snapshot);
    const app = this.appForRouteData(data);
    return (app.state$ as Observable<ApplicationState>).pipe(
      first(),
      map(state => !!state.token)
    );
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(childRoute);
  }
}
