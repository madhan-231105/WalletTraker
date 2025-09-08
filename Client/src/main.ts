import 'zone.js';   // ✅ must be first
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes)  // ✅ This is required
  ]
}).catch(err => console.error(err));
