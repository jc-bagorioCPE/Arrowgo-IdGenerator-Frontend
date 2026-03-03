import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AppearanceSettings({ settings, setSettings }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span>Theme</span>
        <ThemeToggle
          value={settings.theme}
          onChange={(newTheme) => setSettings({ ...settings, theme: newTheme })}
        />
      </div>

      <div className="flex items-center justify-between">
        <span>Reduce Animations</span>
        <Switch
          checked={settings.reduce_motion}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, reduce_motion: checked })
          }
        />
      </div>
    </div>
  );
}
