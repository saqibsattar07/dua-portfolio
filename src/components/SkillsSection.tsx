import { useEffect, useRef, useState } from "react";
import { Palette, PenTool, Figma, Layout, Brush, Layers } from "lucide-react";

const skills = [
  {
    icon: Palette,
    title: "Brand Identity",
    description: "Creating memorable visual identities that resonate with audiences",
  },
  {
    icon: Layout,
    title: "UI/UX Design",
    description: "Designing intuitive and beautiful digital experiences",
  },
  {
    icon: PenTool,
    title: "Illustration",
    description: "Custom illustrations that bring stories to life",
  },
  {
    icon: Figma,
    title: "Figma",
    description: "Expert-level proficiency in modern design tools",
  },
  {
    icon: Brush,
    title: "Adobe Suite",
    description: "Photoshop, Illustrator, InDesign mastery",
  },
  {
    icon: Layers,
    title: "Motion Design",
    description: "Bringing designs to life with subtle animations",
  },
];

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" ref={sectionRef} className="py-24 md:py-32 relative bg-muted/30">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block text-primary font-semibold mb-4">Skills & Tools</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-10">
            What I <span className="gradient-text">Bring to the Table</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A carefully curated toolkit for crafting exceptional design solutions
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => (
            <div
              key={skill.title}
              className={`group glass-card rounded-2xl p-8 hover-lift cursor-pointer transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6 group-hover:glow-effect transition-all duration-500">
                <skill.icon className="w-7 h-7 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="font-display font-bold text-xl mb-3 group-hover:gradient-text transition-all duration-300">
                {skill.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{skill.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
