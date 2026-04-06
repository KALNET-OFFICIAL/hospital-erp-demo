import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Phone, Mail, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { staff as mockStaff } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

// Get staff from localStorage or fall back to mock data
function getStaff() {
  const stored = localStorage.getItem("hos_staff");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockStaff;
}

// Save staff to localStorage
function saveStaff(staffList: typeof mockStaff) {
  localStorage.setItem("hos_staff", JSON.stringify(staffList));
}

export function StaffListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [staffList, setStaffList] = useState(getStaff);

  const filteredStaff = staffList.filter((s: typeof mockStaff[0]) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const doctors = staffList.filter((s: typeof mockStaff[0]) => s.role === "doctor");

  const toggleStatus = (staffId: string) => {
    const updated = staffList.map((s: typeof mockStaff[0]) =>
      s.id === staffId
        ? { ...s, status: s.status === "active" ? "inactive" : "active" }
        : s
    );
    setStaffList(updated);
    saveStaff(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500">Manage doctors and staff members</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/staff/new")}>
          <Plus size={16} />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          variant="interactive"
          accent="primary"
          onClick={() => {
            setRoleFilter("all");
            setSearchQuery("");
          }}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Staff</p>
            <p className="text-2xl font-bold text-slate-900">{staffList.length}</p>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="teal"
          onClick={() => setRoleFilter("doctor")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Doctors</p>
            <p className="text-2xl font-bold text-primary-600">{doctors.length}</p>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="success"
          onClick={() => {
            setRoleFilter("all");
            setSearchQuery("");
          }}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Active</p>
            <p className="text-2xl font-bold text-success-600">
              {staffList.filter((s: typeof mockStaff[0]) => s.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card
          variant="interactive"
          accent="violet"
          onClick={() => navigate("/staff/roles")}
          className="hover:shadow-lg hover:-translate-y-0.5"
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Departments</p>
            <p className="text-2xl font-bold text-slate-900">
              {[...new Set(staffList.map((s: typeof mockStaff[0]) => s.department))].length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search staff..."
                icon={<Search size={18} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="doctor">Doctors</option>
              <option value="reception">Reception</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((member: typeof mockStaff[0]) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      {member.specialization && (
                        <p className="text-sm text-slate-500">
                          {member.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.role === "doctor" ? "primary" : "default"}
                    className="capitalize"
                  >
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone size={12} className="text-slate-400" />
                      {member.phone}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Mail size={12} className="text-slate-400" />
                      {member.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-500">
                  {formatDate(member.joinDate)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.status === "active" ? "success" : "default"}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/staff/${member.id}/edit`)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleStatus(member.id)}
                      title={member.status === "active" ? "Deactivate" : "Activate"}
                    >
                      {member.status === "active" ? (
                        <ToggleRight size={16} className="text-success-600" />
                      ) : (
                        <ToggleLeft size={16} className="text-slate-400" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
