"use client";

import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Sidebar } from "../../../components/Sidebar";
import { useRouter } from "next/navigation";

// Define structured permissions
interface ModulePermission {
  moduleName: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  download: boolean;
}

interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  type: "Internal" | "External";
  entity?: string;
  department: string;
  permissions: ModulePermission[];
  isSystem?: boolean; // Core system roles that cannot be deleted
}

// Initial default roles
const SYSTEM_MODULES = [
  "Live Studio Feed",
  "Citizen Profiles",
  "Case Management",
  "Resolution & Follow-up",
  "Executive Directives",
  "User Access Directory"
];

const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full read, write, execution, and system administration permissions.",
    type: "Internal",
    department: "IT & Administration",
    isSystem: true,
    permissions: SYSTEM_MODULES.map((module) => ({
      moduleName: module,
      view: true,
      add: true,
      edit: true,
      delete: true,
      download: true
    }))
  },
  {
    id: "presenter",
    name: "Presenter",
    description: "Broadcast screen monitoring, real-time transcript viewing, and host prompt actions.",
    type: "Internal",
    department: "Direct Line Presenter",
    isSystem: true,
    permissions: SYSTEM_MODULES.map((module) => ({
      moduleName: module,
      view: module === "Live Studio Feed" || module === "Citizen Profiles",
      add: false,
      edit: false,
      delete: false,
      download: false
    }))
  },
  {
    id: "producer",
    name: "Producer",
    description: "Overlooks broadcast quality, coordinates show screen queues, and reviews draft cases.",
    type: "Internal",
    department: "Direct Line Show Production",
    isSystem: true,
    permissions: SYSTEM_MODULES.map((module) => ({
      moduleName: module,
      view: ["Live Studio Feed", "Citizen Profiles", "Case Management", "Executive Directives"].includes(module),
      add: module === "Case Management",
      edit: ["Live Studio Feed", "Case Management"].includes(module),
      delete: false,
      download: false
    }))
  },
  {
    id: "casemanager",
    name: "Case Manager",
    description: "Reviews case summaries, assigns liaison officers, updates operational timelines and proof.",
    type: "Internal",
    department: "Humanitarian Operations Center",
    isSystem: true,
    permissions: SYSTEM_MODULES.map((module) => ({
      moduleName: module,
      view: ["Citizen Profiles", "Case Management", "Resolution & Follow-up", "Executive Directives"].includes(module),
      add: ["Case Management", "Resolution & Follow-up"].includes(module),
      edit: ["Case Management", "Resolution & Follow-up"].includes(module),
      delete: false,
      download: true
    }))
  },
  {
    id: "liaison",
    name: "External Liaison",
    description: "Restricted access to the external partner portal to review referrals and submit closure proof.",
    type: "External",
    entity: "Sharjah Health Authority",
    department: "External Government Entities",
    isSystem: true,
    permissions: SYSTEM_MODULES.map((module) => ({
      moduleName: module,
      view: module === "Resolution & Follow-up",
      add: false,
      edit: module === "Resolution & Follow-up",
      delete: false,
      download: false
    }))
  }
];

