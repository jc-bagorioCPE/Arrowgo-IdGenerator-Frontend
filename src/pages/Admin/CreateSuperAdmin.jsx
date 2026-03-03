// src/pages/admin/CreateAdmin.jsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function CreateAdmin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // default role
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const res = await axios.post(
        "http://localhost:5000/api/admins",
        { username, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);
      setUsername("");
      setPassword("");
      setRole("admin");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to create admin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Admin</h2>

      <form onSubmit={handleCreateAdmin} className="space-y-4">
        {/* Username */}
        <div className="space-y-1">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        {/* Role */}
        <div className="space-y-1">
          <Label>Role</Label>
          <Select value={role} onValueChange={(val) => setRole(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="superadmin">Superadmin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Admin"}
        </Button>
      </form>
    </div>
  );
}
