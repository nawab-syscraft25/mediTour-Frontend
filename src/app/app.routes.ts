import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
  },
  {
    path: 'treatments',
    loadComponent: () => import('./pages/treatments/treatments').then(m => m.Treatments)
  },
  {
    path: 'treatments/:slug',
    loadComponent: () => import('./pages/treatments/treatments').then(m => m.Treatments)
  },
  {
    path: 'associate-hospital',
    loadComponent: () => import('./pages/associate-hospital/associate-hospital').then(m => m.AssociateHospital)
  },
  {
    path: 'doctors',
    loadComponent: () => import('./pages/doctors/doctors').then(m => m.Doctors)
  },
  {
    path: 'hospital-detail/:id',
    loadComponent: () => import('./pages/hospital-detail/hospital-detail').then(m => m.HospitalDetail)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
