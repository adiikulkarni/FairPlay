import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { RequestLoaderService } from './services/request-loader.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(RequestLoaderService);

  loader.start();
  return next(req).pipe(finalize(() => loader.stop()));
};
