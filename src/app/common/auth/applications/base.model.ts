import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApplicationState} from '../application.state';
import {OAuth2Token} from '../oauth2-token.model';
import {first, map} from 'rxjs/operators';
import {select} from '@ngrx/store';
import {AuthApplicationConfig} from '../application.model';
import {DateTime} from '../../date/date-time.model';

export interface ApplicationBaseState {
  readonly app: string;

  readonly token?: OAuth2Token;
  readonly refreshedAt?: DateTime;
}

export abstract class ApplicationBase<Config, State extends ApplicationBaseState> {
  abstract readonly grantType: 'public' | 'password' | 'authorization_code';
  abstract readonly http: HttpClient;
  abstract readonly name: string;
  abstract readonly config: Config;
  abstract readonly state$: Observable<ApplicationState>;

  get token$(): Observable<OAuth2Token | undefined> {
    return this.state$.pipe(map(state => state.token));
  }

  /**
   * Get the authorization headers for the request, if the user is logged in.
   */
  getAuthorizeHeaders(): Observable<{[k: string]: string}> {
    return this.state$.pipe(
      select(ApplicationState.selectAccessToken),
      first(),
      map(accessToken => (accessToken ? {'authorization': `Bearer ${accessToken}`} : {}) as { [k: string]: string })
    );
  }
}
