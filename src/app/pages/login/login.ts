import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgClass],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
