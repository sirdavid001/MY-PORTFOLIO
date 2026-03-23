import Logo from "./Logo";
import { Link } from "react-router-dom";
import { CV_PROFILE } from "../../../shared/cv/profile.js";

export default function Footer() {
  return (
    <footer className="bg-background pb-12 pt-20 border-t border-border/40">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-lg leading-relaxed text-muted-foreground">
              Computer Science graduate building practical digital experiences with strong attention to clarity,
              reliability, and execution.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-bold text-foreground">Quick Links</h4>
            <div className="grid gap-3 text-lg text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-bold text-foreground">Connect</h4>
            <div className="flex flex-wrap gap-2">
              <a 
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5" 
                href={CV_PROFILE.githubUrl} 
                target="_blank" 
                rel="noreferrer"
              >
                GitHub
              </a>
              <a 
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5" 
                href={CV_PROFILE.portfolioUrl} 
                target="_blank" 
                rel="noreferrer"
              >
                Portfolio
              </a>
              <a 
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5" 
                href={`mailto:${CV_PROFILE.email}`}
              >
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border/40 pt-8 text-center text-sm font-medium text-muted-foreground">
          &copy; {new Date().getFullYear()} {CV_PROFILE.name}. Crafted with precision.
        </div>
      </div>
    </footer>
  );
}
