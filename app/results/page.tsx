"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Search,
  Download,
  ExternalLink,
  BarChart3,
  PieChart,
} from "lucide-react"
import { ClaimChart } from "@/components/claim-chart"
import { type AnalysisResult } from "@/lib/api"

interface Claim {
  id: string
  text: string
  category: "Financial" | "Operational" | "Legal & Compliance" | "ESG"
  consistency: "Supported" | "Contradicted" | "Unverifiable" | "Unsupported"
  trustScore: number
  explanation: string
  evidence: Evidence[]
  pageNumber?: number
}

interface Evidence {
  id: string
  text: string
  source: string
  url: string
  relevanceScore: number
}

interface WebEvidence {
  title: string;
  url: string;
  snippet: string;
  source_type: string;
  relevance_score: number;
  search_query: string;
}

export default function ResultsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [consistencyFilter, setConsistencyFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("trustScore")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load analysis result from localStorage
  useEffect(() => {
    try {
      const storedResult = localStorage.getItem('analysisResult')
      if (storedResult) {
        const result: AnalysisResult = JSON.parse(storedResult)
        setAnalysisResult(result)
      } else {
        // If no data found, redirect to upload page
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

  // Use real data instead of mock data
  const claims: Claim[] = analysisResult?.claims || []

  // Calculate derived values (must be before any conditional returns)
  const documentTrustScore = useMemo(() => {
    if (claims.length === 0) return 0
    const totalScore = claims.reduce((sum, claim) => sum + claim.trustScore, 0)
    return Math.round(totalScore / claims.length)
  }, [claims])

  const consistencyStats = useMemo(() => {
    const stats = claims.reduce(
      (acc, claim) => {
        acc[claim.consistency] = (acc[claim.consistency] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return stats
  }, [claims])

  const categoryStats = useMemo(() => {
    const stats = claims.reduce(
      (acc, claim) => {
        acc[claim.category] = (acc[claim.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return stats
  }, [claims])

  const filteredAndSortedClaims = useMemo(() => {
    const filtered = claims.filter((claim) => {
      const matchesSearch = claim.text.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || claim.category === categoryFilter
      const matchesConsistency = consistencyFilter === "all" || claim.consistency === consistencyFilter
      return matchesSearch && matchesCategory && matchesConsistency
    })

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Claim]
      let bValue: any = b[sortBy as keyof Claim]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [claims, searchTerm, categoryFilter, consistencyFilter, sortBy, sortOrder])

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

  // Remove the old mock data array and replace with empty array since we're using real data
  const mockClaims: Claim[] = [
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
        {
          id: "e2",
          text: "Company's sustainability report confirms implementation of energy efficiency measures",
          source: "Corporate Sustainability Report 2023",
          url: "#",
          relevanceScore: 88,
        },
      ],
      pageNumber: 12,
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
        {
          id: "e5",
          text: "Web of Science confirms 43 publications in Q1 journals",
          source: "Web of Science",
          url: "https://webofscience.com/",
          relevanceScore: 94,
        },
      ],
      pageNumber: 8,
    },
    {
      id: "4",
      text: "Revenue increased by 35% year-over-year, reaching $2.4 billion in 2023.",
      category: "Financial",
      consistency: "Unverifiable",
      trustScore: 50,
      explanation:
        "This claim cannot be verified as the company is privately held and detailed financial information is not publicly available through standard financial databases.",
      evidence: [
        {
          id: "e6",
          text: "No public financial filings found for private company",
          source: "SEC EDGAR Database",
          url: "https://www.sec.gov/edgar.shtml",
          relevanceScore: 60,
        },
      ],
      pageNumber: 3,
    },
    {
      id: "5",
      text: "We maintain full compliance with all GDPR requirements across European operations.",
      category: "Policy",
      consistency: "Unsupported",
      trustScore: 35,
      explanation:
        "While no direct violations were found, there is insufficient public evidence to verify comprehensive GDPR compliance across all European operations.",
      evidence: [
        {
          id: "e7",
          text: "No GDPR violations reported in public enforcement databases",
          source: "European Data Protection Board",
          url: "https://edpb.europa.eu/",
          relevanceScore: 70,
        },
      ],
      pageNumber: 22,
    },
  ]

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

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrustScoreLabel = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 60) return "Medium"
    return "Low"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Results</h1>
          <p className="text-gray-600">Comprehensive claim verification results for your institutional documents.</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Document Trust Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-bold ${getTrustScoreColor(documentTrustScore)}`}>
                    {documentTrustScore}/100
                  </div>
                  <div className="text-sm text-gray-600">{getTrustScoreLabel(documentTrustScore)} Confidence</div>
                </div>
                <div className="w-16 h-16">
                  <Progress value={documentTrustScore} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Claims Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{claims.length}</div>
              <div className="text-sm text-gray-600">Total claims extracted</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Issues Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {(consistencyStats.Contradicted || 0) + (consistencyStats.Unsupported || 0)}
              </div>
              <div className="text-sm text-gray-600">Contradicted or unsupported claims</div>
            </CardContent>
          </Card>
        </div>

        {/* Visualizations */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Claim Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClaimChart type="category" data={categoryStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Consistency Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClaimChart type="consistency" data={consistencyStats} />
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Claims Analysis</CardTitle>
            <CardDescription>Filter and search through analyzed claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search claims..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Legal & Compliance">Legal & Compliance</SelectItem>
                  <SelectItem value="ESG">ESG</SelectItem>
                </SelectContent>
              </Select>
              <Select value={consistencyFilter} onValueChange={setConsistencyFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Consistency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Supported">Supported</SelectItem>
                  <SelectItem value="Contradicted">Contradicted</SelectItem>
                  <SelectItem value="Unverifiable">Unverifiable</SelectItem>
                  <SelectItem value="Unsupported">Unsupported</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trustScore">Trust Score</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="consistency">Consistency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Claims List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Claims ({filteredAndSortedClaims.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-4">
              {filteredAndSortedClaims.map((claim) => (
                <AccordionItem key={claim.id} value={claim.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center space-x-3 text-left">
                        {getConsistencyIcon(claim.consistency)}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 line-clamp-2">{claim.text}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{claim.category}</Badge>
                            <Badge className={getConsistencyColor(claim.consistency)}>{claim.consistency}</Badge>
                            {claim.pageNumber && <span className="text-xs text-gray-500">Page {claim.pageNumber}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getTrustScoreColor(claim.trustScore)}`}>
                          {claim.trustScore}
                        </div>
                        <div className="text-xs text-gray-500">Trust Score</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Explanation</h4>
                        <p className="text-gray-700">{claim.explanation}</p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Supporting Evidence</h4>
                        <div className="space-y-3">
                          {claim.evidence.map((evidence) => (
                            <div key={evidence.id} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-700 mb-2">{evidence.text}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-gray-600">{evidence.source}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {evidence.relevanceScore}% relevant
                                  </Badge>
                                </div>
                                {evidence.url !== "#" && (
                                  <Button variant="ghost" size="sm" asChild>
                                    <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {/* Web Evidence Section */}
                          {claim.web_evidence && claim.web_evidence.length > 0 && (
                            <div className="mt-4 border-t pt-4">
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                <span className="mr-2">🌐</span>
                                Web Verification Sources ({claim.web_evidence.length})
                              </h5>
                              <Accordion type="single" collapsible className="space-y-2">
                                {claim.web_evidence.map((webEvidence, webIndex) => (
                                  <AccordionItem key={webIndex} value={`web-${webIndex}`} className="border rounded-lg">
                                    <AccordionTrigger className="px-3 py-2 hover:no-underline">
                                      <div className="flex items-center justify-between w-full mr-4">
                                        <div className="flex items-center space-x-2 text-left">
                                          <Badge variant="outline" className="text-xs">
                                            {webEvidence.source_type}
                                          </Badge>
                                          <span className="text-sm font-medium truncate max-w-xs">
                                            {webEvidence.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="outline" className="text-xs">
                                            {webEvidence.relevance_score}% match
                                          </Badge>
                                          <Button variant="ghost" size="sm" asChild>
                                            <a href={webEvidence.url} target="_blank" rel="noopener noreferrer">
                                              <ExternalLink className="h-3 w-3" />
                                            </a>
                                          </Button>
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-3 pb-3">
                                      <div className="space-y-2">
                                        <p className="text-sm text-gray-700">{webEvidence.snippet}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                          <span>Search Query: "{webEvidence.search_query}"</span>
                                          <span className="truncate max-w-xs">{webEvidence.url}</span>
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Analysis Summary Info */}
        {analysisResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Document:</span>
                  <p className="text-gray-600">{analysisResult.summary.documentName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Processing Time:</span>
                  <p className="text-gray-600">{analysisResult.summary.processingTime.toFixed(1)}s</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Analyzed:</span>
                  <p className="text-gray-600">{new Date(analysisResult.summary.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/upload")}>
            Upload New Document
          </Button>
          <div className="space-x-4">
            <Button onClick={() => router.push("/reports")} className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
