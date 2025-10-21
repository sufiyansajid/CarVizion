import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfileSchema } from "@/lib/schemas";
import { userApi, type User, type AvatarResponse } from "@/store/userStore";
import { toast } from "sonner";
import { User as UserIcon, Camera, Save, X, Loader2 } from "lucide-react";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { EditProfileFormData } from "@/lib/schemas";
import { Textarea } from "@/components/ui/textarea";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave?: (user: User) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSave,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      setIsLoading(true);
      const promise = userApi.updateProfile(data);

      await toast.promise(promise, {
        loading: "Updating profile...",
        success: (response) => {
          onSave?.(response.user);
          onOpenChange(false);
          return response.message || "Profile updated successfully";
        },
        error: (error) => {
          return error.response?.data?.message || "Failed to update profile";
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setIsLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("avatar", file);

      const promise = userApi.updateAvatar(formData);

      await toast.promise<AvatarResponse>(promise, {
        loading: "Uploading avatar...",
        success: (response) => {
          if (onSave) {
            onSave(response.user);
          }
          return "Avatar updated successfully";
        },
        error: "Failed to upload avatar",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserIcon className="h-5 w-5 text-primary animate-pulse" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>
                  <UserIcon className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("avatar")?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="text"
                        className="bg-background/50 border-input focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="text"
                        className="bg-background/50 border-input focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      type="email"
                      className="bg-background/50 border-input focus:ring-primary"
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      type="tel"
                      className="bg-background/50 border-input focus:ring-primary"
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
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px] resize-none bg-background/50 border-input focus:ring-primary"
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
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
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
