import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import jsQR from 'jsqr';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qr-scanner-container">
      <video #videoElement autoplay playsinline></video>
      <canvas #canvasElement></canvas>
      <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
      <div class="camera-list" *ngIf="availableCameras.length > 1">
        <select (change)="switchCamera($event)">
          <option *ngFor="let camera of availableCameras; let i = index" [value]="i">
            {{ camera.label || 'Camera ' + (i + 1) }}
          </option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .qr-scanner-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    video {
      max-width: 100%;
      height: auto;
      border: 2px solid #ccc;
      border-radius: 8px;
    }

    canvas {
      display: none;
    }

    .error-message {
      color: #e74c3c;
      background: #fdf2f2;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: 1px solid #fecaca;
      text-align: center;
    }

    .camera-list select {
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
  `]
})
export class QrScannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  availableCameras: MediaDeviceInfo[] = [];
  currentStream: MediaStream | null = null;
  isScanning = false;
  errorMessage = '';
  private isBrowser = false;
  private animationId?: number;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    // Only proceed if we're in a browser environment
    if (!this.isBrowser) {
      console.log('QR Scanner: Not in browser environment, skipping initialization');
      return;
    }

    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
      this.initializeCamera();
    }, 100);
  }

  ngOnDestroy(): void {
    this.stopScanning();
    this.stopStream();
  }

  private async initializeCamera(): Promise<void> {
    try {
      await this.getAvailableCameras();
      await this.requestCameraAccess();
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      this.errorMessage = 'Failed to initialize camera. Please check permissions.';
    }
  }

  async getAvailableCameras(): Promise<void> {
    try {
      // Check if we're in browser and APIs are available
      if (!this.isBrowser) {
        console.log('Not in browser environment');
        return;
      }

      // Check for navigator object
      if (typeof navigator === 'undefined') {
        console.warn('Navigator object not available');
        this.errorMessage = 'Camera not available in this environment';
        return;
      }

      // Check for mediaDevices API
      if (!navigator.mediaDevices) {
        console.warn('MediaDevices API not available');
        this.errorMessage = 'Camera API not supported in this browser';
        return;
      }

      // Check for enumerateDevices method
      if (!navigator.mediaDevices.enumerateDevices) {
        console.warn('enumerateDevices not available');
        this.errorMessage = 'Cannot enumerate camera devices';
        return;
      }

      console.log('Attempting to get camera devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices.filter(device => device.kind === 'videoinput');
      
      console.log(`Found ${this.availableCameras.length} camera devices`);
      
      if (this.availableCameras.length === 0) {
        this.errorMessage = 'No camera devices found';
      }

    } catch (error) {
      console.error('Error getting camera devices:', error);
      this.errorMessage = 'Error accessing camera devices';
      this.availableCameras = [];
    }
  }

  async requestCameraAccess(deviceId?: string): Promise<void> {
    try {
      // Check if we're in browser and APIs are available
      if (!this.isBrowser) {
        console.log('Not in browser environment');
        return;
      }

      // Check for navigator object
      if (typeof navigator === 'undefined') {
        console.warn('Navigator object not available');
        this.errorMessage = 'Camera not available in this environment';
        return;
      }

      // Check for mediaDevices API
      if (!navigator.mediaDevices) {
        console.warn('MediaDevices API not available');
        this.errorMessage = 'Camera API not supported in this browser';
        return;
      }

      // Check for getUserMedia method
      if (!navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia not available');
        this.errorMessage = 'Camera access not supported in this browser';
        return;
      }

      // Stop existing stream
      this.stopStream();

      console.log('Requesting camera access...');

      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } }
          : { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
      };

      this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.currentStream;
        this.videoElement.nativeElement.addEventListener('loadedmetadata', () => {
          this.startScanning();
        });
      }

      this.errorMessage = ''; // Clear any previous error messages
      console.log('Camera access granted');

    } catch (error) {
      console.error('Camera access error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          this.errorMessage = 'Camera permission denied. Please allow camera access.';
        } else if (error.name === 'NotFoundError') {
          this.errorMessage = 'No camera found. Please connect a camera.';
        } else if (error.name === 'NotSupportedError') {
          this.errorMessage = 'Camera not supported in this browser.';
        } else {
          this.errorMessage = `Camera error: ${error.message}`;
        }
      } else {
        this.errorMessage = 'Unknown camera error occurred';
      }
    }
  }

  switchCamera(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const cameraIndex = parseInt(target.value, 10);
    
    if (this.availableCameras[cameraIndex]) {
      const deviceId = this.availableCameras[cameraIndex].deviceId;
      this.requestCameraAccess(deviceId);
    }
  }

  private startScanning(): void {
    if (!this.isBrowser || this.isScanning) return;

    this.isScanning = true;
    this.scanQRCode();
  }

  private scanQRCode(): void {
    if (!this.isScanning || !this.videoElement || !this.canvasElement) {
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context || !video.videoWidth || !video.videoHeight) {
      this.animationId = requestAnimationFrame(() => this.scanQRCode());
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Check if jsQR is available
    if (typeof jsQR !== 'undefined') {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log('QR Code detected:', code.data);
        this.onQRCodeDetected(code.data);
        return; // Stop scanning after detection
      }
    } else {
      console.warn('jsQR library not available');
    }

    this.animationId = requestAnimationFrame(() => this.scanQRCode());
  }

  private onQRCodeDetected(data: string): void {
    // Handle the detected QR code data
    console.log('QR Code Data:', data);
    // Add your QR code handling logic here
  }

  private stopScanning(): void {
    this.isScanning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  private stopStream(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
  }

  // Public method to check if camera is available
  public isCameraAvailable(): boolean {
    return this.isBrowser && 
           typeof navigator !== 'undefined' && 
           !!navigator.mediaDevices && 
           !!navigator.mediaDevices.getUserMedia;
  }
}