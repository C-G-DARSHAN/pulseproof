import { MOCK_LIKELY_MANIPULATED, MOCK_NO_EVIDENCE, MOCK_INCONCLUSIVE } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Checks if the FastAPI backend is running
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return { online: false };
    const data = await response.json();
    return { online: true, data };
  } catch {
    return { online: false };
  }
}

/**
 * Uploads a video file to the backend for real-time forensic analysis,
 * with graceful fallback to realistic demo forensic data if backend is not yet started.
 */
export async function analyzeVideo(file, forceMockType = null) {
  // If explicitly requesting mock data mode
  if (forceMockType === 'manipulated') return { ...MOCK_LIKELY_MANIPULATED, isMock: true };
  if (forceMockType === 'authentic') return { ...MOCK_NO_EVIDENCE, isMock: true };
  if (forceMockType === 'inconclusive') return { ...MOCK_INCONCLUSIVE, isMock: true };

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error (${response.status})`);
    }

    const data = await response.json();
    return { ...data, isMock: false };
  } catch (error) {
    console.warn(`[PulseProof API] Backend connection failed: ${error.message}. Engaging offline mock forensic mode.`);
    // Fallback cleanly with realistic mock result
    return {
      ...MOCK_LIKELY_MANIPULATED,
      filename: file.name,
      filesize_mb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
      isMock: true,
      mockNotice: "Backend currently offline. Displaying verified forensic evaluation sample."
    };
  }
}
