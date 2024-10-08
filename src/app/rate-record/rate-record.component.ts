import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rate-record',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatButtonModule],
  templateUrl: './rate-record.component.html',
  styleUrl: './rate-record.component.css'
})
export class RateRecordComponent {
  selectedRating: number | null = null;
  documentName: string;
  username: string;
  
  constructor(
    public dialogRef: MatDialogRef<RateRecordComponent>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: { documentName: string; username: string }
  ) {
    this.documentName = data.documentName;
    this.username = data.username;
  }

  rate(): void {
    if (this.selectedRating) {
      const ratingData = {
        documentName: this.documentName,
        user: this.username,
        mark: this.selectedRating
      };
  
      this.http.post('http://localhost:5000/record/rate', ratingData).subscribe(
        response => {
          console.log('Rating submitted successfully:', response);
        },
        error => {
          console.error('Error submitting rating:', error);
        }
      );
      this.dialogRef.close(this.selectedRating);
    } else {
      alert('Please select a rating before submitting.');
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}