import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs'; 
import { environment } from '../../environments/environment';

export interface UserRest {
  id: string;
  email: string;
  username: string; 
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  // ✅ URL configurabile
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * ⭐ NUOVO: Configura URL a runtime
   */
  configureUrl(apiUrl: string): void {
    console.log('🔧 UserService - Configurazione URL:', apiUrl);
    this.baseUrl = apiUrl;
  }

  readUser(id: string, include?: string): Observable<UserRest> {
    const params = include ? `?include=${include}` : '';
    return this.http.get<UserRest>(`${this.baseUrl}/user/read/${id}${params}`).pipe(
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

    return this.http.get<UserRest[]>(`${this.baseUrl}/user/readAll`, { params }).pipe(
      catchError(err => {
        console.error('Errore HTTP:', err);
        return throwError(() => new Error('Errore nel recupero della lista utenti'));
      })
    );
  }
}