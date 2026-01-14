import { useEffect, useRef, useState } from "react";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote: "Muhammad delivered exceptional social media designs for our restaurant campaign. His creativity and quick turnaround were impressive. The engagement on our posts increased by 40%!",
    author: "Ahmed Khan",
    role: "Owner, Karachi Bites Restaurant",
    rating: 5,
    avatar: "AK",
    date: "2 weeks ago",
  },
  {
    quote: "The travel poster designs were stunning! Our Baku trip campaign got so much attention. Very professional communication and understood exactly what we needed.",
    author: "Fatima Malik",
    role: "Marketing Manager, Dimension Travels",
    rating: 5,
    avatar: "FM",
    date: "1 month ago",
  },
  {
    quote: "Brilliant work on our solar panel promotional materials. Clean, professional design that helped us close more deals. Will definitely work together again!",
    author: "Hassan Ali",
    role: "Director, Solar Square Pakistan",
    rating: 5,
    avatar: "HA",
    date: "3 weeks ago",
  },
  {
    quote: "The real estate listing designs were exactly what we needed - modern and eye-catching. Got more inquiries on properties with his designs. Highly recommend!",
    author: "Sarah Ahmed",
    role: "Real Estate Agent, Downtown Realty",
    rating: 5,
    avatar: "SA",
    date: "1 month ago",
  },
  {
    quote: "Amazing food photography and social media post designs. Our Pizza Hut franchise saw a significant boost in orders after using his creatives.",
    author: "Bilal Hussain",
    role: "Franchise Owner, Pizza Hut Lahore",
    rating: 5,
    avatar: "BH",
    date: "2 months ago",
  },
  {
    quote: "Very talented designer! Created beautiful beauty product ads for our skincare line. The aesthetic matched our brand perfectly. Fast delivery and great communication.",
    author: "Ayesha Tariq",
    role: "Founder, NikSkin Beauty",
    rating: 5,
    avatar: "AT",
    date: "1 month ago",
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={`glass-card rounded-2xl p-6 hover-lift transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Header with Avatar and Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {testimonial.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-foreground truncate">
                    {testimonial.author}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote Text */}
              <p className="text-foreground/90 text-sm leading-relaxed mb-4">
                "{testimonial.quote}"
              </p>

              {/* Date */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {testimonial.date}
                </div>
                <Quote className="w-4 h-4 text-primary/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