export default function AdminRolesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  // Modal forms states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  
  // New role inputs state
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [roleType, setRoleType] = useState<"Internal" | "External">("Internal");
  const [roleEntity, setRoleEntity] = useState("");
  const [roleDept, setRoleDept] = useState("");
  const [rolePerms, setRolePerms] = useState<ModulePermission[]>(
    SYSTEM_MODULES.map(m => ({ moduleName: m, view: false, add: false, edit: false, delete: false, download: false }))
  );

  // Check if current user is Admin
  if (!user || user.role !== "Administrator") {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-card border border-border-warm rounded-2xl p-8 max-w-md shadow-sm">
          <div className="text-red-600 font-bold text-lg mb-2">Access Denied</div>
          <p className="text-sm text-foreground/75 mb-6">
            You do not have Administrator permissions to access the Roles & Permissions console.
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

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDesc("");
    setRoleType("Internal");
    setRoleEntity("");
    setRoleDept("IT & Administration");
    setRolePerms(SYSTEM_MODULES.map(m => ({ moduleName: m, view: false, add: false, edit: false, delete: false, download: false })));
    setIsModalOpen(true);
  };

  const openEditModal = (role: RoleDefinition) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description);
    setRoleType(role.type);
    setRoleEntity(role.entity || "");
    setRoleDept(role.department);
    // Deep clone permissions
    setRolePerms(JSON.parse(JSON.stringify(role.permissions)));
    setIsModalOpen(true);
  };

  const handlePermissionChange = (moduleIdx: number, capability: keyof Omit<ModulePermission, "moduleName">) => {
    const updated = [...rolePerms];
    updated[moduleIdx][capability] = !updated[moduleIdx][capability];
    
    // Auto-enable "view" if check add/edit/delete/download
    if (capability !== "view" && updated[moduleIdx][capability] === true) {
      updated[moduleIdx].view = true;
    }
    
    setRolePerms(updated);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName || !roleDesc || !roleDept) return;

    if (editingRole) {
      // Edit mode
      const updated = roles.map(r => {
        if (r.id === editingRole.id) {
          return {
            ...r,
            name: roleName,
            description: roleDesc,
            type: roleType,
            entity: roleType === "External" ? roleEntity : undefined,
            department: roleDept,
            permissions: rolePerms
          };
        }
        return r;
      });
      setRoles(updated);
    } else {
      // Create mode
      const newRoleObj: RoleDefinition = {
        id: roleName.toLowerCase().replace(/\s+/g, "-"),
        name: roleName,
        description: roleDesc,
        type: roleType,
        entity: roleType === "External" ? roleEntity : undefined,
        department: roleDept,
        permissions: rolePerms
      };
      setRoles([...roles, newRoleObj]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteRole = (id: string) => {
    const roleToDelete = roles.find(r => r.id === id);
    if (roleToDelete?.isSystem) {
      alert("System roles cannot be deleted for safety.");
      return;
    }
    if (confirm("Are you sure you want to delete this role definition?")) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  // Filter and search
  const filteredRoles = roles.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = deptFilter === "All" || r.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Extract list of unique departments for filter dropdown
  const departmentsList = Array.from(new Set(roles.map(r => r.department)));

  return (
    <div className="min-h-screen flex bg-background">
      
      {/* 1. Left Sidebar */}
      <Sidebar activeItem="Roles & Permissions" />

      {/* 2. Main Workspace Content */}
      <main className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-border-warm pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
              Roles & Permissions
            </h1>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mt-1">
              Configure system roles, access policies, and permission matrices for SBA modules
            </p>
          </div>
          <button 
            onClick={openCreateModal}
            className="bg-gold hover:bg-gold-hover text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
          >
            <span>+</span> Create New Role
          </button>
        </header>

        {/* Filter bar */}
        <section className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles by name, description, or department..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-warm bg-card text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/50 uppercase font-bold tracking-wider whitespace-nowrap">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border-warm bg-card text-foreground text-xs font-semibold uppercase tracking-wider focus:outline-none focus:border-gold"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Roles list */}
        <section className="bg-card border border-border-warm rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(20,19,17,0.02)]">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-warm bg-background/50 text-foreground/50 font-semibold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Role Name</th>
                <th className="py-4 px-6">Type & Entity</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Permissions Overview</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-warm">
              {filteredRoles.map((role) => {
                // Calculate modules with active permissions
                const activeModulesCount = role.permissions.filter(
                  p => p.view || p.add || p.edit || p.delete || p.download
                ).length;

                return (
                  <tr key={role.id} className="hover:bg-background/25 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary-text-gold block">{role.name}</span>
                        {role.isSystem && (
                          <span className="text-[9px] font-bold bg-gold-muted text-gold px-1.5 py-0.5 rounded border border-gold/10 uppercase tracking-wider">
                            System
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        role.type === "Internal" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                      }`}>
                        {role.type}
                      </span>
                      {role.type === "External" && role.entity && (
                        <span className="block text-xs font-semibold text-foreground/80 mt-1">{role.entity}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-foreground/80 max-w-[320px]">{role.description}</td>
                    <td className="py-4 px-6 text-foreground/70 font-medium">{role.department}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-foreground/80">
                        <span className={`w-2 h-2 rounded-full ${activeModulesCount > 0 ? "bg-active-green" : "bg-foreground/20"}`}></span>
                        {activeModulesCount} / {SYSTEM_MODULES.length} Modules Allowed
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-1 rounded text-foreground/40 hover:text-gold transition-colors"
                          title="Edit Role Matrix"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className={`p-1 rounded transition-colors ${role.isSystem ? "text-foreground/10 cursor-not-allowed" : "text-foreground/40 hover:text-red-600"}`}
                          title={role.isSystem ? "Cannot delete system roles" : "Delete Role"}
                          disabled={role.isSystem}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>

      {/* 3. CRUD Create / Edit Slide-Over Drawer (With Module Permission Matrix) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-card border-l border-border-warm p-8 w-full max-w-2xl shadow-2xl h-full flex flex-col justify-between animate-in slide-in-from-right duration-300 overflow-y-auto">
            <form onSubmit={handleSaveRole} className="flex flex-col gap-6">
              <header className="border-b border-border-warm pb-3">
                <h3 className="text-base font-bold text-foreground uppercase tracking-tight">
                  {editingRole ? "Modify Role Matrix" : "Create New Access Role"}
                </h3>
                <p className="text-xs text-foreground/50 uppercase tracking-wider mt-0.5">
                  Assign modules rights and read/write capabilities
                </p>
              </header>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Role Name
                    </label>
                    <input
                      type="text"
                      required
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Host, Case Supervisor"
                      className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Role Type
                    </label>
                    <select
                      value={roleType}
                      onChange={(e) => {
                        setRoleType(e.target.value as "Internal" | "External");
                        if (e.target.value === "Internal") setRoleEntity("");
                      }}
                      className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="Internal">Internal (SBA Staff)</option>
                      <option value="External">External (Government Partners)</option>
                    </select>
                  </div>
                </div>

                {roleType === "External" && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      Assign to Entity
                    </label>
                    <select
                      required
                      value={roleEntity}
                      onChange={(e) => setRoleEntity(e.target.value)}
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

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={roleDept}
                    onChange={(e) => setRoleDept(e.target.value)}
                    placeholder="e.g. IT & Administration"
                    className="px-3 py-2.5 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                    placeholder="Define role responsibilities and limitations..."
                    className="px-3 py-2 rounded-xl border border-border-warm bg-background text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30 resize-none"
                  />
                </div>

                {/* Module Permission Matrix Table */}
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    Module Capabilities Matrix
                  </label>
                  <div className="border border-border-warm rounded-xl overflow-hidden bg-background/30 text-xs">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border-warm bg-background/70 text-foreground/60 font-bold uppercase tracking-wider text-left">
                          <th className="py-3 px-4">System Module</th>
                          <th className="py-3 px-3 text-center">View</th>
                          <th className="py-3 px-3 text-center">Add</th>
                          <th className="py-3 px-3 text-center">Edit</th>
                          <th className="py-3 px-3 text-center">Delete</th>
                          <th className="py-3 px-3 text-center">Download</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-warm">
                        {rolePerms.map((perm, idx) => (
                          <tr key={perm.moduleName} className="hover:bg-card transition-colors">
                            <td className="py-2.5 px-4 font-semibold text-foreground/80">{perm.moduleName}</td>
                            
                            {/* VIEW Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={perm.view}
                                onChange={() => handlePermissionChange(idx, "view")}
                                className="w-3.5 h-3.5 accent-gold border-border-warm rounded cursor-pointer"
                              />
                            </td>

                            {/* ADD Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={perm.add}
                                onChange={() => handlePermissionChange(idx, "add")}
                                className="w-3.5 h-3.5 accent-gold border-border-warm rounded cursor-pointer"
                              />
                            </td>

                            {/* EDIT Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={perm.edit}
                                onChange={() => handlePermissionChange(idx, "edit")}
                                className="w-3.5 h-3.5 accent-gold border-border-warm rounded cursor-pointer"
                              />
                            </td>

                            {/* DELETE Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={perm.delete}
                                onChange={() => handlePermissionChange(idx, "delete")}
                                className="w-3.5 h-3.5 accent-gold border-border-warm rounded cursor-pointer"
                              />
                            </td>

                            {/* DOWNLOAD Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={perm.download}
                                onChange={() => handlePermissionChange(idx, "download")}
                                className="w-3.5 h-3.5 accent-gold border-border-warm rounded cursor-pointer"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-border-warm pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-warm bg-background hover:bg-background/80 text-foreground font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Save Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
