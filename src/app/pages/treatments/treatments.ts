import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { Treatment } from 'src/app/shared/interfaces/treatment.interface';

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './treatments.html',
  styleUrls: ['./treatments.css']
})
export class Treatments implements OnInit {
  slug: string | null = null;
  treatmentName: string | null = null;
  treatments: Treatment[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private treatmentService: TreatmentService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug');
      this.loading = true;

      const requestPayload: any = { skip: 0, limit: 100 };

      if (this.slug) {
        // Convert slug (e.g. "cardiac-surgery") → "Cardiac Surgery"
        this.treatmentName = this.slugToName(this.slug);
        requestPayload.treatment_type = this.treatmentName;
      }

      this.treatmentService.searchTreatments(requestPayload).subscribe({
        next: (data) => {
          // ✅ Sort by rating descending (null → bottom)
          this.treatments = data.sort((a, b) => {
            const ratingA = a.rating ?? -1; // unrated → lowest
            const ratingB = b.rating ?? -1;
            return ratingB - ratingA; // higher first
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching treatments:', err);
          this.loading = false;
        }
      });
    });
  }

  /** Generate star array for ratings (supports half stars) */
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
