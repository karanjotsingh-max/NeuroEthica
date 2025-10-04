import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, MessageSquare, Activity, ArrowRight, Sparkles, Database, Shield, Phone } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Powered by Advanced AI
          </div>
          <h1 className="mb-6 font-sans text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl text-balance">
            Advancing Neural Research Through{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </h1>
          <p className="mb-10 text-lg text-muted-foreground md:text-xl text-pretty max-w-3xl mx-auto leading-relaxed">
            Explore NASA bioscience publications, classify neural data, and contribute to groundbreaking research in
            brain-computer interfaces and neuroscience.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/chatbot">
                <MessageSquare className="h-5 w-5" />
                Try AI Chatbot
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 bg-transparent">
              <Link href="/classifier">
                <Activity className="h-5 w-5" />
                Neural Classifier
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-card">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-sans text-3xl font-bold text-foreground md:text-4xl text-balance">
              Comprehensive Research Tools
            </h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Access cutting-edge AI tools designed specifically for NASA bioscience research and neural data analysis.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group relative overflow-hidden border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-sans text-xl font-semibold text-card-foreground">AI Research Chatbot</h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Trained on NASA bioscience publications. Ask questions, explore research, and get instant insights from
                thousands of scientific papers.
              </p>
              <Link
                href="/chatbot"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
              >
                Explore Chatbot <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            <Card className="group relative overflow-hidden border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-sans text-xl font-semibold text-card-foreground">Neural Data Classifier</h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Visualize and classify neural data with advanced machine learning algorithms. Upload datasets and get
                real-time analysis.
              </p>
              <Link
                href="/classifier"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
              >
                Try Classifier <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            <Card className="group relative overflow-hidden border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-sans text-xl font-semibold text-card-foreground">Research Database</h3>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Access our comprehensive database of NASA bioscience research, publications, and collaborative studies.
              </p>
              <Link
                href="/research"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
              >
                Browse Research <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="mx-auto max-w-4xl text-center">
          <Brain className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h2 className="mb-6 font-sans text-3xl font-bold text-foreground md:text-4xl text-balance">Our Mission</h2>
          <p className="mb-8 text-lg text-muted-foreground leading-relaxed text-pretty">
            We are dedicated to advancing neuroscience research through artificial intelligence, supporting NASA's
            bioscience initiatives, and ensuring ethical practices in brain-computer interface development. Our platform
            provides researchers with powerful tools to analyze neural data, explore scientific literature, and
            collaborate on groundbreaking discoveries.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More About Us</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 bg-transparent">
              <Link href="/donate">
                <Shield className="h-5 w-5" />
                Support Our Work
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-card">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 font-sans text-3xl font-bold text-foreground md:text-4xl text-balance">
            Need Help or Support?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground text-pretty">
            Our BCI-abuse hotline and contact team are here to assist with any concerns, questions, or support needs.
          </p>
          <Button asChild size="lg" variant="default" className="gap-2">
            <Link href="/contact">
              <Phone className="h-5 w-5" />
              Contact Us
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
