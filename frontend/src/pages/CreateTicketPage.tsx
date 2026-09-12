import React, { useState } from 'react';
import { CreateTicketInput, TicketPriority } from '../types/ticket';
import { ticketService } from '../lib/api';
import { Button } from '../components/common/Button';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreateTicketPageProps {
  onCancel: () => void;
  onSuccess: (ticketId: string) => void;
}

export const CreateTicketPage: React.FC<CreateTicketPageProps> = ({
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateTicketInput>({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'medium',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Customer email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customer_email.trim())) {
        newErrors.customer_email = 'Please enter a valid email address';
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Issue description is required';
    } else if (formData.description.trim().length < 15) {
      newErrors.description = 'Please provide more details (at least 15 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const created = await ticketService.createTicket(formData);
      onSuccess(created.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create ticket. Please try again.';
      setApiError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Back link */}
      <div className="mb-4">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Ticket Queue</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <h1 className="text-base font-semibold text-slate-100">
            Create Operational Ticket
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Manually log an inbound customer issue for AI-assisted triage and operator resolution.
          </p>
        </div>

        {apiError && (
          <div className="mx-6 mt-4 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Customer Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer_name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Customer Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="customer_name"
                type="text"
                placeholder="e.g. Sarah Connor"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                className={`w-full px-3 py-2 text-xs bg-slate-950 border rounded-md text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.customer_name
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-700/80 focus:border-blue-500'
                }`}
              />
              {errors.customer_name && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.customer_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="customer_email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Customer Email <span className="text-rose-400">*</span>
              </label>
              <input
                id="customer_email"
                type="email"
                placeholder="e.g. s.connor@cyberdyne.com"
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({ ...formData, customer_email: e.target.value })
                }
                className={`w-full px-3 py-2 text-xs bg-slate-950 border rounded-md text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.customer_email
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-700/80 focus:border-blue-500'
                }`}
              />
              {errors.customer_email && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.customer_email}</p>
              )}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Initial Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as TicketPriority[]).map((p) => {
                const isSelected = formData.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`py-1.5 px-3 text-xs font-medium rounded-md border capitalize text-center transition-colors ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="ticket_subject" className="block text-xs font-medium text-slate-300 mb-1.5">
              Subject <span className="text-rose-400">*</span>
            </label>
            <input
              id="ticket_subject"
              type="text"
              placeholder="Brief summary of the issue or inquiry"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`w-full px-3 py-2 text-xs bg-slate-950 border rounded-md text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.subject
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-700/80 focus:border-blue-500'
              }`}
            />
            {errors.subject && (
              <p className="mt-1 text-[11px] text-rose-400">{errors.subject}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="ticket_description" className="block text-xs font-medium text-slate-300 mb-1.5">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="ticket_description"
              rows={6}
              placeholder="Paste full customer inquiry, logs, or error message here..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`w-full px-3 py-2 text-xs bg-slate-950 border rounded-md text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed ${
                errors.description
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-700/80 focus:border-blue-500'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-[11px] text-rose-400">{errors.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Create Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
