import {JsonObject} from '../common/json/json.model';


export interface Org {
  readonly id: string;
  // Human readable name for the organisation
  readonly name: string;
}

export const Org = {
  fromJson: (json: JsonObject) => {
    throw new Error('Not implemented');
  },
  toJson: (json: JsonObject) => {
    throw new Error('not implemented');
  }
};
