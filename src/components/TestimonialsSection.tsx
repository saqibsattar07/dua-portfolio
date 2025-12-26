import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Working with this designer was an absolute pleasure. They understood our vision perfectly and delivered beyond expectations.",
    author: "Sarah Mitchell",
    role: "CEO, TechVentures",
  },
  {
    quote: "Incredible attention to detail and creative vision. Our brand has never looked better. Highly recommended!",
    author: "James Rodriguez",
    role: "Founder, Luxe Co",
  },
  {
    quote: "The design transformed our entire digital presence. Professional, creative, and always delivering on time.",
    author: "Emily Chen",
    role: "Marketing Director, StartupXYZ",
  },
];

export function TestimonialsSection() {
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
      ref={sectionRef}
      className="py-24 md:py-32 relative bg-muted/30"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block text-primary font-semibold mb-4">Testimonials</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
            What <span className="gradient-text">Clients Say</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={`glass-card rounded-2xl p-8 hover-lift transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Quote Icon */}
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-6">
                <Quote className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Quote Text */}
              <p className="text-foreground text-lg leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div>
                <div className="font-display font-semibold text-foreground">
                  {testimonial.author}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
