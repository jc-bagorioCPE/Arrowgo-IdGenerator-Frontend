import { Switch } from "@/components/ui/switch";

export default function NotificationSettings({ settings, setSettings }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span>Email Notifications</span>
        <Switch
          checked={settings.email_notifications}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, email_notifications: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <span>In-App Notifications</span>
        <Switch
          checked={settings.app_notifications}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, app_notifications: checked })
          }
        />
      </div>
    </div>
  );
}
