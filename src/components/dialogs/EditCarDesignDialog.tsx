"use client";

import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editCarDesignSchema } from "@/lib/schemas";
import { Car } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { designApi, type DesignData } from "@/store/designStore"; // Import DesignData
import { Loader2 } from "lucide-react";

import type { EditCarDesignFormInput } from "@/lib/schemas";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Update Props interface to match your database structure
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design?: {
    id?: number;
    name: string;
    description: string;
    thumbnail_url?: string;
    model_data?: Record<string, unknown>;
    color_data?: Record<string, unknown>;
    parts_data?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
  };
  onSave: (data: DesignData) => void; // Use DesignData instead of EditCarDesignFormData
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const LoadingButton: React.FC<ButtonProps> = ({
  children,
  isLoading,
  ...props
}) => (
  <Button {...props} disabled={isLoading}>
    {isLoading ? (
      <Button>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Saving...
      </Button>
    ) : (
      children
    )}
  </Button>
);

export function EditCarDesignDialog({
  open,
  onOpenChange,
  design,
  onSave,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditCarDesignFormInput>({
    resolver: zodResolver(editCarDesignSchema),
    defaultValues: {
      name: design?.name || "",
      description: design?.description || "",
    },
  });

  // Reset form when design changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: design?.name || "",
        description: design?.description || "",
      });
    }
  }, [open, design, form]);

  const onSubmit: SubmitHandler<EditCarDesignFormInput> = async (formData) => {
    try {
      setIsLoading(true);
      const parsed = editCarDesignSchema.parse(formData);

      // Prepare data according to DesignData interface
      const designData: DesignData = {
        name: parsed.name,
        description: parsed.description,
        // Preserve existing data
        model_data: design?.model_data || {},
        color_data: design?.color_data || {},
        parts_data: design?.parts_data || {},
        thumbnail_url: design?.thumbnail_url,
      };

      if (design?.id) {
        await designApi.updateDesign(design.id, designData);
        toast.success("Design updated successfully!");
      } else {
        await designApi.createDesign(designData);
        toast.success("Design created successfully!");
      }

      onSave(designData);
      onOpenChange(false);
    } catch (error: unknown) {
      // Safe error handling
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save design";
      toast.error(errorMessage);
      console.error("Error saving design:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            {design?.id ? "Edit Car Design" : "Create New Design"}
          </DialogTitle>
          <DialogDescription>
            {design?.id
              ? "Update the details of your car design below."
              : "Create a new car design with the details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Design Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter design name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" isLoading={isLoading}>
                {design?.id ? "Save Changes" : "Create Design"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
