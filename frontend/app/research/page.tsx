import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Calendar, Users, ExternalLink, Filter } from "lucide-react"
import Link from "next/link"

const researchPapers = [
  {
    title: "Neural Plasticity in Microgravity Environments",
    authors: "Johnson, M., Chen, L., Rodriguez, A.",
    date: "2024",
    category: "Space Neuroscience",
    abstract:
      "Investigation of structural and functional changes in neural networks during extended spaceflight missions.",
    citations: 142,
  },
  {
    title: "Brain-Computer Interface Applications for Space Exploration",
    authors: "Williams, K., Patel, R., Thompson, S.",
    date: "2023",
    category: "BCI Technology",
    abstract:
      "Novel approaches to implementing BCI systems in zero-gravity environments for enhanced astronaut control.",
    citations: 98,
  },
  {
    title: "Cognitive Function During Long-Duration Space Missions",
    authors: "Anderson, T., Lee, J., Martinez, C.",
    date: "2024",
    category: "Cognitive Science",
    abstract:
      "Longitudinal study of cognitive performance and neural adaptation in astronauts during 6-month ISS missions.",
    citations: 76,
  },
  {
    title: "Machine Learning for Neural Signal Classification",
    authors: "Zhang, Y., Kumar, A., Brown, D.",
    date: "2023",
    category: "AI & ML",
    abstract:
      "Deep learning architectures for real-time classification of neural activity patterns in space environments.",
    citations: 134,
  },
  {
    title: "Ethical Frameworks for BCI Development",
    authors: "Davis, E., Wilson, M., Garcia, P.",
    date: "2024",
    category: "Ethics",
    abstract:
      "Comprehensive guidelines for responsible development and deployment of brain-computer interface technologies.",
    citations: 89,
  },
  {
    title: "Neurogenesis in Altered Gravity Conditions",
    authors: "Taylor, R., Nguyen, H., Clark, B.",
    date: "2023",
    category: "Space Biology",
    abstract: "Effects of microgravity and hypergravity on neural stem cell proliferation and differentiation.",
    citations: 112,
  },
]

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-sans text-3xl font-bold text-foreground md:text-4xl">Research Database</h1>
              <p className="text-muted-foreground">Explore NASA bioscience publications and studies</p>
            </div>
          </div>

          {/* Search and Filter */}
          <Card className="p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search research papers..." className="pl-10" />
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="mb-1 text-2xl font-bold text-primary">10,247</div>
            <div className="text-sm text-muted-foreground">Total Papers</div>
          </Card>
          <Card className="p-4">
            <div className="mb-1 text-2xl font-bold text-accent">1,842</div>
            <div className="text-sm text-muted-foreground">BCI Studies</div>
          </Card>
          <Card className="p-4">
            <div className="mb-1 text-2xl font-bold text-secondary">3,456</div>
            <div className="text-sm text-muted-foreground">Space Biology</div>
          </Card>
          <Card className="p-4">
            <div className="mb-1 text-2xl font-bold text-chart-2">892</div>
            <div className="text-sm text-muted-foreground">AI/ML Papers</div>
          </Card>
        </div>

        {/* Research Papers */}
        <div className="mb-8">
          <h2 className="mb-6 font-sans text-2xl font-bold text-foreground">Featured Research</h2>
          <div className="space-y-4">
            {researchPapers.map((paper, index) => (
              <Card key={index} className="p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="mb-2 font-sans text-lg font-semibold text-foreground hover:text-primary">
                      <Link href="#">{paper.title}</Link>
                    </h3>
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {paper.authors}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {paper.date}
                      </span>
                    </div>
                    <div className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {paper.category}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    View Paper
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mb-3 text-sm text-muted-foreground leading-relaxed">{paper.abstract}</p>
                <div className="text-xs text-muted-foreground">Cited by {paper.citations} publications</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <Card className="p-8">
          <h2 className="mb-6 font-sans text-2xl font-bold text-foreground">Research Categories</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Space Neuroscience",
              "BCI Technology",
              "Cognitive Science",
              "AI & Machine Learning",
              "Ethics & Policy",
              "Space Biology",
              "Neural Plasticity",
              "Sensory Systems",
              "Motor Control",
            ].map((category, index) => (
              <Button key={index} variant="outline" className="justify-start bg-transparent">
                {category}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
