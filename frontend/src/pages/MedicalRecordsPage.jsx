import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
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
  FileText,
  Plus,
  Calendar,
  Trash2,
  Loader2,
  FileImage,
  FilePlus,
  Activity,
  Pill,
  FlaskConical,
} from 'lucide-react';
import { format } from 'date-fns';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const recordTypes = [
  { value: 'prescription', label: 'Prescription', icon: Pill },
  { value: 'lab_result', label: 'Lab Result', icon: FlaskConical },
  { value: 'imaging', label: 'Imaging/X-Ray', icon: FileImage },
  { value: 'vaccination', label: 'Vaccination', icon: Activity },
  { value: 'diagnosis', label: 'Diagnosis', icon: FileText },
  { value: 'other', label: 'Other', icon: FilePlus },
];

const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    record_type: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    file_url: '',
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/medical-records`);
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.record_type || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/medical-records`, formData);
      toast.success('Record added successfully!');
      setDialogOpen(false);
      resetForm();
      fetchRecords();
    } catch (error) {
      console.error('Failed to add record:', error);
      toast.error(error.response?.data?.detail || 'Failed to add record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId) => {
    try {
      await axios.delete(`${API_URL}/medical-records/${recordId}`);
      toast.success('Record deleted');
      fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast.error('Failed to delete record');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      record_type: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      file_url: '',
    });
  };

  const getRecordIcon = (type) => {
    const recordType = recordTypes.find((r) => r.value === type);
    return recordType ? recordType.icon : FileText;
  };

  const getRecordLabel = (type) => {
    const recordType = recordTypes.find((r) => r.value === type);
    return recordType ? recordType.label : type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div data-testid="medical-records-page" className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-3xl text-foreground">Medical Records</h1>
            <p className="text-muted-foreground">Manage your health documents and history</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-scale" data-testid="add-record-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Add Medical Record</DialogTitle>
                <DialogDescription>
                  Add a new medical record to your health history
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Blood Test Results"
                    required
                    data-testid="record-title-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Record Type *</Label>
                  <Select
                    value={formData.record_type}
                    onValueChange={(value) => setFormData({ ...formData, record_type: value })}
                  >
                    <SelectTrigger data-testid="record-type-select">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    data-testid="record-date-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add any notes or details..."
                    rows={3}
                    data-testid="record-description-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file_url">File URL (Optional)</Label>
                  <Input
                    id="file_url"
                    type="url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    placeholder="https://..."
                    data-testid="record-file-url-input"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
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
                  <Button type="submit" disabled={submitting} data-testid="save-record-btn">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Record'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : records.length === 0 ? (
          <Card data-testid="no-records-card">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-xl mb-2">No medical records</h3>
              <p className="text-muted-foreground mb-6">
                Start building your health history by adding your first record
              </p>
              <Button onClick={() => setDialogOpen(true)} data-testid="add-first-record-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {records.map((record) => {
              const Icon = getRecordIcon(record.record_type);
              return (
                <Card key={record.id} className="card-hover" data-testid={`record-card-${record.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-semibold text-lg">{record.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="secondary">
                                {getRecordLabel(record.record_type)}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(record.date)}
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => handleDelete(record.id)}
                            data-testid={`delete-record-${record.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {record.description && (
                          <p className="text-sm text-muted-foreground mt-3">
                            {record.description}
                          </p>
                        )}
                        
                        {record.file_url && (
                          <a
                            href={record.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-2 inline-block"
                          >
                            View attached file →
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MedicalRecordsPage;
