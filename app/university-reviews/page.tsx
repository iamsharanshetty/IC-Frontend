"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GraduationCap,
  Search,
  Star,
  AlertCircle,
  Clock,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  Users,
} from "lucide-react";
import {
  searchUniversityReviews,
  type UniversityReviewsResponse,
} from "@/lib/api";

export default function UniversityReviewsPage() {
  const [universityName, setUniversityName] = useState("");
  const [results, setResults] = useState<UniversityReviewsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!universityName.trim()) {
      setError("Please enter a university name");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await searchUniversityReviews(universityName.trim());
      setResults(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to search university reviews"
      );
      console.error("University search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "partial_success":
        return "text-yellow-600 bg-yellow-50";
      case "search_failed":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <GraduationCap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            University Reviews Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search and analyze university reviews and feedback from multiple
            sources to make informed decisions.
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search University
            </CardTitle>
            <CardDescription>
              Enter the name of the university or college you want to analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter university name (e.g., IIT Delhi)"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert className="max-w-2xl mx-auto mb-8 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-8">
            {/* Search Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Search Results for "{results.university_name}"</span>
                  <Badge className={getStatusColor(results.search_status)}>
                    {results.search_status.replace("_", " ").toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Analysis completed at{" "}
                  {new Date(results.analysis_timestamp).toLocaleString()}
                  {results.processing_time &&
                    ` • Processing time: ${results.processing_time}s`}
                </CardDescription>
              </CardHeader>
            </Card>
            {/* Summary Statistics */}
            {results.review_summary && (
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-red-600">
                          {results.review_summary.total_negative_reviews}
                        </p>
                        <p className="text-sm text-gray-600">
                          Negative Reviews
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {results.review_summary.total_positive_reviews}
                        </p>
                        <p className="text-sm text-gray-600">
                          Positive Reviews
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                {/* <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-2xl font-bold ${getRatingColor(
                            results.review_summary.average_rating
                          )}`}
                        >
                          {results.review_summary.average_rating.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-600">Average Rating</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card> */}

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {results.sources?.length || 0}
                        </p>
                        <p className="text-sm text-gray-600">Sources Found</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            NIRF Ranking
            {results.nirf_ranking && results.nirf_ranking.ranking && (
              <Card>
                <CardHeader>
                  <CardTitle>NIRF Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-blue-600">
                      #{results.nirf_ranking.ranking}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {results.nirf_ranking.category}
                      </p>
                      <p className="text-sm text-gray-600">
                        Year: {results.nirf_ranking.year} •
                        {results.nirf_ranking.verified
                          ? " Verified"
                          : " Unverified"}
                      </p>
                      {results.nirf_ranking.note && (
                        <p className="text-sm text-yellow-600 mt-1">
                          {results.nirf_ranking.note}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Common Complaints */}
            {/* Common Complaints - Fixed TypeScript error */}
            {results.review_summary &&
              results.review_summary.common_complaints &&
              Array.isArray(results.review_summary.common_complaints) &&
              results.review_summary.common_complaints.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Common Complaints</CardTitle>
                    <CardDescription>
                      Most frequently mentioned issues in reviews
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {results.review_summary.common_complaints
                        .slice(0, 10)
                        .map((complaint, index) => {
                          // Handle both string and object formats
                          let displayText: string;
                          let frequency: number | undefined;

                          if (typeof complaint === "string") {
                            displayText = complaint;
                          } else if (
                            complaint &&
                            typeof complaint === "object" &&
                            "category" in complaint
                          ) {
                            displayText = complaint.category;
                            frequency = complaint.frequency;
                          } else {
                            displayText = String(complaint);
                          }

                          return (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-red-700 bg-red-50"
                              title={
                                frequency
                                  ? `Mentioned ${frequency} times`
                                  : undefined
                              }
                            >
                              {displayText}
                              {frequency && frequency > 1 && (
                                <span className="ml-1 text-xs opacity-75">
                                  ({frequency})
                                </span>
                              )}
                            </Badge>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}
            {/* Negative Reviews */}
            {results.negative_reviews &&
              results.negative_reviews.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-red-600" />
                      Negative Reviews ({results.negative_reviews.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.negative_reviews.map((review, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-red-200 pl-4 py-2"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {review.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span className="text-sm font-medium">
                                    {review.rating}/5
                                  </span>
                                </div>
                              )}
                              {review.source && (
                                <Badge variant="outline" className="text-xs">
                                  {review.source}
                                </Badge>
                              )}
                            </div>
                            {review.date && (
                              <span className="text-xs text-gray-500">
                                {review.date}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {review.content}
                          </p>
                          {review.author && (
                            <p className="text-xs text-gray-500 mt-2">
                              - {review.author}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            {/* Positive Reviews */}
            {results.positive_reviews &&
              results.positive_reviews.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      Positive Reviews ({results.positive_reviews.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.positive_reviews.map((review, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-green-200 pl-4 py-2"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {review.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span className="text-sm font-medium">
                                    {review.rating}/5
                                  </span>
                                </div>
                              )}
                              {review.source && (
                                <Badge variant="outline" className="text-xs">
                                  {review.source}
                                </Badge>
                              )}
                            </div>
                            {review.date && (
                              <span className="text-xs text-gray-500">
                                {review.date}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {review.content}
                          </p>
                          {review.author && (
                            <p className="text-xs text-gray-500 mt-2">
                              - {review.author}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            {/* Sources */}
            {results.sources && results.sources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sources</CardTitle>
                  <CardDescription>
                    Websites and platforms analyzed for reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {results.sources.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{source.title}</h4>
                          <p className="text-sm text-gray-600">
                            {source.reviews_count} reviews found
                          </p>
                        </div>
                        {source.url && source.url !== "#" && (
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* No Results Message */}
            {results.search_status === "search_failed" && (
              <Card className="text-center py-8">
                <CardContent>
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Reviews Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {results.message ||
                      "We couldn't find reviews for this university. This could be due to:"}
                  </p>
                  {results.suggestions && (
                    <ul className="text-sm text-gray-600 space-y-1 max-w-md mx-auto">
                      {results.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-left">
                          • {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Getting Started Guide */}
        {!results && !isLoading && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>How to Use University Reviews Analysis</CardTitle>
                <CardDescription>
                  Get comprehensive insights about universities from multiple
                  review sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-3">What We Analyze</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Student reviews and feedback
                      </li>
                      {/* <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        NIRF rankings and positions
                      </li> */}
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Common complaints and issues
                      </li>
                      {/* <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Overall satisfaction ratings
                      </li> */}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">
                      Tips for Better Results
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Use full official university names
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Include location if needed (e.g., "IIT Delhi")
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Check spelling and abbreviations
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Try alternative name formats
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
