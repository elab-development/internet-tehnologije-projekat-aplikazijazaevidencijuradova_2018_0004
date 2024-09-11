import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-window',
  templateUrl: './new-window.component.html',
  styleUrls: ['./new-window.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule]
})
export class NewWindowComponent {
  selectedOption = 'Domaci';
  file: File | null = null;

  constructor(public dialogRef: MatDialogRef<NewWindowComponent>, private http: HttpClient) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Dodaj neki stil za vizualnu promenu prilikom dragovanja
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.file = event.dataTransfer.files[0];
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Ukloni stil za vizualnu promenu nakon dragovanja
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onUpload(): void {
    if (this.file) {
      const formData = new FormData();
      formData.append('file', this.file);

      const headers = new HttpHeaders({
        'documentType': this.selectedOption,
        'username': localStorage.getItem('username')!
      });
      console.log("formData:",formData)
      console.log("File:",this.file)

      this.http.post('http://localhost:5000/upload-file', formData, { headers }).subscribe({
        next: (response) => {
          console.log('File uploaded successfully:', response);
        },
        error: (error) => {
          console.error('Error uploading file:', error);
        }
      });
      this.dialogRef.close();
    }
  }
}
