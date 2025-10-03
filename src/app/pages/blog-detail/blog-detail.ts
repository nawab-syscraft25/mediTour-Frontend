import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface BlogDetail {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  images: { id: number; url: string }[];
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-detail.html',
  styleUrls: ['./blog-detail.css']
})
export class BlogDetailComponent implements OnInit {
  blog!: BlogDetail;
  baseUrl = 'http://165.22.223.163:8000';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // from /blog/:id
    if (id) {
      this.http
        .get<BlogDetail>(`${this.baseUrl}/api/v1/blogs/${id}`)
        .subscribe((data) => {
          this.blog = data;
        });
    }
  }

  getImageUrl(path: string): string {
    return path ? this.baseUrl + path : 'assets/images/blog-img.png';
  }
}