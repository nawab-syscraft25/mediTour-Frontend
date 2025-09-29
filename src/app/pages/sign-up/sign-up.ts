import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true, 
  imports: [NgClass],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css']
})
export class SignUp {
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
