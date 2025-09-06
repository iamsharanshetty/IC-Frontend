// FIXED API client for FastAPI backend integration
// Resolved connection issues and API mapping problems

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://asv-8ghi.onrender.com";

// Add timeout and retry logic
const FETCH_TIMEOUT = 30000; // 30 seconds for document analysis
const UNIVERSITY_TIMEOUT = 100000; // 15 seconds for university search
const MAX_RETRIES = 2;

// Types for Document Analysis (existing functionality)
export interface ApiSummary {
  total_claims: number;
  processing_time_seconds: number;
  document_name: string;
  timestamp: string;
  analysis_mode?: string; // Added from backend
}

export interface ApiClaim {
  claim_text: string;
  category: "Financial" | "Operational" | "Legal & Compliance" | "ESG";
  verdict:
    | "Confirmed"
    | "Supported"
    | "Contradicted"
    | "Unverifiable"
    | "Unsupported";
  evidence_summary: string;
  verdict_reasoning: string;
  source_context: string;
  trustScore?: number; // Added - backend may include this
  web_evidence?: Array<{
    title: string;
    url: string;
    snippet: string;
    source_type: string;
    relevance_score: number;
  }>; // Added from backend
  metadata: {
    source: string;
    source_chunk_id: number;
    claim_type?: string;
    extracted_value?: string;
    confidence?: string;
    analysis_method?: string;
  };
}

export interface ApiAnalysisResponse {
  summary: ApiSummary;
  claims: ApiClaim[];
}

// Types for University Reviews (updated to match backend exactly)
export interface UniversityReview {
  content: string;
  rating?: string; // Backend returns string, not number
  source?: string;
  date?: string;
  author?: string;
  sentiment?: string; // Added from backend
  url?: string;
  platform?: string;
  review_type?: string;
  date_found?: string;
  complaints?: string[];
  relevance_score?: number;
}

export interface ReviewSummary {
  total_negative_reviews: number;
  total_positive_reviews: number;
  average_rating: number;
  common_complaints: Array<{ category: string; frequency: number }> | string[]; // Backend format
  common_praises?: Array<{ category: string; frequency: number }>;
}

export interface NIRFRanking {
  ranking?: number;
  category?: string;
  year?: string; // Backend returns string
  verified?: boolean;
  note?: string;
  source?: string;
  source_url?: string;
  source_title?: string;
}

export interface ReviewSource {
  title: string;
  url: string;
  reviews_count?: number; // Optional in backend
  type?: string;
  platform?: string;
  search_query?: string;
}

export interface UniversityReviewsResponse {
  university_name: string;
  nirf_ranking?: NIRFRanking | null;
  negative_reviews: UniversityReview[];
  positive_reviews: UniversityReview[];
  review_summary: ReviewSummary;
  sources: ReviewSource[];
  analysis_timestamp: string;
  search_status:
    | "success"
    | "partial_success"
    | "search_failed"
    | "service_unavailable"
    | "no_data_found"
    | "error";
  error?: string;
  message?: string;
  suggestions?: string[];
  api_version?: string;
  search_method?: string;
  processing_time?: number;
  debug_info?: {
    web_search_available: boolean;
    search_attempts: number;
    errors: string[];
    scraped_platforms?: string[];
  };
}

// Frontend types (existing UI structure)
export interface Claim {
  id: string;
  text: string;
  category: "Financial" | "Operational" | "Legal & Compliance" | "ESG";
  consistency: "Supported" | "Contradicted" | "Unverifiable" | "Unsupported";
  trustScore: number;
  explanation: string;
  evidence: Evidence[];
  pageNumber?: number;
  reviewStatus?: "pending" | "approved" | "rejected" | "needs-review";
  reviewNotes?: string;
  reviewReason?: string;
}

export interface Evidence {
  id: string;
  text: string;
  source: string;
  url: string;
  relevanceScore: number;
}

export interface AnalysisResult {
  summary: {
    totalClaims: number;
    processingTime: number;
    documentName: string;
    timestamp: string;
    analysisMode?: string;
  };
  claims: Claim[];
}

// API Error types
export class ApiError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Utility function for fetch with timeout and retry
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
  retries: number = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (attempt === retries) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new ApiError(
            `Request timeout after ${timeout / 1000} seconds`,
            408
          );
        }
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw new Error("Maximum retries exceeded");
}

