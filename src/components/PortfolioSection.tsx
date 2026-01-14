import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

const projects = [
  {
    title: "Social Media Designs",
    category: "Marketing",
    image: "/images/portfolio-1.png",
  },
  {
    title: "Calendar Graphics",
    category: "Branding",
    image: "/images/portfolio-2.png",
  },
  {
    title: "Beauty Product Campaign",
    category: "Product Design",
    image: "/images/portfolio-3.png",
  },
  {
    title: "Automotive Ad",
    category: "Advertising",
    image: "/images/portfolio-4.png",
  },
  {
    title: "Food & Restaurant",
    category: "Marketing",
    image: "/images/portfolio-5.png",
  },
];

export function PortfolioSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="py-24 md:py-32 relative"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block text-primary font-semibold mb-4">Portfolio</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
            Selected <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A collection of projects that showcase my passion for design excellence
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Background Image */}
              <img 
                src={project.image} 
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* Category Badge */}
                <div className="flex justify-end">
                  <span className="px-3 py-1 text-xs font-medium rounded-full glass-card opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-background">
                    {project.category}
                  </span>
                </div>

                {/* Title & Link */}
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-display font-bold text-2xl text-background mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2 text-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    <span className="text-sm font-medium">View Project</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
