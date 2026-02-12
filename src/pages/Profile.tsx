import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User as UserIcon,
  Settings,
  LogOut,
  Upload,
  Camera,
  Car,
  Edit3,
  Trash2,
  Zap,
  Shield,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import EditProfileDialog from "@/components/dialogs/EditProfileDialog";
import ChangePasswordDialog from "@/components/dialogs/ChangePasswordDialog";
import { EditCarDesignDialog } from "@/components/dialogs/EditCarDesignDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { designApi, type DesignData } from "@/store/designStore";
import api from "@/store/baseApi";
import { getAvatarUrl, getImageUrl } from "@/lib/imageUtils";
import type { User } from "@/types/user";
import type { Design } from "@/store/designStore";
import OptimizedImage from "@/components/OptimizedImage";

const Profile = () => {
  // Use centralized image URL utilities
  const toImageUrl = getImageUrl;
  const toModelUrl = (url?: string | null) => getImageUrl(url) || "";

  const ModelViewer = (props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { src?: string; "camera-controls"?: boolean; "auto-rotate"?: boolean; exposure?: string; "shadow-intensity"?: string }) =>
    React.createElement("model-viewer", props);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editDesignOpen, setEditDesignOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [viewModelOpen, setViewModelOpen] = useState(false);
  const [activeModelUrl, setActiveModelUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token used:", token);

        const res = await api.get(`/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Profile response:", res.data);
        setUser(res.data.user);
      } catch (err: unknown) {
        console.error(
          "Failed to load user:",
          (err as { response?: { data?: unknown }; message?: string }).response?.data || (err as Error).message
        );
      }
    };
    fetchUser();
  }, []);

  const fetchUserDesigns = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await designApi.getUserDesigns();
      setSavedDesigns(response.designs || []);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        toast.error("Designs endpoint not found. Check your backend server.");
        console.error("API Error:", error);
        setSavedDesigns([]);
      } else if (err.response?.status === 401) {
        toast.error("Please login to view your designs");
        navigate("/login");
      } else {
        toast.error("Failed to fetch designs");
        console.error("Error fetching designs:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Load designs after user profile is available
    if (user?.id) {
      fetchUserDesigns();
    }
  }, [user, fetchUserDesigns]);

  const handleEditDesign = (design: Design) => {
    setSelectedDesign({
      id: design.id,
      user_id: design.user_id,
      name: design.name,
      description: design.description,
      thumbnail_url: design.thumbnail_url,
      model_data: design.model_data,
      color_data: design.color_data,
      parts_data: design.parts_data,
      created_at: design.created_at,
      updated_at: design.updated_at,
    });
    setEditDesignOpen(true);
  };

  const handleSaveDesign = (data: DesignData) => {
    console.log("Design saved:", data);
    fetchUserDesigns(); // Refresh the list
  };

  const handleDeleteDesign = async (designId: number) => {
    try {
      await designApi.deleteDesign(designId);
      toast.success("Design deleted successfully!");
      fetchUserDesigns(); // Refresh the list
    } catch (error: unknown) {
      toast.error(error.response?.data?.message || "Failed to delete design");
      console.error("Error deleting design:", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.success("Image uploaded successfully!");
      console.log("Uploading file:", file.name);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);

      // Convert file to base64 data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const dataUrl = reader.result as string;

          // Send as JSON with dataUrl
          const response = await api.post("/api/users/avatar", {
            dataUrl: dataUrl,
          });

          setUser(response.data.user);
          toast.success("Avatar updated successfully!");
        } catch (error: unknown) {
          toast.error(
            error.response?.data?.message || "Failed to upload avatar"
          );
          console.error("Error uploading avatar:", error);
        } finally {
          setUploadingAvatar(false);
          // Reset input
          if (avatarInputRef.current) {
            avatarInputRef.current.value = "";
          }
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploadingAvatar(false);
        if (avatarInputRef.current) {
          avatarInputRef.current.value = "";
        }
      };

      reader.readAsDataURL(file);
    } catch (error: unknown) {
      toast.error("Failed to process file");
      console.error("Error processing file:", error);
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleLogout = () => {
    toast.success("Logged out successfully!");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-4 sm:p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-20 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 animate-slideIn">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
              Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your car customizations and account settings
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-16 w-16 cursor-pointer border-2 border-primary/20 hover:border-primary transition-colors">
                <AvatarImage
                  src={getAvatarUrl(user.avatarUrl)}
                />
                <AvatarFallback className="bg-primary/10">
                  {user.firstName?.[0]?.toUpperCase()}
                  {user.lastName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 rounded-full"
                disabled={uploadingAvatar}
              />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.membership === 'Premium' || user.membership === 'Pro' ? "Premium Member" : "Free Member"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <Card className="mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                asChild
                variant="default"
                className="h-20 flex flex-col gap-2"
              >
                <Link to="/ar-studio">
                  <Car className="h-6 w-6" />
                  Start New Customization
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6" />
                Upload Car Image
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-accent hover:text-accent-foreground"
              >
                <Camera className="h-6 w-6" />
                Live AR Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Saved Designs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Saved Designs */}
          <div
            className="lg:col-span-3 animate-slideIn"
            style={{ animationDelay: "400ms" }}
          >
            <Card className="backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-automotive-orange animate-glow" />
                  Saved Designs
                </CardTitle>
                <CardDescription>
                  Your customization history and saved car designs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="backdrop-blur-lg bg-card/50 border-border">
                        <Skeleton className="aspect-video rounded-t-lg" />
                        <CardContent className="p-4 space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex gap-2 pt-2">
                            <Skeleton className="h-8 flex-1" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {savedDesigns.map((design) => (
                        <Card
                          key={design.id}
                          className="group backdrop-blur-lg bg-card/50 border-border hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                            {design.thumbnail_url ? (
                              <OptimizedImage
                                src={toImageUrl(design.thumbnail_url) || ''}
                                alt={design.name}
                                className="w-full h-full object-cover rounded-t-lg"
                                containerClassName="w-full h-full"
                                fallback={<Car className="h-12 w-12 text-muted-foreground" />}
                              />
                            ) : (
                              <Car className="h-12 w-12 text-muted-foreground" />
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-1">
                              {design.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {design.description}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              Created:{" "}
                              {new Date(design.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              Updated:{" "}
                              {new Date(design.updated_at).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleEditDesign(design)}
                              >
                                Edit
                              </Button>
                              {design.model_data?.model_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="px-2 hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => {
                                    setActiveModelUrl(
                                      toModelUrl(design.model_data?.model_url)
                                    );
                                    setViewModelOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View 3D
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="px-2"
                                onClick={() => {
                                  setDesignToDelete({ id: design.id, name: design.name });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {savedDesigns.length === 0 && (
                      <div className="text-center py-16 px-6">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full animate-pulse" />
                          <div className="absolute inset-2 bg-gradient-to-br from-background to-card rounded-full flex items-center justify-center">
                            <Car className="h-10 w-10 text-primary" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          Your Garage is Empty
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                          Start customizing your dream car with our AR studio. Choose colors, add wraps, and create stunning designs!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            asChild
                            className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-lg"
                          >
                            <Link to="/ar-studio">
                              <Zap className="w-4 h-4 mr-2" />
                              Start Customizing
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                          >
                            <Link to="/features">
                              Learn More
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Settings */}
          <div
            className="lg:col-span-1 animate-slideIn"
            style={{ animationDelay: "600ms" }}
          >
            <Card className="backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-automotive-orange animate-glow" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setEditProfileOpen(true)}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setChangePasswordOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Subscription
                    </p>
                    <Badge
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      {user.membership === 'Premium' || user.membership === 'Pro' ? `${user.membership} Member` : "Free Member"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Storage Used
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {savedDesigns.length} of 50 designs
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-car-gradient h-2 rounded-full transition-all"
                        style={{
                          width: `${(savedDesigns.length / 50) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <Separator />

                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Elements */}
        <Zap className="absolute top-32 right-20 w-6 h-6 text-automotive-orange opacity-30 animate-float delay-500" />
        <Shield className="absolute bottom-40 left-20 w-7 h-7 text-automotive-orange opacity-30 animate-float delay-1000" />
        <Car className="absolute top-1/2 left-10 w-8 h-8 text-automotive-orange-light opacity-20 animate-float" />
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Dialogs */}
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        user={user} // Pass the user prop
      />
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
      <EditCarDesignDialog
        open={editDesignOpen}
        onOpenChange={setEditDesignOpen}
        design={selectedDesign ?? undefined}
        onSave={handleSaveDesign}
      />
      <Dialog open={viewModelOpen} onOpenChange={setViewModelOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>3D Model Preview</DialogTitle>
          </DialogHeader>
          {activeModelUrl ? (
            <ModelViewer
              src={activeModelUrl}
              camera-controls
              auto-rotate
              style={{
                width: "100%",
                height: "480px",
                background: "transparent",
              }}
              exposure="0.9"
              shadow-intensity="0.5"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No model available for this design.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{designToDelete?.name}"? This action cannot be undone and will permanently remove this design from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDesignToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (designToDelete) {
                  handleDeleteDesign(designToDelete.id);
                  setDeleteDialogOpen(false);
                  setDesignToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
