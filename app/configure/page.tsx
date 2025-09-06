"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Leaf,
  GraduationCap,
  DollarSign,
  FileText,
  Search,
  BarChart3,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"

interface ClaimCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

interface AnalysisConfig {
  categories: string[]
  deepSearch: boolean
  includeVisualizations: boolean
}

export default function ConfigurePage() {
  const router = useRouter()
  const [config, setConfig] = useState<AnalysisConfig>({
    categories: [],
    deepSearch: false,
    includeVisualizations: true,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  const claimCategories: ClaimCategory[] = [
    {
      id: "environmental",
      name: "Environmental",
      description: "ESG environmental claims, carbon emissions, sustainability metrics",
      icon: <Leaf className="h-5 w-5" />,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "academic",
      name: "Academic",
      description: "Research findings, citations, academic achievements, publication claims",
      icon: <GraduationCap className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "financial",
      name: "Financial",
      description: "Revenue figures, profit margins, financial performance metrics",
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "policy",
      name: "Policy",
      description: "Regulatory compliance, policy implementation, governance claims",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800",
    },
  ]

  const processingSteps = [
    "Extracting claims from documents...",
    "Classifying claim types...",
    "Retrieving evidence from public sources...",
    "Evaluating claim consistency...",
    "Generating explanations...",
    "Calculating trust scores...",
    "Building audit report...",
  ]

  const toggleCategory = (categoryId: string) => {
    setConfig((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }))
  }

  const simulateProcessing = async () => {
    setIsProcessing(true)
    setProgress(0)

    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(processingSteps[i])
      const stepProgress = ((i + 1) / processingSteps.length) * 100

      // Simulate processing time for each step
      for (let j = 0; j <= 100; j += 10) {
        const totalProgress = (i / processingSteps.length) * 100 + j / processingSteps.length
        setProgress(Math.min(totalProgress, stepProgress))
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
    }

    setCurrentStep("Analysis complete!")
    setProgress(100)

    // Redirect to results after a brief delay
    setTimeout(() => {
      router.push("/results")
    }, 1500)
  }

  const startAnalysis = () => {
    if (config.categories.length === 0) {
      return
    }
    // Redirect to upload since analysis now happens during upload
    router.push("/upload")
  }

  const hasSelectedCategories = config.categories.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configure Analysis</h1>
          <p className="text-gray-600">
            Note: Analysis configuration is currently handled by the backend. This page will redirect you to upload your documents.
          </p>
        </div>

        {!isProcessing ? (
          <>
            {/* Claim Categories */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Claim Categories</CardTitle>
                <CardDescription>
                  Select the types of claims you want to analyze in your documents. You can choose multiple categories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {claimCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        config.categories.includes(category.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={config.categories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={category.color}>{category.icon}</Badge>
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {config.categories.length === 0 && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please select at least one claim category to proceed.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Analysis Options */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Analysis Options</CardTitle>
                <CardDescription>Customize your analysis with additional features and settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Search className="h-5 w-5 text-gray-400" />
                    <div>
                      <Label htmlFor="deep-search" className="text-base font-medium">
                        Deep Evidence Search
                      </Label>
                      <p className="text-sm text-gray-600">
                        Perform comprehensive evidence retrieval from multiple public sources
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="deep-search"
                    checked={config.deepSearch}
                    onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, deepSearch: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                    <div>
                      <Label htmlFor="visualizations" className="text-base font-medium">
                        Include Visualizations
                      </Label>
                      <p className="text-sm text-gray-600">Generate charts and graphs for claim analysis results</p>
                    </div>
                  </div>
                  <Switch
                    id="visualizations"
                    checked={config.includeVisualizations}
                    onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, includeVisualizations: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Selected Configuration Summary */}
            {hasSelectedCategories && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Selected Categories:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {config.categories.map((categoryId) => {
                          const category = claimCategories.find((c) => c.id === categoryId)
                          return (
                            <Badge key={categoryId} className={category?.color}>
                              {category?.icon}
                              <span className="ml-1">{category?.name}</span>
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex space-x-6 text-sm">
                      <span className={config.deepSearch ? "text-green-600" : "text-gray-500"}>
                        Deep Search: {config.deepSearch ? "Enabled" : "Disabled"}
                      </span>
                      <span className={config.includeVisualizations ? "text-green-600" : "text-gray-500"}>
                        Visualizations: {config.includeVisualizations ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/upload")}>
                Back to Upload
              </Button>
              <Button
                onClick={startAnalysis}
                disabled={!hasSelectedCategories}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Run Audit
              </Button>
            </div>
          </>
        ) : (
          /* Processing State */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Processing Analysis</span>
              </CardTitle>
              <CardDescription>
                Please wait while we analyze your documents. This may take a few minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{currentStep}</span>
                  <span className="text-gray-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Analysis Configuration</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {config.categories.map((categoryId) => {
                    const category = claimCategories.find((c) => c.id === categoryId)
                    return (
                      <Badge key={categoryId} className={category?.color}>
                        {category?.icon}
                        <span className="ml-1">{category?.name}</span>
                      </Badge>
                    )
                  })}
                </div>
                <div className="flex space-x-4 text-sm text-gray-600">
                  <span>Deep Search: {config.deepSearch ? "Enabled" : "Disabled"}</span>
                  <span>Visualizations: {config.includeVisualizations ? "Enabled" : "Disabled"}</span>
                </div>
              </div>

              {progress === 100 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Analysis complete! Redirecting to results...</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
