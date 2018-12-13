import {AuthEffects} from '../common/auth/auth.effects';
import {Oauth2TokenPersistenceEffects} from '../common/auth/oauth2-token-persistence.effects';
import {AuthorizationCodeGrantEffects} from '../common/auth/authorization-code-grant.effects';


export const coreEffects = [
  AuthEffects,
  AuthorizationCodeGrantEffects,
  Oauth2TokenPersistenceEffects
];

