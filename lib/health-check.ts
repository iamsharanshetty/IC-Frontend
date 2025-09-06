// Health check utilities for the FastAPI backend

import { apiClient, ApiError } from './api'

export interface HealthStatus {
  isHealthy: boolean
  message: string
  version?: string
  error?: string
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const healthResponse = await apiClient.getHealth()
    const statusResponse = await apiClient.getStatus()
    
    return {
      isHealthy: true,
      message: `Backend is healthy - ${statusResponse.message}`,
      version: healthResponse.version
    }
  } catch (error) {
    console.error('Backend health check failed:', error)
    
    if (error instanceof ApiError) {
      return {
        isHealthy: false,
        message: `Backend error: ${error.message}`,
        error: error.message
      }
    }
    
    return {
      isHealthy: false,
      message: 'Cannot connect to backend server',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export function useHealthCheck() {
  // This could be expanded to a React hook for real-time health monitoring
  return { checkBackendHealth }
}