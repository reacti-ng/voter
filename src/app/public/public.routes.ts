import {PublicHeaderComponent} from './header/header.component';

export const publicRoutes = [
  {
    path: 'header',
    outlet: 'header',
    component: PublicHeaderComponent
  }
];
