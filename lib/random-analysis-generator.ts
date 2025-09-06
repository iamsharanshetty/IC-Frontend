// This file is deprecated - real data now comes from the FastAPI backend
// Keeping minimal types for backward compatibility

interface Claim {
  id: string
  text: string
  category: "Environmental" | "Academic" | "Financial" | "Policy"
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

const CLAIM_TEMPLATES = {
  Environmental: [
    "Our company reduced carbon emissions by {percentage}% in {year} compared to {baseline_year} baseline.",
    "We achieved a {percentage}% increase in renewable energy usage across all facilities.",
    "Our water consumption decreased by {percentage}% through efficiency improvements.",
    "We diverted {percentage}% of waste from landfills through recycling programs.",
    "Our supply chain carbon footprint was reduced by {percentage}% in {year}.",
    "We planted {number} trees as part of our reforestation initiative.",
    "Our facilities achieved {percentage}% reduction in energy consumption per unit produced.",
    "We eliminated {percentage}% of single-use plastics from our operations.",
  ],
  Academic: [
    "Our research team published {number} peer-reviewed papers in top-tier journals in {year}.",
    "We received ${amount} million in research grants from federal agencies.",
    "Our faculty achieved a {percentage}% increase in citation impact factor.",
    "We graduated {number} PhD students with a {percentage}% job placement rate.",
    "Our research collaboration network expanded to {number} international institutions.",
    "We filed {number} patents based on our research discoveries in {year}.",
    "Our academic programs achieved {percentage}% student satisfaction rating.",
    "We established {number} new research centers focused on emerging technologies.",
  ],
  Financial: [
    "Revenue increased by {percentage}% year-over-year, reaching ${amount} billion in {year}.",
    "Our profit margin improved to {percentage}% in {year}.",
    "We achieved ${amount} million in cost savings through operational efficiency.",
    "Our market share grew by {percentage} percentage points in the {sector} sector.",
    "We reduced operational expenses by {percentage}% while maintaining service quality.",
    "Our return on investment reached {percentage}% for key strategic initiatives.",
    "We generated ${amount} million in new revenue from digital transformation.",
    "Our debt-to-equity ratio improved to {ratio}:1 by the end of {year}.",
  ],
  Policy: [
    "We maintain full compliance with all {regulation} requirements across {region} operations.",
    "Our data privacy program covers {percentage}% of customer interactions.",
    "We implemented {number} new security protocols to meet regulatory standards.",
    "Our compliance audit achieved a {percentage}% pass rate across all jurisdictions.",
    "We reduced regulatory violations by {percentage}% compared to the previous year.",
    "Our ethics training program reached {percentage}% of all employees.",
    "We established {number} new partnerships with regulatory bodies.",
    "Our risk management framework covers {percentage}% of operational processes.",
  ],
}

const EVIDENCE_SOURCES = {
  Environmental: [
    { name: "EPA FLIGHT Database", url: "https://ghgdata.epa.gov/ghgp/main.do" },
    { name: "Energy Information Administration", url: "https://www.eia.gov/totalenergy/data/monthly/" },
    { name: "CDP Climate Change Report", url: "https://www.cdp.net/" },
    { name: "Global Reporting Initiative", url: "https://www.globalreporting.org/" },
    { name: "SASB Standards", url: "https://www.sasb.org/" },
    { name: "UN Global Compact", url: "https://www.unglobalcompact.org/" },
  ],
  Academic: [
    { name: "PubMed/MEDLINE", url: "https://pubmed.ncbi.nlm.nih.gov/" },
    { name: "Web of Science", url: "https://webofscience.com/" },
    { name: "Google Scholar", url: "https://scholar.google.com/" },
    { name: "Scopus Database", url: "https://www.scopus.com/" },
    { name: "NSF Award Database", url: "https://www.nsf.gov/awardsearch/" },
    { name: "NIH Reporter", url: "https://reporter.nih.gov/" },
  ],
  Financial: [
    { name: "SEC EDGAR Database", url: "https://www.sec.gov/edgar.shtml" },
    { name: "Bloomberg Terminal", url: "https://www.bloomberg.com/professional/solution/bloomberg-terminal/" },
    { name: "Yahoo Finance", url: "https://finance.yahoo.com/" },
    { name: "Morningstar Direct", url: "https://www.morningstar.com/products/direct" },
    { name: "S&P Capital IQ", url: "https://www.spglobal.com/marketintelligence/" },
    { name: "FactSet", url: "https://www.factset.com/" },
  ],
  Policy: [
    { name: "Federal Register", url: "https://www.federalregister.gov/" },
    { name: "European Data Protection Board", url: "https://edpb.europa.eu/" },
    { name: "OSHA Compliance Database", url: "https://www.osha.gov/" },
    { name: "FTC Enforcement Actions", url: "https://www.ftc.gov/" },
    { name: "ISO Standards Database", url: "https://www.iso.org/" },
    { name: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework" },
  ],
}

const EXPLANATION_TEMPLATES = {
  Supported: [
    "This claim is well-supported by {source} data showing {evidence_detail}.",
    "Multiple independent sources confirm this claim, including {source} which reports {evidence_detail}.",
    "The claim is substantiated by official {source} records indicating {evidence_detail}.",
    "Strong evidence from {source} validates this claim with {evidence_detail}.",
  ],
  Contradicted: [
    "This claim is contradicted by {source} data which shows {evidence_detail}, significantly different from the claimed figures.",
    "Official {source} records contradict this claim, reporting {evidence_detail} instead.",
    "Multiple sources including {source} provide conflicting evidence showing {evidence_detail}.",
    "The claim is disputed by {source} data indicating {evidence_detail}, which contradicts the stated information.",
  ],
  Unverifiable: [
    "This claim cannot be verified as {source} does not contain sufficient public information to confirm {evidence_detail}.",
    "No reliable public sources including {source} provide adequate data to verify {evidence_detail}.",
    "The claim lacks verifiable evidence from standard sources like {source} for {evidence_detail}.",
    "Insufficient public documentation exists to verify this claim through {source} or similar databases.",
  ],
  Unsupported: [
    "While no direct contradictions were found, there is insufficient evidence from {source} to fully support {evidence_detail}.",
    "The claim lacks adequate supporting evidence, with {source} providing only limited data on {evidence_detail}.",
    "Current evidence from {source} is insufficient to substantiate the claim regarding {evidence_detail}.",
    "The claim requires stronger evidence, as {source} data provides incomplete information about {evidence_detail}.",
  ],
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomPercentage(min = 5, max = 50): number {
  return getRandomNumber(min, max)
}

function getRandomAmount(min = 1, max = 100): number {
  return getRandomNumber(min, max)
}

function getRandomYear(): number {
  return getRandomNumber(2020, 2024)
}

function fillTemplate(template: string): string {
  return template
    .replace(/{percentage}/g, getRandomPercentage().toString())
    .replace(/{number}/g, getRandomNumber(10, 500).toString())
    .replace(/{amount}/g, getRandomAmount().toString())
    .replace(/{year}/g, getRandomYear().toString())
    .replace(/{baseline_year}/g, (getRandomYear() - 1).toString())
    .replace(/{sector}/g, getRandomElement(["technology", "healthcare", "manufacturing", "retail"]))
    .replace(/{region}/g, getRandomElement(["European", "North American", "global"]))
    .replace(/{regulation}/g, getRandomElement(["GDPR", "SOX", "HIPAA", "ISO 27001"]))
    .replace(/{ratio}/g, (Math.random() * 2 + 0.5).toFixed(1))
}

function generateRandomEvidence(category: keyof typeof EVIDENCE_SOURCES, consistency: string): Evidence[] {
  const sources = EVIDENCE_SOURCES[category]
  const numEvidence = getRandomNumber(1, 3)
  const evidence: Evidence[] = []

  for (let i = 0; i < numEvidence; i++) {
    const source = getRandomElement(sources)
    const relevanceScore = consistency === "Supported" ? getRandomNumber(85, 98) : getRandomNumber(60, 85)

    let evidenceText = ""
    switch (consistency) {
      case "Supported":
        evidenceText = `${source.name} confirms ${getRandomPercentage()}% improvement in reported metrics`
        break
      case "Contradicted":
        evidenceText = `${source.name} shows only ${getRandomPercentage(1, 15)}% change, contradicting claimed figures`
        break
      case "Unverifiable":
        evidenceText = `${source.name} does not contain sufficient public data for verification`
        break
      case "Unsupported":
        evidenceText = `${source.name} provides limited data with ${getRandomPercentage(40, 70)}% confidence level`
        break
    }

    evidence.push({
      id: `e${Date.now()}-${i}`,
      text: evidenceText,
      source: source.name,
      url: source.url,
      relevanceScore,
    })
  }

  return evidence
}

function generateTrustScore(consistency: string): number {
  switch (consistency) {
    case "Supported":
      return getRandomNumber(80, 95)
    case "Contradicted":
      return getRandomNumber(10, 30)
    case "Unverifiable":
      return getRandomNumber(40, 60)
    case "Unsupported":
      return getRandomNumber(25, 45)
    default:
      return 50
  }
}

function generateDocumentTrustScore(fileSizeMB: number): number {
  if (fileSizeMB < 5) {
    return 83
  } else if (fileSizeMB >= 5 && fileSizeMB < 10) {
    return 93
  } else if (fileSizeMB >= 10 && fileSizeMB <= 20) {
    return 91
  } else {
    return 94
  }
}

// DEPRECATED: These functions are no longer used since we now get real data from the FastAPI backend
// Keeping them for backward compatibility but they should not be used in new code

export function generateRandomClaim(category?: keyof typeof CLAIM_TEMPLATES): Claim {
  console.warn('generateRandomClaim is deprecated - use real API data instead')
  throw new Error('Mock data generation is disabled - use real API data from FastAPI backend')
}

export function generateRandomAnalysis(numClaims = 5, categories?: Array<keyof typeof CLAIM_TEMPLATES>): Claim[] {
  console.warn('generateRandomAnalysis is deprecated - use real API data instead')
  throw new Error('Mock data generation is disabled - use real API data from FastAPI backend')
}

export function generateAnalysisStats(claims: Claim[], fileSizeMB?: number) {
  console.warn('generateAnalysisStats is deprecated - use real API data instead')
  throw new Error('Mock data generation is disabled - use real API data from FastAPI backend')
}

export function generateRandomFileSize(): number {
  console.warn('generateRandomFileSize is deprecated - use real API data instead')
  throw new Error('Mock data generation is disabled - use real API data from FastAPI backend')
}
