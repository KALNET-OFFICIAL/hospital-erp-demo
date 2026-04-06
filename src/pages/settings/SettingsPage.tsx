import { Bell, Shield, Building, Palette, Moon, Sun, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeStore } from "@/stores";

export function SettingsPage() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your hospital settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hospital Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building size={20} />
              Hospital Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Hospital Name" defaultValue="KALNET Hospital" />
            <Input label="Address" defaultValue="123 Healthcare Street, Mumbai" />
            <Input label="Phone" defaultValue="+91 22 1234 5678" />
            <Input label="Email" defaultValue="info@kalnethospital.com" />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-slate-500">Receive email alerts</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-slate-500">Receive SMS alerts</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-slate-500">Alert when inventory is low</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500">Add extra security</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-slate-500">Auto logout after inactivity</p>
              </div>
              <select className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
              </select>
            </div>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={20} />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium mb-3">Theme</p>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="flex items-center gap-2"
                >
                  <Sun size={16} />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="flex items-center gap-2"
                >
                  <Moon size={16} />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="flex items-center gap-2"
                >
                  <Monitor size={16} />
                  System
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Compact Mode</p>
                <p className="text-sm text-slate-500">Reduce spacing</p>
              </div>
              <input type="checkbox" className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
