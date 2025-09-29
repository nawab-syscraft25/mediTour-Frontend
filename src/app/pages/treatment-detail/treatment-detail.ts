import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TreatmentService } from 'src/app/core/services/treatment.service';
import { Treatment } from 'src/app/shared/interfaces/treatment.interface';

// Import the standalone ModalComponent
import { ModalComponent } from '@core/modal/modal.component';

@Component({
  selector: 'app-treatment-detail',
  standalone: true,
  imports: [
    CommonModule,
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

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  constructor(
    private route: ActivatedRoute,
    private treatmentService: TreatmentService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.treatmentService.getTreatmentById(id).subscribe({
        next: (res) => {
          this.treatment = res;
          this.loading = false;
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
