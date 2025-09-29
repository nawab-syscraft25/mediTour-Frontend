import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class AboutComponent {

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

}
