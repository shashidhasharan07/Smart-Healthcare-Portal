import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Stethoscope,
  X,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    doctor_id: '',
    time: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        axios.get(`${API_URL}/appointments`),
        axios.get(`${API_URL}/doctors`),
      ]);
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !formData.doctor_id || !formData.time || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/appointments`, {
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
      toast.success('Appointment booked successfully!');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast.error(error.response?.data?.detail || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      await axios.delete(`${API_URL}/appointments/${appointmentId}`);
      toast.success('Appointment cancelled');
      fetchData();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const resetForm = () => {
    setFormData({ doctor_id: '', time: '', reason: '', notes: '' });
    setSelectedDate(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary text-primary-foreground';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const selectedDoctor = doctors.find(d => d.id === formData.doctor_id);

  return (
    <DashboardLayout>
      <div data-testid="appointments-page" className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-3xl text-foreground">Appointments</h1>
            <p className="text-muted-foreground">Manage your healthcare appointments</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-scale" data-testid="book-appointment-btn">
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">Book New Appointment</DialogTitle>
                <DialogDescription>
                  Select a doctor, date, and time for your appointment
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Doctor Selection */}
                <div className="space-y-2">
                  <Label>Select Doctor *</Label>
                  <Select
                    value={formData.doctor_id}
                    onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                  >
                    <SelectTrigger data-testid="doctor-select">
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex items-center gap-2">
                            <span>{doctor.name}</span>
                            <span className="text-muted-foreground">- {doctor.specialty}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Doctor Info */}
                {selectedDoctor && (
                  <Card className="bg-secondary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedDoctor.image_url}
                          alt={selectedDoctor.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{selectedDoctor.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                          <p className="text-sm text-primary font-medium">${selectedDoctor.consultation_fee}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label>Select Date *</Label>
                  <div className="border rounded-lg p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      className="mx-auto"
                      data-testid="appointment-calendar"
                    />
                  </div>
                  {selectedDate && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {format(selectedDate, 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label>Select Time *</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={formData.time === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, time })}
                        data-testid={`time-slot-${time.replace(/[: ]/g, '-')}`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit *</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="e.g., Annual checkup, Follow-up visit"
                    required
                    data-testid="reason-input"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional information for the doctor"
                    rows={3}
                    data-testid="notes-input"
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} data-testid="confirm-booking-btn">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <Card data-testid="no-appointments-card">
            <CardContent className="p-12 text-center">
              <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-xl mb-2">No appointments yet</h3>
              <p className="text-muted-foreground mb-6">
                Book your first appointment with one of our healthcare professionals
              </p>
              <Button onClick={() => setDialogOpen(true)} data-testid="book-first-appointment-btn">
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="card-hover" data-testid={`appointment-card-${appointment.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-heading font-semibold text-lg">{appointment.doctor_name}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.doctor_specialty}</p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDate(appointment.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </span>
                      </div>
                      
                      <p className="text-sm">
                        <span className="text-muted-foreground">Reason: </span>
                        {appointment.reason}
                      </p>
                      
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground">
                          Notes: {appointment.notes}
                        </p>
                      )}
                    </div>

                    {appointment.status === 'scheduled' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancel(appointment.id)}
                        data-testid={`cancel-appointment-${appointment.id}`}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AppointmentsPage;
