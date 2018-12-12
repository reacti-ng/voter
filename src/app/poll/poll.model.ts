import {Ballot} from '../ballot/ballot.model';
import {ModelRef} from '../common/model/model-ref.model';
import {JsonAny, JsonObject} from '../common/json/json.model';
import {DateTime} from '../common/date/date-time.model';
import {Ident} from '../common/model/ident.model';


export interface Poll {
  readonly id: string;

  readonly ballot: ModelRef<Ballot>;

  readonly createAt: Date;
  readonly openAt: Date;
  readonly closeAt: Date;
  readonly countAt: Date;

  // Only visible in full poll details
  readonly ballotIssuerId?: string;

}

export const Poll = {
  fromJson: (json: JsonObject) => JsonObject.fromJson<Poll>({
    id: () => Ident.fromJson(json).id,
    createAt: ({create_at}) => {
      if (typeof create_at !== 'string') {
        throw new Error('JSON has no date-like \'created_at\'');
      }
      return DateTime.fromJson(create_at);
    },
    ballot: ({ballot}) => ModelRef.fromJson(Ballot.fromJson, ballot as JsonAny),
    openAt: ({open_at}) => {
      if (typeof open_at !== 'string') {
        throw new Error('JSON has no date-like \'open_at\'');
      }
      return DateTime.fromJson(open_at);
    },
    closeAt: ({close_at}) => {
      if (typeof close_at !== 'string') {
        throw new Error('JSON has no date-like \'close_at\'');
      }
      return DateTime.fromJson(close_at);
    },
    countAt: ({count_at}) => {
      if (typeof count_at !== 'string') {
        throw new Error('JSON has no date-like \'count_at\'');
      }
      return DateTime.fromJson(count_at);
    }
  }, json),
  toJson: function(poll: Poll): JsonObject {
    return {
      id: poll.id,
      create_at: poll.createAt.toISOString(),
      open_at: poll.openAt.toISOString(),
      close_at: poll.closeAt.toISOString(),
      count_at: poll.countAt.toISOString()
    };
  }
};

