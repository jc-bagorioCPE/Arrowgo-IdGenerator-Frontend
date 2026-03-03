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
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Archive,
  AlertCircle,
  HardDrive,
  Calendar
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DataManagementSettings({ settings, setSettings }) {
  const handleExportData = () => {
    // Implement export functionality
    console.log("Exporting data...");
  };

  const handleBackupNow = () => {
    // Implement backup functionality
    console.log("Creating backup...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600" />
          Data Management
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage backups, exports, and data retention policies
        </p>
      </div>

      {/* Warning Alert */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Only administrators can access data management settings. Changes affect all users.
        </AlertDescription>
      </Alert>

      {/* Automatic Backups */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-green-600" />
              <Label className="text-base font-semibold">Automatic Backups</Label>
            </div>
            <p className="text-sm text-gray-600">
              Automatically backup system data on a schedule
            </p>
          </div>
          <Switch
            checked={settings.auto_backup || true}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, auto_backup: checked })
            }
          />
        </div>

        {settings.auto_backup && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select
                value={settings.backup_frequency || "daily"}
                onValueChange={(value) =>
                  setSettings({ ...settings, backup_frequency: value })
                }
              >
                <SelectTrigger id="backup-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">Last Backup</p>
                <p className="text-xs text-gray-600">Today at 2:00 AM</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleBackupNow}>
                Backup Now
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Data Retention */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <Label className="text-base font-semibold">Data Retention Policy</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="retention-days">Keep data for (days)</Label>
          <Select
            value={String(settings.retention_days || 90)}
            onValueChange={(value) =>
              setSettings({ ...settings, retention_days: Number(value) })
            }
          >
            <SelectTrigger id="retention-days">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
              <SelectItem value="-1">Forever</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-600">
            Older records will be automatically archived or deleted
          </p>
        </div>
      </div>

      {/* Export & Import */}
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-gray-600" />
          <Label className="text-base font-semibold">Export & Import</Label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="text-sm font-medium">Export Employee Data</p>
              <p className="text-xs text-gray-600">Download all employee records as CSV</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="text-sm font-medium">Import Employee Data</p>
              <p className="text-xs text-gray-600">Bulk upload employee records from CSV</p>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      </div>

      {/* Storage Information */}
      <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
        <div className="flex items-center gap-2">
          <Archive className="h-4 w-4 text-blue-600" />
          <Label className="text-base font-semibold">Storage Information</Label>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Database Size</span>
            <span className="font-medium">45.2 MB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Employees</span>
            <span className="font-medium">234</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total QR Codes</span>
            <span className="font-medium">234</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Notifications</span>
            <span className="font-medium">1,456</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 p-4 border-2 border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-red-600" />
          <Label className="text-base font-semibold text-red-700">Danger Zone</Label>
        </div>

        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full border-red-300 text-red-600 hover:bg-red-100">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Notifications
          </Button>

          <Button variant="outline" size="sm" className="w-full border-red-300 text-red-600 hover:bg-red-100">
            <Archive className="h-4 w-4 mr-2" />
            Archive Old Records
          </Button>

          <Alert className="border-red-300 bg-red-100">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-xs">
              These actions cannot be undone. Please proceed with caution.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}