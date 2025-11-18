import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs'; 
import { environment } from '../../environments/environment';

export interface UserRest {
  id: string;
  email: string;
  username: string; 
  password: string;
}
@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = environment.apiUrl;
  private userId: string | null = null;
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  configureUrl(apiUrl: string): void {
    this.baseUrl = apiUrl;
  }

  // ⭐ NUOVO: Configura auth
  configureAuth(userId: string, token: string): void {
    this.userId = userId;
    this.token = token;
  }

  readUser(id: string, include?: string): Observable<UserRest> {
    const params = include ? `?include=${include}` : '';
    return this.http.get<UserRest>(`${this.baseUrl}/user/read/${id}${params}`, {
      headers: this.getAuthHeaders()  // ⭐ USA HEADERS
    }).pipe(
      catchError(err => {
        console.error('Errore HTTP:', err);
        return throwError(() => new Error('Errore nel recupero del profilo'));
      })
    );
  }

  getAllUsers(page: number = 0, limit: number = 20): Observable<UserRest[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    const headers = this.getAuthHeaders();
    
    // ⭐ AGGIUNGI QUESTI LOG
    console.log('🔐 UserService - userId:', this.userId);
    console.log('🔐 UserService - token:', this.token ? '***' : 'null');
    console.log('🔐 UserService - headers:', headers.keys());
    
    const url = `${this.baseUrl}/user/readAll`;
    console.log('🌐 UserService - Chiamata a:', url);

    return this.http.get<UserRest[]>(url, { 
      params,
      headers  // ⭐ USA HEADERS
    }).pipe(
      catchError(err => {
        console.error('Errore HTTP:', err);
        return throwError(() => new Error('Errore nel recupero della lista utenti'));
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    
    console.log('🔧 getAuthHeaders - userId:', this.userId);
    console.log('🔧 getAuthHeaders - token:', this.token ? '***' : 'null');
    
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
      console.log('✅ Header Authorization aggiunto');
    }
    
    if (this.userId) {
      headers = headers.set('UserId', this.userId);
      console.log('✅ Header UserId aggiunto:', this.userId);
    }
    
    return headers;
  }
}