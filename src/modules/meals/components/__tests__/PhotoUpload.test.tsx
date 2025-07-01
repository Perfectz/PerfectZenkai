import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoUpload } from '../PhotoUpload';

vi.mock('browser-image-compression', () => ({
  __esModule: true,
  default: vi.fn(async (file) => {
    // Mock compression: return a dummy compressed base64 string
    return Promise.resolve('data:image/jpeg;base64,mock-compressed-image-data');
  }),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('PhotoUpload Component', () => {
  const mockOnPhotoCapture = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render photo upload button', () => {
    render(<PhotoUpload onPhotoCapture={mockOnPhotoCapture} />);
    
    expect(screen.getByText(/take photo/i)).toBeInTheDocument();
    expect(screen.getByText(/upload photo/i)).toBeInTheDocument();
  });

  test('should capture photo from camera', async () => {
    // Mock camera API
    const mockStream = {
      getTracks: vi.fn(() => [{ stop: vi.fn() }])
    };
    
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(mockStream)
    } as MediaDevices;

    // Mock video and canvas elements that useRef will return
    const mockVideoElement = {
      videoWidth: 640,
      videoHeight: 480,
      play: vi.fn(),
      srcObject: null,
    };
    const mockCanvasElement = {
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
      })),
      toBlob: vi.fn((callback) => {
        callback(new Blob(['mock-blob-data'], { type: 'image/jpeg' }));
      }),
    };

    // Mock useRef to return our mock elements in the correct order
    vi.spyOn(React, 'useRef')
      .mockReturnValueOnce({ current: null }) // For fileInputRef
      .mockReturnValueOnce({ current: mockVideoElement }) // For videoRef
      .mockReturnValueOnce({ current: mockCanvasElement }); // For canvasRef

    render(<PhotoUpload onPhotoCapture={mockOnPhotoCapture} />);
    
    const cameraButton = screen.getByText(/take photo/i);
    fireEvent.click(cameraButton);
    
    await waitFor(() => {
      expect(mockOnPhotoCapture).toHaveBeenCalledWith(
        expect.stringMatching(/^data:image\/jpeg;base64,/),
      );
    });
  });

  test('should handle file upload', async () => {
    render(<PhotoUpload onPhotoCapture={mockOnPhotoCapture} />);
    
    const fileInput = screen.getByLabelText(/upload photo/i);
    const file = new File(['fake-image-data'], 'meal.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnPhotoCapture).toHaveBeenCalledWith(
        expect.stringMatching(/^data:image\/jpeg;base64,/),
      );
    });
  });

  test('should compress image for API efficiency', async () => {
    render(<PhotoUpload onPhotoCapture={mockOnPhotoCapture} maxSizeMB={1} />);
    
    // Create a large fake image file (2MB)
    const largeImageData = 'x'.repeat(2 * 1024 * 1024);
    const file = new File([largeImageData], 'large-meal.jpg', { type: 'image/jpeg' });
    
    const fileInput = screen.getByLabelText(/upload photo/i);
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const capturedData = mockOnPhotoCapture.mock.calls[0][0];
      const sizeInMB = (capturedData.length * 0.75) / (1024 * 1024); // Base64 is ~33% larger
      expect(sizeInMB).toBeLessThan(1);
    });
  });

  test('should show loading state during processing', async () => {
    render(<PhotoUpload onPhotoCapture={mockOnPhotoCapture} />);
    
    const file = new File(['fake-image-data'], 'meal.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/upload photo/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });
});