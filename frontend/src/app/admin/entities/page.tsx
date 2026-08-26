"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export type LiaisonOfficer = {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  isPrimary: boolean;
};

export type Department = {
  id: string;
  name: string;
  officers: LiaisonOfficer[];
};

export type Entity = {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  departments: Department[];
};

const MOCK_ENTITIES: Entity[] = [
  {
    id: "ENT-001",
    name: "Sharjah Health Authority",
    status: "Active",
    departments: [
      {
        id: "DEP-101",
        name: "Medical Approvals",
        officers: [
          { id: "OFF-101", name: "Dr. Fatima Al Suwaidi", title: "Head of Approvals", phone: "050-111-2222", email: "fatima@sha.gov.ae", isPrimary: true },
          { id: "OFF-102", name: "Ahmed Salem", title: "Coordinator", phone: "050-333-4444", email: "ahmed.s@sha.gov.ae", isPrimary: false }
        ]
      },
      {
        id: "DEP-102",
        name: "Overseas Treatment",
        officers: [
          { id: "OFF-103", name: "Dr. Khalid M.", title: "Director", phone: "050-123-4567", email: "khalid.m@sha.gov.ae", isPrimary: true }
        ]
      }
    ]
  },
  {
    id: "ENT-002",
    name: "Sharjah Housing Directorate",
    status: "Active",
    departments: [
      {
        id: "DEP-201",
        name: "Citizen Grants",
        officers: [
          { id: "OFF-201", name: "Eng. Khalid Al Qasimi", title: "Director of Grants", phone: "050-555-6666", email: "khalid@shd.gov.ae", isPrimary: true }
        ]
      }
    ]
  },
  {
    id: "ENT-003",
    name: "Ministry of Community Development",
    status: "Inactive",
    departments: [
      {
        id: "DEP-301",
        name: "Financial Aid",
        officers: [
          { id: "OFF-301", name: "Mariam Al Shamsi", title: "Senior Liaison", phone: "050-777-8888", email: "mariam@mocd.gov.ae", isPrimary: true }
        ]
      }
    ]
  }
];

