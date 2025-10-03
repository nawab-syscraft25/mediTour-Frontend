import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TreatmentService } from 'src/app/core/services/treatment.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  showSearchBox = false;   // 👈 added for search toggle
  treatmentTypes: string[] = [];

  constructor(private treatmentService: TreatmentService) {}

  ngOnInit(): void {
    this.treatmentService.getTreatmentTypes().subscribe({
      next: (data) => {
        this.treatmentTypes = data;
      },
      error: (err) => {
        console.error('Error fetching treatment types:', err);
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSearchBox() {   // 👈 added function for search toggle
    this.showSearchBox = !this.showSearchBox;
  }

  /** Utility to convert API string into a route slug */
  toSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }
}
