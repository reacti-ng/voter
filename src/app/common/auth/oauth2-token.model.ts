/**
 * A CommonAuthUser
 */
import {Set} from 'immutable';
import {isNumber, isString, notAStringError} from '../common.types';
import {JsonObject} from '../json/json.model';


export interface OAuth2Token {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly refreshToken: string;
  readonly scope: Set<string>;
}

function oauth2TokenFromJson(json: JsonObject): OAuth2Token {
  return JsonObject.fromJson<OAuth2Token>({
    tokenType: () => 'Bearer',
    accessToken: ({access_token}) => {
      if (typeof access_token !== 'string') {
        throw notAStringError('access_token', access_token);
      }
      return access_token;
    },
    expiresIn: ({expires_in}) => {
      if (!isNumber(expires_in)) {
        throw new Error(`Expected expires_in to be a number`);
      }
      return expires_in;
    },
    refreshToken: ({refresh_token}) => {
      if (!isString(refresh_token)) {
        throw new Error(`Expected refresh_token to be a string`);
      }
      return refresh_token;
    },
    scope: ({scope}) => {
      if (!isString(scope)) {
        throw new Error(`Expected scope to be a string`);
      }
      return Set(scope.split(' '));
    }
  }, json);
}

export const OAuth2Token = {
  toJson: function (token: OAuth2Token) {
    return {
      token_type: 'Bearer',
      access_token: token.accessToken,
      expires_in: token.expiresIn,
      refresh_token: token.refreshToken,
      scope: token.scope.join(' ')
    };
  },
  fromJson: oauth2TokenFromJson
};
