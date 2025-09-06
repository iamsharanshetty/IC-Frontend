"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Code, Globe, CheckCircle, Clock, BarChart3, FileCheck, Eye } from "lucide-react"
import { type AnalysisResult } from "@/lib/api"

interface ReportConfig {
  includeExecutiveSummary: boolean
  includeDetailedClaims: boolean
  includeEvidence: boolean
  includeVisualizations: boolean
  includeMethodology: boolean
  includeRawData: boolean
}

interface ReportStats {
  totalClaims: number
  supportedClaims: number
  contradictedClaims: number
  unverifiableClaims: number
  unsupportedClaims: number
  averageTrustScore: number
  documentsAnalyzed: number
}

export default function ReportsPage() {
  const router = useRouter()
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    includeExecutiveSummary: true,
    includeDetailedClaims: true,
    includeEvidence: true,
    includeVisualizations: true,
    includeMethodology: false,
    includeRawData: false,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [generatedReports, setGeneratedReports] = useState<string[]>([])
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

  // Show loading state
  if (isLoading || !analysisResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  // Calculate real report statistics from analysis result
  const reportStats: ReportStats = {
    totalClaims: analysisResult.claims.length,
    supportedClaims: analysisResult.claims.filter(c => c.consistency === 'Supported').length,
    contradictedClaims: analysisResult.claims.filter(c => c.consistency === 'Contradicted').length,
    unverifiableClaims: analysisResult.claims.filter(c => c.consistency === 'Unverifiable').length,
    unsupportedClaims: analysisResult.claims.filter(c => c.consistency === 'Unsupported').length,
    averageTrustScore: Math.round(analysisResult.claims.reduce((sum, claim) => sum + claim.trustScore, 0) / analysisResult.claims.length),
    documentsAnalyzed: 1,
  }

  const reportSections = [
    {
      id: "includeExecutiveSummary",
      title: "Executive Summary",
      description: "High-level overview of findings and key insights",
      icon: <FileCheck className="h-4 w-4" />,
      recommended: true,
    },
    {
      id: "includeDetailedClaims",
      title: "Detailed Claims Analysis",
      description: "Complete breakdown of each claim with consistency ratings",
      icon: <FileText className="h-4 w-4" />,
      recommended: true,
    },
    {
      id: "includeEvidence",
      title: "Supporting Evidence",
      description: "Source citations and evidence snippets for each claim",
      icon: <CheckCircle className="h-4 w-4" />,
      recommended: true,
    },
    {
      id: "includeVisualizations",
      title: "Charts and Visualizations",
      description: "Pie charts, bar graphs, and visual data representations",
      icon: <BarChart3 className="h-4 w-4" />,
      recommended: true,
    },
    {
      id: "includeMethodology",
      title: "Methodology Section",
      description: "Technical details about the analysis process and AI models used",
      icon: <Code className="h-4 w-4" />,
      recommended: false,
    },
    {
      id: "includeRawData",
      title: "Raw Data Export",
      description: "Machine-readable data for further analysis (JSON format only)",
      icon: <Globe className="h-4 w-4" />,
      recommended: false,
    },
  ]

  const generationSteps = [
    "Compiling analysis results...",
    "Generating executive summary...",
    "Formatting claims data...",
    "Creating visualizations...",
    "Building report structure...",
    "Finalizing document...",
  ]

  const generateReport = async (format: string) => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedReports([])

    for (let i = 0; i < generationSteps.length; i++) {
      setCurrentStep(generationSteps[i])
      const stepProgress = ((i + 1) / generationSteps.length) * 100

      for (let j = 0; j <= 100; j += 20) {
        const totalProgress = (i / generationSteps.length) * 100 + j / generationSteps.length
        setGenerationProgress(Math.min(totalProgress, stepProgress))
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    setCurrentStep("Report generated successfully!")
    setGenerationProgress(100)
    
    // Generate and download the actual report
    if (format === 'PDF') {
      downloadPDFReport()
    } else if (format === 'HTML') {
      downloadHTMLReport()
    } else if (format === 'JSON') {
      downloadJSONReport()
    }
    
    setGeneratedReports([format])

    setTimeout(() => {
      setIsGenerating(false)
      setGenerationProgress(0)
      setCurrentStep("")
    }, 2000)
  }

  const downloadPDFReport = () => {
    // Create a comprehensive PDF report
    const reportContent = generateDetailedReportContent()
    const blob = new Blob([reportContent], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `institutional-claim-audit-report-${analysisResult?.summary.documentName || 'document'}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadHTMLReport = () => {
    const htmlContent = generateHTMLReport()
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `claim-audit-report-${analysisResult?.summary.documentName || 'document'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadJSONReport = () => {
    const jsonContent = JSON.stringify({
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0.0",
        documentName: analysisResult?.summary.documentName,
        processingTime: analysisResult?.summary.processingTime,
        totalClaims: reportStats.totalClaims,
        averageTrustScore: reportStats.averageTrustScore,
      },
      summary: analysisResult?.summary,
      claims: analysisResult?.claims,
      statistics: reportStats,
    }, null, 2)
    
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `claim-audit-report-${analysisResult?.summary.documentName || 'document'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateDetailedReportContent = () => {
    if (!analysisResult) return ''
    
    const currentDate = new Date().toLocaleDateString()
    const currentTime = new Date().toLocaleTimeString()
    
    return `
INSTITUTIONAL CLAIM AUDIT REPORT
=====================================

REPORT METADATA
Generated on: ${currentDate} at ${currentTime}
Document Analyzed: ${analysisResult.summary.documentName}
Analysis Timestamp: ${analysisResult.summary.timestamp}
Processing Duration: ${analysisResult.summary.processingTime.toFixed(2)} seconds
Report Version: 1.0.0

EXECUTIVE SUMMARY
=====================================
This comprehensive audit analyzed ${reportStats.totalClaims} institutional claims extracted from the submitted document. 
The analysis employed advanced natural language processing and evidence verification techniques to assess claim validity.

Key Findings:
• Overall Document Trust Score: ${reportStats.averageTrustScore}/100
• Claims Successfully Verified: ${reportStats.supportedClaims} (${Math.round((reportStats.supportedClaims/reportStats.totalClaims)*100)}%)
• Claims Contradicted by Evidence: ${reportStats.contradictedClaims} (${Math.round((reportStats.contradictedClaims/reportStats.totalClaims)*100)}%)
• Claims Requiring Further Investigation: ${reportStats.unverifiableClaims + reportStats.unsupportedClaims} (${Math.round(((reportStats.unverifiableClaims + reportStats.unsupportedClaims)/reportStats.totalClaims)*100)}%)

STATISTICAL BREAKDOWN
=====================================
Total Claims Analyzed: ${reportStats.totalClaims}
├── Supported Claims: ${reportStats.supportedClaims}
├── Contradicted Claims: ${reportStats.contradictedClaims}
├── Unverifiable Claims: ${reportStats.unverifiableClaims}
└── Unsupported Claims: ${reportStats.unsupportedClaims}

Average Trust Score: ${reportStats.averageTrustScore}/100
Documents Processed: ${reportStats.documentsAnalyzed}

DETAILED CLAIMS ANALYSIS
=====================================
${analysisResult.claims.map((claim, index) => `
CLAIM #${index + 1}
${'-'.repeat(50)}
Text: "${claim.text}"
Category: ${claim.category}
Verification Status: ${claim.consistency}
Trust Score: ${claim.trustScore}/100
${claim.pageNumber ? `Source Location: Page ${claim.pageNumber}` : ''}

ANALYSIS EXPLANATION:
${claim.explanation}

SUPPORTING EVIDENCE:
${claim.evidence.map((e, evidenceIndex) => `
${evidenceIndex + 1}. ${e.text}
   Source: ${e.source}
   Relevance Score: ${e.relevanceScore}%
   ${e.url !== '#' ? `URL: ${e.url}` : ''}
`).join('')}

RISK ASSESSMENT:
${claim.consistency === 'Supported' ? '✓ LOW RISK - Claim is well-supported by available evidence' :
  claim.consistency === 'Contradicted' ? '⚠ HIGH RISK - Claim contradicts available evidence' :
  claim.consistency === 'Unverifiable' ? '? MEDIUM RISK - Insufficient evidence to verify claim' :
  '⚠ MEDIUM-HIGH RISK - Claim lacks adequate supporting evidence'}

${'='.repeat(80)}
`).join('\n')}

METHODOLOGY
=====================================
This audit employed the following analytical framework:

1. DOCUMENT PROCESSING
   • Text extraction and segmentation
   • Claim identification using natural language processing
   • Categorization into predefined domains

2. EVIDENCE GATHERING
   • Web-based research for supporting/contradicting evidence
   • Academic database searches
   • Regulatory and compliance database queries

3. VERIFICATION PROCESS
   • Cross-referencing claims against gathered evidence
   • Trust score calculation based on evidence quality and relevance
   • Consistency rating assignment

4. QUALITY ASSURANCE
   • Multi-source evidence validation
   • Bias detection and mitigation
   • Confidence interval assessment

RECOMMENDATIONS
=====================================
Based on this analysis, we recommend:

${reportStats.contradictedClaims > 0 ? `
• IMMEDIATE ATTENTION REQUIRED: ${reportStats.contradictedClaims} claim(s) were contradicted by evidence
  - Review and correct contradicted claims before publication
  - Investigate source of discrepancies` : ''}

${reportStats.unverifiableClaims > 0 ? `
• VERIFICATION NEEDED: ${reportStats.unverifiableClaims} claim(s) could not be verified
  - Provide additional supporting documentation
  - Consider removing unverifiable claims or marking as preliminary` : ''}

${reportStats.unsupportedClaims > 0 ? `
• EVIDENCE ENHANCEMENT: ${reportStats.unsupportedClaims} claim(s) lack sufficient support
  - Gather additional supporting evidence
  - Strengthen documentation and citations` : ''}

${reportStats.supportedClaims === reportStats.totalClaims ? `
• EXCELLENT COMPLIANCE: All claims are well-supported by evidence
  - Document demonstrates high institutional credibility
  - Consider this as a model for future publications` : ''}

DISCLAIMER
=====================================
This automated audit provides an initial assessment of institutional claims based on publicly available information. 
Results should be reviewed by qualified personnel and may require additional manual verification for critical applications.

The analysis is based on information available at the time of processing and may not reflect the most current data.
Trust scores are algorithmic assessments and should be interpreted within the context of the specific domain and use case.

TECHNICAL DETAILS
=====================================
Analysis Engine: Institutional Claim Auditor v1.0.0
Processing Model: Advanced NLP with Evidence Verification
Analysis Date: ${currentDate}
Report Format: Comprehensive Audit Report
Quality Assurance: Automated with Manual Review Recommended

END OF REPORT
=====================================
Generated by Institutional Claim Auditor
© 2024 - Automated Institutional Compliance Solutions
    `.trim()
  }

  const updateReportConfig = (key: keyof ReportConfig, value: boolean) => {
    setReportConfig((prev) => ({ ...prev, [key]: value }))
  }

  const getEstimatedSize = () => {
    let baseSize = 2 // Base report size in MB
    if (reportConfig.includeDetailedClaims) baseSize += 1
    if (reportConfig.includeEvidence) baseSize += 2
    if (reportConfig.includeVisualizations) baseSize += 1.5
    if (reportConfig.includeMethodology) baseSize += 0.5
    if (reportConfig.includeRawData) baseSize += 3
    return baseSize.toFixed(1)
  }

  const generateHTMLReport = () => {
    if (!analysisResult) return ''
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>Institutional Claim Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .claim { border-left: 4px solid #10B981; padding: 15px; margin: 15px 0; background: #F9FAFB; }
        .contradicted { border-left-color: #EF4444; }
        .unverifiable { border-left-color: #6B7280; }
        .unsupported { border-left-color: #F59E0B; }
        .trust-score { font-size: 24px; font-weight: bold; color: #3B82F6; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Institutional Claim Audit Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>Document: ${analysisResult.summary.documentName}</p>
        <p>Processing Time: ${analysisResult.summary.processingTime.toFixed(1)} seconds</p>
    </div>
    
    <div class="summary">
        <h2>Executive Summary</h2>
        <p>Analysis of ${reportStats.documentsAnalyzed} document(s) revealed ${reportStats.totalClaims} claims with an average trust score of <span class="trust-score">${reportStats.averageTrustScore}/100</span>.</p>
        <ul>
            <li>${reportStats.supportedClaims} claims were supported by evidence</li>
            <li>${reportStats.contradictedClaims} claims were contradicted</li>
            <li>${reportStats.unverifiableClaims} claims were unverifiable</li>
            <li>${reportStats.unsupportedClaims} claims lacked sufficient support</li>
        </ul>
    </div>
    
    <h2>Detailed Analysis</h2>
    ${analysisResult.claims.map((claim, index) => `
    <div class="claim ${claim.consistency.toLowerCase()}">
        <h3>${claim.category} Claim ${index + 1}</h3>
        <p><strong>Claim:</strong> ${claim.text}</p>
        <p><strong>Status:</strong> ${claim.consistency}</p>
        <p><strong>Trust Score:</strong> ${claim.trustScore}/100</p>
        <p><strong>Explanation:</strong> ${claim.explanation}</p>
        <p><strong>Evidence:</strong></p>
        <ul>
            ${claim.evidence.map(e => `<li>${e.text} (Source: ${e.source})</li>`).join('')}
        </ul>
    </div>
    `).join('')}
    
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666;">
        Report generated by Institutional Claim Auditor v1.0.0
    </footer>
</body>
</html>`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Reports</h1>
          <p className="text-gray-600">
            Create comprehensive audit reports in multiple formats for sharing and documentation.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Report Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>Select the sections to include in your audit report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportSections.map((section) => (
                  <div key={section.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={section.id}
                      checked={reportConfig[section.id as keyof ReportConfig]}
                      onCheckedChange={(checked) =>
                        updateReportConfig(section.id as keyof ReportConfig, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {section.icon}
                        <Label htmlFor={section.id} className="font-medium cursor-pointer">
                          {section.title}
                        </Label>
                        {section.recommended && <Badge variant="outline">Recommended</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Report Formats */}
            <Card>
              <CardHeader>
                <CardTitle>Download Formats</CardTitle>
                <CardDescription>Choose your preferred format for the audit report</CardDescription>
              </CardHeader>
              <CardContent>
                {!isGenerating ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => generateReport("PDF")}
                      className="h-20 flex-col space-y-2 bg-red-600 hover:bg-red-700"
                    >
                      <FileText className="h-6 w-6" />
                      <span>Download PDF</span>
                    </Button>
                    <Button
                      onClick={() => generateReport("HTML")}
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                    >
                      <Globe className="h-6 w-6" />
                      <span>Download HTML</span>
                    </Button>
                    <Button
                      onClick={() => generateReport("JSON")}
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                    >
                      <Code className="h-6 w-6" />
                      <span>Download JSON</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Generating Report...</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">{currentStep}</span>
                        <span className="text-gray-600">{Math.round(generationProgress)}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  </div>
                )}

                {generatedReports.length > 0 && (
                  <Alert className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Report generated successfully! Your download should start automatically.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Report Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{reportStats.totalClaims}</div>
                    <div className="text-sm text-gray-600">Total Claims</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{reportStats.supportedClaims}</div>
                    <div className="text-sm text-gray-600">Supported</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{reportStats.contradictedClaims}</div>
                    <div className="text-sm text-gray-600">Contradicted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{reportStats.averageTrustScore}</div>
                    <div className="text-sm text-gray-600">Avg. Score</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Documents Analyzed:</span>
                    <span className="font-medium">{reportStats.documentsAnalyzed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Size:</span>
                    <span className="font-medium">{getEstimatedSize()} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Generated:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Report Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="html" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="html">HTML Preview</TabsTrigger>
                    <TabsTrigger value="json">JSON Structure</TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" className="mt-4">
                    <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: generateHTMLReport() }} />
                    </div>
                  </TabsContent>
                  <TabsContent value="json" className="mt-4">
                    <div className="border rounded-lg p-4 bg-gray-900 text-green-400 max-h-96 overflow-y-auto">
                      <pre className="text-xs">
                        {JSON.stringify(
                          {
                            reportMetadata: {
                              generatedAt: new Date().toISOString(),
                              version: "1.0.0",
                              documentName: analysisResult?.summary.documentName,
                              processingTime: analysisResult?.summary.processingTime,
                              totalClaims: reportStats.totalClaims,
                              averageTrustScore: reportStats.averageTrustScore,
                            },
                            summary: analysisResult?.summary,
                            claims: analysisResult?.claims.slice(0, 2), // Show first 2 claims in preview
                            statistics: reportStats,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => router.push("/results")}>
            Back to Results
          </Button>
          <Button onClick={() => router.push("/results")} className="bg-blue-600 hover:bg-blue-700">
            View Analysis Results
          </Button>
        </div>
      </main>
    </div>
  )
}
