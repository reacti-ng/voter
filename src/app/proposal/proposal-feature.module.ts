import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {ProposalCreateComponent} from './create/create.component';
import {reduceProposalState} from './proposal.state';
import {ProposalService} from './proposal.service';
import {OrgSharedModule} from '../org/org-shared.module';
import {RouterModule} from '@angular/router';
import {proposalRoutes} from './proposal.routes';
import {ReactiveFormsModule} from '@angular/forms';

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
