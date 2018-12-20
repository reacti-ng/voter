import {Set} from 'immutable';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {select, Store} from '@ngrx/store';
import {Proposal, ProposalCreateRequest, proposalFromJson} from './proposal.model';
import {AddManyProposals, AddProposal} from './proposal.actions';
import {ProposalState} from './proposal.state';
import {CoreState} from '../core/core.state';
import {ModelService} from '../common/model/model.service';
import {Observable} from 'rxjs';
import {PaginatedResponseFactory} from '../common/pagination/pagination.service';
import {singleResponseFromJson} from '../common/model/http-response.model';

@Injectable()
export class ProposalService extends ModelService<Proposal> {

  readonly path = '/api/proposal';
  protected readonly fromJson = proposalFromJson;
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
      singleResponseFromJson(this.fromJson)
    );
  }

  protected addEntity(entity: Proposal): void {
    this.store.dispatch(new AddProposal(entity));
  }

  protected addManyEntities(entities: Set<Proposal>): void {
    this.store.dispatch(new AddManyProposals(entities));
  }

}
