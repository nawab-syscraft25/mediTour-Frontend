import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { BannerService, Banner } from 'src/app/core/services/banner.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class AboutComponent implements OnInit {
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

  banner: Banner | undefined;

  constructor(private bannerService: BannerService) {}

  ngOnInit(): void {
    this.bannerService.getBannerByTitle('About Us').subscribe(banner => {
      this.banner = banner;
    });
  }
}
