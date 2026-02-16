
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, MessageSquare, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackModalProps {
  children?: React.ReactNode;
}

export function FeedbackModal({ children }: FeedbackModalProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to capture screenshot (naive implementation)
  const captureScreenshot = async (): Promise<string | null> => {
    try {
      // If we are in the 3D context (R3F), we might need to access the canvas.
      // Since this component is outside the Canvas, we can look for the canvas element.
      const canvas = document.querySelector('canvas');
      if (canvas) {
        return canvas.toDataURL('image/png');
      }
      return null;
    } catch (e) {
      console.error("Screenshot failed", e);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setIsSubmitting(true);
    let screenshotUrl = null;

    if (includeScreenshot) {
      screenshotUrl = await captureScreenshot();
    }

    try {
      // Assuming axios base URL matches backend or we use relative if proxied
      // The ARStudio uses http://localhost:3001/api/cars, so we should use full URL or ensure proxy
      // Let's use the same host logic or just hardcode for MVP: http://localhost:3001/api/feedback
      // Better: use a configured axios instance if avail, else fetch.
      
      const payload = {
        rating,
        category,
        message,
        screenshot: screenshotUrl 
      };

      // Using fetch for simplicity to avoid import issues if axios not configured globally
      const token = localStorage.getItem('token'); // Assuming auth token management
      
      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success("Feedback submitted! Thank you.");
      setOpen(false);
      // Reset form
      setRating(0);
      setCategory('Suggestion');
      setMessage('');
      setIncludeScreenshot(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          
          {/* Rating */}
          <div className="flex flex-col gap-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 hover:scale-110 transition-transform ${rating >= star ? 'text-yellow-400' : 'text-muted-foreground/30'}`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug">Bug Report</SelectItem>
                <SelectItem value="Suggestion">Feature Suggestion</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us what you think..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Screenshot */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="screenshot" 
              checked={includeScreenshot} 
              onCheckedChange={(checked) => setIncludeScreenshot(checked === true)}
            />
            <Label htmlFor="screenshot" className="flex items-center gap-2 cursor-pointer">
              <Camera className="w-4 h-4" />
              Include screenshot of current view
            </Label>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
