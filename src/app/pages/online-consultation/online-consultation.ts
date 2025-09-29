import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService, Doctor } from 'src/app/core/services/doctors.service';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';
import { ModalComponent } from '@core/modal/modal.component'; // Add this import

@Component({
  selector: 'app-online-consultation',
  imports: [CommonModule, ModalComponent], // Add ModalComponent here
  templateUrl: './online-consultation.html',
  styleUrl: './online-consultation.css'
})
export class OnlineConsultation implements OnInit {
  doctors: (Doctor & { hospitalName?: string })[] = [];
  hospitalCache: { [id: number]: string } = {}; // avoid duplicate hospital API calls
  loading = true;
  showModal = false; // Add modal state
  selectedDoctor: Doctor | null = null; // Track selected doctor for booking

  constructor(
    private doctorService: DoctorService,
    private hospitalService: HospitalService,
    private cdr: ChangeDetectorRef
  ) {}

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
    this.cdr.detectChanges(); // Force change detection
  }

  closeModal() {
    console.log('Closing modal'); // Debug log
    this.showModal = false;
    this.selectedDoctor = null;
    this.cdr.detectChanges(); // Force change detection
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