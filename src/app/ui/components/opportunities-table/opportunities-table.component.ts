import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Opportunity } from '../../../domain/models/market.models';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-opportunities-table',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, PricePipe],
  templateUrl: './opportunities-table.component.html',
  styleUrl: './opportunities-table.component.scss'
})
export class OpportunitiesTableComponent {
  @Input({ required: true }) opportunities: Opportunity[] = [];
}

