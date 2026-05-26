import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Only prefix relative URLs
  const apiReq = req.url.startsWith('http')
    ? req
    : req.clone({ url: `${environment.apiUrl}/${req.url}` });

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.message ?? 'Something went wrong. Please try again.';
      console.error('[ACTrader API Error]', error.status, message);
      return throwError(() => new Error(message));
    })
  );
};
