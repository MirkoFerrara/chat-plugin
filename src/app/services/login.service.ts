import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private userId: string | null = null;
  private token: string | null = null;

  setCredentials(userId: string, token: string) {
    this.userId = userId;
    this.token = token;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getToken(): string | null {
    return this.token;
  }
}