export default function DirectoryOfEntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>(MOCK_ENTITIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showDrawer, setShowDrawer] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  
  // For the form, we keep a clone of the entity
  const [formState, setFormState] = useState<Partial<Entity>>({
    name: "", status: "Active", departments: []
  });

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const filteredEntities = entities.filter(e => {
    // Search by entity name or any department name
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.departments.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "All" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingEntity(null);
    setFormState({ name: "", status: "Active", departments: [] });
    setShowDrawer(true);
  };

  const handleOpenEdit = (entity: Entity) => {
    setEditingEntity(entity);
    // deep clone so we can edit without affecting original until saved
    setFormState(JSON.parse(JSON.stringify(entity)));
    setShowDrawer(true);
  };

  const handleSaveEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntity) {
      setEntities(entities.map(ent => ent.id === editingEntity.id ? { ...ent, ...formState } as Entity : ent));
    } else {
      const newEntity: Entity = {
        ...(formState as Entity),
        id: `ENT-${Math.floor(Math.random() * 900) + 100}`,
      };
      setEntities([newEntity, ...entities]);
    }
    setShowDrawer(false);
  };

  const handleDeleteEntity = (id: string) => {
    setEntities(entities.filter(ent => ent.id !== id));
    setShowDeleteModal(null);
  };

  const handleAddDepartment = () => {
    const newDept: Department = {
      id: `DEP-${Math.floor(Math.random() * 900) + 100}`,
      name: "",
      officers: []
    };
    setFormState({ ...formState, departments: [...(formState.departments || []), newDept] });
  };

  const handleUpdateDepartmentName = (deptIndex: number, newName: string) => {
    const updatedDepts = [...(formState.departments || [])];
    updatedDepts[deptIndex].name = newName;
    setFormState({ ...formState, departments: updatedDepts });
  };

  const handleRemoveDepartment = (deptIndex: number) => {
    const updatedDepts = [...(formState.departments || [])];
    updatedDepts.splice(deptIndex, 1);
    setFormState({ ...formState, departments: updatedDepts });
  };

  const handleAddOfficer = (deptIndex: number) => {
    const updatedDepts = [...(formState.departments || [])];
    const newOfficer: LiaisonOfficer = {
      id: `OFF-${Math.floor(Math.random() * 900) + 100}`,
      name: "", title: "", phone: "", email: "", 
      isPrimary: updatedDepts[deptIndex].officers.length === 0
    };
    updatedDepts[deptIndex].officers.push(newOfficer);
    setFormState({ ...formState, departments: updatedDepts });
  };

  const handleUpdateOfficer = (deptIndex: number, officerIndex: number, field: keyof LiaisonOfficer, value: any) => {
    const updatedDepts = [...(formState.departments || [])];
    const dept = updatedDepts[deptIndex];
    
    if (field === "isPrimary" && value === true) {
      dept.officers.forEach(o => o.isPrimary = false); // Only one primary per department
    }
    
    dept.officers[officerIndex] = { ...dept.officers[officerIndex], [field]: value };
    setFormState({ ...formState, departments: updatedDepts });
  };

  const handleRemoveOfficer = (deptIndex: number, officerIndex: number) => {
    const updatedDepts = [...(formState.departments || [])];
    updatedDepts[deptIndex].officers.splice(officerIndex, 1);
    setFormState({ ...formState, departments: updatedDepts });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar activeItem="Directory of Entities" />

      <main className="flex-1 p-8 flex flex-col gap-6 overflow-hidden max-h-screen">
        <header className="border-b border-border-warm pb-5 flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
              Directory of Entities & Officials
            </h1>
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mt-1">
              Manage organizational registries, departments, and liaison officers.
            </p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-gold hover:bg-gold-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
          >
            + Add Entity
          </button>
        </header>

        {/* Filters */}
        <section className="flex gap-4 items-center shrink-0">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Entity Name or Department..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-warm bg-card text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/50 uppercase font-bold tracking-wider whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border-warm bg-card text-foreground text-xs font-semibold uppercase tracking-wider focus:outline-none focus:border-gold"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </section>

        {/* Main Table List */}
        <section className="bg-card border border-border-warm rounded-xl overflow-y-auto shadow-[0_2px_8px_rgba(20,19,17,0.02)] flex-1">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm">
              <tr className="border-b border-border-warm text-foreground/50 font-semibold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Entity Reference</th>
                <th className="py-4 px-6">Departments</th>
                <th className="py-4 px-6">Total Officers</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-warm">
              {filteredEntities.map((ent) => (
                <tr key={ent.id} className="hover:bg-background/25 transition-colors group">
                  <td className="py-4 px-6 align-top">
                    <span className="font-bold text-foreground block mb-0.5">{ent.name}</span>
                    <span className="text-[10px] text-foreground/50 uppercase tracking-widest">{ent.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-3">
                      {ent.departments.map(dept => (
                        <div key={dept.id}>
                          <span className="font-semibold text-xs text-foreground block mb-1">{dept.name}</span>
                          <div className="flex flex-col gap-1 pl-2 border-l-2 border-gold/20">
                            {dept.officers.length > 0 ? dept.officers.slice(0, 2).map(o => (
                              <div key={o.id} className="text-[11px] flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${o.isPrimary ? 'bg-gold' : 'bg-foreground/20'}`} title={o.isPrimary ? "Primary Officer" : "Backup Officer"}></span>
                                <span className="text-foreground/90">{o.name}</span>
                                <span className="text-[9px] text-foreground/50">({o.phone})</span>
                              </div>
                            )) : <span className="text-[10px] text-foreground/40 italic">No officers</span>}
                            {dept.officers.length > 2 && (
                              <span className="text-[9px] text-gold font-bold">+{dept.officers.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {ent.departments.length === 0 && (
                        <span className="text-[10px] text-foreground/40 italic">No departments</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 align-top font-medium text-foreground/80">
                    {ent.departments.reduce((acc, dept) => acc + dept.officers.length, 0)} officers
                  </td>
                  <td className="py-4 px-6 text-center align-top">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      ent.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {ent.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2 align-top">
                    <button
                      onClick={() => handleOpenEdit(ent)}
                      className="text-foreground/50 hover:text-gold transition-colors p-2"
                      title="Edit Entity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(ent.id)}
                      className="text-foreground/50 hover:text-red-500 transition-colors p-2"
                      title="Delete Entity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEntities.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-foreground/40 uppercase tracking-widest font-bold">
                    No entities found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* Right-to-Left Drawer for Add/Edit Entity */}
      {showDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[600px] max-w-full bg-card h-full shadow-2xl flex flex-col border-l border-border-warm animate-in slide-in-from-right duration-300">
            <header className="px-6 py-5 border-b border-border-warm flex justify-between items-center bg-background shrink-0">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                {editingEntity ? "Edit Entity & Departments" : "Add New Entity"}
              </h2>
              <button type="button" onClick={() => setShowDrawer(false)} className="text-foreground/40 hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            
            <form onSubmit={handleSaveEntity} className="p-6 flex flex-col gap-8 flex-1 overflow-y-auto">
              {/* Entity Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-widest border-b border-border-warm pb-2">Entity Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Entity Name</label>
                    <input required value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" placeholder="e.g. Sharjah Health Authority" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Global Status</label>
                    <select required value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as any})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Departments & Liaison Officers */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-border-warm pb-2">
                  <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Departments & Liaisons</h3>
                  <button type="button" onClick={handleAddDepartment} className="text-[10px] font-bold text-gold hover:text-gold-hover uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Department
                  </button>
                </div>
                
                {formState.departments?.length === 0 ? (
                  <p className="text-xs text-foreground/40 italic text-center py-4">No departments added yet. Please add at least one department.</p>
                ) : (
                  <div className="flex flex-col gap-6">
                    {formState.departments?.map((dept, deptIdx) => (
                      <div key={deptIdx} className="p-4 bg-background border border-border-warm rounded-xl relative group">
                        <button type="button" onClick={() => handleRemoveDepartment(deptIdx)} className="absolute top-4 right-4 text-foreground/30 hover:text-red-500 transition-colors" title="Remove Department">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        
                        <div className="mb-4 pr-8">
                          <label className="block text-[9px] font-bold text-foreground/50 uppercase tracking-widest mb-1">Department Name</label>
                          <input required value={dept.name} onChange={e => handleUpdateDepartmentName(deptIdx, e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-card text-sm focus:outline-none focus:border-gold font-bold" placeholder="e.g. IT Department" />
                        </div>

                        <div className="pl-4 border-l-2 border-gold/20 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Officers in {dept.name || 'this department'}</span>
                            <button type="button" onClick={() => handleAddOfficer(deptIdx)} className="text-[9px] font-bold text-gold hover:text-gold-hover uppercase tracking-wider">+ Add Officer</button>
                          </div>
                          
                          {dept.officers.length === 0 ? (
                            <p className="text-[10px] text-foreground/40 italic">No officers assigned.</p>
                          ) : (
                            dept.officers.map((officer, officerIdx) => (
                              <div key={officerIdx} className="p-3 bg-card border border-border-warm/50 rounded-lg relative group/officer">
                                <button type="button" onClick={() => handleRemoveOfficer(deptIdx, officerIdx)} className="absolute top-2 right-2 text-foreground/30 hover:text-red-500 opacity-0 group-hover/officer:opacity-100 transition-opacity">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                
                                <div className="grid grid-cols-2 gap-3 mb-2 pr-6">
                                  <div>
                                    <label className="block text-[8px] font-bold text-foreground/50 uppercase tracking-widest mb-1">Name</label>
                                    <input required value={officer.name} onChange={e => handleUpdateOfficer(deptIdx, officerIdx, "name", e.target.value)} className="w-full px-2 py-1.5 rounded border border-border-warm/50 bg-background text-xs focus:outline-none focus:border-gold" />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-bold text-foreground/50 uppercase tracking-widest mb-1">Title</label>
                                    <input required value={officer.title} onChange={e => handleUpdateOfficer(deptIdx, officerIdx, "title", e.target.value)} className="w-full px-2 py-1.5 rounded border border-border-warm/50 bg-background text-xs focus:outline-none focus:border-gold" />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-bold text-foreground/50 uppercase tracking-widest mb-1">Phone</label>
                                    <input required value={officer.phone} onChange={e => handleUpdateOfficer(deptIdx, officerIdx, "phone", e.target.value)} className="w-full px-2 py-1.5 rounded border border-border-warm/50 bg-background text-xs focus:outline-none focus:border-gold" />
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-bold text-foreground/50 uppercase tracking-widest mb-1">Email</label>
                                    <input required type="email" value={officer.email} onChange={e => handleUpdateOfficer(deptIdx, officerIdx, "email", e.target.value)} className="w-full px-2 py-1.5 rounded border border-border-warm/50 bg-background text-xs focus:outline-none focus:border-gold" />
                                  </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer w-max">
                                  <input type="checkbox" checked={officer.isPrimary} onChange={e => handleUpdateOfficer(deptIdx, officerIdx, "isPrimary", e.target.checked)} className="rounded border-border-warm text-gold focus:ring-gold focus:ring-offset-card" />
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/70">Primary Contact</span>
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border-warm flex justify-end gap-3 sticky bottom-0 bg-card z-10 pb-2">
                <button type="button" onClick={() => setShowDrawer(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-foreground/60 uppercase tracking-widest hover:text-foreground transition-colors">Cancel</button>
                <button type="submit" className="bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">
                  {editingEntity ? "Save Changes" : "Create Entity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border-warm rounded-2xl shadow-2xl p-6 w-[400px] animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-foreground mb-2">Delete Entity</h2>
            <p className="text-sm text-foreground/70 mb-6">Are you sure you want to remove this entity? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 rounded-lg text-xs font-bold text-foreground/60 uppercase tracking-widest hover:text-foreground transition-colors">Cancel</button>
              <button onClick={() => handleDeleteEntity(showDeleteModal)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
