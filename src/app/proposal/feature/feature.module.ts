import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {proposalRoutes} from '../proposal.routes';
import {StoreModule} from '@ngrx/store';
import {reduceProposalState} from '../proposal.state';
import {OrgSharedModule} from '../../org/org-shared.module';
import {ProposalCreateComponent} from './create/create.component';
import {ProposalService} from '../proposal.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(proposalRoutes),
    StoreModule.forFeature('proposal', reduceProposalState),
    OrgSharedModule
  ],
  declarations: [
    ProposalCreateComponent
  ],
  providers: [
    ProposalService
  ]
})
export class ProposalFeatureModule {}
