/**
 * A CommonAuthUser
 */
import {Set} from 'immutable';
import {fromJsonAny, fromJsonObject} from '../json/decoder';


export interface OAuth2Token {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly refreshToken: string;
  readonly scope: Set<string>;
}

export const oauth2TokenFromJson = fromJsonObject<OAuth2Token>({
    tokenType: {value: 'Bearer'},
    accessToken: {source: 'access_token', string: true, ifNull: 'throw'},
    expiresIn: {source: 'expires_in', number: true, ifNull: 'throw'},
    refreshToken: {source: 'refresh_token', string: true, ifNull: 'throw'},
    scope: { string: (rawScope: string) => Set(rawScope.split(' ')), ifNull: 'throw'}
});

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
