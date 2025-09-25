import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSection } from '../hero-section/hero-section';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroSection, CarouselModule],  // 👈 CarouselModule add here
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  hasSearchResults = false;

  // 🔹 Counters
  patientsCount: number = 0;
  patientsTarget: number = 2500;

  awardsCount: number = 0;
  awardsTarget: number = 25;

  ngOnInit(): void {
    this.startCounter('patientsCount', this.patientsTarget, 20, 25);
    this.startCounter('awardsCount', this.awardsTarget, 50, 1);
  }

  onSearchResultsChange(hasResults: boolean) {
    this.hasSearchResults = hasResults;
    console.log('Search results state changed:', hasResults);
  }

  // 🔹 Owl carousel options
  customOptions = {
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

  // 🔹 Counter function
  startCounter(counterName: 'patientsCount' | 'awardsCount', target: number, speed: number, step: number) {
    let interval = setInterval(() => {
      if (this[counterName] < target) {
        this[counterName] += step;
      } else {
        this[counterName] = target;
        clearInterval(interval);
      }
    }, speed);
  }
}
