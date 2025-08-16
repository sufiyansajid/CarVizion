import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditCarDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design?: {
    id: number;
    name: string;
    thumbnail: string;
    date: string;
  };
}

const EditCarDesignDialog = ({
  open,
  onOpenChange,
  design,
}: EditCarDesignDialogProps) => {
  const [name, setName] = useState(design?.name || "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date | undefined>(
    design ? new Date(design.date) : undefined
  );

  const handleSave = () => {
    // In a real app, this would save to Supabase
    console.log("Saving design:", { name, description, category, date });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-lg bg-card/90 border-border shadow-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-car-gradient flex items-center justify-center">
              <Save className="h-4 w-4 text-white" />
            </div>
            Edit Car Design
          </DialogTitle>
          <DialogDescription>
            Update your car design details and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Design Name */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Design Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter design name"
              className="backdrop-blur-sm bg-card/50 border-border"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-foreground"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your car design"
              className="backdrop-blur-sm bg-card/50 border-border min-h-[80px]"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="backdrop-blur-sm bg-card/50 border-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-lg bg-card/90 border-border">
                <SelectItem value="sports">Sports Car</SelectItem>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="coupe">Coupe</SelectItem>
                <SelectItem value="hatchback">Hatchback</SelectItem>
                <SelectItem value="convertible">Convertible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Created */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Date Created
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal backdrop-blur-sm bg-card/50 border-border",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 backdrop-blur-lg bg-card/90 border-border">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            className="flex-1 bg-car-gradient hover:opacity-90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCarDesignDialog;
