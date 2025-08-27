"use client";

import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editCarDesignSchema } from "@/lib/schemas";
import { Car } from "lucide-react";

import type {
  EditCarDesignFormInput,
  EditCarDesignFormData,
} from "@/lib/schemas";

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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design?: EditCarDesignFormData; // parsed design from backend
  onSave: (data: EditCarDesignFormData) => void;
};

export function EditCarDesignDialog({
  open,
  onOpenChange,
  design,
  onSave,
}: Props) {
  const form = useForm<EditCarDesignFormInput>({
    resolver: zodResolver(editCarDesignSchema),
    defaultValues: {
      name: design?.name || "",
      description: design?.description || "",
      category: design?.category || "",
      date:
        design?.date instanceof Date
          ? design.date.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit: SubmitHandler<EditCarDesignFormInput> = (rawData) => {
    const parsed = editCarDesignSchema.parse(rawData); // -> EditCarDesignFormData
    onSave(parsed);
    onOpenChange(false); // close after save
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Edit Car Design
          </DialogTitle>
          <DialogDescription>
            Update the details of your car design below.
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

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value as string} // 👈 cast unknown → string
                    />
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
              >
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
