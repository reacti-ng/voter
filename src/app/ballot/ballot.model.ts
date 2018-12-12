import {JsonObject} from '../common/json/json.model';
import {Ident} from '../common/model/ident.model';


export interface Ballot {
  readonly id: string;

}

export const Ballot = {
  fromJson: function (json: JsonObject): Ballot {
    return JsonObject.fromJson({
      id: () => Ident.fromJson(json).id
    }, json);
  }
}
