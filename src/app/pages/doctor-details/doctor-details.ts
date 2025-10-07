import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DoctorService, Doctor } from 'src/app/core/services/doctors.service';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';
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
  selector: 'app-doctor-details',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule,
    HttpClientModule,
    ModalComponent
  ],
  templateUrl: './doctor-details.html',
  styleUrls: ['./doctor-details.css']
})
export class DoctorDetails implements OnInit {
  doctor: Doctor | null = null;
  hospitalName = '';
  relatedDoctors: Doctor[] = [];
  loadingRelatedDoctors = false;
  showModal = false;
  baseUrl = 'http://165.22.223.163:8000';
  consultationForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  expandedFaqIndex: number | null = null; // Track which FAQ is expanded

  // Budget options
  budgetOptions = [
    { value: '10000 - 50000', label: '₹10,000 - ₹50,000' },
    { value: '50000 - 100000', label: '₹50,000 - ₹1,00,000' },
    { value: '100000 - 300000', label: '₹1,00,000 - ₹3,00,000' },
    { value: '300000 - 500000', label: '₹3,00,000 - ₹5,00,000' },
    { value: '500000 - 800000', label: '₹5,00,000 - ₹8,00,000' },
    { value: '800000+', label: '₹8,00,000+' }
  ];

  // Service options for consultation
  serviceOptions = [
    { value: 1, label: 'General Consultation' },
    { value: 2, label: 'Follow-up Consultation' },
    { value: 3, label: 'Specialist Consultation' },
    { value: 4, label: 'Second Opinion' },
    { value: 5, label: 'Emergency Consultation' }
  ];

  // ✅ NEW: Dropdown open/close states
  isTreatmentDropdownOpen = false;
  isBudgetDropdownOpen = false;

  // ✅ NEW: Selected display values
  selectedTreatmentLabel: string = '';
  selectedBudgetLabel: string = '';

