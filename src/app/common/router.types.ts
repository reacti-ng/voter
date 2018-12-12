import {ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';


export interface RouterData {
  /**
   * Indicates whether the page is a login redirect page.
   *
   * Login pages can accept a `code` and `state` query parameters,
   * which encode an authorization token which is stored as the login
   * user access token.
   *
   * The auth guard will immediately redirect to a version of this page
   * with those query parameters removed from the query string.
   */
  readonly isLoginRedirectPage?: boolean;
}

export const RouterData = {
  fromActivatedRoute: (activatedRoute: ActivatedRoute)  => activatedRoute.data as Observable<RouterData>,
  fromActivatedRouteSnapshot: (snapshot: ActivatedRouteSnapshot) => snapshot.data as RouterData
};

