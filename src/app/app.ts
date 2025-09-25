import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';

import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, Footer, CarouselModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'medical-tourism';
}
