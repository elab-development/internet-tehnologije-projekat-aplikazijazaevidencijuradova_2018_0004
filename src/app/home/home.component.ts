import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewWindowComponent } from '../new-window/new-window.component';
import { TableComponent } from '../table/table.component';
import { CommonModule } from '@angular/common'; 
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TableComponent,MatDialogModule, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  user!: User;
  records: Record[] = []; 

  searchDocumentType: string = '';
  searchUsername: string = '';
  searchMark: number | null = null;

  constructor(public dialog: MatDialog, private http: HttpClient, private route: ActivatedRoute) {} // Definiše konstruktor koji prima MatDialog

  ngOnInit(): void {
    // Preuzmi username iz URL-a
    const username = this.route.snapshot.paramMap.get('id'); 
    if (username) {
      this.getUserDetails(username).pipe(
        switchMap((userData: User) => {
          this.user = userData;
          return this.getRecords(this.user.username); // Preuzmi records nakon što se korisnik učita
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
    return this.http.get<User>(`http://localhost:5000/user-details/${username}`);
  }

  searchRecords() {
    const filters = {
      documentType: this.searchDocumentType,
      username: this.searchUsername,
      mark: this.searchMark
    };

    this.getRecords(this.user.username, filters).subscribe((recordsData: Record[]) => {
      this.records = recordsData;
    });
  }
  
  // Metoda za izvršavanje HTTP GET poziva za records
  getRecords(username: string, filters?: any): Observable<Record[]> {
    let headers = new HttpHeaders({
      'username': username
    });
    if (filters) {
      if (filters.documentType) headers = headers.set('documentType', filters.documentType);
      if (filters.username) headers = headers.set('filterUsername', filters.username);
      if (filters.mark) headers = headers.set('mark', filters.mark.toString());
    }
  
    return this.http.get<Record[]>('http://localhost:5000/records', { headers });
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