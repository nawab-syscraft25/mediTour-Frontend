import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // for [(ngModel)]
import { ActivatedRoute } from '@angular/router';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { Treatment } from 'src/app/shared/interfaces/treatment.interface';

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './treatments.html',
  styleUrls: ['./treatments.css']
})
export class Treatments implements OnInit {
  slug: string | null = null;
  treatmentName: string | null = null;

  treatments: Treatment[] = [];            // all treatments
  filteredTreatments: Treatment[] = [];    // treatments after filter
  loading = true;

  // Filters
  selectedLocation: string = '';
  selectedTreatmentType: string = '';

  // Dropdown data
  availableLocations: string[] = [];
  availableTreatmentTypes: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private treatmentService: TreatmentService
  ) {}

  ngOnInit(): void {
    this.loadTreatments();
  }

  /** Load all treatments from API */
  loadTreatments(): void {
    this.loading = true;
    const requestPayload: any = { skip: 0, limit: 100 };

    this.treatmentService.searchTreatments(requestPayload).subscribe({
      next: (data) => {
        // Sort by rating (highest first, null → bottom)
        this.treatments = data.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));

        // Dropdown values (unique)
        this.availableLocations = Array.from(new Set(this.treatments.map(t => t.location).filter(Boolean)));
        this.availableTreatmentTypes = Array.from(new Set(this.treatments.map(t => t.treatment_type).filter(Boolean)));

        // Initialize filtered list (all by default)
        this.filteredTreatments = [...this.treatments];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching treatments:', err);
        this.loading = false;
      }
    });
  }

  /** Apply filters to treatments */
  applyFilters(): void {
    this.filteredTreatments = this.treatments.filter(t => {
      const locationMatch = this.selectedLocation ? t.location === this.selectedLocation : true;
      const treatmentMatch = this.selectedTreatmentType ? t.treatment_type === this.selectedTreatmentType : true;
      return locationMatch && treatmentMatch;
    });
  }

  /** Generate star array for ratings */
  getStars(rating: number | null): ('full' | 'half' | 'empty')[] {
    if (rating === null) {
      return Array(5).fill('empty');
    }

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return [
      ...Array(fullStars).fill('full'),
      ...Array(halfStar).fill('half'),
      ...Array(emptyStars).fill('empty')
    ];
  }

  /** Utility: turn "cardiac-surgery" into "Cardiac Surgery" */
  private slugToName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
