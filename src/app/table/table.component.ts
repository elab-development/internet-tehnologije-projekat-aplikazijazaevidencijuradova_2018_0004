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
  serverResponse: string | null = null;

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit(){
  }

  rateRecord(record: Record, event: Event): void {
    event.stopPropagation();
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

  deleteRecord(record: Record, event: Event): void {
    event.stopPropagation();
    const headers = { 'username': localStorage.getItem('username') || '' };
    this.http.delete(`http://localhost:5000/records/${record.documentName}`, { headers, responseType: 'json' })
    .subscribe(response => {
      console.log('Record deleted successfully:', response);
      // Ažuriraj listu zapisa ili obavi neku dodatnu radnju
    }, error => {
      console.error('Error deleting record:', error);
    });
  }

  

  viewDocument(record: Record): void {
    const headers = { 'username': localStorage.getItem('username') || '' };
    this.http.get(`http://localhost:5000/records/${record.documentName}`, { headers, responseType: 'blob' })
      .subscribe(response => {
        const url = window.URL.createObjectURL(response);
        window.open(url);
      }, error => {
        console.error('Error fetching document:', error);
      });
  }

  checkDocument(record: Record, event: Event): void {
    event.stopPropagation();
    const headers = {
      'username': localStorage.getItem('username') || '',
      'documentName': record.documentName
    };
  
    this.http.get(`http://localhost:5000/record/check`, { headers })
      .subscribe(response => {
        const responseMessage = JSON.stringify(response, null, 2);
        this.serverResponse = responseMessage
      }, error => {
        console.error('Greška prilikom provere dokumenta:', error);
        alert('Došlo je do greške prilikom provere dokumenta.');
      });
  }

}
