import { Heart, Mail, Phone, MapPin, Instagram, Linkedin, Facebook, ArrowUp } from "lucide-react";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Work", href: "#work" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/dua_shafiq44", icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/syedadua.shah.71", icon: Facebook },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/syeda-dua-shah-aa2047321", icon: Linkedin },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <a href="#home" className="flex items-center mb-4">
              <img src={logo} alt="Dua Logo" className="h-12 w-auto" />
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Creative graphic designer passionate about crafting beautiful, meaningful designs that tell stories and connect brands with their audiences.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">Services</h4>
            <ul className="space-y-3">
              <li><span className="text-muted-foreground text-sm">Brand Identity</span></li>
              <li><span className="text-muted-foreground text-sm">UI/UX Design</span></li>
              <li><span className="text-muted-foreground text-sm">Print Design</span></li>
              <li><span className="text-muted-foreground text-sm">Social Media Graphics</span></li>
              <li><span className="text-muted-foreground text-sm">Packaging Design</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">Get in Touch</h4>
            <ul className="space-y-4">
          <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href="mailto:sduashah17@gmail.com" className="text-sm text-foreground hover:text-primary transition-colors">
                    sduashah17@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href="tel:+923172938921" className="text-sm text-foreground hover:text-primary transition-colors">
                    +92 317 293 8921
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-sm text-foreground">
                    Karachi, Pakistan
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <span>© {new Date().getFullYear()} Syeda Dua Shah. Made with</span>
              <Heart className="w-4 h-4 text-primary fill-primary" />
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <button
                onClick={scrollToTop}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
