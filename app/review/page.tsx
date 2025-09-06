"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Save,
  Send,
  Eye,
  EyeOff,
} from "lucide-react"
import { type AnalysisResult } from "@/lib/api"

interface Claim {
  id: string
  text: string
  category: "Financial" | "Operational" | "Legal & Compliance" | "ESG"
  consistency: "Supported" | "Contradicted" | "Unverifiable" | "Unsupported"
  trustScore: number
  explanation: string
  evidence: Evidence[]
  web_evidence?: WebEvidence[]
  pageNumber?: number
  reviewStatus?: "pending" | "approved" | "rejected" | "needs-review"
  reviewNotes?: string
  reviewReason?: string
}

interface WebEvidence {
  title: string
  url: string
  snippet: string
  source_type: string
  relevance_score: number
  search_query: string
}

interface Evidence {
  id: string
  text: string
  source: string
  url: string
  relevanceScore: number
}

interface ReviewSummary {
  totalClaims: number
  reviewed: number
  approved: number
  rejected: number
  needsReview: number
}

export default function ReviewPage() {
  const router = useRouter()
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [claims, setClaims] = useState<Claim[]>([])

  // Load analysis result from localStorage
  useEffect(() => {
    try {
      const storedResult = localStorage.getItem('analysisResult')
      if (storedResult) {
        const result: AnalysisResult = JSON.parse(storedResult)
        setAnalysisResult(result)
        setClaims(result.claims)
      } else {
        // If no data found, redirect to upload page
        console.log('❌ No analysis result found in localStorage')
        router.push('/upload')
        return
      }
    } catch (error) {
      console.error('Failed to load analysis result:', error)
      router.push('/upload')
      return
    }
    setIsLoading(false)
  }, [router])

  // Show loading state
  if (isLoading || !analysisResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analysis results...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Remove the old hardcoded claims and replace with empty array since we're loading from localStorage
  const oldClaims = [
    {
      id: "1",
      text: "Our company reduced carbon emissions by 25% in 2023 compared to 2022 baseline.",
      category: "Environmental",
      consistency: "Supported",
      trustScore: 85,
      explanation:
        "This claim is supported by EPA emissions data showing a 24.8% reduction in reported carbon emissions for the company's facilities between 2022 and 2023.",
      evidence: [
        {
          id: "e1",
          text: "EPA Facility Level Information on GreenHouse gases Tool shows 24.8% reduction in CO2 emissions",
          source: "EPA FLIGHT Database",
          url: "https://ghgdata.epa.gov/ghgp/main.do",
          relevanceScore: 95,
        },
      ],
      pageNumber: 12,
      reviewStatus: "pending",
    },
    {
      id: "2",
      text: "We achieved a 40% increase in renewable energy usage across all facilities.",
      category: "Environmental",
      consistency: "Contradicted",
      trustScore: 25,
      explanation:
        "This claim is contradicted by energy consumption data which shows only a 15% increase in renewable energy usage, significantly lower than the claimed 40%.",
      evidence: [
        {
          id: "e3",
          text: "Energy Information Administration data shows 15.2% increase in renewable energy consumption",
          source: "EIA Monthly Energy Review",
          url: "https://www.eia.gov/totalenergy/data/monthly/",
          relevanceScore: 92,
        },
      ],
      pageNumber: 15,
      reviewStatus: "pending",
    },
    {
      id: "3",
      text: "Our research team published 45 peer-reviewed papers in top-tier journals in 2023.",
      category: "Academic",
      consistency: "Supported",
      trustScore: 92,
      explanation:
        "This claim is well-supported by publication databases showing exactly 45 peer-reviewed publications from the organization's researchers in 2023.",
      evidence: [
        {
          id: "e4",
          text: "PubMed database shows 45 publications with institutional affiliation in 2023",
          source: "PubMed/MEDLINE",
          url: "https://pubmed.ncbi.nlm.nih.gov/",
          relevanceScore: 98,
        },
      ],
      pageNumber: 8,
      reviewStatus: "approved",
      reviewNotes: "Excellent verification with multiple database sources.",
    },
  ]

  const [currentClaimIndex, setCurrentClaimIndex] = useState(0)
  const [showEvidence, setShowEvidence] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [overallFeedback, setOverallFeedback] = useState("")

  const currentClaim = claims[currentClaimIndex]

  const reviewSummary: ReviewSummary = {
    totalClaims: claims.length,
    reviewed: claims.filter((c) => c.reviewStatus !== "pending").length,
    approved: claims.filter((c) => c.reviewStatus === "approved").length,
    rejected: claims.filter((c) => c.reviewStatus === "rejected").length,
    needsReview: claims.filter((c) => c.reviewStatus === "needs-review").length,
  }

  const updateClaimReview = (
    claimId: string,
    status: "approved" | "rejected" | "needs-review",
    notes?: string,
    reason?: string,
  ) => {
    setClaims((prev) =>
      prev.map((claim) =>
        claim.id === claimId
          ? {
              ...claim,
              reviewStatus: status,
              reviewNotes: notes || claim.reviewNotes,
              reviewReason: reason || claim.reviewReason,
            }
          : claim,
      ),
    )
  }

  const getConsistencyIcon = (consistency: string) => {
    switch (consistency) {
      case "Supported":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Contradicted":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "Unverifiable":
        return <HelpCircle className="h-4 w-4 text-gray-600" />
      case "Unsupported":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getConsistencyColor = (consistency: string) => {
    switch (consistency) {
      case "Supported":
        return "bg-green-100 text-green-800"
      case "Contradicted":
        return "bg-red-100 text-red-800"
      case "Unverifiable":
        return "bg-gray-100 text-gray-800"
      case "Unsupported":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getReviewStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "needs-review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const handleQuickAction = (action: "approved" | "rejected" | "needs-review") => {
    updateClaimReview(currentClaim.id, action)
    if (currentClaimIndex < claims.length - 1) {
      setCurrentClaimIndex(currentClaimIndex + 1)
    }
  }

  const handleSubmitReview = async () => {
    setIsSubmitting(true)
    
    // Update the analysis result with review data and save back to localStorage
    if (analysisResult) {
      const updatedResult = {
        ...analysisResult,
        claims: claims
      }
      localStorage.setItem('analysisResult', JSON.stringify(updatedResult))
    }
    
    // Simulate API call for submitting review feedback
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    router.push("/reports")
  }

  const progressPercentage = (reviewSummary.reviewed / reviewSummary.totalClaims) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review & Annotate Claims</h1>
          <p className="text-gray-600">
            Review AI-generated assessments and provide feedback to improve accuracy and reliability.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Review Progress Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completed</span>
                    <span>
                      {reviewSummary.reviewed}/{reviewSummary.totalClaims}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="font-bold text-green-600">{reviewSummary.approved}</div>
                    <div className="text-green-700">Approved</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <div className="font-bold text-red-600">{reviewSummary.rejected}</div>
                    <div className="text-red-700">Rejected</div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-2 rounded text-center text-sm">
                  <div className="font-bold text-yellow-600">{reviewSummary.needsReview}</div>
                  <div className="text-yellow-700">Needs Review</div>
                </div>
              </CardContent>
            </Card>

            {/* Claims Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Claims List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {claims.map((claim, index) => (
                    <button
                      key={claim.id}
                      onClick={() => setCurrentClaimIndex(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        index === currentClaimIndex
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Claim {index + 1}</span>
                        {claim.reviewStatus && claim.reviewStatus !== "pending" && (
                          <Badge className={getReviewStatusColor(claim.reviewStatus)}>
                            {claim.reviewStatus === "needs-review" ? "Review" : claim.reviewStatus}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{claim.text}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Review Interface */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Claim */}
            <Card
              className={
                currentClaim.consistency === "Contradicted" || currentClaim.consistency === "Unsupported"
                  ? "border-red-200"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span>
                      Claim {currentClaimIndex + 1} of {claims.length}
                    </span>
                    {currentClaim.pageNumber && <Badge variant="outline">Page {currentClaim.pageNumber}</Badge>}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getConsistencyColor(currentClaim.consistency)}>
                      {getConsistencyIcon(currentClaim.consistency)}
                      <span className="ml-1">{currentClaim.consistency}</span>
                    </Badge>
                    <div className={`text-lg font-bold ${getTrustScoreColor(currentClaim.trustScore)}`}>
                      {currentClaim.trustScore}/100
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Claim Text</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">{currentClaim.text}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">AI Assessment</Label>
                  <p className="mt-1 text-gray-700">{currentClaim.explanation}</p>
                </div>

                {/* Evidence Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700">Supporting Evidence</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEvidence(!showEvidence)}
                      className="text-xs"
                    >
                      {showEvidence ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                      {showEvidence ? "Hide" : "Show"} Evidence
                    </Button>
                  </div>
                  {showEvidence && (
                    <div className="space-y-2">
                      {currentClaim.evidence.map((evidence) => (
                        <div key={evidence.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700 mb-2">{evidence.text}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">{evidence.source}</span>
                            <Badge variant="outline" className="text-xs">
                              {evidence.relevanceScore}% relevant
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Your Review</CardTitle>
                <CardDescription>Evaluate the AI's assessment and provide feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Actions */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Quick Actions</Label>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleQuickAction("approved")}
                      variant={currentClaim.reviewStatus === "approved" ? "default" : "outline"}
                      className="flex-1"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleQuickAction("rejected")}
                      variant={currentClaim.reviewStatus === "rejected" ? "destructive" : "outline"}
                      className="flex-1"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleQuickAction("needs-review")}
                      variant={currentClaim.reviewStatus === "needs-review" ? "secondary" : "outline"}
                      className="flex-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Needs Review
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Detailed Review */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="review-reason" className="text-sm font-medium text-gray-700">
                      Reason (Optional)
                    </Label>
                    <Select
                      value={currentClaim.reviewReason || ""}
                      onValueChange={(value) =>
                        updateClaimReview(
                          currentClaim.id,
                          currentClaim.reviewStatus || "pending",
                          currentClaim.reviewNotes,
                          value,
                        )
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outdated-source">Outdated Source</SelectItem>
                        <SelectItem value="insufficient-evidence">Insufficient Evidence</SelectItem>
                        <SelectItem value="conflicting-data">Conflicting Data</SelectItem>
                        <SelectItem value="methodology-issue">Methodology Issue</SelectItem>
                        <SelectItem value="context-missing">Missing Context</SelectItem>
                        <SelectItem value="accurate-assessment">Accurate Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="review-notes" className="text-sm font-medium text-gray-700">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Add your detailed feedback, suggestions, or additional context..."
                    value={currentClaim.reviewNotes || ""}
                    onChange={(e) =>
                      updateClaimReview(currentClaim.id, currentClaim.reviewStatus || "pending", e.target.value)
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentClaimIndex(Math.max(0, currentClaimIndex - 1))}
                    disabled={currentClaimIndex === 0}
                  >
                    Previous Claim
                  </Button>
                  <Button
                    onClick={() => setCurrentClaimIndex(Math.min(claims.length - 1, currentClaimIndex + 1))}
                    disabled={currentClaimIndex === claims.length - 1}
                  >
                    Next Claim
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Overall Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Feedback</CardTitle>
                <CardDescription>Provide general feedback about the analysis quality</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Share your thoughts on the overall analysis quality, suggestions for improvement, or any patterns you noticed..."
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Submit Review */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/results")}>
                Back to Results
              </Button>
              <div className="space-x-3">
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || reviewSummary.reviewed === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </div>

            {reviewSummary.reviewed === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Please review at least one claim before submitting your feedback.</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
