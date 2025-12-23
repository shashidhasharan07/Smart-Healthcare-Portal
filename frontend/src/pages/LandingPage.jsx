import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import {
  Heart,
  Calendar,
  FileText,
  MessageSquare,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Stethoscope,
  Activity,
  Users,
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments with top healthcare professionals in just a few clicks.',
    },
    {
      icon: FileText,
      title: 'Medical Records Management',
      description: 'Securely store and access your medical history, prescriptions, and test results.',
    },
    {
      icon: MessageSquare,
      title: 'AI Health Assistant',
      description: 'Get instant health insights and recommendations powered by advanced AI technology.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected with enterprise-grade security.',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Patients Served' },
    { value: '500+', label: 'Healthcare Providers' },
    { value: '98%', label: 'Patient Satisfaction' },
    { value: '24/7', label: 'AI Support' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2" data-testid="landing-logo">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">
                Vital<span className="gradient-text">Sync</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {user ? (
                <Button onClick={() => navigate('/dashboard')} data-testid="go-dashboard-btn">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" data-testid="login-btn">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button data-testid="register-btn">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                <Activity className="w-4 h-4" />
                AI-Powered Healthcare Platform
              </div>
              
              <h1 className="font-heading font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl text-foreground">
                Your Health,{' '}
                <span className="gradient-text">Simplified</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Experience seamless healthcare management with AI-powered insights, 
                easy appointment scheduling, and secure medical records — all in one place.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="btn-scale" data-testid="hero-get-started-btn">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="btn-scale" data-testid="hero-signin-btn">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">Trusted by 10,000+ patients</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative lg:pl-8">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1623261887327-c1d2d2ad0137?w=800&q=80"
                  alt="Healthcare consultation"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              
              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 glass rounded-xl p-4 shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Next Appointment</p>
                    <p className="text-xs text-muted-foreground">Dr. Sarah Mitchell</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 glass rounded-xl p-4 shadow-lg animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center ai-glow">
                    <MessageSquare className="w-5 h-5 text-[hsl(var(--ai-glow))]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Assistant</p>
                    <p className="text-xs text-muted-foreground">Online 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-heading font-bold text-3xl md:text-4xl text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold tracking-tight text-3xl md:text-4xl text-foreground">
              Everything You Need for Better Health
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              VitalSync combines cutting-edge technology with healthcare expertise to deliver 
              a comprehensive health management experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="card-hover border-border/50" data-testid={`feature-card-${index}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1682684123154-c21854fd90cf?w=800&q=80"
                alt="AI Technology"
                className="rounded-2xl shadow-xl"
              />
            </div>
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--ai-glow))]/10 text-[hsl(var(--ai-glow))] text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                Powered by GPT-5.1
              </div>
              
              <h2 className="font-heading font-bold tracking-tight text-3xl md:text-4xl text-foreground">
                Meet Your AI Health Assistant
              </h2>
              
              <p className="text-lg text-muted-foreground">
                Get instant answers to your health questions, personalized wellness tips, 
                and guidance on when to seek professional care — all powered by advanced AI.
              </p>
              
              <ul className="space-y-4">
                {[
                  '24/7 availability for health queries',
                  'Personalized health recommendations',
                  'Symptom checker and guidance',
                  'Medication reminders and tips',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Clock className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/register">
                <Button size="lg" className="btn-scale mt-4" data-testid="try-ai-btn">
                  Try AI Assistant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold tracking-tight text-3xl md:text-4xl text-foreground mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of patients who trust VitalSync for their healthcare needs.
          </p>
          <Link to="/register">
            <Button size="lg" className="btn-scale" data-testid="cta-get-started-btn">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">
                Vital<span className="gradient-text">Sync</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 VitalSync AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
