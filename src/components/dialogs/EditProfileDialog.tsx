import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Save, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfileSchema } from "@/lib/schemas";
import type { EditProfileFormData } from "@/lib/schemas";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      bio: "Car enthusiast and AR customization expert",
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onOpenChange(false);
      console.log("Profile updated:", data);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary animate-pulse" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>

            {/* Form Fields */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="bg-background/50 border-input focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="bg-background/50 border-input focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      className="bg-background/50 border-input focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Tell us about yourself..."
                      className="bg-background/50 border-input focus:ring-primary"
                      {...field}
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
                className="border-border hover:bg-muted/50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} variant="default">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
