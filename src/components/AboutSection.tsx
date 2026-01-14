import { useEffect, useRef, useState } from "react";

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-24 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-card p-2">
              <img 
                src="/images/dua.jpeg" 
                alt="Graphic Designer" 
                className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] object-cover rounded-2xl"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full gradient-bg opacity-20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-secondary opacity-40 blur-2xl" />
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <span className="inline-block text-primary font-semibold mb-4">About Me</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
              Turning Ideas Into
              <span className="gradient-text"> Visual Magic</span>
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                I am a passionate graphic designer with over 5 years of experience creating stunning visual identities
                for brands worldwide.
              </p>
              <p>
                I believe design is not just about making things look pretty it's about solving problems, telling
                stories, and creating meaningful connections between brands and their audiences.
              </p>
              <p>
                When I am not pushing pixels, you'll find me exploring new design trends, sipping coffee, or hunting for
                inspiration in the most unexpected places.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              {[
                { number: "5+", label: "Years Experience" },
                { number: "100+", label: "Projects Done" },
                { number: "50+", label: "Happy Clients" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center transition-all duration-700`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="font-display font-bold text-3xl md:text-4xl gradient-text">{stat.number}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
