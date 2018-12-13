import {ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';


export interface RouterData {
  'common.auth'?: {
    readonly app?: string
  };
}

export const RouterData = {
  fromActivatedRoute: (activatedRoute: ActivatedRoute)  => activatedRoute.data as Observable<RouterData>,
  fromActivatedRouteSnapshot: (snapshot: ActivatedRouteSnapshot) => snapshot.data as RouterData
};

