import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DoctorService, Doctor } from 'src/app/core/services/doctors.service';
import { HospitalService, Hospital } from 'src/app/core/services/hospital.service';
import { ModalComponent } from '@core/modal/modal.component';

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  templateUrl: './doctor-details.html',
  styleUrls: ['./doctor-details.css']
})
export class DoctorDetails implements OnInit {
  doctor: Doctor | null = null;
  hospitalName = '';
  showModal = false;
  baseUrl = 'http://165.22.223.163:8000';

  constructor(
    private doctorService: DoctorService,
    private hospitalService: HospitalService,
    private route: ActivatedRoute
  ) {}

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
        }
      },
      error: (err) => console.error(err)
    });
  }

  fetchHospitalName(hospitalId: number) {
    this.hospitalService.getHospitalById(hospitalId).subscribe({
      next: (hospital: Hospital) => this.hospitalName = hospital.name,
      error: (err) => console.error('Error fetching hospital', err)
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
