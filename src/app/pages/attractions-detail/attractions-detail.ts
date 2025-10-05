import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { OfferService } from 'src/app/core/services/offer.service';

@Component({
  selector: 'app-attractions-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './attractions-detail.html',
  styleUrls: ['./attractions-detail.css']
})
export class AttractionsDetail implements OnInit {
  offer: any;
  loading = true;
  error = '';

  constructor(private offerService: OfferService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || 1;
    this.offerService.getOfferById(id).subscribe({
      next: (data) => {
        this.offer = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load offer details.';
        this.loading = false;
      }
    });
  }

  getPrimaryImage(offer: any): string {
    const primary = offer.images?.find((img: any) => img.is_primary);
    return primary ? primary.url : offer.images?.[0]?.url || '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
