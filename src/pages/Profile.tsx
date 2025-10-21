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
  User,
  Settings,
  LogOut,
  Upload,
  Camera,
  Car,
  Edit3,
  Trash2,
  Zap,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import EditProfileDialog from "@/components/dialogs/EditProfileDialog";
import ChangePasswordDialog from "@/components/dialogs/ChangePasswordDialog";
import { EditCarDesignDialog } from "@/components/dialogs/EditCarDesignDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { designApi, type DesignData } from "@/store/designStore";
import axios from "axios";

const Profile = () => {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editDesignOpen, setEditDesignOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token used:", token);

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Profile response:", res.data);
        setUser(res.data.user);
      } catch (err: any) {
        console.error(
          "Failed to load user:",
          err.response?.data || err.message
        );
        // optional: redirect to login if unauthorized
      }
    };
    fetchUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  // Fetch user designs on component mount
  useEffect(() => {
    fetchUserDesigns();
  }, []);

  const fetchUserDesigns = async () => {
    try {
      setLoading(true);
      const response = await designApi.getUserDesigns();
      setSavedDesigns(response.designs || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("Designs endpoint not found. Check your backend server.");
        console.error("API Error:", error);
        setSavedDesigns([]);
      } else if (error.response?.status === 401) {
        toast.error("Please login to view your designs");
        navigate("/login");
      } else {
        toast.error("Failed to fetch designs");
        console.error("Error fetching designs:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditDesign = (design: any) => {
    setSelectedDesign({
      id: design.id,
      name: design.name,
      description: design.description,
      thumbnail_url: design.thumbnail_url,
      model_data: design.model_data,
      color_data: design.color_data,
      parts_data: design.parts_data,
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
    } catch (error: any) {
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

  const handleLogout = () => {
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 animate-slideIn">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your car customizations and account settings
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{user.firstName}</p>
              <p className="text-sm text-muted-foreground">
                {user.isPremium ? "Premium Member" : "Free Member"}
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
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading designs...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {savedDesigns.map((design, index) => (
                        <Card
                          key={design.id}
                          className="group backdrop-blur-lg bg-card/50 border-border hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                            {design.thumbnail_url ? (
                              <img
                                src={design.thumbnail_url}
                                alt={design.name}
                                className="w-full h-full object-cover rounded-t-lg"
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
                              <Button
                                size="sm"
                                variant="destructive"
                                className="px-2"
                                onClick={() => handleDeleteDesign(design.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {savedDesigns.length === 0 && (
                      <div className="text-center py-12">
                        <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          No saved designs yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Start customizing cars to see your designs here
                        </p>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-automotive-orange to-automotive-orange-light hover:opacity-90 text-white"
                        >
                          <Link to="/ar-studio">Create Your First Design</Link>
                        </Button>
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
                    <User className="h-4 w-4 mr-2" />
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
                      {user.isPremium ? "Premium Member" : "Free Member"}
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

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
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
        design={selectedDesign}
        onSave={handleSaveDesign}
      />
    </div>
  );
};

export default Profile;
