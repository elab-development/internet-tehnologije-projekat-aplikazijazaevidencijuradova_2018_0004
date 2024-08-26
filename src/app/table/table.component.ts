import { Component,Input,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Record } from "../home/home.component";
import { MatDialog } from '@angular/material/dialog';
import { RateRecordComponent } from '../rate-record/rate-record.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {
  @Input() records: Record[] = [];
  @Input() userType: string | undefined= '';

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit(){
  }

  rateRecord(record: Record): void {
    const dialogRef = this.dialog.open(RateRecordComponent, {
      width: '400px',
      height: '300px',
      data: {
        documentName: record.documentName,
        username: record.username
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Document ${record.documentName} rated with ${result}`);
      }
    });
  }

  viewDocument(record: Record): void {
    this.http.get(`http://localhost:8080/records/${record.documentName}`, { responseType: 'blob' })
      .subscribe(response => {
        const url = window.URL.createObjectURL(response);
        window.open(url);
      }, error => {
        console.error('Error fetching document:', error);
      });
  }

}
