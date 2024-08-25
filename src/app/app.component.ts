import { Component, OnInit, OnDestroy } from '@angular/core';
import {RouterModule} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent, RouterModule, LoginComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy  {
  username: string | null = null;
  private intervalSubscription: Subscription | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateUsername();
    this.intervalSubscription = timer(0, 500).subscribe(() => this.updateUsername());
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe(); // Oslobodi resurse kada se komponenta uništi
    }
  }

  private updateUsername() {
    this.username = localStorage.getItem('username');
  }

  logout() {
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }
}
