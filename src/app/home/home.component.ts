import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewWindowComponent } from '../new-window/new-window.component';
import { TableComponent } from '../table/table.component';
import { CommonModule } from '@angular/common'; 
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TableComponent,MatDialogModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  user!: User;
  records: Record[] = []; 
  // records: Record[] = [
  //   {
  //     id: 1,
  //     documentName: 'Invoice_July_2024.pdf',
  //     documentType: 'Invoice',
  //     username: 'john_doe',
  //     mark: null,
  //     document: new File([''], 'Invoice_July_2024.pdf', { type: 'application/pdf' })
  //   },
  //   {
  //     id: 2,
  //     documentName: 'ProjectPlan_August_2024.docx',
  //     documentType: 'Project Plan',
  //     username: 'jane_smith',
  //     mark: 10,
  //     document: new File([''], 'ProjectPlan_August_2024.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  //   }
  // ];


  constructor(public dialog: MatDialog, private http: HttpClient, private route: ActivatedRoute) {} // Definiše konstruktor koji prima MatDialog

  ngOnInit(): void {
    // Preuzmi username iz URL-a
    const username = this.route.snapshot.paramMap.get('id'); 
    if (username) {
      this.getUserDetails(username).pipe(
        switchMap((userData: User) => {
          this.user = userData;
          return this.getRecords(); // Preuzmi records nakon što se korisnik učita
        }),
        catchError(error => {
          console.error('An error occurred:', error);
          return [];
        })
      ).subscribe((recordsData: Record[]) => {
        this.records = recordsData;
      });
    }
  }
  

  // Metoda za izvršavanje HTTP GET poziva za korisničke podatke
  getUserDetails(username: string): Observable<User> {
    return this.http.get<User>(`http://localhost:8080/user-details/${username}`);
  }
  
  // Metoda za izvršavanje HTTP GET poziva za records
  getRecords(): Observable<Record[]> {
    return this.http.get<Record[]>('http://localhost:8080/records');
  }


  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const newRecord: Record = {
        id: Date.now(), // Primer id-a
        documentName: file.name,
        documentType: file.type,
        username: 'someUser', // Trebalo bi da se dobije iz sesije ili korisničkog inputa
        mark:10,
        document: file
      };
      this.records.push(newRecord);
    }
  }

  openNewWindow() {
    this.dialog.open(NewWindowComponent, {
      width: '500px', // Širina dijaloga
      height: '400px', // Visina dijaloga
      autoFocus: true // Fokus na dijalog prilikom otvaranja
    });
  }
}


export interface Record {
  id: number;
  documentName: string;
  documentType: string;
  username: string;
  mark: number | null;
  document: File | null; // Polje za dokument, može biti File ili null ako dokument nije odabran
}

export interface User {
  id: number;
  username: string;
  userType: string;
}