import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss'
})
export class KpiCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() hint?: string;
  @Input() tone: 'ember' | 'mint' | 'sky' = 'ember';
}