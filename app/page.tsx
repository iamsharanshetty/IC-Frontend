import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  FileText,
  BarChart3,
  Users,
  CheckCircle,
  GraduationCap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Institutional Claim Auditor
                </h1>
                <p className="text-xs text-gray-600">
                  AI-Powered Document Verification
                </p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="text-gray-900 hover:text-blue-600 font-medium"
              >
                Home
              </Link>
              <Link
                href="/upload"
                className="text-gray-600 hover:text-blue-600"
              >
                Upload
              </Link>
              <Link
                href="/university-reviews"
                className="text-gray-600 hover:text-blue-600"
              >
                University Reviews
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Verify Claims in Institutional Documents
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Leverage AI-driven analysis to verify the truthfulness of claims in
            ESG disclosures, academic narratives, and policy reports with
            comprehensive evidence-based evaluation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/upload">
                <FileText className="mr-2 h-5 w-5" />
                Start Analysis
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Link href="/university-reviews">
                <GraduationCap className="mr-2 h-5 w-5" />
                University Reviews
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <FileText className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Multi-Format Support</CardTitle>
              <CardDescription>
                Upload PDF, HTML, DOCX, and TXT documents for comprehensive
                analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Evidence-Based Scoring</CardTitle>
              <CardDescription>
                Get trust scores (0-100) with detailed explanations and source
                citations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <Users className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Human-in-the-Loop</CardTitle>
              <CardDescription>
                Review, annotate, and provide feedback on AI-generated
                assessments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <GraduationCap className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>University Analysis</CardTitle>
              <CardDescription>
                Search and analyze university reviews and feedback from multiple
                sources
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Use Cases */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Perfect for Professional Analysis
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">ESG Auditors</h4>
              <p className="text-gray-600 text-sm">
                Verify environmental, social, and governance claims in corporate
                reports
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Policy Analysts
              </h4>
              <p className="text-gray-600 text-sm">
                Analyze policy documents and government reports for accuracy
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Academics</h4>
              <p className="text-gray-600 text-sm">
                Validate claims in research papers and academic publications
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Upload Documents</h4>
              <p className="text-gray-600 text-sm">
                Upload your institutional reports and documents
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Configure Analysis</h4>
              <p className="text-gray-600 text-sm">
                Select claim categories and analysis options
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">AI Analysis</h4>
              <p className="text-gray-600 text-sm">
                Our AI extracts and verifies claims with evidence
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                4
              </div>
              <h4 className="font-semibold mb-2">Review Results</h4>
              <p className="text-gray-600 text-sm">
                Get detailed reports with trust scores and evidence
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Auditing?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Upload your first document or search university reviews to
            experience AI-powered analysis in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/upload">Get Started Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Link href="/university-reviews">Search Universities</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Shield className="h-6 w-6" />
              <span className="font-semibold">Institutional Claim Auditor</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="hover:text-gray-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gray-300">
                Terms of Service
              </Link>
              <span className="text-gray-400">v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
