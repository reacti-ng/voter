import {Set} from 'immutable';
import {ParamMap} from '@angular/router';
import {Mutable, notAStringError} from '../common.types';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {JsonObject} from '../json/json.model';

/**
 * These query parameters are passed to the login component via the
 * application route.
 *
 * They will be use to generate an authorization code for original page
 */
export interface AuthorizationCodeGrantRequest {
  /**
   * After the server issues a successful resource-owner grant, exchange
   * the resource owner grant with the server for an authorization code
   * that can be matched against clientID and state.
   */
  readonly redirectUri: string;

  /** The clientId of the requesting feature area or external application */
  readonly clientId: string;

  readonly scope: Set<string>;

  // State encoded in the application. Must match the browser fingerprint of the page.
  readonly state: string;
}


export const AuthorizationCodeGrantRequest = {
  fromQueryParams: (params: ParamMap) => {
    const redirectUri = params.get('redirect_uri');
    if (typeof redirectUri !== 'string') {
      throw notAStringError('redirect_uri', redirectUri);
    }
    const clientId = params.get('client_id');
    if (typeof clientId !== 'string') {
      throw notAStringError('client_id', clientId);
    }
    const strScope = params.get('scope');
    if (typeof strScope !== 'string') {
      throw notAStringError('scope', strScope);
    }
    const scope = Set(strScope.split(' '));

    const state = params.get('state');
    if (typeof state !== 'string') {
      throw notAStringError('state', state);
    }
    return {redirectUri, clientId, scope, state} as AuthorizationCodeGrantRequest;
  },
  toHttpParams: (request: AuthorizationCodeGrantRequest) => {
    return new HttpParams({
      fromObject: {
        response_type: 'code',
        redirect_uri: request.redirectUri,
        client_id: request.clientId,
        scope: request.scope.join(' '),
        state: request.state
      }
    });
  }

};

export interface AuthorizationCodeGrantResponse {
  readonly code: string;
  readonly state: string;
}

export const AuthorizationCodeGrantResponse = {
  fromJson: (json: JsonObject) => {
    const {code, state} = json;
    if (typeof code !== 'string') {
      throw notAStringError('code', code);
    }
    if (typeof state !== 'string') {
      throw notAStringError('state', state);
    }
    return {code, state} as AuthorizationCodeGrantResponse;
  },

  fromQueryParams: (params: ParamMap) => {
    const code = params.get('code');
    if (code != null) {
      const state = params.get('state');
      if (state == null) {
        throw notAStringError('code', params);
      }
      return {code, state};
    }
    return null;
  },
  toHttpParams: (response: AuthorizationCodeGrantResponse) => {
    return new HttpParams({ fromObject: {
      ...response
      }
    });
  }
};
