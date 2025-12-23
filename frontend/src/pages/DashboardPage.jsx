import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Calendar,
  FileText,
  MessageSquare,
  Activity,
  ArrowRight,
  Clock,
  Stethoscope,
  TrendingUp,
  Heart,
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule a visit with a doctor',
      icon: Calendar,
      link: '/appointments',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'View Records',
      description: 'Access your medical history',
      icon: FileText,
      link: '/medical-records',
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'AI Assistant',
      description: 'Get health recommendations',
      icon: MessageSquare,
      link: '/ai-assistant',
      color: 'bg-[hsl(var(--ai-glow))]/10 text-[hsl(var(--ai-glow))]',
    },
    {
      title: 'Find Doctors',
      description: 'Browse available doctors',
      icon: Stethoscope,
      link: '/doctors',
      color: 'bg-chart-2/20 text-chart-1',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div data-testid="patient-dashboard" className="space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="font-heading font-bold text-3xl text-foreground">
            {getGreeting()}, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your health journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover" data-testid="stat-upcoming-appointments">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '-' : stats?.upcoming_appointments || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover" data-testid="stat-total-appointments">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '-' : stats?.total_appointments || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover" data-testid="stat-medical-records">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Medical</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '-' : stats?.total_records || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Records</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover" data-testid="stat-health-score">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Health</p>
                  <p className="text-2xl font-bold text-foreground">Good</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    Trending up
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-heading font-semibold text-xl">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.link}>
                    <Card className="card-hover cursor-pointer h-full" data-testid={`quick-action-${index}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <h3 className="font-heading font-semibold mt-4">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-xl">Recent Appointments</h2>
              <Link to="/appointments">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all
                </Button>
              </Link>
            </div>
            <Card data-testid="recent-appointments-card">
              <CardContent className="p-4 space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : stats?.recent_appointments?.length > 0 ? (
                  stats.recent_appointments.slice(0, 4).map((apt, index) => (
                    <div key={apt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{apt.doctor_name}</p>
                        <p className="text-xs text-muted-foreground">{apt.doctor_specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{formatDate(apt.date)}</p>
                        <Badge variant={apt.status === 'scheduled' ? 'default' : 'secondary'} className="text-xs">
                          {apt.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No appointments yet</p>
                    <Link to="/appointments">
                      <Button variant="link" size="sm" className="mt-2">
                        Book your first appointment
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Assistant Promo */}
        <Card className="overflow-hidden" data-testid="ai-assistant-promo">
          <div className="grid md:grid-cols-2 gap-6">
            <CardContent className="p-8 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--ai-glow))]/10 text-[hsl(var(--ai-glow))] text-xs font-medium w-fit mb-4">
                <MessageSquare className="w-3 h-3" />
                AI-Powered
              </div>
              <h2 className="font-heading font-bold text-2xl mb-2">
                Your Personal Health Assistant
              </h2>
              <p className="text-muted-foreground mb-6">
                Get instant answers to your health questions, personalized recommendations, and wellness tips powered by advanced AI.
              </p>
              <Link to="/ai-assistant">
                <Button className="btn-scale w-fit" data-testid="chat-with-ai-btn">
                  Chat with AI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
            <div className="hidden md:block bg-gradient-to-br from-[hsl(var(--ai-glow))]/10 to-primary/10 p-8">
              <div className="h-full flex items-center justify-center">
                <div className="space-y-3 w-full max-w-sm">
                  <div className="chat-message-ai">
                    <p className="text-sm">Hello! I'm your AI health assistant. How can I help you today?</p>
                  </div>
                  <div className="chat-message-user ml-auto w-fit">
                    <p className="text-sm">What are some tips for better sleep?</p>
                  </div>
                  <div className="chat-message-ai">
                    <p className="text-sm">Great question! Here are some evidence-based tips...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
