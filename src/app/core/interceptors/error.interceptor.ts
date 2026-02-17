
import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        console.error('HTTP Error:', {
          url: req.url,
          status: err.status,
          message: err.message,
          error: err.error,
        });

        if (err.status === 401 || err.status === 403) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url },
          });
        }
      }

      return throwError(() => err);
    }),
  );
};
