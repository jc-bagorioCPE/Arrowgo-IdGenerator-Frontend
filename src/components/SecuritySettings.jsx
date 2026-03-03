import { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Lock,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function SecuritySettings({ settings, setSettings, userId }) {
  const saveTimer = useRef(null);

  // Safe local updater
  const updateSetting = (key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };

      // ❗ Safety rule: auto_logout cannot exceed session_timeout
      if (
        key === "auto_logout" &&
        updated.session_timeout > 0 &&
        value > updated.session_timeout
      ) {
        updated.auto_logout = updated.session_timeout;
      }

      return updated;
    });
  };

  // 🔥 Auto-save settings (debounced)
  useEffect(() => {
    if (!settings || !userId) return;

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch(`localhost:5000/api/settings/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(settings),
        });
      } catch (err) {
        console.error("Failed to save security settings", err);
      }
    }, 600);

    return () => clearTimeout(saveTimer.current);
  }, [settings, userId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Security Settings
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account security and session preferences
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <div className="space-y-4 p-4 border rounded-lg bg-green-50">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <Label className="text-base font-semibold">
                Two-Factor Authentication
              </Label>
            </div>
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account
            </p>
          </div>

          <Switch
            checked={Boolean(settings.two_factor_enabled)}
            onCheckedChange={(checked) =>
              updateSetting("two_factor_enabled", checked)
            }
          />
        </div>

        {Boolean(settings.two_factor_enabled) && (
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" disabled>
              Configure 2FA (Coming Soon)
            </Button>
          </div>
        )}
      </div>

      {/* Session Management */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <Label className="text-base font-semibold">
            Session Management
          </Label>
        </div>

        <div className="space-y-4">
          {/* Auto Logout */}
          <div className="space-y-2">
            <Label>Auto-logout after inactivity (minutes)</Label>
            <Select
              value={String(settings.auto_logout)}
              onValueChange={(value) =>
                updateSetting("auto_logout", Number(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="0">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Session Timeout */}
          <div className="space-y-2">
            <Label>Maximum session duration (minutes)</Label>
            <Select
              value={String(settings.session_timeout)}
              onValueChange={(value) =>
                updateSetting("session_timeout", Number(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Password Policy */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <Label className="text-base font-semibold">Password Policy</Label>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Minimum 6 characters required
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Password expires after 90 days
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Cannot reuse last 3 passwords
          </div>
        </div>

        <Button variant="outline" size="sm" disabled>
          View Password History
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-600" />
          <Label className="text-base font-semibold">Active Sessions</Label>
        </div>

        <div className="p-3 bg-gray-50 rounded flex justify-between">
          <div>
            <p className="text-sm font-medium">Current Session</p>
            <p className="text-xs text-gray-600">
              Chrome • Philippines
            </p>
          </div>
          <span className="text-xs text-green-600 font-medium">
            Active Now
          </span>
        </div>

        <Button variant="outline" size="sm" className="w-full" disabled>
          View All Sessions
        </Button>
      </div>
    </div>
  );
}
