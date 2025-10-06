import { Card } from "@/components/ui/card"
import { Brain, Target, Users, Rocket, Shield, Lightbulb } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-9 w-9 text-primary" />
          </div>
          <h1 className="mb-4 font-sans text-4xl font-bold text-foreground md:text-5xl text-balance">
            About Our Mission
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Advancing neuroscience research through artificial intelligence and supporting NASA's bioscience initiatives
            for the future of space exploration.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 md:p-12">
          <h2 className="mb-4 font-sans text-2xl font-bold text-foreground">Our Mission</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            We are dedicated to advancing the field of neuroscience through cutting-edge artificial intelligence
            technologies. Our platform serves as a bridge between NASA's extensive bioscience research and the global
            scientific community, providing powerful tools for data analysis, knowledge discovery, and collaborative
            research.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By combining machine learning with decades of NASA research, we aim to accelerate discoveries in neural
            science, brain-computer interfaces, and the effects of space environments on human biology.
          </p>
        </Card>

        {/* Values */}
        <div className="mb-12">
          <h2 className="mb-8 text-center font-sans text-3xl font-bold text-foreground">Our Core Values</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">Scientific Excellence</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Maintaining the highest standards of research integrity and accuracy in all our AI models and data
                analysis.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">Open Collaboration</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fostering a global community of researchers, scientists, and innovators working together to advance
                knowledge.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">Ethical Practice</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ensuring responsible development and use of brain-computer interfaces with strong ethical guidelines and
                protections.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                <Rocket className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">Innovation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pushing the boundaries of what's possible in neuroscience research and space biology through AI
                technology.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                <Lightbulb className="h-6 w-6 text-chart-4" />
              </div>
              <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">Accessibility</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Making advanced research tools and NASA data accessible to researchers worldwide, regardless of
                resources.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-5/10">
                <Brain className="h-6 w-6 text-chart-5" />
              </div>
              <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">Human-Centered</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Prioritizing human wellbeing and safety in all BCI research and neural technology development.
              </p>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <Card className="mb-12 p-8">
          <h2 className="mb-6 font-sans text-2xl font-bold text-foreground">Our Team</h2>
          <p className="mb-8 text-muted-foreground leading-relaxed">
            Our multidisciplinary team brings together expertise in neuroscience, artificial intelligence, space
            biology, and ethics. We work closely with NASA researchers, academic institutions, and industry partners to
            ensure our platform meets the highest standards of scientific rigor.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Davis Juell */}
            <div className="group flex flex-col items-center text-center">
              <div className="mb-3 h-32 w-32 overflow-hidden rounded-full border-2 border-muted transition-all duration-300 group-hover:border-primary group-hover:shadow-lg">
                <img
                  src="/davis.png"
                  alt="Davis Juell"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="mb-1 font-sans text-base font-semibold text-foreground">Davis Juell</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                MSc Neuroscience at University of Lethbridge
              </p>
            </div>

            {/* Karanjot Singh */}
            <div className="group flex flex-col items-center text-center">
              <div className="mb-3 h-32 w-32 overflow-hidden rounded-full border-2 border-muted transition-all duration-300 group-hover:border-primary group-hover:shadow-lg">
                <img
                  src="/karan.png"
                  alt="Karanjot Singh"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="mb-1 font-sans text-base font-semibold text-foreground">Karanjot Singh</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Software Developer Intern at Government of Alberta, MSc Computing Science (AI Multimedia Specialization)
                University of Alberta
              </p>
            </div>

            {/* Melwin Chacko Money */}
            <div className="group flex flex-col items-center text-center">
              <div className="mb-3 h-32 w-32 overflow-hidden rounded-full border-2 border-muted transition-all duration-300 group-hover:border-primary group-hover:shadow-lg">
                <img
                  src="/melwin.png"
                  alt="Melwin Chacko Money"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="mb-1 font-sans text-base font-semibold text-foreground">Melwin Chacko Money</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                MSc in Biomedical Engineering at University of Alberta
              </p>
            </div>

            {/* Nena Sproule */}
            <div className="group flex flex-col items-center text-center">
              <div className="mb-3 h-32 w-32 overflow-hidden rounded-full border-2 border-muted transition-all duration-300 group-hover:border-primary group-hover:shadow-lg">
                <img
                  src="/nena.png"
                  alt="Nena Sproule"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="mb-1 font-sans text-base font-semibold text-foreground">Nena Sproule</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Multi-Media Artist, Illustrator and 2D Animator
              </p>
            </div>

            {/* Paula Frossard */}
            <div className="group flex flex-col items-center text-center">
              <div className="mb-3 h-32 w-32 overflow-hidden rounded-full border-2 border-muted transition-all duration-300 group-hover:border-primary group-hover:shadow-lg">
                <img
                  src="/paula.png"
                  alt="Paula Frossard"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="mb-1 font-sans text-base font-semibold text-foreground">Paula Frossard</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                UX Researcher and Designer Specialist. Machine Learning Analyst student at Norquest College
              </p>
            </div>

            {/* Tanveer Singh Bhatia */}
            <div className="group flex flex-col items-center text-center">
              <div className="mb-3 h-32 w-32 overflow-hidden rounded-full border-2 border-muted transition-all duration-300 group-hover:border-primary group-hover:shadow-lg">
                <img
                  src="/tanveer.png"
                  alt="Tanveer Singh Bhatia"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="mb-1 font-sans text-base font-semibold text-foreground">Tanveer Singh Bhatia</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                MSc Computing Science (AI specialization) at University of Alberta
              </p>
            </div>
          </div>
        </Card>

        {/* Impact */}
        <Card className="bg-gradient-to-br from-accent/5 via-card to-primary/5 p-8">
          <h2 className="mb-4 font-sans text-2xl font-bold text-foreground">Our Impact</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 text-3xl font-bold text-primary">10,000+</div>
              <div className="text-sm text-muted-foreground">Research papers analyzed</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-accent">500+</div>
              <div className="text-sm text-muted-foreground">Active researchers</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-secondary">50+</div>
              <div className="text-sm text-muted-foreground">Partner institutions</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-chart-2">95%</div>
              <div className="text-sm text-muted-foreground">Classification accuracy</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
