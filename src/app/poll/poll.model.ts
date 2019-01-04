import {Ballot, ballotFromJson} from '../ballot/ballot.model';
import {ModelRef, modelRefFromJson, modelRefProperty} from '../common/model/model-ref.model';
import {JsonAny, JsonObject} from '../common/json/json.model';
import {DateTime, dateTimeFromJson} from '../common/date/date-time.model';
import {Ident} from '../common/model/ident.model';
import {Proposal, proposalFromJson} from '../proposal/proposal.model';
import {fromJsonAny, fromObjectProperties} from '../common/json/decoder';


export interface Poll {
  readonly id: string;
  readonly name: string;

  readonly proposal: Proposal | string;
  readonly ballot: Ballot | string;

  readonly createAt: Date;
  readonly openAt: Date | null;
  readonly closeAt: Date | null;
  readonly countAt: Date | null;

  // Only visible in full poll details
  readonly ballotIssuerId: string | null;
}

export const pollFromJson = fromObjectProperties<Poll>({
  id:       {string: true, ifNull: 'throw'},
  name:     {string: true, ifNull: 'throw'},
  ballot:   {...modelRefProperty(ballotFromJson), ifNull: 'throw'},
  proposal: {...modelRefProperty(proposalFromJson), ifNull: 'throw'},
  createAt: {source: 'created_at', string: dateTimeFromJson, ifNull: 'throw'},
  openAt:   {source: 'open_at', string: dateTimeFromJson },
  closeAt:  {source: 'close_at', string: dateTimeFromJson },
  countAt:  {source: 'count_at', string: dateTimeFromJson },

  ballotIssuerId: {source: 'ballot_issuer_id', string: true, ifNull: null}
});
export function pollToJson(poll: Poll): JsonObject {
  return {
    id: poll.id,
    create_at: poll.createAt.toISOString(),
    open_at: poll.openAt && poll.openAt.toISOString(),
    close_at: poll.closeAt && poll.closeAt.toISOString(),
    count_at: poll.countAt && poll.countAt.toISOString()
  };
}

