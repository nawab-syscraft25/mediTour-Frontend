import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  // List 1: Company Links
  footerlink1 = [
    { label: 'About Us', route: '/' },
    { label: 'Careers', route: '/' },
    { label: 'Blog', route: '/' },
    { label: 'Press', route: '/' },
    { label: 'Contact', route: '/' }
  ];

  // List 2: Services Links
  footerlink2 = [
    { label: 'Medical Tourism', route: '/' },
    { label: 'Cardiology', route: '/' },
    { label: 'Neurology', route: '/' },
    { label: 'Orthopedics', route: '/' },
    { label: 'Cancer Treatment', route: '/' }
  ];

  // List 3: Support Links
  footerlink3 = [
    { label: 'FAQs', route: '/' },
    { label: 'Help Center', route: '/' },
    { label: 'Privacy Policy', route: '/' },
    { label: 'Terms of Service', route: '/' }
  ];

  // Newsletter input
  email: string = '';

  subscribe() {
    if (this.email) {
      console.log('Subscribed with:', this.email);
      alert(`Thank you for subscribing, ${this.email}!`);
      this.email = '';
    } else {
      alert('Please enter a valid email.');
    }
  }
}
