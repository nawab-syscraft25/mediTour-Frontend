import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  // imports: [NgClass],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
