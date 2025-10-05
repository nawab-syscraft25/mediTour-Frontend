import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { DoctorService } from 'src/app/core/services/doctors.service';
import { Treatment } from 'src/app/shared/interfaces/treatment.interface';
import { Doctor } from 'src/app/core/services/doctors.service';

// Import the standalone ModalComponent
import { ModalComponent } from '@core/modal/modal.component';

interface BookingRequest {
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  treatment_id: number;
  budget: string;
  medical_history_file: string;
  doctor_preference: string;
  hospital_preference: string;
  user_query: string;
  travel_assistant: boolean;
  stay_assistant: boolean;
}

interface BookingResponse extends BookingRequest {
  id: number;
  created_at: string;
}

@Component({
  selector: 'app-treatment-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    ModalComponent   // ✅ standalone modal imported
  ],
  templateUrl: './treatment-detail.html',
  styleUrls: ['./treatment-detail.css']
})
export class TreatmentDetail implements OnInit {
  treatment?: Treatment;
  loading = true;
  baseUrl = 'http://165.22.223.163:8000';
  showModal = false;
  expandedFaqIndex: number | null = null; // Track which FAQ is expanded
  bookingForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  // Doctor-related properties
  relatedDoctors: Doctor[] = [];
  loadingDoctors = false;

  // Budget options
  budgetOptions = [
    { value: '10000 - 50000', label: '₹10,000 - ₹50,000' },
    { value: '50000 - 100000', label: '₹50,000 - ₹1,00,000' },
    { value: '100000 - 300000', label: '₹1,00,000 - ₹3,00,000' },
    { value: '300000 - 500000', label: '₹3,00,000 - ₹5,00,000' },
    { value: '500000 - 800000', label: '₹5,00,000 - ₹8,00,000' },
    { value: '800000+', label: '₹8,00,000+' }
  ];

  // Service options (you can populate these from API)
  serviceOptions = [
    { value: 1, label: 'Cardiology' },
    { value: 2, label: 'Orthopedics' },
    { value: 3, label: 'Oncology' },
    // Add more services as needed
  ];

