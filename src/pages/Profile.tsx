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
  Plus,
  Upload,
  Camera,
  Car,
  Edit3,
  Trash2,
  Zap,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import EditProfileDialog from "@/components/dialogs/EditProfileDialog";
import ChangePasswordDialog from "@/components/dialogs/ChangePasswordDialog";
import { EditCarDesignDialog } from "@/components/dialogs/EditCarDesignDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editDesignOpen, setEditDesignOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSaveDesign = (data: any) => {
    console.log("Saving updated design:", data);
    // This is where you would call your API to save the changes
    toast.success("Design updated successfully!");
    setEditDesignOpen(false); // Close the dialog after saving
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would upload to Supabase Storage
      toast.success("Image uploaded successfully!");
      console.log("Uploading file:", file.name);
    }
  };

  const handleLogout = () => {
    // In a real app, this would clear session and redirect
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleEditDesign = (design: any) => {
    setSelectedDesign(design);
    setEditDesignOpen(true);
  };

  // Mock data for saved designs - in real app, this would come from Supabase
  const savedDesigns = [
    {
      id: 1,
      name: "Red Sports Car",
      thumbnail: "/placeholder.svg",
      date: "2024-01-15",
    },
    {
      id: 2,
      name: "Blue Sedan Custom",
      thumbnail: "/placeholder.svg",
      date: "2024-01-14",
    },
    {
      id: 3,
      name: "Green SUV Design",
      thumbnail: "/placeholder.svg",
      date: "2024-01-12",
    },
    {
      id: 4,
      name: "Black Coupe",
      thumbnail: "/placeholder.svg",
      date: "2024-01-10",
    },
    {
      id: 5,
      name: "Silver Hatchback",
      thumbnail: "/placeholder.svg",
      date: "2024-01-08",
    },
    {
      id: 6,
      name: "Yellow Convertible",
      thumbnail: "/placeholder.svg",
      date: "2024-01-05",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dark-gradient" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-automotive-orange opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-automotive-orange-light opacity-10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slideIn">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-automotive-orange to-automotive-orange-light bg-clip-text text-transparent mb-2">
              Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your car customizations and account settings
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">John Doe</p>
              <p className="text-sm text-muted-foreground">Premium Member</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card
          className="mb-8 backdrop-blur-lg bg-card/50 border-border shadow-xl hover:shadow-2xl transition-all duration-300 animate-slideIn"
          style={{ animationDelay: "200ms" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-automotive-orange animate-glow" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Jump right into customizing your next car design
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                asChild
                className="h-20 flex flex-col gap-2 bg-gradient-to-r from-automotive-orange to-automotive-orange-light hover:opacity-90 text-white"
              >
                <Link to="/ar-studio">
                  <Car className="h-6 w-6" />
                  Start New Customization
                </Link>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 border-automotive-orange text-automotive-orange hover:bg-automotive-orange hover:text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6" />
                Upload Car Image
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 border-automotive-orange-light text-automotive-orange-light hover:bg-automotive-orange-light hover:text-white"
              >
                <Camera className="h-6 w-6" />
                Live AR Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {savedDesigns.map((design, index) => (
                    <Card
                      key={design.id}
                      className="group backdrop-blur-lg bg-card/50 border-border hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                        <Car className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-1">
                          {design.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {design.date}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-automotive-orange text-automotive-orange hover:bg-automotive-orange hover:text-white"
                            onClick={() => handleEditDesign(design)}
                          >
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="px-2">
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
                      <Link to="/">Create Your First Design</Link>
                    </Button>
                  </div>
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
                    className="w-full justify-start"
                    onClick={() => setEditProfileOpen(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
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
                      Premium Member
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
