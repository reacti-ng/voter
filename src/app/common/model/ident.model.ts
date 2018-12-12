import {JsonObject} from '../json/json.model';

export interface Ident {
  readonly id: string;
}

export const Ident = {
  fromJson: (object: JsonObject) => {
    if (typeof object.id !== 'string') {
      throw new Error(`Json identifiable object has no \'id\' (got: ${object})`);
    }
    return {id: object.id};
  }
};
