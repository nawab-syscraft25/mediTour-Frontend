import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';
import { DoctorService } from 'src/app/core/services/doctors.service';
import { Doctor } from 'src/app/core/services/doctors.service';

@Component({
  selector: 'app-hospital-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hospital-detail.html',
  styleUrls: ['./hospital-detail.css']
})
export class HospitalDetail implements OnInit {
  hospital: Hospital | null = null;
  baseUrl = 'http://165.22.223.163:8000';
  
  // Doctor-related properties
  hospitalDoctors: Doctor[] = [];
  loadingDoctors = false;

  constructor(
    private route: ActivatedRoute,
    private hospitalService: HospitalService,
    private doctorService: DoctorService
  ) { }

  facilityIcons: string[] = [
    'assets/images/dtl-bed.svg',     // 1st
    'assets/images/dtl-shield.svg',  // 2nd
    'assets/images/dtl-specialities.svg',       // 3rd
    'assets/images/dtl-facilities.svg',  // 4th
  ];

  featureIcon: string = 'assets/images/features-check.svg';
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.hospitalService.getHospitalById(id).subscribe({
        next: (data: Hospital) => {
          console.log('✅ Full hospital details:', data); // 👈 logs everything
          this.hospital = data;
          
          // Load doctors for this hospital
          this.loadHospitalDoctors(id);
        },
        error: (err: unknown) => {
          console.error('❌ Error fetching hospital detail:', err);
        }
      });
    }
  }

  // Load doctors for the specific hospital
  loadHospitalDoctors(hospitalId: number): void {
    this.loadingDoctors = true;
    console.log('Loading doctors for hospital ID:', hospitalId);
    
    this.doctorService.getDoctorsByHospital(hospitalId, 0, 10).subscribe({
      next: (doctors) => {
        console.log('Hospital doctors loaded:', doctors);
        console.log('Number of doctors found:', doctors.length);
        
        if (doctors.length > 0) {
          this.hospitalDoctors = doctors.slice(0, 3); // Limit to 3 for display
          console.log('Displaying doctors:', this.hospitalDoctors);
        } else {
          console.log('No doctors found for hospital ID:', hospitalId);
          // Fallback: Try to get any doctors as a backup
          this.getFallbackDoctors();
          return;
        }
        this.loadingDoctors = false;
      },
      error: (error) => {
        console.error('Error loading hospital doctors:', error);
        this.loadingDoctors = false;
        // Try fallback doctors on error
        this.getFallbackDoctors();
      }
    });
  }

  // Fallback method to get any available doctors
  private getFallbackDoctors(): void {
    console.log('Loading fallback doctors...');
    this.doctorService.getDoctors(0, 3).subscribe({
      next: (doctors) => {
        console.log('Fallback doctors loaded:', doctors);
        this.hospitalDoctors = doctors.slice(0, 3);
        this.loadingDoctors = false;
      },
      error: (error) => {
        console.error('Error loading fallback doctors:', error);
        this.hospitalDoctors = [];
        this.loadingDoctors = false;
      }
    });
  }
}
