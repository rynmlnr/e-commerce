import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-paging-header',
  templateUrl: './paging-header.component.html',
  styleUrls: ['./paging-header.component.css']
})
export class PagingHeaderComponent implements OnInit {
  @Input() pageNumber!: number;
  @Input() pageSize!: number;
  @Input() totalCount!: number;

  constructor() { }

  ngOnInit(): void {
  }

  computeDisplayCount(): string {
    return `${((this.pageNumber - 1) * this.pageSize) + 1} - 
      ${this.pageNumber * this.pageSize > this.totalCount 
        ? this.totalCount 
        : this.pageNumber * this.pageSize}
      `;
  }
}
