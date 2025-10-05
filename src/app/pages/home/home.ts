import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { HeroSection } from '../hero-section/hero-section';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { PartnerService, Partner } from 'src/app/core/services/partner.service';
import { PatientStory, PatientStoryService } from 'src/app/core/services/patient-story.service';
import { Treatment } from 'src/app/shared/interfaces/treatment.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroSection, CarouselModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  treatments: Treatment[] = [];
  partners: Partner[] = [];
  patientStories: PatientStory[] = [];

  patientsCount = 0;
  patientsTarget = 2500;
  awardsCount = 0;
  awardsTarget = 25;

  hasSearchResults = false;

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    dots: true,
    margin: 25,
    nav: false,
    navText: ['<', '>'],
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1000: { items: 3 }
    }
  };

  constructor(
    private treatmentService: TreatmentService,
    public partnerService: PartnerService,
    private patientStoryService: PatientStoryService
  ) {}

  ngOnInit(): void {
    this.loadTopTreatments();
    this.loadPartners();
    this.loadPatientStories();
    this.startCounter('patientsCount', this.patientsTarget, 20, 25);
    this.startCounter('awardsCount', this.awardsTarget, 50, 1);
  }

  // Load top treatments
  private loadTopTreatments(): void {
    this.treatmentService.searchTreatments({ skip: 0, limit: 4 }).subscribe({
      next: (res) => (this.treatments = res),
      error: (err) => console.error('Failed to load treatments:', err)
    });
  }

  // Load active partners
  private loadPartners(): void {
    this.partnerService.getActivePartners().subscribe({
      next: (res) => (this.partners = res),
      error: (err) => console.error('Failed to load partners:', err)
    });
  }

  // Load patient stories
  private loadPatientStories(): void {
    this.patientStoryService.getStories().subscribe({
      next: (res) => (this.patientStories = res),
      error: (err) => console.error('Failed to load patient stories:', err)
    });
  }

  // Get star icons for ratings
  getStars(rating: number | null): ('full' | 'half' | 'empty')[] {
    if (rating === null) return Array(5).fill('empty');

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return [
      ...Array(fullStars).fill('full'),
      ...Array(halfStar).fill('half'),
      ...Array(emptyStars).fill('empty')
    ];
  }

  // Handle search result changes
  onSearchResultsChange(hasResults: boolean): void {
    this.hasSearchResults = hasResults;
    console.log('Search results state changed:', hasResults);
  }

  // Counter animation
  private startCounter(counterName: 'patientsCount' | 'awardsCount', target: number, speed: number, step: number): void {
    const interval = setInterval(() => {
      if (this[counterName] < target) {
        this[counterName] += step;
      } else {
        this[counterName] = target;
        clearInterval(interval);
      }
    }, speed);
  }
}
