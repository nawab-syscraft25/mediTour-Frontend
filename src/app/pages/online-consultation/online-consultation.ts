import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DoctorService, Doctor } from 'src/app/core/services/doctors.service';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';
import { ModalComponent } from '@core/modal/modal.component'; // Add this import

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
  selector: 'app-online-consultation',
  imports: [CommonModule, ModalComponent, ReactiveFormsModule, HttpClientModule], // Add ReactiveFormsModule and HttpClientModule
  templateUrl: './online-consultation.html',
  styleUrl: './online-consultation.css'
})
export class OnlineConsultation implements OnInit {
  doctors: (Doctor & { hospitalName?: string })[] = [];
  hospitalCache: { [id: number]: string } = {}; // avoid duplicate hospital API calls
  loading = true;
  showModal = false; // Add modal state
  selectedDoctor: Doctor | null = null; // Track selected doctor for booking
  baseUrl = 'http://165.22.223.163:8000';

  // Form-related properties
  bookingForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  // Budget options
  budgetOptions = [
    { value: '1000 - 5000', label: '₹1,000 - ₹5,000' },
    { value: '5000 - 10000', label: '₹5,000 - ₹10,000' },
    { value: '10000 - 25000', label: '₹10,000 - ₹25,000' },
    { value: '25000 - 50000', label: '₹25,000 - ₹50,000' },
    { value: '50000+', label: '₹50,000+' }
  ];

  // Service options for online consultation
  serviceOptions = [
    { value: 1, label: 'General Consultation' },
    { value: 2, label: 'Specialist Consultation' },
    { value: 3, label: 'Second Opinion' },
    { value: 4, label: 'Follow-up Consultation' },
    { value: 5, label: 'Emergency Consultation' }
  ];

  constructor(
    private doctorService: DoctorService,
    private hospitalService: HospitalService,
    private cdr: ChangeDetectorRef,
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

  // Add modal methods
  openModal(doctor: Doctor) {
    console.log('Opening modal for doctor:', doctor.name); // Debug log
    this.selectedDoctor = doctor;
    this.showModal = true;
    this.resetForm();
    // Pre-fill doctor preference if doctor is selected
    if (doctor) {
      this.bookingForm.patchValue({
        doctor_preference: doctor.name,
        hospital_preference: (doctor as any).hospitalName || ''
      });
    }
    this.cdr.detectChanges(); // Force change detection
  }

  closeModal() {
    console.log('Closing modal'); // Debug log
    this.showModal = false;
    this.selectedDoctor = null;
    this.resetForm();
    this.cdr.detectChanges(); // Force change detection
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
        doctor_preference: formData.doctor_preference || (this.selectedDoctor?.name || ''),
        hospital_preference: formData.hospital_preference || ((this.selectedDoctor as any)?.hospitalName || ''),
        user_query: formData.user_query || 'Online consultation booking',
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

      console.log('Online consultation booking created successfully:', response);
      this.submitSuccess = true;
      
      // Close modal after 2 seconds
      setTimeout(() => {
        this.closeModal();
      }, 2000);

    } catch (error: any) {
      console.error('Error creating online consultation booking:', error);
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

  ngOnInit(): void {
    console.log('Doctors component initialized...');
    console.log('Current loading state:', this.loading);

    this.doctorService.getDoctors().subscribe({
      next: (data: Doctor[]) => {
        console.log('✅ Doctor API raw data:', data);
        console.log('Number of doctors received:', data?.length || 0);

        if (!data || data.length === 0) {
          console.log('No doctors found - setting loading to false');
          this.doctors = [];
          this.loading = false;
          this.cdr.detectChanges(); // Force change detection
          return;
        }

        // ✅ sort doctors by rating (high → low, null last)
        this.doctors = data.sort((a, b) => {
          const ratingA = a.rating ?? 0;
          const ratingB = b.rating ?? 0;
          return ratingB - ratingA;
        });

        // Get unique hospital IDs
        const uniqueHospitalIds = [...new Set(this.doctors.map(doc => doc.hospital_id))];
        console.log('Unique hospital IDs:', uniqueHospitalIds);

        if (uniqueHospitalIds.length === 0) {
          this.loading = false;
          this.cdr.detectChanges(); // Force change detection
          return;
        }

        let hospitalRequestsCompleted = 0;
        const totalHospitalRequests = uniqueHospitalIds.length;

        // Function to check if all hospital requests are done
        const checkAllHospitalsLoaded = () => {
          hospitalRequestsCompleted++;
          console.log(`Hospital requests completed: ${hospitalRequestsCompleted}/${totalHospitalRequests}`);
          if (hospitalRequestsCompleted >= totalHospitalRequests) {
            this.loading = false;
            console.log('All hospital data loaded, setting loading to false');
            console.log('Doctors array:', this.doctors);
            console.log('Loading state:', this.loading);
            this.cdr.detectChanges(); // Force change detection
          }
        };

        // Add timeout fallback in case hospital requests hang
        setTimeout(() => {
          if (this.loading) {
            console.log('⚠️ Hospital loading timeout - forcing loading to false');
            this.loading = false;
            this.cdr.detectChanges(); // Force change detection
          }
        }, 10000); // 10 second timeout

        // Fetch hospital names for unique IDs only
        uniqueHospitalIds.forEach((hospitalId) => {
          if (this.hospitalCache[hospitalId]) {
            // Already cached, update all doctors with this hospital_id
            this.doctors.forEach((doctor, index) => {
              if (doctor.hospital_id === hospitalId) {
                this.doctors[index].hospitalName = this.hospitalCache[hospitalId];
              }
            });
            checkAllHospitalsLoaded();
          } else {
            // Fetch hospital data
            this.hospitalService.getHospitalById(hospitalId).subscribe({
              next: (hospital: Hospital) => {
                console.log(`🏥 Hospital fetched for ID ${hospitalId}: ${hospital.name}`);
                this.hospitalCache[hospitalId] = hospital.name;
                
                // Update all doctors with this hospital_id
                this.doctors.forEach((doctor, index) => {
                  if (doctor.hospital_id === hospitalId) {
                    this.doctors[index].hospitalName = hospital.name;
                  }
                });
                
                checkAllHospitalsLoaded();
              },
              error: (err) => {
                console.error(`❌ Error fetching hospital with ID ${hospitalId}:`, err);
                this.hospitalCache[hospitalId] = 'Hospital not available';
                
                // Update all doctors with this hospital_id
                this.doctors.forEach((doctor, index) => {
                  if (doctor.hospital_id === hospitalId) {
                    this.doctors[index].hospitalName = 'Hospital not available';
                  }
                });
                
                checkAllHospitalsLoaded();
              }
            });
          } 
        });
      },
      error: (err: unknown) => {
        console.error('❌ Error loading doctors:', err);
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      }
    });
  }
}