import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Clock, 
  CheckCircle, 
  Calendar,
  Bell,
  Shield,
  Zap,
  Globe,
  AlertTriangle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SystemSettings({ settings, setSettings }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-green-600" />
          System Settings
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure system-wide settings and default behaviors
        </p>
      </div>

      {/* Admin Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          These settings apply to all users and affect system behavior globally.
        </AlertDescription>
      </Alert>

      {/* ID Management */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <Label className="text-base font-semibold">ID Management</Label>
        </div>

        <div className="space-y-4">
          {/* ID Expiration */}
          <div className="space-y-2">
            <Label htmlFor="id-expiration">Default ID Expiration Period</Label>
            <Select
              value={String(settings.default_id_expiration || 365)}
              onValueChange={(value) =>
                setSettings({ ...settings, default_id_expiration: Number(value) })
              }
            >
              <SelectTrigger id="id-expiration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 days (3 months)</SelectItem>
                <SelectItem value="180">180 days (6 months)</SelectItem>
                <SelectItem value="365">365 days (1 year)</SelectItem>
                <SelectItem value="730">730 days (2 years)</SelectItem>
                <SelectItem value="1825">1825 days (5 years)</SelectItem>
                <SelectItem value="-1">Never expire</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600">
              IDs will need to be renewed after this period
            </p>
          </div>

          {/* ID Renewal Reminder */}
          <div className="space-y-2">
            <Label htmlFor="renewal-reminder">Send Renewal Reminder Before</Label>
            <Select
              value={String(settings.renewal_reminder_days || 30)}
              onValueChange={(value) =>
                setSettings({ ...settings, renewal_reminder_days: Number(value) })
              }
            >
              <SelectTrigger id="renewal-reminder">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Auto-Approval Settings */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-gray-600" />
          <Label className="text-base font-semibold">Automation Settings</Label>
        </div>

        <div className="space-y-4">
          {/* Auto-Approve Claims */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Label className="font-medium">Auto-Approve ID Claims</Label>
              </div>
              <p className="text-sm text-gray-600">
                Automatically mark IDs as claimed when employees scan their QR code
              </p>
            </div>
            <Switch
              checked={settings.auto_approve_claims || false}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_approve_claims: checked })
              }
            />
          </div>

          {/* Auto-Delete Old Records */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <Label className="font-medium">Auto-Archive Old Records</Label>
              </div>
              <p className="text-sm text-gray-600">
                Automatically archive employee records after retention period
              </p>
            </div>
            <Switch
              checked={settings.auto_archive_records || false}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_archive_records: checked })
              }
            />
          </div>

          {/* Auto-Send Notifications */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <Label className="font-medium">Auto-Send Status Notifications</Label>
              </div>
              <p className="text-sm text-gray-600">
                Send automatic notifications when ID status changes
              </p>
            </div>
            <Switch
              checked={settings.auto_send_notifications !== false}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_send_notifications: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Localization */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-600" />
          <Label className="text-base font-semibold">Localization</Label>
        </div>

        <div className="space-y-4">
          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="system-language">System Language</Label>
            <Select
              value={settings.language || "en"}
              onValueChange={(value) =>
                setSettings({ ...settings, language: value })
              }
            >
              <SelectTrigger id="system-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fil">Filipino (Tagalog)</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={settings.timezone || "Asia/Manila"}
              onValueChange={(value) =>
                setSettings({ ...settings, timezone: value })
              }
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Manila">Asia/Manila (PHT)</SelectItem>
                <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select
              value={settings.date_format || "MM/DD/YYYY"}
              onValueChange={(value) =>
                setSettings({ ...settings, date_format: value })
              }
            >
              <SelectTrigger id="date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (UK)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* QR Code Settings */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <Label className="text-base font-semibold">QR Code Configuration</Label>
        </div>

        <div className="space-y-4">
          {/* QR Code Size */}
          <div className="space-y-2">
            <Label htmlFor="qr-size">Default QR Code Size</Label>
            <Select
              value={String(settings.qr_code_size || 200)}
              onValueChange={(value) =>
                setSettings({ ...settings, qr_code_size: Number(value) })
              }
            >
              <SelectTrigger id="qr-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="150">Small (150x150)</SelectItem>
                <SelectItem value="200">Medium (200x200)</SelectItem>
                <SelectItem value="300">Large (300x300)</SelectItem>
                <SelectItem value="400">Extra Large (400x400)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* QR Code Expiry */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <Label className="font-medium">Enable QR Code Expiry</Label>
              <p className="text-sm text-gray-600">
                QR codes will expire and cannot be scanned after expiry date
              </p>
            </div>
            <Switch
              checked={settings.qr_code_expiry_enabled || false}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, qr_code_expiry_enabled: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="space-y-4 p-4 border-2 border-amber-200 rounded-lg bg-amber-50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <Label className="text-base font-semibold text-amber-900">System Maintenance</Label>
        </div>

        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            Schedule Maintenance Window
          </Button>

          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Reset System Cache
          </Button>

          <p className="text-xs text-amber-800">
            Last maintenance: Never
          </p>
        </div>
      </div>
    </div>
  );
}