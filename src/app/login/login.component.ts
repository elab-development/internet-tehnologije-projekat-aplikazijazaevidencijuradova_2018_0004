import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  errorMessage: string | null = null;

  username: string = '';
  password: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  login(form: NgForm) {
    const username = form.value.username;
    const password = form.value.password;

    const headers = new HttpHeaders({
      'username': username,
      'password': password
    });

    this.http.post('http://localhost:5000/login', null, { headers, observe: 'response' }).subscribe({
      next: (response) => {
        if (response.status === 200) {
          localStorage.setItem('username', username);
          this.router.navigate(['/home/' + username]);
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
      }
    });
  }

  loginAsGuest() {
    localStorage.setItem('username', 'GOST');
    this.router.navigate(['/home/' + 'guest']);
  }

}