// API client functions
export const apiClient = {
  // Health check endpoints
  async getHealth(): Promise<{ message: string; version?: string }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/`,
        { method: "GET" },
        5000, // 5 second timeout for health check
        1 // Only 1 retry for health check
      );

      if (!response.ok) {
        throw new ApiError("Failed to connect to API", response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Cannot connect to backend server", 0);
    }
  },

  async getStatus(): Promise<{
    status: string;
    message: string;
    services?: any;
    analysis_mode?: string;
    endpoints?: string[];
  }> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/status`,
        { method: "GET" },
        5000,
        1
      );

      if (!response.ok) {
        throw new ApiError("Failed to get server status", response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Cannot get server status", 0);
    }
  },

  // File analysis endpoint (FIXED)
  async analyzeDocument(file: File): Promise<ApiAnalysisResponse> {
    console.log(`Starting analysis for: ${file.name} (${file.size} bytes)`);

    try {
      // Convert file to base64 for backend processing
      const fileBuffer = await file.arrayBuffer();
      const base64Content = btoa(
        String.fromCharCode(...new Uint8Array(fileBuffer))
      );

      // Determine file type - FIXED to match backend expectations
      const fileType = file.type === "application/pdf" ? "pdf" : "txt";

      // FIXED: Match exact backend request structure
      const requestBody = {
        filename: file.name,
        content: base64Content,
        file_type: fileType,
      };

      console.log(`Sending ${fileType} file to ${API_BASE_URL}/analyze`);

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        },
        FETCH_TIMEOUT
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Analysis failed:", errorData);

        throw new ApiError(
          errorData.detail ||
            errorData.error ||
            `Analysis failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      const responseData = await response.json();
      console.log("Analysis successful:", responseData.summary);

      // Validate response structure
      if (!responseData.summary || !responseData.claims) {
        throw new ApiError("Invalid response structure from backend", 500);
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if (error instanceof Error && error.message.includes("timeout")) {
        throw new ApiError(
          "Analysis timeout - please try with a smaller document",
          408
        );
      }

      console.error("Document analysis error:", error);
      throw new ApiError(
        `Analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },

  // University reviews endpoint (FIXED)
  async searchUniversityReviews(
    universityName: string
  ): Promise<UniversityReviewsResponse> {
    if (!universityName.trim()) {
      throw new ApiError("University name is required", 400);
    }

    if (universityName.length < 3) {
      throw new ApiError(
        "University name must be at least 3 characters long",
        400
      );
    }

    console.log(`Searching reviews for: ${universityName}`);

    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/university-reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            university_name: universityName.trim(),
            include_debug: false,
          }),
        },
        UNIVERSITY_TIMEOUT
      );

      const responseData = await response.json();
      console.log("University search response:", responseData.search_status);

      // FIXED: Don't throw error for non-200 status if we got valid data
      if (!response.ok && !responseData.search_status) {
        throw new ApiError(
          responseData.detail ||
            responseData.error ||
            `Request failed with status ${response.status}`,
          response.status,
          responseData
        );
      }

      // FIXED: Handle all backend response scenarios properly
      const normalizedResponse: UniversityReviewsResponse = {
        university_name: responseData.university_name || universityName,
        nirf_ranking: responseData.nirf_ranking || null,
        negative_reviews: Array.isArray(responseData.negative_reviews)
          ? responseData.negative_reviews
          : [],
        positive_reviews: Array.isArray(responseData.positive_reviews)
          ? responseData.positive_reviews
          : [],
        review_summary: {
          total_negative_reviews:
            responseData.review_summary?.total_negative_reviews || 0,
          total_positive_reviews:
            responseData.review_summary?.total_positive_reviews || 0,
          average_rating: responseData.review_summary?.average_rating || 0,
          common_complaints:
            responseData.review_summary?.common_complaints || [],
          common_praises: responseData.review_summary?.common_praises || [],
        },
        sources: Array.isArray(responseData.sources)
          ? responseData.sources
          : [],
        analysis_timestamp:
          responseData.analysis_timestamp || new Date().toISOString(),
        search_status: responseData.search_status || "success",
        error: responseData.error,
        message: responseData.message,
        suggestions: responseData.suggestions,
        api_version: responseData.api_version,
        search_method: responseData.search_method,
        processing_time: responseData.processing_time,
        debug_info: responseData.debug_info,
      };

      return normalizedResponse;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new ApiError("University search timeout - please try again", 408);
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new ApiError(
          "Unable to connect to the server. Please check your internet connection.",
          0
        );
      }

      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        throw new ApiError("Invalid response format from server", 500);
      }

      // Unknown errors
      console.error("University search error:", error);
      throw new ApiError(
        `Unexpected error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  },
};

// FIXED: Utility functions to map API response to frontend types
export function mapApiResponseToFrontend(
  apiResponse: ApiAnalysisResponse
): AnalysisResult {
  console.log("Mapping backend response to frontend format");

  // Validate the response structure
  if (!apiResponse || typeof apiResponse !== "object") {
    throw new Error("Invalid API response: Response is not an object");
  }

  if (!apiResponse.summary) {
    throw new Error("Invalid API response: Missing summary field");
  }

  if (!apiResponse.claims || !Array.isArray(apiResponse.claims)) {
    throw new Error("Invalid API response: Missing or invalid claims array");
  }

  const claims: Claim[] = apiResponse.claims.map((apiClaim, index) => {
    // FIXED: Handle both "Confirmed" and "Supported" from backend
    const consistencyMap: Record<string, Claim["consistency"]> = {
      Confirmed: "Supported",
      Supported: "Supported",
      Contradicted: "Contradicted",
      Unverifiable: "Unverifiable",
      Unsupported: "Unsupported",
    };

    // FIXED: Use trustScore from backend if available, otherwise calculate
    let trustScore = 50; // default
    if (apiClaim.trustScore && typeof apiClaim.trustScore === "number") {
      trustScore = apiClaim.trustScore;
    } else {
      // Fallback calculation based on verdict
      const trustScoreMap: Record<string, number> = {
        Confirmed: Math.floor(Math.random() * 16) + 80, // 80-95
        Supported: Math.floor(Math.random() * 16) + 75, // 75-90
        Contradicted: Math.floor(Math.random() * 21) + 10, // 10-30
        Unverifiable: Math.floor(Math.random() * 21) + 40, // 40-60
        Unsupported: Math.floor(Math.random() * 21) + 25, // 25-45
      };
      trustScore = trustScoreMap[apiClaim.verdict] || 50;
    }

    // FIXED: Create evidence from both evidence_summary and web_evidence
    const evidence: Evidence[] = [
      {
        id: `evidence-${index}-1`,
        text: apiClaim.evidence_summary,
        source: apiClaim.metadata.source,
        url: "#",
        relevanceScore: 85,
      },
    ];

    // Add web evidence if available
    if (apiClaim.web_evidence && Array.isArray(apiClaim.web_evidence)) {
      apiClaim.web_evidence.slice(0, 3).forEach((webEv, webIndex) => {
        evidence.push({
          id: `evidence-${index}-web-${webIndex}`,
          text: webEv.snippet,
          source: webEv.title,
          url: webEv.url || "#",
          relevanceScore: webEv.relevance_score || 75,
        });
      });
    }

    return {
      id: `claim-${index}`,
      text: apiClaim.claim_text,
      category: apiClaim.category,
      consistency: consistencyMap[apiClaim.verdict] || "Unverifiable",
      trustScore,
      explanation: apiClaim.verdict_reasoning,
      evidence,
      pageNumber: (apiClaim.metadata.source_chunk_id || 0) + 1,
      reviewStatus: "pending",
    };
  });

  return {
    summary: {
      totalClaims: apiResponse.summary.total_claims,
      processingTime: apiResponse.summary.processing_time_seconds,
      documentName: apiResponse.summary.document_name,
      timestamp: apiResponse.summary.timestamp,
      analysisMode: apiResponse.summary.analysis_mode,
    },
    claims,
  };
}

// FIXED: File validation utilities
export function validateFile(file: File): string | null {
  const allowedTypes = ["application/pdf", "text/plain"];
  const allowedExtensions = [".pdf", ".txt"];

  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension = allowedExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidType && !hasValidExtension) {
    return "Invalid file type. Please upload PDF or TXT files only.";
  }

  // Increased file size limit to match backend capabilities
  if (file.size > 100 * 1024 * 1024) {
    // 100MB limit
    return "File size too large. Please upload files smaller than 100MB.";
  }

  if (file.size === 0) {
    return "File is empty. Please upload a file with content.";
  }

  return null;
}

// University Reviews utility functions (existing)
export function validateUniversityName(name: string): string | null {
  if (!name || typeof name !== "string") {
    return "University name is required";
  }

  const trimmed = name.trim();

  if (trimmed.length < 3) {
    return "University name must be at least 3 characters long";
  }

  if (trimmed.length > 200) {
    return "University name is too long";
  }

  // More permissive regex for international university names
  if (!/^[a-zA-Z0-9\s\-\.\,\&\(\)\'\"]+$/.test(trimmed)) {
    return "University name contains invalid characters";
  }

  return null;
}

export function formatUniversityName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// Test function for debugging connection issues
export async function testBackendConnection(): Promise<{
  health: boolean;
  status: boolean;
  message: string;
  details: any;
}> {
  const result = {
    health: false,
    status: false,
    message: "Connection test failed",
    details: {} as any,
  };

  try {
    console.log(`Testing connection to: ${API_BASE_URL}`);

    // Test health endpoint
    try {
      const health = await apiClient.getHealth();
      result.health = true;
      result.details.health = health;
      console.log("Health check: OK");
    } catch (error) {
      result.details.healthError =
        error instanceof Error ? error.message : "Unknown health error";
      console.error("Health check failed:", result.details.healthError);
    }

    // Test status endpoint
    try {
      const status = await apiClient.getStatus();
      result.status = true;
      result.details.status = status;
      console.log("Status check: OK");
    } catch (error) {
      result.details.statusError =
        error instanceof Error ? error.message : "Unknown status error";
      console.error("Status check failed:", result.details.statusError);
    }

    if (result.health && result.status) {
      result.message = "Backend connection successful";
    } else if (result.health) {
      result.message = "Partial connection - health OK, status failed";
    } else if (result.status) {
      result.message = "Partial connection - status OK, health failed";
    } else {
      result.message = "Complete connection failure";
    }
  } catch (error) {
    result.details.testError =
      error instanceof Error ? error.message : "Unknown test error";
    console.error("Connection test error:", result.details.testError);
  }

  return result;
}

// Convenience exports
export const { searchUniversityReviews, analyzeDocument } = apiClient;
