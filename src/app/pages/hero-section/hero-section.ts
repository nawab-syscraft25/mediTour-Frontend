import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TreatmentService } from '../../core/services/treatment.service';
import { DoctorService } from '../../core/services/doctors.service';
import { Treatment } from '../../shared/interfaces/treatment.interface';
import { Doctor } from '../../core/services/doctors.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css'
})
export class HeroSection implements OnInit {

  @Output() searchResultsChange = new EventEmitter<boolean>();

  locations: string[] = [];
  treatments: string[] = [];
  searchResults: Treatment[] = [];

  // Doctor-related properties for Online Consultation
  doctorLocations: string[] = [];
  specializations: string[] = [];
  doctorResults: Doctor[] = [];
  selectedDoctorLocation: string = '';
  selectedSpecialization: string = '';
  isDoctorSearching = false;
  doctorSearchClicked = false;

  isSearching = false;
  searchClicked = false;   // ✅ new flag to show "No Results Found" only after searching
  buttonClicked = false;

  selectedLocation: string = '';
  selectedTreatment: string = '';

constructor(
  private treatmentService: TreatmentService,
  private doctorService: DoctorService,
  private router: Router
) {}

  ngOnInit(): void {
    console.log('HeroSection ngOnInit called');

    // fallback demo data
    this.locations = ['Bangalore', 'Indore', 'Mumbai', 'Test City'];
    this.treatments = ['Cardiac Surgery', 'Neurology', 'Oncology', 'Orthopedics'];

    this.loadLocations();
    this.loadTreatments();
    this.loadDoctorLocations();
    this.loadSpecializations();
  }
   goToContact() {
    this.router.navigate(['/contact']); // 👈 navigate to Contact page
  }

  loadLocations(): void {
    this.treatmentService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
        this.locations = ['Indore', 'Bhopal', 'Delhi', 'Mumbai']; // fallback
      }
    });
  }

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

  loadTreatments(): void {
    this.treatmentService.getTreatmentTypes().subscribe({
      next: (treatments) => {
        this.treatments = treatments;
      },
      error: (error) => {
        console.error('Error fetching treatments:', error);
        this.treatments = ['Cardiology', 'Neurology', 'Orthopedics', 'Cancer Treatment']; // fallback
      }
    });
  }

  search() {
    console.log('Search button clicked!');
    console.log('Selected location:', this.selectedLocation);
    console.log('Selected treatment:', this.selectedTreatment);

    if (!this.selectedLocation && !this.selectedTreatment) {
      // alert('Please select a location or treatment type');
      return;
    }

    this.searchClicked = true;   // ✅ mark that user searched
    this.isSearching = true;
    
    // Clear doctor results when searching for treatments
    this.doctorResults = [];
    this.doctorSearchClicked = false;

    const searchParams: any = {
      skip: 0,
      limit: 100
    };

    if (this.selectedLocation) {
      searchParams.location = this.selectedLocation.toLowerCase();
    }
    if (this.selectedTreatment) {
      searchParams.treatment_type = this.selectedTreatment;
    }

    this.treatmentService.searchTreatments(searchParams).subscribe({
      next: (results) => {
        // ✅ sort by rating high → low, null last
        this.searchResults = results.sort((a, b) => {
          const ratingA = a.rating ?? 0;
          const ratingB = b.rating ?? 0;
          return ratingB - ratingA;
        });

        this.isSearching = false;

        // notify parent - emit true if either treatment or doctor results exist
        this.searchResultsChange.emit(this.searchResults.length > 0 || this.doctorResults.length > 0);

        // smooth scroll to results
        setTimeout(() => {
          const resultsElement = document.querySelector('.search-results-container');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error searching treatments:', error);
        this.isSearching = false;
        this.searchResults = [];
        this.searchResultsChange.emit(this.searchResults.length > 0 || this.doctorResults.length > 0);
        alert('Error occurred while searching: ' + error.message);
      }
    });
  }

  clearSearch() {
    console.log('Clearing search...');
    this.selectedLocation = '';
    this.selectedTreatment = '';
    this.searchResults = [];
    this.isSearching = false;
    this.searchClicked = false;   // ✅ reset flag

    this.searchResultsChange.emit(this.searchResults.length > 0 || this.doctorResults.length > 0);
  }

  testButtonClick() {
    this.buttonClicked = !this.buttonClicked;
    console.log('Button clicked state:', this.buttonClicked);
  }

  // Doctor-related methods for Online Consultation
  loadDoctorLocations(): void {
    this.doctorService.getLocations().subscribe({
      next: (locations) => {
        this.doctorLocations = locations;
      },
      error: (error) => {
        console.error('Error fetching doctor locations:', error);
        this.doctorLocations = ['Indore', 'Mumbai', 'Delhi', 'Bangalore']; // fallback
      }
    });
  }

  loadSpecializations(): void {
    this.doctorService.getSpecializations().subscribe({
      next: (specializations) => {
        this.specializations = specializations;
      },
      error: (error) => {
        console.error('Error fetching specializations:', error);
        this.specializations = ['Interventional Cardiology', 'Neurology', 'Orthopedics', 'Oncology']; // fallback
      }
    });
  }

  searchDoctors() {
    console.log('Doctor search button clicked!');
    console.log('Selected doctor location:', this.selectedDoctorLocation);
    console.log('Selected specialization:', this.selectedSpecialization);

    this.doctorSearchClicked = true;
    this.isDoctorSearching = true;
    
    // Clear treatment results when searching for doctors
    this.searchResults = [];
    this.searchClicked = false;

    this.doctorService.getDoctors(0, 100, this.selectedDoctorLocation || undefined).subscribe({
      next: (doctors) => {
        // Filter by specialization if selected
        if (this.selectedSpecialization) {
          this.doctorResults = doctors.filter(doctor => 
            doctor.specialization && 
            doctor.specialization.toLowerCase().includes(this.selectedSpecialization.toLowerCase())
          );
        } else {
          this.doctorResults = doctors;
        }

        // Sort by rating high → low, null last
        this.doctorResults = this.doctorResults.sort((a, b) => {
          const ratingA = a.rating ?? 0;
          const ratingB = b.rating ?? 0;
          return ratingB - ratingA;
        });

        this.isDoctorSearching = false;

        // notify parent - emit true if either treatment or doctor results exist
        this.searchResultsChange.emit(this.searchResults.length > 0 || this.doctorResults.length > 0);

        // Smooth scroll to results
        setTimeout(() => {
          const resultsElement = document.querySelector('.doctor-results-container');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error searching doctors:', error);
        this.isDoctorSearching = false;
        this.doctorResults = [];
        this.searchResultsChange.emit(this.searchResults.length > 0 || this.doctorResults.length > 0);
        alert('Error occurred while searching doctors: ' + error.message);
      }
    });
  }

  clearDoctorSearch() {
    console.log('Clearing doctor search...');
    this.selectedDoctorLocation = '';
    this.selectedSpecialization = '';
    this.doctorResults = [];
    this.isDoctorSearching = false;
    this.doctorSearchClicked = false;
    this.searchResultsChange.emit(this.searchResults.length > 0 || this.doctorResults.length > 0);
  }
}
