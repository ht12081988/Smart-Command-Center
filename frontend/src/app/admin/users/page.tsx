"use client";

import React, { useState } from "react";
import { useAuth, UserSession, UserRole, MOCK_USERS } from "../../../context/AuthContext";
import { Sidebar } from "../../../components/Sidebar";
import { useRouter } from "next/navigation";

// List of initial users mapped from MOCK_USERS
const INITIAL_USERS: UserSession[] = Object.values(MOCK_USERS).map(({ username, fullName, email, role, type, entity, department, mobile }) => ({
  username,
  fullName,
  email,
  role,
  type,
  entity,
  department,
  mobile
}));

const DEPARTMENTS = [
  "IT & Administration",
  "Direct Line Presenter",
  "Direct Line Show Production",
  "Humanitarian Operations Center",
  "External Government Entities"
];

export default function AdminUsersPage() {
  const { user, changeRole, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserSession[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSession | null>(null);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [userType, setUserType] = useState<"Internal" | "External">("Internal");
  const [userEntity, setUserEntity] = useState("");
  const [role, setRole] = useState<UserRole>("CaseManager");
  const [department, setDepartment] = useState("Humanitarian Operations Center");

  // Check if current user has Admin rights
  if (!user || user.role !== "Administrator") {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-card border border-border-warm rounded-2xl p-8 max-w-md shadow-sm">
          <div className="text-red-600 font-bold text-lg mb-2">Access Denied</div>
          <p className="text-sm text-foreground/75 mb-6">
            You do not have Administrator permissions to access this control panel. Please log in with an admin account.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-gold hover:bg-gold-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const openCreateDrawer = () => {
    setEditingUser(null);
    setFullName("");
    setEmail("");
    setMobile("");
    setUserType("Internal");
    setUserEntity("");
    setRole("CaseManager");
    setDepartment("Humanitarian Operations Center");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (u: UserSession) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setEmail(u.email);
    setMobile(u.mobile || "");
    setUserType(u.type || "Internal");
    setUserEntity(u.entity || "");
    setRole(u.role);
    setDepartment(u.department || "Humanitarian Operations Center");
    setIsDrawerOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !mobile || !department) return;

    if (editingUser) {
      // Edit Mode
      const updated = users.map((u) => {
        if (u.username === editingUser.username) {
          return { ...u, fullName, email, mobile, role, type: userType, entity: userType === "External" ? userEntity : undefined, department };
        }
        return u;
      });
      setUsers(updated);
      
      // Update context if modifying self
      if (editingUser.username === user.username) {
        changeRole(role);
      }
    } else {
      // Create Mode
      const newUsername = fullName.toLowerCase().replace(/\s+/g, "");
      const newUser: UserSession = {
        username: newUsername,
        fullName,
        email,
        mobile,
        type: userType,
        entity: userType === "External" ? userEntity : undefined,
        role,
        department
      };
      setUsers([...users, newUser]);
    }
    
    setIsDrawerOpen(false);
  };

  const handleDeleteUser = (username: string) => {
    if (username === user.username) {
      alert("You cannot delete your own active administrator account.");
      return;
    }
    if (confirm("Are you sure you want to delete this user access account?")) {
      setUsers(users.filter(u => u.username !== username));
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.mobile && u.mobile.includes(searchQuery)) ||
    (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex bg-background">
      
      {/* 1. Left Sidebar */}
      <Sidebar activeItem="User Access Directory" />

      {/* 2. Main Content Area */}
      <main className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
        
        {/* Top Title Bar */}
        <header className="flex justify-between items-center border-b border-border-warm pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
              Admin Users
            </h1>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mt-1">
              Monitor and manage membership, staff credentials and system access permissions
            </p>
          </div>
          <button 
            onClick={openCreateDrawer}
            className="bg-gold hover:bg-gold-hover text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
          >
            <span>+</span> Create New User
          </button>
        </header>

        {/* Filter & Search Panel */}
        <section className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, mobile, department, or role..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-warm bg-card text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </section>

        {/* Users Table List */}
        <section className="bg-card border border-border-warm rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(20,19,17,0.02)]">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-warm bg-background/50 text-foreground/50 font-semibold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Name / Username</th>
                <th className="py-4 px-6">Type & Entity</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Mobile Number</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">System Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-warm">
              {filteredUsers.map((u, idx) => (
                <tr key={idx} className="hover:bg-background/25 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-bold text-primary-text-gold block">{u.fullName}</span>
                    <span className="text-xs text-foreground/40 font-medium">@{u.username}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      u.type === "Internal" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    }`}>
                      {u.type || "Internal"}
                    </span>
                    {u.type === "External" && u.entity && (
                      <span className="block text-xs font-semibold text-foreground/80 mt-1">{u.entity}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-foreground/80">{u.email}</td>
                  <td className="py-4 px-6 text-foreground/80">{u.mobile || "-"}</td>
                  <td className="py-4 px-6 text-foreground/80">{u.department || "-"}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      u.role === "Administrator" ? "bg-red-50 text-red-700 border border-red-200" :
                      u.role === "Presenter" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      u.role === "Producer" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      u.role === "CaseManager" ? "bg-green-50 text-green-700 border border-green-200" :
                      "bg-slate-50 text-slate-700 border border-slate-200"
                    }`}>
                      {u.role.replace("Manager", " Manager").replace("Liaison", " Liaison")}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-xs text-active-green font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-active-green"></span>
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2.5">
                      <button 
                        onClick={() => openEditDrawer(u)}
                        className="p-1 rounded text-foreground/40 hover:text-gold transition-colors"
                        title="Edit User"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="p-1 rounded text-foreground/40 hover:text-foreground transition-colors" title="Copy Info">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.username)}
                        className={`p-1 rounded transition-colors ${u.username === user.username ? "text-foreground/10 cursor-not-allowed" : "text-foreground/40 hover:text-red-600"}`}
                        title="Delete User"
                        disabled={u.username === user.username}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* 3. Dynamic Create / Edit Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-card border-l border-border-warm p-8 w-full max-w-md shadow-2xl h-full flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <form onSubmit={handleSaveUser} className="flex flex-col gap-6">
              <div>
                <h3 className="text-base font-bold text-foreground uppercase tracking-tight mb-1">
                  {editingUser ? "Modify User Authorization" : "Create New User Access"}
                </h3>
                <p className="text-xs text-foreground/50 mb-6 uppercase tracking-wider">
                  {editingUser ? `Updating permissions for ${editingUser.fullName}` : "Add a new staff member to the command directory"}
                </p>

                <div className="flex flex-col gap-4">
                  
                  {/* User Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      User Type
                    </label>
                    <select
                      value={userType}
                      onChange={(e) => {
                        const type = e.target.value as "Internal" | "External";
                        setUserType(type);
                        if (type === "Internal") setUserEntity("");
                        if (type === "External") setRole("ExternalLiaison");
                      }}
                      className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="Internal">Internal (SBA Staff)</option>
                      <option value="External">External (Government Partners)</option>
                    </select>
                  </div>

                  {/* Entity Dropdown (if External) */}
                  {userType === "External" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                        Assign to Entity
                      </label>
                      <select
                        required
                        value={userEntity}
                        onChange={(e) => setUserEntity(e.target.value)}
                        className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                      >
                        <option value="" disabled>Select an Entity...</option>
                        <option value="Sharjah Health Authority">Sharjah Health Authority</option>
                        <option value="Sharjah Housing Directorate">Sharjah Housing Directorate</option>
                        <option value="Ministry of Community Development">Ministry of Community Development</option>
                        <option value="Sharjah Police General Directorate">Sharjah Police General Directorate</option>
                      </select>
                    </div>
                  )}

                  {/* System Role and Department (Internal Only) */}
                  {userType === "Internal" && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                          System Role
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as UserRole)}
                          className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                        >
                          <option value="Administrator">Administrator (Full Control)</option>
                          <option value="Presenter">Presenter (Studio Host)</option>
                          <option value="Producer">Producer (Executive Producer)</option>
                          <option value="CaseManager">Case Manager (Operations Officer)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                          Department
                        </label>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* External Department and Role */}
                  {userType === "External" && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                          Entity Department
                        </label>
                        <input
                          type="text"
                          required
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="e.g. Medical Approvals"
                          className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                          External Role
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as UserRole)}
                          className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                        >
                          <option value="ExternalLiaison">External Liaison Officer</option>
                        </select>
                      </div>
                    </>
                  )}
                  {/* Full Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Abdullah Al-Mansoori"
                      className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. abdullah@sba.gov.ae"
                      className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                    />
                  </div>

                  {/* Mobile Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. +971-50-1234567"
                      className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                    />
                  </div>



                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex justify-end gap-3 border-t border-border-warm pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-warm bg-background hover:bg-background/80 text-foreground font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
