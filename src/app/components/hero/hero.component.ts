import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.component.html'
})
export class HeroComponent {
  @Output() onExploreFeatured = new EventEmitter<void>();
}
