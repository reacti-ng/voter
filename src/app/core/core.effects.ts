import {AuthEffects} from '../common/auth/auth.effects';
import {Oauth2TokenPersistenceEffects} from '../common/auth/oauth2-token-persistence.effects';


export const coreEffects = [
  AuthEffects,
  Oauth2TokenPersistenceEffects
];

