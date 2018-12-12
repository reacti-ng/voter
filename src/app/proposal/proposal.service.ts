import {Set} from 'immutable';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {Proposal, ProposalCreateRequest} from './proposal.model';
import {AddManyProposals, AddProposal} from './proposal.actions';
import {ProposalState} from './proposal.state';
import {CoreState} from '../core/core.state';
import {ModelService} from '../common/model/model.service';
import {Observable} from 'rxjs';
import {fromJson} from '../common/json/from-json.operator';
import {PaginatedResponseFactory} from '../common/model/pagination.service';

@Injectable()
export class ProposalService extends ModelService<Proposal> {

  readonly path = '/api/proposal';
  protected readonly fromJson = Proposal.fromJson;
  protected readonly entityState$ = this.store.pipe(
    select(ProposalState.fromRoot)
  );

  constructor(
    readonly http: HttpClient,
    readonly pagination: PaginatedResponseFactory<Proposal>,
    readonly store: Store<CoreState & object>
  ) {
    super(http, pagination);
  }

  create(create: ProposalCreateRequest): Observable<Proposal> {
    return this.http.post(this.path, ProposalCreateRequest.toJson(create)).pipe(
      fromJson({ ifObj: (json) => Proposal.fromJson(json) })
    );
  }

  protected addEntity(entity: Proposal): void {
    this.store.dispatch(new AddProposal(entity));
  }

  protected addManyEntities(entities: Set<Proposal>): void {
    this.store.dispatch(new AddManyProposals(entities));
  }

}
