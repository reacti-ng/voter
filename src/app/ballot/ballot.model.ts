import {JsonPointer} from 'json-pointer';
import {JsonObject} from '../common/json/json.model';
import {Ident} from '../common/model/ident.model';
import {fromJsonAny, fromJsonObject} from '../common/json/decoder';


export interface Ballot {
  readonly id: string;

}

export const ballotFromJson = fromJsonObject<Ballot>({
  id: {string: true, ifNull: 'throw'}
});
