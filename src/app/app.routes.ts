import { Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {
        path: 'login',
        component:LoginComponent,
        title: 'Login'
    },
    {
        path:'home/:id',
        component: HomeComponent,
        title: 'Home'
    }
];
