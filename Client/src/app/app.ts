import { Component, signal } from '@angular/core';
import { LoginComponent } from './login/login';
import { RouterOutlet } from '@angular/router'; // Add this import


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent,RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('WalletTracker');
}
