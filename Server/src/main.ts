import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app/app';
import { routes } from './app/app.routes'; // Import your routes

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // This is crucial - provides your routes to the app
    provideHttpClient(),
    importProvidersFrom(ReactiveFormsModule)
  ]
}).catch(err => console.error(err));