import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedInSnapshot()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  login(): void {
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid credentials';
      }
    });
  }
}