  constructor(
    private route: ActivatedRoute,
    private treatmentService: TreatmentService,
    private doctorService: DoctorService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.bookingForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile_no: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      treatment_id: ['', Validators.required],
      budget: ['', Validators.required],
      doctor_preference: [''],
      hospital_preference: [''],
      medical_history_file: [''],
      user_query: [''],
      travel_assistant: [false],
      stay_assistant: [false]
    });
  }

  // Method to get dynamic FAQs from treatment data
  getDynamicFaqs(): { question: string; answer: string }[] {
    if (!this.treatment) return [];

    const faqs: { question: string; answer: string }[] = [];

    // Collect faq1..faq5 if present
    for (let i = 1; i <= 5; i++) {
      const q = (this.treatment as any)[`faq${i}_question`];
      const a = (this.treatment as any)[`faq${i}_answer`];
      if (q && a) {
        faqs.push({ question: q, answer: a });
      }
    }

    // Merge faqs array if present
    if (Array.isArray(this.treatment.faqs)) {
      this.treatment.faqs.forEach((faq: any) => {
        if (faq.question && faq.answer) {
          faqs.push({ question: faq.question, answer: faq.answer });
        }
      });
    }

    return faqs;
  }

  // Method to toggle FAQ expansion
  toggleFaq(index: number): void {
    this.expandedFaqIndex = this.expandedFaqIndex === index ? null : index;
  }

  // Method to check if FAQ is expanded
  isFaqExpanded(index: number): boolean {
    return this.expandedFaqIndex === index;
  }

  openModal() {
    this.showModal = true;
    this.resetForm();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.bookingForm.reset();
    this.isSubmitting = false;
    this.submitSuccess = false;
    this.submitError = '';

    // Set default values
    this.bookingForm.patchValue({
      travel_assistant: false,
      stay_assistant: false,
      treatment_id: '',  // Keep empty to show default option
      budget: ''         // Keep empty to show default option
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      // For now, we'll just store the filename
      // In a real application, you'd upload the file to a server first
      this.bookingForm.patchValue({
        medical_history_file: file.name
      });
    }
  }

  async onSubmit() {
    if (this.bookingForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    try {
      const formData = this.bookingForm.value;

      // Prepare the request payload
      const bookingRequest: BookingRequest = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobile_no: formData.mobile_no,
        treatment_id: Number(formData.treatment_id),
        budget: formData.budget,
        medical_history_file: formData.medical_history_file || 'null',
        doctor_preference: formData.doctor_preference || '1',
        hospital_preference: formData.hospital_preference || '1',
        user_query: formData.user_query || 'No query provided',
        travel_assistant: formData.travel_assistant,
        stay_assistant: formData.stay_assistant
      };

      const response = await this.http.post<BookingResponse>(
        `${this.baseUrl}/api/v1/bookings`,
        bookingRequest,
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      ).toPromise();

      console.log('Booking created successfully:', response);
      this.submitSuccess = true;

      // Close modal after 2 seconds
      setTimeout(() => {
        this.closeModal();
      }, 2000);

    } catch (error: any) {
      console.error('Error creating booking:', error);
      this.submitError = error.error?.message || 'Failed to create booking. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName.replace('_', ' ')} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return 'Please enter a valid mobile number';
      if (field.errors['minlength']) return `${fieldName.replace('_', ' ')} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  // Load related doctors based on treatment name
  loadRelatedDoctors(treatmentName: string) {
    this.loadingDoctors = true;
    console.log('Searching for doctors with treatment name:', treatmentName);

    // First try: Search using full treatment name
    this.doctorService.searchDoctors(0, 10, treatmentName).subscribe({
      next: (doctors) => {
        console.log('Search results for full name:', doctors);

        if (doctors.length > 0) {
          this.relatedDoctors = doctors.slice(0, 3); // Limit to 3 doctors
          this.loadingDoctors = false;
        } else {
          // Second try: Extract keywords from treatment name and search
          this.searchByKeywords(treatmentName);
        }
      },
      error: (error) => {
        console.error('Error in first search:', error);
        // Fallback: Try keyword search
        this.searchByKeywords(treatmentName);
      }
    });
  }

  // Search using keywords extracted from treatment name
  private searchByKeywords(treatmentName: string) {
    // Extract potential medical keywords
    const keywords = this.extractMedicalKeywords(treatmentName);
    console.log('Extracted keywords:', keywords);

    if (keywords.length > 0) {
      // Try searching with the first keyword
      this.doctorService.searchDoctors(0, 10, keywords[0]).subscribe({
        next: (doctors) => {
          console.log('Search results for keyword:', keywords[0], doctors);

          if (doctors.length > 0) {
            this.relatedDoctors = doctors.slice(0, 3);
          } else if (keywords.length > 1) {
            // Try second keyword if available
            this.searchWithSecondKeyword(keywords[1]);
            return;
          } else {
            // Final fallback: Get any doctors
            this.getFallbackDoctors();
            return;
          }
          this.loadingDoctors = false;
        },
        error: (error) => {
          console.error('Error in keyword search:', error);
          this.getFallbackDoctors();
        }
      });
    } else {
      this.getFallbackDoctors();
    }
  }

  private searchWithSecondKeyword(keyword: string) {
    this.doctorService.searchDoctors(0, 10, keyword).subscribe({
      next: (doctors) => {
        console.log('Search results for second keyword:', keyword, doctors);
        this.relatedDoctors = doctors.length > 0 ? doctors.slice(0, 3) : [];
        if (this.relatedDoctors.length === 0) {
          this.getFallbackDoctors();
          return;
        }
        this.loadingDoctors = false;
      },
      error: (error) => {
        console.error('Error in second keyword search:', error);
        this.getFallbackDoctors();
      }
    });
  }

  // Get any available doctors as fallback
  private getFallbackDoctors() {
    console.log('Using fallback: getting any available doctors');
    this.doctorService.getDoctors(0, 3).subscribe({
      next: (doctors) => {
        console.log('Fallback doctors:', doctors);
        this.relatedDoctors = doctors.slice(0, 3);
        this.loadingDoctors = false;
      },
      error: (error) => {
        console.error('Error loading fallback doctors:', error);
        this.loadingDoctors = false;
        this.relatedDoctors = [];
      }
    });
  }

  // Extract medical keywords from treatment name
  private extractMedicalKeywords(treatmentName: string): string[] {
    const keywords: string[] = [];
    const medicalTerms = [
      'cardiac', 'cardiology', 'heart', 'surgery', 'orthopedic', 'orthopedics',
      'bone', 'joint', 'oncology', 'cancer', 'tumor', 'neurology', 'brain',
      'spine', 'kidney', 'liver', 'lung', 'gastro', 'dental', 'eye', 'skin',
      'plastic', 'cosmetic', 'urology', 'gynecology', 'pediatric', 'ENT'
    ];

    const words = treatmentName.toLowerCase().split(/[\s\-_]+/);

    // First, look for exact medical terms
    words.forEach(word => {
      if (medicalTerms.some(term => word.includes(term) || term.includes(word))) {
        keywords.push(word);
      }
    });

    // If no medical terms found, use the first few words
    if (keywords.length === 0) {
      keywords.push(...words.slice(0, 2));
    }

    return keywords;
  }

  // Method to get features as an array for line-by-line display
  getFeaturesList(): string[] {
    if (!this.treatment?.features) {
      return [];
    }

    // If features is already a string, split it by common delimiters
    if (typeof this.treatment.features === 'string') {
      // Split by various delimiters and clean up
      return this.treatment.features
        .split(/[,;|\n\r]/) // Split by comma, semicolon, pipe, or newlines
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0);
    }

    // If features is an array, return as-is
    if (Array.isArray(this.treatment.features)) {
      return this.treatment.features;
    }

    return [];
  }

  // Method to get dynamic FAQs from treatment data


  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.treatmentService.getTreatmentById(id).subscribe({
        next: (res) => {
          this.treatment = res;
          this.loading = false;

          // Load related doctors based on treatment name
          if (this.treatment?.name) {
            this.loadRelatedDoctors(this.treatment.name);
          }
        },
        error: (err) => {
          console.error('Error loading treatment:', err);
          this.loading = false;
        }
      });
    } else {
      console.warn('No treatment ID found in route');
      this.loading = false;
    }
  }
}
