import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export const secretSlugGuard: CanActivateFn = (route) => {
  const http   = inject(HttpClient);
  const router = inject(Router);
  const slug   = route.params['slug'] as string;

  return http.get<{ valid: boolean }>(`${environment.api.baseUrl}/admin/verify-slug/${slug}`).pipe(
    map(res => {
      if (res.valid) return true;
      router.navigate(['/']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    })
  );
};
