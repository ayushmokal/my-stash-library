import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppearanceTabProps {
  themeColor: string;
  setThemeColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  layoutStyle: "grid" | "list";
  setLayoutStyle: (style: "grid" | "list") => void;
  isLoading: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AppearanceTab = ({
  themeColor,
  setThemeColor,
  backgroundColor,
  setBackgroundColor,
  layoutStyle,
  setLayoutStyle,
  isLoading,
  onCancel,
  onSubmit
}: AppearanceTabProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="themeColor">Theme Color</Label>
        <div className="flex gap-2">
          <Input
            id="themeColor"
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="w-12 h-12 p-1 cursor-pointer"
            disabled={isLoading}
          />
          <Input
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            placeholder="#6B4E9B"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="backgroundColor">Background Color</Label>
        <div className="flex gap-2">
          <Input
            id="backgroundColor"
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-12 h-12 p-1 cursor-pointer"
            disabled={isLoading}
          />
          <Input
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            placeholder="#FFFFFF"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="layoutStyle">Layout Style</Label>
        <Select
          value={layoutStyle}
          onValueChange={(value: "grid" | "list") => setLayoutStyle(value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a layout style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default AppearanceTab;