  constructor(
    private doctorService: DoctorService,
    private hospitalService: HospitalService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.consultationForm = this.fb.group({
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

  // ✅ NEW: Toggle dropdowns
  toggleTreatmentDropdown(): void {
    this.isTreatmentDropdownOpen = !this.isTreatmentDropdownOpen;
    this.isBudgetDropdownOpen = false;
  }

  toggleBudgetDropdown(): void {
    this.isBudgetDropdownOpen = !this.isBudgetDropdownOpen;
    this.isTreatmentDropdownOpen = false;
  }

  // ✅ NEW: Select treatment
  selectTreatment(service: { value: number; label: string }): void {
    this.consultationForm.patchValue({ treatment_id: service.value });
    this.selectedTreatmentLabel = service.label;
    this.isTreatmentDropdownOpen = false;
  }

  // ✅ NEW: Select budget
  selectBudget(budget: { value: string; label: string }): void {
    this.consultationForm.patchValue({ budget: budget.value });
    this.selectedBudgetLabel = budget.label;
    this.isBudgetDropdownOpen = false;
  }

  // ✅ NEW: Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: any): void {
    if (!event.target.closest('.custom-select-wrapper')) {
      this.isTreatmentDropdownOpen = false;
      this.isBudgetDropdownOpen = false;
    }
  }

  ngOnInit(): void {
    const doctorId = Number(this.route.snapshot.paramMap.get('id'));
    if (doctorId) {
      this.fetchDoctor(doctorId);
    }
  }
  
  fetchDoctor(id: number) {
    this.doctorService.getDoctorById(id).subscribe({
      next: (data) => {
        this.doctor = data;
        if (data.hospital_id) {
          this.fetchHospitalName(data.hospital_id);
          this.fetchRelatedDoctors(data.hospital_id, id);
        }
      },
      error: (err) => console.error(err)
    });
  }

  fetchHospitalName(hospitalId: number) {
    this.hospitalService.getHospitalById(hospitalId).subscribe({
      next: (hospital: Hospital) => {
        this.hospitalName = hospital.name;
      },
      error: (err) => console.error('Error fetching hospital', err)
    });
  }

  fetchRelatedDoctors(hospitalId: number, currentDoctorId: number) {
    this.loadingRelatedDoctors = true;
    this.doctorService.getDoctorsByHospital(hospitalId, 0, 10).subscribe({
      next: (doctors) => {
        // Filter out the current doctor and take only first 3 related doctors
        this.relatedDoctors = doctors
          .filter(doctor => doctor.id !== currentDoctorId)
          .slice(0, 3);
        this.loadingRelatedDoctors = false;
      },
      error: (err) => {
        console.error('Error fetching related doctors', err);
        this.loadingRelatedDoctors = false;
      }
    });
  }

  // Method to get dynamic FAQs from doctor data
  getDynamicFaqs(): { question: string; answer: string }[] {
    if (!this.doctor) return [];

    const faqs: { question: string; answer: string }[] = [];

    // Collect faq1..faq5 if present
    for (let i = 1; i <= 5; i++) {
      const q = (this.doctor as any)[`faq${i}_question`];
      const a = (this.doctor as any)[`faq${i}_answer`];
      if (q && a) {
        faqs.push({ question: q, answer: a });
      }
    }

    // Merge faqs array if present
    if (Array.isArray(this.doctor.faqs)) {
      this.doctor.faqs.forEach((faq: any) => {
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

  // ✅ UPDATED: Reset form with dropdown labels
  resetForm() {
    this.consultationForm.reset();
    this.isSubmitting = false;
    this.submitSuccess = false;
    this.submitError = '';
    
    // ✅ Reset dropdown labels
    this.selectedTreatmentLabel = '';
    this.selectedBudgetLabel = '';
    
    // Set default values and pre-populate doctor/hospital info
    this.consultationForm.patchValue({
      travel_assistant: false,
      stay_assistant: false,
      treatment_id: '',
      budget: '',
      doctor_preference: this.doctor?.name || '',
      hospital_preference: this.hospitalName || ''
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      // For now, we'll just store the filename
      // In a real application, you'd upload the file to a server first
      this.consultationForm.patchValue({
        medical_history_file: file.name
      });
    }
  }

  async onSubmit() {
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched();
    
    if (this.consultationForm.invalid) {
      this.submitError = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    try {
      const formData = this.consultationForm.value;
      
      // Prepare the request payload
      const bookingRequest: BookingRequest = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobile_no: formData.mobile_no,
        treatment_id: Number(formData.treatment_id),
        budget: formData.budget,
        medical_history_file: formData.medical_history_file || 'null',
        doctor_preference: formData.doctor_preference || (this.doctor?.id?.toString() || '1'),
        hospital_preference: formData.hospital_preference || (this.doctor?.hospital_id?.toString() || '1'),
        user_query: formData.user_query || 'Consultation booking request',
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

      console.log('Consultation booked successfully:', response);
      this.submitSuccess = true;
      
      // Close modal after 2 seconds
      setTimeout(() => {
        this.closeModal();
      }, 2000);

    } catch (error: any) {
      console.error('Error booking consultation:', error);
      this.submitError = error.error?.message || 'Failed to book consultation. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.consultationForm.controls).forEach(key => {
      const control = this.consultationForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.consultationForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.consultationForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        // Customize error messages for different fields
        switch(fieldName) {
          case 'first_name': return 'First name is required';
          case 'last_name': return 'Last name is required';
          case 'email': return 'Email is required';
          case 'mobile_no': return 'Mobile number is required';
          case 'treatment_id': return 'Please select a service';
          case 'budget': return 'Please select a budget preference';
          default: return `${fieldName.replace('_', ' ')} is required`;
        }
      }
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return 'Please enter a valid 10-digit mobile number';
      if (field.errors['minlength']) return `Must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }
}