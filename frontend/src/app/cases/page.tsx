"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Sidebar } from "../../components/Sidebar";
import { PortalHeader } from "../../components/PortalHeader";
import { Pagination } from "../../components/Pagination";
import Link from "next/link";
import { MOCK_DIRECTIVES, ExecutiveDirective } from "../directives/page";
import { MOCK_ARCHIVES, ArchiveSession } from "../studio/archives/page";
import { useAuth } from "../../context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { LogCommunicationDrawer, CommType, CommunicationLog, COMM_ICONS } from "../../components/LogCommunicationDrawer";

export type CaseStatus = "New" | "Under Review" | "Awaiting Citizen" | "Assigned" | "In Progress" | "Escalated" | "Resolved" | "Closed" | "Reopened";

export interface CaseTask {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
}

export interface TimelineEvent {
  id: string;
  action: string;
  actor: string;
  date: string;
  comment?: string;
  isEmail?: boolean;
  emailDetails?: {
    from: string;
    to: string;
    subject: string;
    body: string;
    reply?: {
      from: string;
      to: string;
      date: string;
      body: string;
    };
    attachments?: { name: string; size: string }[];
  };
}

export interface CaseDocument {
  id: string;
  title: string;
  type?: string;
  dateAdded: string;
}

export interface Case {
  id: string; // Reference Number
  status: CaseStatus;
  
  // Linkages
  citizenId: string;
  citizenName: string;
  feedSource: string; 
  
  // Core Info
  summary: string;
  facts: string;
  
  // Classification
  primaryClassification: string;
  secondaryClassification: string;
  priority: "Critical" | "High" | "Standard" | "Medium" | "Low";
  
  // SLAs
  slaHours?: number;
  alertDate?: string;
  
  // Stakeholders
  caseOwner: string;
  externalEntity: string;
  entityDepartment?: string;
  liaisonOfficer: string;
  escalationOfficer?: string;
  
  // Sub-collections
  tasks: CaseTask[];
  timeline: TimelineEvent[];
  documents: CaseDocument[];
  
  // Outcome
  outcome?: string;
  resolutionClassification?: string;

  // Analytics fields (for Executive module)
  region?: string;       // Sharjah sub-region
  createdAt?: string;    // ISO-ish date string for trend charts
  resolvedAt?: string;   // For avg response time calc
}

export const MOCK_CASES: Case[] = [
  {
    id: "CASE-9410",
    status: "Resolved",
    citizenId: "CIT-001",
    citizenName: "Salem Al-Ketbi",
    feedSource: "Radio Ingest - Direct Line",
    summary: "Housing Expansion Request for growing family.",
    facts: "Citizen lives in a rented apartment. Applied in 2025. Rent is increasing.",
    primaryClassification: "Housing",
    secondaryClassification: "Grant Application",
    priority: "Medium",
    caseOwner: "Ahmed (Producer)",
    externalEntity: "Sharjah Housing Department",
    liaisonOfficer: "Khalid M.",
    region: "Sharjah City",
    createdAt: "2026-01-12",
    resolvedAt: "2026-01-15",
    tasks: [
      { id: "TSK-101", title: "Verify application status with Housing Dept.", assignee: "Khalid M.", deadline: "Aug 20, 2026", status: "Completed" }
    ],
    timeline: [
      { id: "TL-01", action: "Case Created via HotLine", actor: "System", date: "Jan 12, 2024, 09:00 AM" },
      { id: "TL-02", action: "Status changed to Resolved", actor: "Khalid M.", date: "Jan 15, 2024, 11:30 AM", comment: "Housing department approved the fast-track application." }
    ],
    documents: [
      { id: "DOC-201", title: "Initial Rent Agreement", dateAdded: "Jan 12, 2024" }
    ],
    outcome: "Application fast-tracked.",
    resolutionClassification: "Successful Resolution"
  },
  {
    id: "CASE-9810",
    status: "Assigned",
    citizenId: "CIT-003",
    citizenName: "Ahmed Al-Suwaidi",
    feedSource: "Executive Directive",
    summary: "Executive Directive: Cover Health Debt",
    facts: "Citizen has pending medical bills of AED 150,000 at Al Qassimi Hospital. Executive directive issued on air to clear it within 24h. We need the Health Authority to approve the grant and transfer funds.",
    primaryClassification: "Health & Medical",
    secondaryClassification: "Financial Support",
    priority: "High",
    caseOwner: "Fatima (Producer)",
    externalEntity: "Sharjah Health Authority",
    liaisonOfficer: "Dr. Khalid M.",
    slaHours: 24,
    region: "Sharjah City",
    createdAt: "2026-08-26",
    tasks: [
      { id: "TSK-102", title: "Wait for SHA approval", assignee: "Dr. Khalid M.", deadline: "Aug 26, 2026", status: "Pending" }
    ],
    timeline: [
      { id: "TL-03", action: "Case Assigned to SHA", actor: "Command Center", date: "Aug 26, 2026, 09:00 AM", comment: "Please expedite approval." },
      {
        id: "TL-EMAIL-1",
        action: "Email Correspondence Logged",
        actor: "System Inbound Router",
        date: "Aug 26, 2026, 02:15 PM",
        isEmail: true,
        emailDetails: {
          from: "case-9810@sba-command.ae",
          to: "dr.khalid@sharjahhealth.gov.ae",
          subject: "Urgent: Ruler Executive Directive referral - Case 9810 [SBA-9810]",
          body: "Dear Dr. Khalid, \n\nWe have received an executive directive during today's live radio broadcast regarding the medical bills of citizen Ahmed Al-Suwaidi. Please review the attached medical file and confirm SHA fast-track clearance within 24 hours.",
          reply: {
            from: "dr.khalid@sharjahhealth.gov.ae",
            to: "case-9810@sba-command.ae",
            date: "Aug 26, 2026, 03:10 PM",
            body: "Dear Command Center, \n\nI have received the directive. The file has been pushed to the Medical Approvals Committee. We will review the Al Qassimi Hospital records and upload the signed clearance once ready. See attached initial committee acknowledgement."
          },
          attachments: [
            { name: "Initial_Committee_Acknowledgement.pdf", size: "320 KB" }
          ]
        }
      }
    ],
    documents: []
  },
  {
    id: "CASE-9411",
    status: "In Progress",
    citizenId: "CIT-002",
    citizenName: "Fatima Al-Suwaidi",
    feedSource: "Portal",
    summary: "Approval for Overseas Treatment (Germany)",
    facts: "Citizen requires specialized oncology treatment not available locally. Medical committee approved initially. Awaiting final budget allocation from the Health Authority.",
    primaryClassification: "Health & Medical",
    secondaryClassification: "Overseas Treatment",
    priority: "Standard",
    caseOwner: "Ahmed (Producer)",
    externalEntity: "Sharjah Health Authority",
    liaisonOfficer: "Dr. Khalid M.",
    slaHours: 48,
    region: "Eastern Region (Khorfakkan)",
    createdAt: "2026-08-24",
    tasks: [
      { id: "TSK-103", title: "Review committee reports", assignee: "Dr. Khalid M.", deadline: "Aug 27, 2026", status: "In Progress" }
    ],
    timeline: [
      { id: "TL-04", action: "Case Assigned to SHA", actor: "Command Center", date: "Aug 24, 2026, 11:00 AM" },
      { id: "TL-05", action: "Status updated to In Progress", actor: "Dr. Khalid M.", date: "Aug 25, 2026, 10:00 AM", comment: "Reviewing committee reports." }
    ],
    documents: []
  },
  {
    id: "CASE-9412",
    status: "Escalated",
    citizenId: "CIT-004",
    citizenName: "Khalid Al-Qasimi",
    feedSource: "Radio Ingest - Direct Line",
    summary: "Housing allocation delay exceeding 3 years.",
    facts: "Citizen applied for housing in 2023, no response yet. Family of 8 in cramped rental.",
    primaryClassification: "Housing",
    secondaryClassification: "Allocation",
    priority: "Critical",
    caseOwner: "Maryam (Officer)",
    externalEntity: "Sharjah Housing Department",
    liaisonOfficer: "Khalid M.",
    slaHours: -12,
    region: "Central Region (Al Dhaid)",
    createdAt: "2026-03-10",
    tasks: [],
    timeline: [
      { id: "TL-06", action: "Case Created via HotLine", actor: "System", date: "Mar 10, 2026, 10:00 AM" },
      { id: "TL-07", action: "Status changed to Escalated", actor: "Maryam (Officer)", date: "Mar 18, 2026, 09:00 AM", comment: "Entity not responding." }
    ],
    documents: []
  },
  {
    id: "CASE-9413",
    status: "New",
    citizenId: "CIT-005",
    citizenName: "Mohammed Al-Shamsi",
    feedSource: "Radio Ingest - Direct Line",
    summary: "Job placement assistance after factory closure.",
    facts: "Citizen lost job due to factory closure. Has 5 dependents. Looking for government employment support.",
    primaryClassification: "Employment",
    secondaryClassification: "Job Placement",
    priority: "Standard",
    caseOwner: "Fatima (Producer)",
    externalEntity: "Sharjah Human Resources Department",
    liaisonOfficer: "TBD",
    slaHours: 72,
    region: "Al Hamriyah",
    createdAt: "2026-08-25",
    tasks: [],
    timeline: [
      { id: "TL-08", action: "Case Created via HotLine", actor: "System", date: "Aug 25, 2026, 08:00 AM" },
      {
        id: "TL-EMAIL-CIT",
        action: "Citizen Email Received",
        actor: "Mohammed Al-Shamsi",
        date: "Aug 25, 2026, 09:30 AM",
        isEmail: true,
        emailDetails: {
          from: "m.alshamsi@gmail.com",
          to: "case-9413@sba-command.ae",
          subject: "Regarding my job application support - Mohamad Al-Shamsi [SBA-9413]",
          body: "Dear SBA Team, \n\nI am sending this email following my call to the Direct Line show regarding my job placement request. As mentioned, my factory closed down last month, and I support a family of 5 children. I have attached my updated CV and experience certificate for your review. Please let me know what the next step is.\n\nBest regards,\nMohammed Al-Shamsi",
          attachments: [
            { name: "Mohammed_AlShamsi_CV.pdf", size: "180 KB" }
          ]
        }
      },
      {
        id: "TL-EMAIL-OWNER",
        action: "Internal Case Update Sent",
        actor: "Fatima Al-Suwaidi (Producer)",
        date: "Aug 25, 2026, 11:00 AM",
        isEmail: true,
        emailDetails: {
          from: "case-9413@sba-command.ae",
          to: "m.alshamsi@gmail.com",
          subject: "Re: Regarding my job application support - Mohamad Al-Shamsi [SBA-9413]",
          body: "Dear Mohammed, \n\nWe have received your email and CV. We are forwarding your case files directly to our liaison officer at the Sharjah Human Resources Department. They will match your qualifications with active vacancies. We will keep you updated on their feedback.\n\nWarm regards,\nFatima Al-Suwaidi\nDirect Line Production Team"
        }
      },
      {
        id: "TL-EMAIL-ENTITY",
        action: "External Liaison Response Logged",
        actor: "Sharjah Human Resources Department",
        date: "Aug 25, 2026, 03:45 PM",
        isEmail: true,
        emailDetails: {
          from: "liaison@shrd.gov.ae",
          to: "case-9413@sba-command.ae",
          subject: "RE: Job placement assistance referral - Case 9413 [SBA-9413]",
          body: "Dear Fatima, \n\nWe have received the referral for citizen Mohammed Al-Shamsi. We checked his CV and have flagged two potential matches: one in the Sharjah Municipality and one in the Sharjah Commerce Authority. We have scheduled an initial interview with him on August 30, 2026. Please see the attached interview appointment card.\n\nRegards,\nAisha Al-Ketbi\nLiaison Officer, SHRD",
          attachments: [
            { name: "Interview_Appointment_Card.pdf", size: "120 KB" }
          ]
        }
      }
    ],
    documents: []
  },
  {
    id: "CASE-9414",
    status: "Closed",
    citizenId: "CIT-001",
    citizenName: "Noura Al-Mazrouei",
    feedSource: "Portal",
    summary: "Medical debt clearance for chronic illness.",
    facts: "Citizen has accumulated AED 45,000 in hospital bills. Low income. Request for financial waiver approved.",
    primaryClassification: "Health & Medical",
    secondaryClassification: "Debt Waiver",
    priority: "High",
    caseOwner: "Ahmed (Producer)",
    externalEntity: "Sharjah Health Authority",
    liaisonOfficer: "Dr. Khalid M.",
    region: "Eastern Region (Kalba)",
    createdAt: "2026-02-05",
    resolvedAt: "2026-02-20",
    tasks: [],
    timeline: [
      { id: "TL-09", action: "Case Created", actor: "System", date: "Feb 5, 2026" },
      { id: "TL-10", action: "Status changed to Closed", actor: "Ahmed (Producer)", date: "Feb 20, 2026", comment: "Waiver approved and processed." }
    ],
    documents: [],
    outcome: "Waiver granted.",
    resolutionClassification: "Successful Resolution"
  },
  {
    id: "CASE-9415",
    status: "Under Review",
    citizenId: "CIT-003",
    citizenName: "Saeed Al-Bloushi",
    feedSource: "Radio Ingest - Direct Line",
    summary: "Land boundary dispute with neighbour.",
    facts: "Citizen reports a land boundary encroachment. Survey requested from Sharjah Municipality.",
    primaryClassification: "Government Services",
    secondaryClassification: "Land Affairs",
    priority: "Standard",
    caseOwner: "Maryam (Officer)",
    externalEntity: "Sharjah Municipality",
    liaisonOfficer: "TBD",
    slaHours: 96,
    region: "Sharjah City",
    createdAt: "2026-05-14",
    tasks: [],
    timeline: [
      { id: "TL-11", action: "Case Created via HotLine", actor: "System", date: "May 14, 2026" }
    ],
    documents: []
  },
  {
    id: "CASE-9416",
    status: "Resolved",
    citizenId: "CIT-002",
    citizenName: "Mariam Al-Jabri",
    feedSource: "Executive Directive",
    summary: "Emergency housing repair after flooding.",
    facts: "Storm damage caused roof collapse. Family relocated. Emergency repair grant approved via directive.",
    primaryClassification: "Housing",
    secondaryClassification: "Emergency Repair",
    priority: "Critical",
    caseOwner: "Fatima (Producer)",
    externalEntity: "Sharjah Housing Department",
    liaisonOfficer: "Khalid M.",
    region: "Central Region (Al Dhaid)",
    createdAt: "2026-04-02",
    resolvedAt: "2026-04-05",
    tasks: [],
    timeline: [
      { id: "TL-12", action: "Emergency Directive Issued", actor: "Leadership", date: "Apr 2, 2026" },
      { id: "TL-13", action: "Status changed to Resolved", actor: "Khalid M.", date: "Apr 5, 2026", comment: "Repair completed. Family back home." }
    ],
    documents: [],
    outcome: "Emergency repair completed.",
    resolutionClassification: "Successful Resolution"
  },
  {
    id: "CASE-9417",
    status: "Awaiting Citizen",
    citizenId: "CIT-005",
    citizenName: "Tariq Al-Nuaimi",
    feedSource: "Portal",
    summary: "Business license renewal blockage.",
    facts: "Small business owner blocked from renewing license due to old debt registered in error. SEDD contacted.",
    primaryClassification: "Government Services",
    secondaryClassification: "License Affairs",
    priority: "Medium",
    caseOwner: "Ahmed (Producer)",
    externalEntity: "SEDD",
    liaisonOfficer: "TBD",
    slaHours: -6,
    region: "Eastern Region (Khorfakkan)",
    createdAt: "2026-06-20",
    tasks: [],
    timeline: [
      { id: "TL-14", action: "Case Created", actor: "System", date: "Jun 20, 2026" }
    ],
    documents: []
  },
  {
    id: "CASE-9418",
    status: "In Progress",
    citizenId: "CIT-004",
    citizenName: "Aisha Al-Mansoori",
    feedSource: "Radio Ingest - Direct Line",
    summary: "Disability allowance application pending for 8 months.",
    facts: "Citizen with permanent disability. Application submitted to MOSD in Dec 2025. No updates received.",
    primaryClassification: "Financial Assistance",
    secondaryClassification: "Disability Allowance",
    priority: "High",
    caseOwner: "Maryam (Officer)",
    externalEntity: "MOSD",
    liaisonOfficer: "Dr. Khalid M.",
    slaHours: 12,
    region: "Sharjah City",
    createdAt: "2026-07-15",
    tasks: [],
    timeline: [
      { id: "TL-15", action: "Case Created via HotLine", actor: "System", date: "Jul 15, 2026" },
      { id: "TL-16", action: "Assigned to MOSD", actor: "Maryam (Officer)", date: "Jul 16, 2026" }
    ],
    documents: []
  },
  {
    id: "CASE-9419",
    status: "New",
    citizenId: "CIT-001",
    citizenName: "Hassan Al-Ali",
    feedSource: "Radio Ingest - Direct Line",
    summary: "School enrollment blocked due to nationality documentation issue.",
    facts: "Child unable to enroll in government school. Parents cannot get the required educational residency approval.",
    primaryClassification: "Education",
    secondaryClassification: "Enrollment",
    priority: "Standard",
    caseOwner: "Fatima (Producer)",
    externalEntity: "Sharjah Education Council",
    liaisonOfficer: "TBD",
    slaHours: 48,
    region: "Al Hamriyah",
    createdAt: "2026-08-20",
    tasks: [],
    timeline: [
      { id: "TL-17", action: "Case Created via HotLine", actor: "System", date: "Aug 20, 2026" }
    ],
    documents: []
  },
  {
    id: "CASE-9420",
    status: "Escalated",
    citizenId: "CIT-002",
    citizenName: "Hamdan Al-Rashidi",
    feedSource: "Radio Ingest - Direct Line",
    summary: "Repeated housing allocation denial without explanation.",
    facts: "Applied three consecutive years. Denied each time. No reasoning provided. Wife disabled. Six children.",
    primaryClassification: "Housing",
    secondaryClassification: "Allocation Appeal",
    priority: "Critical",
    caseOwner: "Maryam (Officer)",
    externalEntity: "Sharjah Housing Department",
    liaisonOfficer: "Khalid M.",
    slaHours: -48,
    region: "Central Region (Al Dhaid)",
    createdAt: "2026-08-10",
    tasks: [],
    timeline: [
      { id: "TL-18", action: "Case Created via HotLine", actor: "System", date: "Aug 10, 2026" },
      { id: "TL-19", action: "Status changed to Escalated", actor: "Maryam (Officer)", date: "Aug 12, 2026", comment: "Third consecutive denial. Escalating to leadership." }
    ],
    documents: []
  }
];

export const MOCK_CITIZENS_REGISTRY = [
  { id: "CIT-001", name: "Salem Al-Ketbi" },
  { id: "CIT-002", name: "Fatima Al-Suwaidi" },
  { id: "CIT-003", name: "Ahmed Al-Suwaidi" },
  { id: "CIT-004", name: "Khalid Al-Qasimi" },
  { id: "CIT-005", name: "Mohammed Al-Shamsi" }
];

function SearchParamsHandler({ onAction }: { onAction: (action: string | null, params: URLSearchParams) => void }) {
  const searchParams = useSearchParams();
  // Use a ref to prevent onAction dependency from triggering infinite loops
  const onActionRef = React.useRef(onAction);
  React.useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  React.useEffect(() => {
    if (searchParams.get("action")) {
      onActionRef.current(searchParams.get("action"), searchParams);
    }
  }, [searchParams]);
  return null;
}

const ENTITY_DEPARTMENTS: Record<string, string[]> = {
  "Sharjah Health Authority": ["Medical Approvals", "Patient Affairs", "Hospital Referrals"],
  "Sharjah Housing Directorate": ["Housing Grants", "Land Allocation", "Finance & Loans"],
  "Ministry of Community Development": ["Social Aid & Welfare", "Family Care", "Humanitarian Grants"],
  "Sharjah Police General Directorate": ["Traffic & Licensing", "Community Policing", "Humanitarian Cases Desk"]
};

export const ENTITY_LIAISONS: Record<string, string[]> = {
  "Sharjah Health Authority": ["Dr. Fatima Al-Suwaidi", "Dr. Saeed Omar", "Ahmed Salem"],
  "Sharjah Housing Directorate": ["Eng. Ahmed Al-Suwaidi", "Eng. Khalid Al Qasimi", "Mariam Al-Hassani"],
  "Ministry of Community Development": ["Aisha Al-Mansoori", "Tariq Al-Shamsi", "Hessa Al-Nuaimi"],
  "Sharjah Police General Directorate": ["Col. Saeed Al Nuaimi", "Lt. Col. Mohammed Al Qasimi", "Capt. Sultan Al-Ketbi"]
};

export const ENTITY_ESCALATION_OFFICERS: Record<string, string[]> = {
  "Sharjah Health Authority": ["Dr. Abdulaziz Al-Sarki (Director General)", "H.E. Chairman of SHA", "Dr. Ali Obaid (Head of Inspection)"],
  "Sharjah Housing Directorate": ["H.E. Eng. Khalifa Al-Tunaiji (Director General)", "Eng. Ibrahim Al-Housani (CEO)", "H.E. Chairman of Housing Directorate"],
  "Ministry of Community Development": ["H.E. Hessa Bint Essa Buhumaid (Undersecretary)", "Sultan Al-Junaibi (Executive Director)", "H.E. Minister of Community Development"],
  "Sharjah Police General Directorate": ["Maj. Gen. Saif Zari Al Shamsi (Commander-in-Chief)", "Brig. Gen. Abdullah Mubarak (Deputy Commander)", "Col. Omar Al-Ghazal (Director of Inspection)"]
};

const KANBAN_COLUMNS = [
  { 
    title: "Triage & Review", 
    statuses: ["New", "Under Review", "Awaiting Citizen"],
    theme: {
      bg: "bg-blue-500/[0.02] border-blue-500/15",
      headerText: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    }
  },
  { 
    title: "Assigned & Active", 
    statuses: ["Assigned", "In Progress"],
    theme: {
      bg: "bg-indigo-500/[0.02] border-indigo-500/15",
      headerText: "text-indigo-600 dark:text-indigo-400",
      badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
    }
  },
  { 
    title: "Escalated", 
    statuses: ["Escalated"],
    theme: {
      bg: "bg-red-500/[0.02] border-red-500/15",
      headerText: "text-red-600 dark:text-red-400",
      badge: "bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse"
    }
  },
  { 
    title: "Resolved & Closed", 
    statuses: ["Resolved", "Closed", "Reopened"],
    theme: {
      bg: "bg-green-500/[0.02] border-green-500/15",
      headerText: "text-green-600 dark:text-green-400",
      badge: "bg-green-500/10 text-green-600 dark:text-green-400"
    }
  }
];

export default function CaseManagementPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assignmentFilter, setAssignmentFilter] = useState<"All" | "Internal" | "External">("All");
  const [cameFromNavigation, setCameFromNavigation] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [autoOpenStatus, setAutoOpenStatus] = useState(false);
  const [autoOpenStatusVal, setAutoOpenStatusVal] = useState<CaseStatus>("New");

  const ALL_STATUSES = ["All", "New", "Assigned", "Under Review", "In Progress", "Await Citizen", "Escalated", "Resolved", "Closed", "Reopened"];

  const getStatusColors = (status: string, isActive: boolean) => {
    const map: Record<string, { active: string, inactive: string, text: string }> = {
      "All": { active: "bg-gradient-to-br from-gold/20 to-gold/5 border-gold shadow-md shadow-gold/10", inactive: "border-border-warm hover:border-gold/40 hover:bg-gold/5", text: "text-primary-text-gold" },
      "New": { active: "bg-blue-500/10 border-blue-500 shadow-md shadow-blue-500/20", inactive: "border-border-warm hover:border-blue-500/40 hover:bg-blue-500/5", text: "text-blue-500" },
      "Assigned": { active: "bg-indigo-500/10 border-indigo-500 shadow-md shadow-indigo-500/20", inactive: "border-border-warm hover:border-indigo-500/40 hover:bg-indigo-500/5", text: "text-indigo-400" },
      "Under Review": { active: "bg-purple-500/10 border-purple-500 shadow-md shadow-purple-500/20", inactive: "border-border-warm hover:border-purple-500/40 hover:bg-purple-500/5", text: "text-purple-400" },
      "In Progress": { active: "bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/20", inactive: "border-border-warm hover:border-amber-500/40 hover:bg-amber-500/5", text: "text-amber-500" },
      "Await Citizen": { active: "bg-orange-500/10 border-orange-500 shadow-md shadow-orange-500/20", inactive: "border-border-warm hover:border-orange-500/40 hover:bg-orange-500/5", text: "text-orange-500" },
      "Escalated": { active: "bg-red-500/10 border-red-500 shadow-md shadow-red-500/20", inactive: "border-border-warm hover:border-red-500/40 hover:bg-red-500/5", text: "text-red-500" },
      "Resolved": { active: "bg-teal-500/10 border-teal-500 shadow-md shadow-teal-500/20", inactive: "border-border-warm hover:border-teal-500/40 hover:bg-teal-500/5", text: "text-teal-400" },
      "Closed": { active: "bg-green-500/10 border-green-500 shadow-md shadow-green-500/20", inactive: "border-border-warm hover:border-green-500/40 hover:bg-green-500/5", text: "text-green-500" },
      "Reopened": { active: "bg-pink-500/10 border-pink-500 shadow-md shadow-pink-500/20", inactive: "border-border-warm hover:border-pink-500/40 hover:bg-pink-500/5", text: "text-pink-500" }
    };
    const colors = map[status] || map["All"];
    return {
      bg: isActive ? colors.active : `bg-card ${colors.inactive}`,
      text: isActive ? colors.text : "text-foreground",
      label: isActive ? colors.text : "text-foreground/60"
    };
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.id.includes(searchQuery) || c.citizenName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const hasExternalEntity = c.externalEntity && c.externalEntity !== "TBD" && c.externalEntity !== "";
    const matchesAssignment =
      assignmentFilter === "All" ||
      (assignmentFilter === "External" && hasExternalEntity) ||
      (assignmentFilter === "Internal" && !hasExternalEntity);
    return matchesSearch && matchesStatus && matchesAssignment;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, assignmentFilter]);

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const { user } = useAuth();

  const [showCreateCaseDrawer, setShowCreateCaseDrawer] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [highlightedCaseId, setHighlightedCaseId] = useState<string | null>(null);
  const [newCaseForm, setNewCaseForm] = useState({
    citizenName: "", citizenId: "", primaryClassification: "General Inquiry", secondaryClassification: "", priority: "Standard", slaHours: "", alertDate: "", summary: "", facts: "", caseOwner: user?.fullName || "Current User", externalEntity: "", entityDepartment: "", liaisonOfficer: "", escalationOfficer: "", status: "New"
  });
  const [showCitizenSuggestions, setShowCitizenSuggestions] = useState(false);

  const suggestedCitizens = MOCK_CITIZENS_REGISTRY.filter(c => 
    (newCaseForm.citizenName.length >= 3 && c.name.toLowerCase().includes(newCaseForm.citizenName.toLowerCase())) ||
    (newCaseForm.citizenId.length >= 3 && c.id.toLowerCase().includes(newCaseForm.citizenId.toLowerCase()))
  );

  const selectCitizen = (citizen: { id: string, name: string }) => {
    setNewCaseForm({ ...newCaseForm, citizenName: citizen.name, citizenId: citizen.id });
    setShowCitizenSuggestions(false);
  };

  const openCreateDrawer = () => {
    setEditingCaseId(null);
    setNewCaseForm({ citizenName: "", citizenId: "", primaryClassification: "General Inquiry", secondaryClassification: "", priority: "Standard", slaHours: "", alertDate: "", summary: "", facts: "", caseOwner: user?.fullName || "Current User", externalEntity: "", entityDepartment: "", liaisonOfficer: "", escalationOfficer: "", status: "New" });
    setShowCreateCaseDrawer(true);
  };

  const openEditDrawer = (c: Case) => {
    setEditingCaseId(c.id);
    const defaultEscalation = c.escalationOfficer || (ENTITY_ESCALATION_OFFICERS[c.externalEntity]?.[0] || "");
    setNewCaseForm({
      citizenName: c.citizenName,
      citizenId: c.citizenId,
      primaryClassification: c.primaryClassification,
      secondaryClassification: c.secondaryClassification,
      priority: (c.priority as any) === "Low" || (c.priority as any) === "Medium" ? "Standard" : c.priority,
      slaHours: c.slaHours?.toString() || "",
      alertDate: c.alertDate || "",
      summary: c.summary,
      facts: c.facts || "",
      caseOwner: c.caseOwner,
      externalEntity: c.externalEntity,
      entityDepartment: c.entityDepartment || "",
      liaisonOfficer: c.liaisonOfficer,
      escalationOfficer: defaultEscalation,
      status: c.status
    });
    setShowCreateCaseDrawer(true);
  };

  const handleDeleteCase = (caseId: string) => {
    if (window.confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      setCases(cases.filter(c => c.id !== caseId));
    }
  };

  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCaseId) {
      setCases(cases.map(c => c.id === editingCaseId ? {
        ...c,
        citizenName: newCaseForm.citizenName,
        citizenId: newCaseForm.citizenId,
        primaryClassification: newCaseForm.primaryClassification,
        secondaryClassification: newCaseForm.secondaryClassification || "N/A",
        priority: newCaseForm.priority as "Critical" | "High" | "Standard",
        slaHours: newCaseForm.priority !== "Standard" && newCaseForm.slaHours ? parseInt(newCaseForm.slaHours) : undefined,
        alertDate: newCaseForm.priority === "Standard" ? newCaseForm.alertDate : undefined,
        externalEntity: newCaseForm.externalEntity || "TBD",
        entityDepartment: newCaseForm.entityDepartment || "TBD",
        liaisonOfficer: newCaseForm.liaisonOfficer || "TBD",
        escalationOfficer: newCaseForm.status === "Escalated" ? (newCaseForm.escalationOfficer || ENTITY_ESCALATION_OFFICERS[newCaseForm.externalEntity]?.[0]) : newCaseForm.escalationOfficer,
        status: newCaseForm.status as CaseStatus,
        summary: newCaseForm.summary,
        facts: newCaseForm.facts
      } : c));
    } else {
      const newCase: Case = {
        id: `CASE-${Math.floor(Math.random() * 9000) + 1000}`,
      status: newCaseForm.status as CaseStatus,
      citizenId: newCaseForm.citizenId,
      citizenName: newCaseForm.citizenName,
      feedSource: "Manual Entry",
      summary: newCaseForm.summary,
      facts: newCaseForm.facts || "Awaiting facts verification...",
      primaryClassification: newCaseForm.primaryClassification,
      secondaryClassification: newCaseForm.secondaryClassification || "N/A",
      priority: newCaseForm.priority as "Critical" | "High" | "Standard",
      slaHours: newCaseForm.priority !== "Standard" && newCaseForm.slaHours ? parseInt(newCaseForm.slaHours) : undefined,
      alertDate: newCaseForm.priority === "Standard" ? newCaseForm.alertDate : undefined,
      caseOwner: newCaseForm.caseOwner,
      externalEntity: newCaseForm.externalEntity || "TBD",
      entityDepartment: newCaseForm.entityDepartment || "TBD",
      liaisonOfficer: newCaseForm.liaisonOfficer || "TBD",
      escalationOfficer: newCaseForm.status === "Escalated" ? (newCaseForm.escalationOfficer || ENTITY_ESCALATION_OFFICERS[newCaseForm.externalEntity]?.[0]) : newCaseForm.escalationOfficer,
      tasks: [],
      timeline: [
        {
          id: `TL-${Math.floor(Math.random() * 1000)}`,
          action: "Case Manually Created",
          actor: newCaseForm.caseOwner,
          date: new Date().toLocaleString()
        }
      ],
      documents: []
      };
      setCases([newCase, ...cases]);
      setHighlightedCaseId(newCase.id);
      setTimeout(() => setHighlightedCaseId(null), 3000);
    }
    setShowCreateCaseDrawer(false);
    setNewCaseForm({ citizenName: "", citizenId: "", primaryClassification: "General Inquiry", secondaryClassification: "", priority: "Standard", slaHours: "", alertDate: "", summary: "", facts: "", caseOwner: user?.fullName || "Current User", externalEntity: "", entityDepartment: "", liaisonOfficer: "", escalationOfficer: "", status: "New" });
  };

  const handleUpdateCase = (updatedCase: Case) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    if (selectedCase?.id === updatedCase.id) setSelectedCase(updatedCase);
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: CaseStatus, comment: string) => {
    const targetCase = cases.find(c => c.id === caseId);
    if (targetCase) {
      const newEvent: TimelineEvent = {
        id: `TL-${Math.floor(Math.random() * 1000)}`,
        action: `Status changed to ${newStatus}`,
        actor: "Current User",
        date: new Date().toLocaleString(),
        comment: comment || "No comment provided."
      };
      handleUpdateCase({ ...targetCase, status: newStatus, timeline: [...targetCase.timeline, newEvent] });
    }
  };

  const handleKanbanDrop = (caseId: string, targetStatus: CaseStatus) => {
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return;
    if (targetCase.status === targetStatus) return;

    // Check if target status requires validation routing or resolution details:
    const isAssigned = targetStatus === "Assigned";
    const isResolvedOrClosed = targetStatus === "Resolved" || targetStatus === "Closed";

    if (isAssigned || isResolvedOrClosed) {
      setSelectedCase(targetCase);
      setAutoOpenStatusVal(targetStatus);
      setAutoOpenStatus(true);
    } else {
      const newEvent: TimelineEvent = {
        id: `TL-${Math.floor(Math.random() * 1000)}`,
        action: `Status changed to ${targetStatus} via Kanban Board`,
        actor: user?.fullName || "Current User",
        date: new Date().toLocaleString(),
        comment: `Dragged card to the ${targetStatus} column.`
      };
      
      const updatedCase: Case = {
        ...targetCase,
        status: targetStatus,
        timeline: [...targetCase.timeline, newEvent]
      };

      if (targetStatus === "New" || targetStatus === "Under Review") {
        updatedCase.externalEntity = "";
        updatedCase.entityDepartment = "";
        updatedCase.liaisonOfficer = "";
      }

      handleUpdateCase(updatedCase);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Suspense fallback={null}>
        <SearchParamsHandler onAction={(action, params) => {
          if (action === "new" && !showCreateCaseDrawer) {
            if (params.get("autofill") === "true") {
              const summaryParam = params.get("summary") || "";
              setNewCaseForm(prev => ({
                ...prev,
                citizenName: params.get("name") || "",
                citizenId: params.get("citizenId") || prev.citizenId,
                summary: summaryParam,
                primaryClassification: params.get("category") || prev.primaryClassification || "Housing",
                externalEntity: params.get("dept") || prev.externalEntity || "Sharjah Housing Directorate",
                entityDepartment: params.get("subDept") || prev.entityDepartment,
                liaisonOfficer: params.get("liaison") || prev.liaisonOfficer,
                slaHours: params.get("sla") || prev.slaHours,
                alertDate: params.get("date") || prev.alertDate,
                priority: summaryParam.toLowerCase().includes("directive") ? "Critical" : "Standard",
                status: "Assigned"
              }));
            }
            setShowCreateCaseDrawer(true);
            router.replace("/cases");
          } else if (action === "view" && params.get("id")) {
            const targetId = params.get("id");
            const targetCase = cases.find(c => c.id === targetId);
            if (targetCase) {
              setSelectedCase(targetCase);
              setCameFromNavigation(true);
            }
            router.replace("/cases");
          }
        }} />
      </Suspense>

      <Sidebar activeItem="Case Management" />

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        <PortalHeader
          title="Case Management (CRM)"
          subtitle="Manage requests from start to closure. Track SLAs, delegations, and timelines."
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          actions={
            <button 
              onClick={openCreateDrawer}
              className="bg-gold hover:bg-gold-hover text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
            >
              + Create Case
            </button>
          }
        />

        <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">

        {/* Status KPI Tabs */}
        <section className="grid grid-cols-5 2xl:grid-cols-10 gap-3">
          {ALL_STATUSES.map(status => {
            const count = status === "All" ? cases.length : cases.filter(c => c.status === status).length;
            const isActive = statusFilter === status;
            const colors = getStatusColors(status, isActive);
            
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${colors.bg}`}
              >
                <span className={`text-2xl font-black mb-1 ${colors.text}`}>{count}</span>
                <span className={`text-[9px] uppercase font-bold tracking-widest text-center ${colors.label}`}>{status}</span>
              </button>
            );
          })}
        </section>

        {/* Filters */}
        <section className="flex gap-4 items-center shrink-0">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Case ID or Citizen Name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-warm bg-card text-foreground text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/30"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Internal / External Assignment Filter */}
          <div className="flex items-center gap-1 bg-card border border-border-warm rounded-xl p-1">
            {(["All", "Internal", "External"] as const).map(f => (
              <button
                key={f}
                onClick={() => setAssignmentFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  assignmentFilter === f
                    ? f === "External" ? "bg-indigo-500 text-white shadow-sm"
                      : f === "Internal" ? "bg-gold text-white shadow-sm"
                      : "bg-foreground text-background shadow-sm"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* View Mode Toggle (List vs. Kanban Board) */}
          <div className="flex items-center gap-1 bg-card border border-border-warm rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                viewMode === "kanban"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kanban
            </button>
          </div>
        </section>

        {/* Main Table List vs. Kanban Board View */}
        {viewMode === "list" ? (
          <section className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-sm flex flex-col shrink-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm">
                <tr className="border-b border-border-warm text-foreground/50 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Case Reference</th>
                  <th className="py-4 px-6">Citizen</th>
                  <th className="py-4 px-6">Category / Entity</th>
                  <th className="py-4 px-6 text-center">Priority & Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-warm">
                {paginatedCases.map((c) => (
                  <tr key={c.id} className={`transition-colors group ${c.id === highlightedCaseId ? 'bg-gold/10 animate-[pulse_1.5s_ease-in-out_infinite]' : 'hover:bg-background/25'}`}>
                    <td className="py-4 px-6">
                      <span className="font-bold text-primary-text-gold block mb-0.5">{c.id}</span>
                      <span className="text-[10px] text-foreground/50 uppercase tracking-widest">{c.feedSource}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-foreground/90 font-bold block mb-0.5">{c.citizenName}</span>
                      <span className="text-[10px] text-foreground/40 font-mono">{c.citizenId}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-foreground/80 block mb-0.5 font-medium">{c.primaryClassification}</span>
                      <span className="text-[10px] text-foreground/50 uppercase tracking-widest">{c.externalEntity}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          c.priority === "Critical" ? "bg-red-600 text-white border border-red-700 animate-pulse" :
                          c.priority === "High" ? "bg-red-50 text-red-700 border border-red-200" :
                          "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {c.priority} Priority
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          c.status === "Resolved" || c.status === "Closed" ? "bg-green-50 text-green-700" :
                          c.status === "New" ? "bg-purple-50 text-purple-700" :
                          "bg-foreground/10 text-foreground/70"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="bg-background border border-border-warm hover:border-gold text-foreground hover:text-gold px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => openEditDrawer(c)}
                          className="p-1.5 text-foreground/40 hover:text-gold transition-colors"
                          title="Edit Case"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCase(c.id)}
                          className="p-1.5 text-foreground/40 hover:text-red-500 transition-colors"
                          title="Delete Case"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCases.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </section>
        ) : (
          /* Kanban Board Layout Column Grid */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 flex-1 min-h-[500px]">
            {KANBAN_COLUMNS.map(col => {
              const colCases = filteredCases.filter(c => col.statuses.includes(c.status));
              return (
                <div 
                  key={col.title} 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const caseId = e.dataTransfer.getData("text/plain");
                    handleKanbanDrop(caseId, col.statuses[0] as CaseStatus);
                  }}
                  className={`flex flex-col gap-3 border rounded-2xl p-2.5 min-h-[450px] transition-colors ${col.theme.bg}`}
                >
                  <div className="flex justify-between items-center border-b border-border-warm pb-2 shrink-0">
                    <span className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${col.theme.headerText}`}>
                      {col.title}
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${col.theme.badge}`}>
                        {colCases.length}
                      </span>
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1.5 pl-0.5 py-1 max-h-[66vh] custom-kanban-scrollbar">
                    <style>{`
                      .custom-kanban-scrollbar::-webkit-scrollbar {
                        width: 4px;
                        height: 4px;
                      }
                      .custom-kanban-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      .custom-kanban-scrollbar::-webkit-scrollbar-thumb {
                        background: transparent;
                        border-radius: 99px;
                      }
                      .custom-kanban-scrollbar:hover::-webkit-scrollbar-thumb {
                        background: rgba(188, 147, 90, 0.25);
                      }
                      .custom-kanban-scrollbar:hover::-webkit-scrollbar-thumb:hover {
                        background: rgba(188, 147, 90, 0.55);
                      }
                    `}</style>
                    {colCases.length === 0 ? (
                      <div className="text-center py-16 text-foreground/30 text-[10px] font-bold uppercase tracking-wider border border-dashed border-border-warm/40 rounded-xl">
                        No Active Cases
                      </div>
                    ) : (
                      colCases.map(c => (
                        <div 
                          key={c.id} 
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", c.id);
                          }}
                          className={`bg-card border rounded-xl p-3 transition-all flex flex-col gap-2 group relative cursor-grab active:cursor-grabbing ${c.id === highlightedCaseId ? 'ring-2 ring-gold border-gold bg-gold/10 shadow-lg animate-[pulse_1.5s_ease-in-out_infinite]' : 'border-border-warm hover:border-gold/45 shadow-xs hover:shadow-md'}`}
                        >
                          
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="font-bold text-xs text-primary-text-gold block mb-0.5">{c.id}</span>
                              <span className="text-[9px] text-foreground/45 uppercase tracking-widest font-bold">{c.feedSource}</span>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                c.priority === "Critical" ? "bg-red-600 text-white border border-red-700 animate-pulse" :
                                c.priority === "High" ? "bg-red-50 text-red-700 border border-red-200" :
                                "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}>
                                {c.priority}
                              </span>
                              <span className="text-[9px] font-bold text-gold/80">{c.status}</span>
                            </div>
                          </div>

                          <div className="text-xs leading-relaxed text-foreground/80 line-clamp-2">
                            {c.summary}
                          </div>

                          <div className="border-t border-border-warm/50 pt-2 flex flex-col gap-1 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-foreground/45 font-semibold">Citizen:</span>
                              <span className="font-bold text-foreground/85 truncate max-w-[140px]">{c.citizenName}</span>
                            </div>
                            {c.externalEntity && (
                              <div className="flex justify-between">
                                <span className="text-foreground/45 font-semibold">Assigned To:</span>
                                <span className="font-bold text-foreground/85 truncate max-w-[130px]">{c.externalEntity}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-2 border-t border-border-warm/50 pt-1.5 mt-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setSelectedCase(c)}
                              className="bg-foreground text-background hover:bg-gold hover:text-white px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => openEditDrawer(c)}
                              className="p-1.5 rounded hover:bg-foreground/5 text-foreground/40 hover:text-gold transition-colors"
                              title="Edit Case"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button
                              onClick={() => handleDeleteCase(c.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-foreground/40 hover:text-red-600 transition-colors"
                              title="Delete Case"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                          
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>

      {/* Detail Workspace Full Page Model */}
      {selectedCase && (
        <CaseDetailWorkspace 
          activeCase={selectedCase} 
          onClose={() => {
            setSelectedCase(null);
            setAutoOpenStatus(false);
            if (cameFromNavigation) {
              setCameFromNavigation(false);
              router.back();
            }
          }} 
          onUpdateCase={handleUpdateCase}
          onUpdateStatus={(status, comment) => handleUpdateCaseStatus(selectedCase.id, status, comment)}
          autoOpenStatusModal={autoOpenStatus}
          defaultStatusForModal={autoOpenStatusVal}
        />
      )}

      {/* Right-to-Left Drawer for Create Case */}
      {showCreateCaseDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[450px] bg-card h-full shadow-2xl flex flex-col border-l border-border-warm animate-in slide-in-from-right duration-300">
            <header className="px-6 py-5 border-b border-border-warm flex justify-between items-center bg-background shrink-0">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">{editingCaseId ? `Edit ${editingCaseId}` : newCaseForm.status === "Assigned" ? "Update Case" : "Create Case"}</h2>
              <button onClick={() => setShowCreateCaseDrawer(false)} className="text-foreground/40 hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            
            <form onSubmit={handleCreateCaseSubmit} className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto">
              {/* Royal Directive / Live Ingestion Quote Banner */}
              {newCaseForm.summary && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex flex-col gap-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <span>👑 Royal Verbal Directive Text</span>
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      Live Ingest Feed
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90 italic font-medium leading-relaxed bg-background/80 p-2.5 rounded-lg border border-amber-500/20">
                    "{newCaseForm.summary}"
                  </p>
                </div>
              )}

              <div className="relative">
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Citizen Name</label>
                <input 
                  required 
                  value={newCaseForm.citizenName} 
                  onChange={e => {
                    setNewCaseForm({...newCaseForm, citizenName: e.target.value});
                    setShowCitizenSuggestions(true);
                  }} 
                  onFocus={() => setShowCitizenSuggestions(true)}
                  className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" 
                />
                
                {showCitizenSuggestions && newCaseForm.citizenName.length >= 3 && suggestedCitizens.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-card border border-border-warm rounded-xl shadow-lg max-h-40 overflow-y-auto">
                    {suggestedCitizens.map(c => (
                      <li 
                        key={c.id} 
                        onClick={() => selectCitizen(c)}
                        className="px-4 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-primary-text-gold cursor-pointer border-b border-border-warm last:border-0"
                      >
                        <span className="font-bold">{c.name}</span> <span className="text-[10px] text-foreground/50">({c.id})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Citizen ID</label>
                <input 
                  required 
                  value={newCaseForm.citizenId} 
                  onChange={e => {
                    setNewCaseForm({...newCaseForm, citizenId: e.target.value});
                    setShowCitizenSuggestions(true);
                  }} 
                  onFocus={() => setShowCitizenSuggestions(true)}
                  className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" 
                  placeholder="CIT-XXXX" 
                />
                
                {showCitizenSuggestions && newCaseForm.citizenId.length >= 3 && suggestedCitizens.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-card border border-border-warm rounded-xl shadow-lg max-h-40 overflow-y-auto">
                    {suggestedCitizens.map(c => (
                      <li 
                        key={c.id} 
                        onClick={() => selectCitizen(c)}
                        className="px-4 py-2 text-sm text-foreground hover:bg-gold/10 hover:text-primary-text-gold cursor-pointer border-b border-border-warm last:border-0"
                      >
                        <span className="font-bold">{c.name}</span> <span className="text-[10px] text-foreground/50">({c.id})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Primary Classification</label>
                  <select required value={newCaseForm.primaryClassification} onChange={e => setNewCaseForm({...newCaseForm, primaryClassification: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold">
                    <option>General Inquiry</option>
                    <option>Housing</option>
                    <option>Health & Medical</option>
                    <option>Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Secondary Class (Opt)</label>
                  <input value={newCaseForm.secondaryClassification} onChange={e => setNewCaseForm({...newCaseForm, secondaryClassification: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" placeholder="e.g. Financial Support" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Priority</label>
                  <select required value={newCaseForm.priority} onChange={e => {
                    const newPriority = e.target.value;
                    let newSla = "";
                    let newDate = "";
                    if (newPriority === "Critical") newSla = "5";
                    else if (newPriority === "High") newSla = "24";
                    else if (newPriority === "Standard") {
                      const d = new Date();
                      d.setDate(d.getDate() + 3);
                      newDate = d.toISOString().split('T')[0];
                    }
                    setNewCaseForm({...newCaseForm, priority: newPriority, slaHours: newSla, alertDate: newDate});
                  }} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold">
                    <option value="Critical">Critical Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Standard">Standard Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Status</label>
                  <select required value={newCaseForm.status} onChange={e => {
                    const st = e.target.value;
                    const defaultEscalation = st === "Escalated" ? (newCaseForm.escalationOfficer || ENTITY_ESCALATION_OFFICERS[newCaseForm.externalEntity]?.[0] || "") : newCaseForm.escalationOfficer;
                    setNewCaseForm({...newCaseForm, status: st, escalationOfficer: defaultEscalation});
                  }} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold">
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Awaiting Citizen">Awaiting Citizen</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Reopened">Reopened</option>
                  </select>
                </div>
              </div>

              {/* Conditional SLA Fields based on Priority */}
              <div className="bg-background/50 p-4 rounded-xl border border-border-warm">
                {newCaseForm.priority === "Critical" && (
                  <div>
                    <label className="block text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Maximum SLA Hours (Max 5)
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      required 
                      value={newCaseForm.slaHours} 
                      onChange={e => setNewCaseForm({...newCaseForm, slaHours: e.target.value})} 
                      className="w-full px-3 py-2 rounded-xl border border-red-200 bg-background text-sm focus:outline-none focus:border-red-400" 
                      placeholder="e.g. 2" 
                    />
                  </div>
                )}
                {newCaseForm.priority === "High" && (
                  <div>
                    <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Maximum SLA Hours (Max 24)
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max="24" 
                      required 
                      value={newCaseForm.slaHours} 
                      onChange={e => setNewCaseForm({...newCaseForm, slaHours: e.target.value})} 
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-background text-sm focus:outline-none focus:border-amber-400" 
                      placeholder="e.g. 12" 
                    />
                  </div>
                )}
                {newCaseForm.priority === "Standard" && (
                  <div>
                    <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Follow-up Alert Date
                    </label>
                    <input 
                      type="date" 
                      required 
                      value={newCaseForm.alertDate} 
                      onChange={e => setNewCaseForm({...newCaseForm, alertDate: e.target.value})} 
                      className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-blue-400" 
                    />
                  </div>
                )}
              </div>
              
              <div className="border-t border-border-warm pt-4 mt-2">
                <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-widest mb-4">Stakeholders</h3>
                
                {(() => {
                  const isAssigned = newCaseForm.status === "Assigned";
                  const isEscalated = newCaseForm.status === "Escalated";
                  return (
                    <>
                      <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Case Owner</label>
                          <select 
                            required
                            value={newCaseForm.caseOwner}
                            onChange={e => setNewCaseForm({...newCaseForm, caseOwner: e.target.value})}
                            className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold"
                          >
                            <option value="Fatima Al-Suwaidi">Fatima Al-Suwaidi (Producer)</option>
                            <option value="Maryam Al-Ali">Maryam Al-Ali (Case Manager)</option>
                            <option value="Layla Al-Mansoori">Layla Al-Mansoori (Executive)</option>
                            <option value="Hardik T.">Hardik T. (Admin)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${(isAssigned || isEscalated) ? "text-red-600" : "text-foreground/60"}`}>
                            External Entity {(isAssigned || isEscalated) && "*"}
                          </label>
                          <select 
                            required={isAssigned || isEscalated}
                            value={newCaseForm.externalEntity} 
                            onChange={e => {
                              const entity = e.target.value;
                              const defaultDept = ENTITY_DEPARTMENTS[entity]?.[0] || "";
                              const defaultLiaison = ENTITY_LIAISONS[entity]?.[0] || "";
                              const defaultEscalation = ENTITY_ESCALATION_OFFICERS[entity]?.[0] || "";
                              setNewCaseForm({
                                ...newCaseForm, 
                                externalEntity: entity, 
                                entityDepartment: defaultDept,
                                liaisonOfficer: defaultLiaison,
                                escalationOfficer: defaultEscalation
                              });
                            }} 
                            className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:border-gold ${(isAssigned || isEscalated) && !newCaseForm.externalEntity ? "border-red-300 focus:border-red-500" : "border-border-warm"}`}
                          >
                            <option value="">Select Entity...</option>
                            <option value="Sharjah Health Authority">Sharjah Health Authority</option>
                            <option value="Sharjah Housing Directorate">Sharjah Housing Directorate</option>
                            <option value="Ministry of Community Development">Ministry of Community Development</option>
                            <option value="Sharjah Police General Directorate">Sharjah Police General Directorate</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${isAssigned ? "text-red-600" : "text-foreground/60"}`}>
                            Entity Department {isAssigned && "*"}
                          </label>
                          <select 
                            required={isAssigned}
                            value={newCaseForm.entityDepartment} 
                            onChange={e => setNewCaseForm({...newCaseForm, entityDepartment: e.target.value})} 
                            className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:border-gold ${isAssigned && !newCaseForm.entityDepartment ? "border-red-300 focus:border-red-500" : "border-border-warm"}`}
                            disabled={!newCaseForm.externalEntity}
                          >
                            {!newCaseForm.externalEntity ? (
                              <option value="">Select Entity First...</option>
                            ) : (
                              <>
                                <option value="">Select Department...</option>
                                {ENTITY_DEPARTMENTS[newCaseForm.externalEntity]?.map(dept => (
                                  <option key={dept} value={dept}>{dept}</option>
                                ))}
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${isAssigned ? "text-red-600" : "text-foreground/60"}`}>
                          Liaison Officer {isAssigned && "*"}
                        </label>
                        <select 
                          required={isAssigned}
                          value={newCaseForm.liaisonOfficer} 
                          onChange={e => setNewCaseForm({...newCaseForm, liaisonOfficer: e.target.value})} 
                          className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:border-gold ${isAssigned && !newCaseForm.liaisonOfficer ? "border-red-300 focus:border-red-500" : "border-border-warm"}`}
                          disabled={!newCaseForm.externalEntity}
                        >
                          {!newCaseForm.externalEntity ? (
                            <option value="">Select Entity First...</option>
                          ) : (
                            <>
                              <option value="">Select Liaison Officer...</option>
                              {ENTITY_LIAISONS[newCaseForm.externalEntity]?.map(officer => (
                                <option key={officer} value={officer}>{officer}</option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>

                      {/* Escalation Officer Field when Status is Escalated */}
                      {isEscalated && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl flex flex-col gap-2 animate-in fade-in duration-200">
                          <label className="block text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Escalation Officer * (Required for Escalation)
                          </label>
                          <select 
                            required
                            value={newCaseForm.escalationOfficer || (ENTITY_ESCALATION_OFFICERS[newCaseForm.externalEntity]?.[0] || "")} 
                            onChange={e => setNewCaseForm({...newCaseForm, escalationOfficer: e.target.value})} 
                            className="w-full px-3 py-2 rounded-xl border border-red-300 bg-background text-sm font-bold focus:outline-none focus:border-red-500 text-foreground"
                            disabled={!newCaseForm.externalEntity}
                          >
                            {!newCaseForm.externalEntity ? (
                              <option value="">Select Entity First...</option>
                            ) : (
                              <>
                                <option value="">Select Escalation Officer...</option>
                                {ENTITY_ESCALATION_OFFICERS[newCaseForm.externalEntity]?.map(officer => (
                                  <option key={officer} value={officer}>{officer}</option>
                                ))}
                              </>
                            )}
                          </select>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Case Summary</label>
                <textarea required value={newCaseForm.summary} onChange={e => setNewCaseForm({...newCaseForm, summary: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold h-24 resize-none" placeholder="Enter main request details..."></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Confirmed Facts</label>
                <textarea value={newCaseForm.facts} onChange={e => setNewCaseForm({...newCaseForm, facts: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold h-24 resize-none" placeholder="Enter any confirmed facts..."></textarea>
              </div>
              <div className="mt-4 pt-4 border-t border-border-warm flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateCaseDrawer(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-foreground/60 uppercase tracking-widest hover:text-foreground transition-colors">Cancel</button>
                <button type="submit" className="bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">{editingCaseId ? "Save Changes" : newCaseForm.status === "Assigned" ? "Update Case" : "Create Case"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const getActorRoleBadge = (actor: string, activeCase: Case) => {
  const normActor = actor.toLowerCase();
  const normCitizen = activeCase.citizenName.toLowerCase();
  const normOwner = activeCase.caseOwner.toLowerCase();
  const normLiaison = activeCase.liaisonOfficer?.toLowerCase() || "";

  if (normActor.includes("system") || normActor === "command center" || normActor.includes("router")) {
    return { label: "System", style: "bg-foreground/5 text-foreground/60 border-foreground/10" };
  }
  if (normActor.includes(normCitizen) || normCitizen.includes(normActor)) {
    return { label: "Citizen", style: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
  }
  if (normActor.includes(normOwner) || normOwner.includes(normActor) || normActor.includes("producer") || normActor.includes("officer") || normActor.includes("admin")) {
    return { label: "Case Owner", style: "bg-gold/15 text-primary-text-gold border-gold/30" };
  }
  if (normActor.includes(normLiaison) || normLiaison.includes(normActor) || normActor.includes("liaison") || normActor.includes("department") || normActor.includes("authority") || normActor.includes("shrd") || normActor.includes("officer")) {
    return { label: "External Entity", style: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25" };
  }
  return { label: "Case Worker", style: "bg-foreground/5 text-foreground/75 border-foreground/10" };
};

const TAB_PERMISSIONS: Record<string, {
  allowedTabs: string[];
  canChangeStatus: boolean;
}> = {
  Administrator: {
    allowedTabs: ["overview", "directive", "archive", "tasks", "timeline", "documents", "closure"],
    canChangeStatus: true
  },
  CaseManager: {
    allowedTabs: ["overview", "directive", "tasks", "timeline", "documents", "closure"],
    canChangeStatus: true
  },
  Producer: {
    allowedTabs: ["overview", "directive", "archive", "tasks", "documents"],
    canChangeStatus: true
  },
  SBAExecutive: {
    allowedTabs: ["overview", "directive", "archive", "timeline", "closure"],
    canChangeStatus: false
  },
  Presenter: {
    allowedTabs: ["overview", "archive"],
    canChangeStatus: false
  },
  ExternalLiaison: {
    allowedTabs: ["overview", "timeline"],
    canChangeStatus: false
  }
};

export function CaseDetailWorkspace({ 
  activeCase, 
  onClose,
  onUpdateCase,
  onUpdateStatus,
  autoOpenStatusModal = false,
  defaultStatusForModal
}: { 
  activeCase: Case, 
  onClose: () => void,
  onUpdateCase: (updatedCase: Case) => void,
  onUpdateStatus: (status: CaseStatus, comment: string) => void,
  autoOpenStatusModal?: boolean,
  defaultStatusForModal?: CaseStatus
}) {
  const { user } = useAuth();
  
  const roleRules = TAB_PERMISSIONS[user?.role || "ExternalLiaison"] || TAB_PERMISSIONS["ExternalLiaison"];
  const allowedTabs = roleRules.allowedTabs;
  const canChangeStatus = roleRules.canChangeStatus;

  const [activeTab, setActiveTab] = useState<"overview" | "directive" | "archive" | "tasks" | "timeline" | "documents" | "closure">("overview");

  useEffect(() => {
    if (user?.role) {
      const allowed = TAB_PERMISSIONS[user.role]?.allowedTabs || ["overview"];
      if (!allowed.includes(activeTab)) {
        setActiveTab(allowed[0] as any);
      }
    }
  }, [user, activeTab]);
  
  const linkedDirective = MOCK_DIRECTIVES.find(d => d.linkedCaseId === activeCase.id) || 
    (activeCase.feedSource === "Executive Directive" ? MOCK_DIRECTIVES[0] : null);
    
  const linkedArchive = MOCK_ARCHIVES.find(a => a.linkedCases?.some(c => c.id === activeCase.id)) || null;
  
  // Status Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<CaseStatus>(activeCase.status);
  const [statusComment, setStatusComment] = useState("");
  
  // Temp External Routing States for status changes
  const [tempExternalEntity, setTempExternalEntity] = useState(activeCase.externalEntity || "");
  const [tempEntityDepartment, setTempEntityDepartment] = useState(activeCase.entityDepartment || "");
  const [tempLiaisonOfficer, setTempLiaisonOfficer] = useState(activeCase.liaisonOfficer || "");
  const [tempEscalationOfficer, setTempEscalationOfficer] = useState(activeCase.escalationOfficer || "");
  
  // Attached Proof File state
  const [attachedFile, setAttachedFile] = useState<string>("");
  
  // Expanded states for email logs
  const [expandedEmailEvents, setExpandedEmailEvents] = useState<Record<string, boolean>>({});

  const toggleEmailExpand = (eventId: string) => {
    setExpandedEmailEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  useEffect(() => {
    if (autoOpenStatusModal) {
      setShowStatusModal(true);
      if (defaultStatusForModal) {
        setNewStatus(defaultStatusForModal);
      }
    }
  }, [autoOpenStatusModal, defaultStatusForModal]);

  useEffect(() => {
    if (showStatusModal) {
      setNewStatus(activeCase.status);
      setTempExternalEntity(activeCase.externalEntity || "");
      setTempEntityDepartment(activeCase.entityDepartment || "");
      setTempLiaisonOfficer(activeCase.liaisonOfficer || "");
      setTempEscalationOfficer(activeCase.escalationOfficer || (ENTITY_ESCALATION_OFFICERS[activeCase.externalEntity]?.[0] || ""));
      setAttachedFile("");
    }
  }, [showStatusModal, activeCase]);

  // Create Task Drawer State
  const [showCreateTaskDrawer, setShowCreateTaskDrawer] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    assignee: "",
    deadline: ""
  });

  // Log Comm Drawer State
  const [showLogCommDrawer, setShowLogCommDrawer] = useState(false);
  const [initialLogType, setInitialLogType] = useState<CommType>("Phone Call");


  // Document Tab States
  const [localDocs, setLocalDocs] = useState<CaseDocument[]>(activeCase.documents || []);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<CaseDocument>>({});
  const [summaryDoc, setSummaryDoc] = useState<CaseDocument | null>(null);

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.type) return;
    
    const docToAdd: CaseDocument = {
      id: `DOC-${Math.floor(Math.random() * 1000)}`,
      title: newDoc.title,
      type: newDoc.type,
      dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
    
    const updatedDocs = [...localDocs, docToAdd];
    setLocalDocs(updatedDocs);
    onUpdateCase({ ...activeCase, documents: updatedDocs });
    setNewDoc({});
    setShowAddDoc(false);
  };

  const handleDeleteDoc = (id: string) => {
    const updatedDocs = localDocs.filter(d => d.id !== id);
    setLocalDocs(updatedDocs);
    onUpdateCase({ ...activeCase, documents: updatedDocs });
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isAssigned = newStatus === "Assigned";
    const isResolvedOrClosed = newStatus === "Resolved" || newStatus === "Closed";

    // 1. Build the timeline event
    const newEvent: TimelineEvent = {
      id: `TL-${Math.floor(Math.random() * 1000)}`,
      action: `Status changed to ${newStatus}`,
      actor: "Current User",
      date: new Date().toLocaleString(),
      comment: statusComment || "No comment provided."
    };

    // 2. Prepare the updated case object
    const updatedCase: Case = {
      ...activeCase,
      status: newStatus,
      timeline: [...activeCase.timeline, newEvent]
    };

    // 3. Conditionally attach external routing details
    if (isAssigned || newStatus === "Escalated") {
      updatedCase.externalEntity = tempExternalEntity;
      updatedCase.entityDepartment = tempEntityDepartment;
      updatedCase.liaisonOfficer = tempLiaisonOfficer;
      if (newStatus === "Escalated") {
        updatedCase.escalationOfficer = tempEscalationOfficer || (ENTITY_ESCALATION_OFFICERS[tempExternalEntity]?.[0] || "");
      }
    }

    // 4. Conditionally attach proof of resolution document
    if (isResolvedOrClosed) {
      updatedCase.outcome = statusComment || "Resolution applied successfully.";
      updatedCase.resolutionClassification = "Successful Resolution";
      
      if (attachedFile) {
        const docObj = {
          id: `DOC-${Math.floor(Math.random() * 1000)}`,
          title: attachedFile,
          type: "Proof of Resolution",
          dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        };
        updatedCase.documents = [...(updatedCase.documents || []), docObj];
      }
    }

    onUpdateCase(updatedCase);
    setShowStatusModal(false);
    setStatusComment("");
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: CaseTask = {
      id: `TSK-${Math.floor(Math.random() * 900) + 100}`,
      title: newTaskForm.title,
      assignee: newTaskForm.assignee,
      deadline: newTaskForm.deadline,
      status: "Pending"
    };
    
    const newEvent: TimelineEvent = {
      id: `TL-${Math.floor(Math.random() * 1000)}`,
      action: `Task created: ${newTaskForm.title}`,
      actor: "Current User",
      date: new Date().toLocaleString(),
      comment: `Assigned to ${newTaskForm.assignee}`
    };

    onUpdateCase({
      ...activeCase,
      tasks: [...activeCase.tasks, newTask],
      timeline: [...activeCase.timeline, newEvent]
    });
    
    setShowCreateTaskDrawer(false);
    setNewTaskForm({ title: "", assignee: "", deadline: "" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col p-8 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Top Header */}
      <header className="border-b border-border-warm pb-5 mb-6 flex items-start justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border-warm hover:bg-card text-foreground font-semibold text-xs uppercase tracking-wider transition-colors">
            ← Back to Board
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground uppercase">
                {activeCase.id}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                activeCase.status === "Resolved" || activeCase.status === "Closed" ? "bg-green-50 text-green-700" :
                "bg-amber-50 text-amber-700"
              }`}>
                {activeCase.status}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                activeCase.priority === "Critical" ? "bg-red-600 text-white border border-red-700 animate-pulse" :
                activeCase.priority === "High" ? "bg-red-50 text-red-700 border border-red-200" :
                "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {activeCase.priority} Priority {activeCase.priority !== "Standard" && activeCase.slaHours ? `(${activeCase.slaHours}h SLA)` : ""}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-foreground/60 font-bold uppercase tracking-widest mt-1">
              <span className="flex items-center gap-1">
                Citizen: <Link href="/citizens" className="text-gold hover:underline">{activeCase.citizenName} ({activeCase.citizenId})</Link>
              </span>
              <span className="text-border-warm">|</span>
              <span className="flex items-center gap-1">
                Source: <span className="text-primary-text-gold bg-gold/10 px-1.5 py-0.5 rounded">{activeCase.feedSource}</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          {canChangeStatus ? (
            <button onClick={() => setShowStatusModal(true)} className="px-4 py-2 rounded-xl border border-border-warm bg-card hover:border-gold font-bold text-[10px] uppercase tracking-wider transition-colors">
              Update Status
            </button>
          ) : (
            <button disabled className="px-4 py-2 rounded-xl border border-border-warm bg-foreground/5 text-foreground/30 font-bold text-[10px] uppercase tracking-wider cursor-not-allowed">
              Status Locked
            </button>
          )}
          <button className="bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm transition-colors">
            Edit Case Info
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-border-warm mb-6 gap-8 shrink-0">
          {[
            { id: "overview", label: "Overview & Stakeholders" },
            linkedDirective ? { id: "directive", label: "Directive Info" } : null,
            linkedArchive ? { id: "archive", label: "Broadcast Archive" } : null,
            { id: "tasks", label: `Tasks (${activeCase.tasks.length})` },
            { id: "timeline", label: "Activity Timeline" },
            { id: "documents", label: `Documents (${activeCase.documents.length})` },
            { id: "closure", label: "Outcome & Closure" },
          ].filter(Boolean).filter(tab => allowedTabs.includes(tab!.id)).map(tab => (
            <button 
              key={tab!.id}
              onClick={() => setActiveTab(tab!.id as any)} 
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === tab!.id ? "border-gold text-primary-text-gold" : "border-transparent text-foreground/50 hover:text-foreground"}`}
            >
              {tab!.label}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto pb-8">
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-8">
              <section className="flex flex-col gap-6">
                <div className="bg-card border border-border-warm rounded-2xl p-6 shadow-xs">
                  <h3 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-4 border-b border-border-warm pb-2">Case Summary & Facts</h3>
                  <div className="mb-4">
                    <span className="block text-[9px] text-foreground/40 uppercase tracking-widest font-bold mb-1">Main Request / Summary</span>
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed">{activeCase.summary}</p>
                  </div>
                  <div>
                    <span className="block text-[9px] text-foreground/40 uppercase tracking-widest font-bold mb-1">Confirmed Facts</span>
                    <p className="text-sm text-foreground/80 leading-relaxed bg-background p-3 rounded-xl border border-border-warm">{activeCase.facts}</p>
                  </div>
                </div>

                <div className="bg-card border border-border-warm rounded-2xl p-6 shadow-xs">
                  <h3 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-4 border-b border-border-warm pb-2">Classifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[9px] text-foreground/40 uppercase tracking-widest font-bold mb-1">Primary</span>
                      <span className="text-sm font-semibold">{activeCase.primaryClassification}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-foreground/40 uppercase tracking-widest font-bold mb-1">Secondary</span>
                      <span className="text-sm font-semibold">{activeCase.secondaryClassification}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-card border border-border-warm rounded-2xl p-6 shadow-xs h-fit">
                <h3 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-4 border-b border-border-warm pb-2">Stakeholders & Ownership</h3>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-border-warm/50 pb-4">
                    <div>
                      <span className="block text-[9px] text-foreground/40 uppercase tracking-widest font-bold mb-0.5">Internal Case Owner</span>
                      <span className="text-sm font-bold text-primary-text-gold">{activeCase.caseOwner}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-xs">CO</div>
                  </div>
                  <div className="flex items-center justify-between border-b border-border-warm/50 pb-4">
                    <div>
                      <span className="block text-[9px] text-foreground/40 uppercase tracking-widest font-bold mb-0.5">Relevant External Entity</span>
                      <span className="text-sm font-bold text-foreground">{activeCase.externalEntity}</span>
                    </div>
                    <svg className="w-5 h-5 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div className="flex items-center justify-between border-b border-border-warm/50 pb-4">
                    <div>
                      <span className="block text-[9px] text-foreground/40 uppercase tracking-widest font-bold mb-0.5">Liaison Officer</span>
                      <span className="text-sm font-bold text-foreground">{activeCase.liaisonOfficer}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-background border border-border-warm text-foreground/60 flex items-center justify-center font-bold text-xs">LO</div>
                  </div>
                  {(activeCase.escalationOfficer || activeCase.status === "Escalated") && (
                    <div className="flex items-center justify-between border-b border-border-warm/50 pb-4 bg-red-500/5 p-3 rounded-xl border border-red-500/20">
                      <div>
                        <span className="block text-[9px] text-red-600 dark:text-red-400 uppercase tracking-widest font-bold mb-0.5">Escalation Officer (Executive)</span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                          {activeCase.escalationOfficer || (ENTITY_ESCALATION_OFFICERS[activeCase.externalEntity]?.[0] || "Executive Director")}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs animate-pulse">EO</div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="block text-[9px] text-foreground/40 uppercase tracking-widest font-bold mb-0.5">Case Inbound Email Channel</span>
                      <span className="text-sm font-bold text-indigo-500 font-mono">
                        {`case-${activeCase.id.toLowerCase().replace("case-", "")}@sba-command.ae`}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`case-${activeCase.id.toLowerCase().replace("case-", "")}@sba-command.ae`);
                        alert("Inbound email address copied to clipboard!");
                      }}
                      className="p-1.5 rounded-lg hover:bg-foreground/5 text-foreground/45 hover:text-gold transition-colors"
                      title="Copy Inbound Address"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB: DIRECTIVE */}
          {activeTab === "directive" && linkedDirective && (
            <div className="space-y-6">
              <div className="bg-card border border-border-warm rounded-xl overflow-hidden p-6 relative">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <svg className="w-32 h-32 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 12.08c-.783-.57-.384-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest border-b border-border-warm pb-3">Official Directive</h3>
                
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/50 mb-1">Directive Ref</p>
                    <p className="font-bold text-lg text-primary-text-gold">{linkedDirective.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/50 mb-1">Authorizing Leader</p>
                    <p className="font-bold text-lg text-foreground">{linkedDirective.authorizingLeader}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8 p-4 bg-background border border-border-warm rounded-xl">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/50 mb-1">Target Entity</p>
                    <p className="font-bold text-foreground">{linkedDirective.targetEntity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/50 mb-1">Department</p>
                    <p className="font-bold text-foreground">{linkedDirective.targetDepartment}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/50 mb-1">Liaison Officer</p>
                    <p className="font-bold text-foreground">{linkedDirective.targetOfficer}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/50 mb-2">Directive Description</p>
                  <p className="text-sm text-foreground/90 bg-red-50/50 p-4 border-l-4 border-red-600 rounded-r-xl italic leading-relaxed">
                    "{linkedDirective.description}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ARCHIVE */}
          {activeTab === "archive" && linkedArchive && (
            <div className="flex gap-8">
              <div className="w-1/3 flex flex-col gap-4">
                <div className="bg-black rounded-xl overflow-hidden border border-border-warm relative shadow-sm">
                  {linkedArchive.source === "YouTubeLive" || linkedArchive.source === "LiveTV" ? (
                    <iframe
                      className="w-full h-[180px]"
                      src={`https://www.youtube.com/embed/${linkedArchive.mediaUrl}`}
                      title="Archive replay player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="h-[180px] flex flex-col justify-center items-center text-center p-6 text-foreground/45 bg-card border-b border-border-warm">
                      <svg className="w-10 h-10 mb-2 text-gold animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <span className="text-[12px] font-bold uppercase tracking-wide">Studio Audio Tape Recording</span>
                    </div>
                  )}
                </div>
                <div className="bg-card border border-border-warm rounded-xl p-5 shadow-xs">
                  <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-3">Ingest Metadata</h4>
                  <div className="flex flex-col gap-2 text-sm text-foreground/80">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Session ID</span>
                      <span>{linkedArchive.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Date</span>
                      <span>{linkedArchive.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Duration</span>
                      <span>{linkedArchive.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-2/3 flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground uppercase mb-1">{linkedArchive.title}</h3>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    linkedArchive.source === "YouTubeLive" ? "bg-red-50 text-red-700 border border-red-200" :
                    linkedArchive.source === "LiveTV" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                    linkedArchive.source === "RadioAoIP" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-green-50 text-green-700 border border-green-200"
                  }`}>
                    {linkedArchive.source.replace("Live", " Live").replace("TV", " TV").replace("AoIP", " AoIP").replace("HotLine", " Hotline")} Feed
                  </span>
                </div>

                <div className="bg-gold-muted/20 border border-gold/15 rounded-xl p-5">
                  <h4 className="text-xs font-bold text-primary-text-gold uppercase tracking-wider mb-3">AI Executive Summary</h4>
                  <ul className="list-disc pl-5 text-sm text-foreground/80 leading-relaxed flex flex-col gap-2.5">
                    {linkedArchive.summary.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TASKS */}
          {activeTab === "tasks" && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Task Management</h3>
                <button 
                  onClick={() => setShowCreateTaskDrawer(true)}
                  className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  + Create Task
                </button>
              </div>
              
              <div className="bg-card border border-border-warm rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-background/50 border-b border-border-warm">
                    <tr>
                      <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-foreground/50">Task Title</th>
                      <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-foreground/50">Assignee</th>
                      <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-foreground/50">Deadline / SLA</th>
                      <th className="py-3 px-5 text-[10px] font-bold uppercase tracking-widest text-foreground/50">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-warm">
                    {activeCase.tasks.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-xs text-foreground/40 uppercase tracking-widest font-bold">No tasks assigned</td></tr>
                    ) : (
                      activeCase.tasks.map(t => (
                        <tr key={t.id} className="hover:bg-background/50 transition-colors">
                          <td className="py-4 px-5 font-medium text-foreground">{t.title}</td>
                          <td className="py-4 px-5 font-bold text-foreground/80">{t.assignee}</td>
                          <td className="py-4 px-5 text-xs font-mono">{t.deadline}</td>
                          <td className="py-4 px-5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              t.status === "Completed" ? "bg-green-50 text-green-700" :
                              t.status === "In Progress" ? "bg-blue-50 text-blue-700" :
                              "bg-amber-50 text-amber-700"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="max-w-3xl">
              <div className="flex justify-between items-end mb-6 border-b border-border-warm pb-4">
                <div>
                  <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Activity & Omnichannel History</h3>
                  <p className="text-[10px] text-foreground/50 mt-1">Log external communications and track all case events.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setInitialLogType("Phone Call"); setShowLogCommDrawer(true); }}
                    className="px-3 py-1.5 bg-card border border-border-warm hover:border-gold rounded-lg text-[9px] font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5 transition-colors"
                  >
                    <svg className="w-3 h-3 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    Log Call
                  </button>
                  <button 
                    onClick={() => { setInitialLogType("Email"); setShowLogCommDrawer(true); }}
                    className="px-3 py-1.5 bg-card border border-border-warm hover:border-gold rounded-lg text-[9px] font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5 transition-colors"
                  >
                    <svg className="w-3 h-3 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Log Email
                  </button>
                  <button className="px-3 py-1.5 bg-gold hover:bg-gold-hover rounded-lg text-[9px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5 shadow-sm transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    Gen PDF Referral
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-6 relative pl-6 border-l-2 border-border-warm/50 ml-3">
                {activeCase.timeline.map((event, idx) => {
                  const isExpanded = expandedEmailEvents[event.id] || false;
                  return (
                    <div key={event.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-card border-[4px] ${event.isEmail ? "border-indigo-500" : "border-gold"}`}></div>
                      
                      <div className="bg-card border border-border-warm p-4 rounded-xl shadow-sm hover:border-gold/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                              event.isEmail 
                                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" 
                                : "bg-background border-border-warm text-foreground"
                            }`}>
                              {event.action}
                            </span>
                            {event.isEmail && (
                              <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                                ✉️ Email Thread
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-foreground/50 font-bold tracking-widest uppercase">{event.date}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-foreground/65 uppercase tracking-widest">
                            By: {event.actor}
                          </span>
                          {(() => {
                            const badge = getActorRoleBadge(event.actor, activeCase);
                            return (
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${badge.style}`}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Standard Timeline Event Comment */}
                        {!event.isEmail && event.comment && (
                          <p className="text-sm text-foreground/80 leading-relaxed bg-background p-3 rounded-lg border border-border-warm italic">
                            "{event.comment}"
                          </p>
                        )}

                        {/* Special Email Pipeline Event Rendering */}
                        {event.isEmail && event.emailDetails && (
                          <div className="flex flex-col gap-3 mt-2 bg-background/50 border border-border-warm/80 rounded-xl p-3.5">
                            
                            {/* Summary row */}
                            <div className="flex justify-between items-center">
                              <div className="min-w-0">
                                <span className="block text-[10px] font-bold text-foreground/45 uppercase tracking-widest mb-0.5">Subject</span>
                                <span className="text-xs font-bold text-foreground/85 block truncate max-w-[450px]">
                                  {event.emailDetails.subject}
                                </span>
                              </div>
                              <button 
                                onClick={() => toggleEmailExpand(event.id)}
                                className="px-3 py-1.5 rounded-lg border border-border-warm hover:border-gold text-[9px] font-bold uppercase tracking-wider bg-card text-foreground transition-colors shrink-0 flex items-center gap-1"
                              >
                                {isExpanded ? "Hide Message" : "Show Full Thread"}
                                <svg className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            {/* Collapsed snippet */}
                            {!isExpanded && (
                              <div className="text-xs text-foreground/50 italic line-clamp-1 border-t border-border-warm/40 pt-2">
                                {event.emailDetails.body}
                              </div>
                            )}

                            {/* Expanded Full Mail & Thread View */}
                            {isExpanded && (
                              <div className="flex flex-col gap-4 border-t border-border-warm/50 pt-3 animate-in fade-in duration-200">
                                
                                {/* Outbound Message */}
                                <div className="flex flex-col gap-2 bg-card border border-border-warm/60 rounded-xl p-3">
                                  <div className="flex justify-between items-center text-[10px] text-foreground/50 border-b border-border-warm/40 pb-1.5">
                                    <span>From: <strong className="text-foreground/75 font-mono">{event.emailDetails.from}</strong></span>
                                    <span>To: <strong className="text-foreground/75 font-mono">{event.emailDetails.to}</strong></span>
                                  </div>
                                  <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
                                    {event.emailDetails.body}
                                  </p>
                                </div>

                                {/* Inbound Reply Message (Nested) */}
                                {event.emailDetails.reply && (
                                  <div className="flex flex-col gap-2 bg-indigo-500/[0.02] border border-indigo-500/15 rounded-xl p-3 ml-6 relative">
                                    {/* Indented Thread Indicator Line */}
                                    <div className="absolute left-[-16px] top-0 bottom-0 w-[2px] bg-indigo-500/20"></div>
                                    <div className="flex justify-between items-center text-[10px] text-foreground/50 border-b border-border-warm/40 pb-1.5">
                                      <span>From: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{event.emailDetails.reply.from}</strong></span>
                                      <span>Date: <strong className="text-foreground/75">{event.emailDetails.reply.date}</strong></span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-foreground/85 whitespace-pre-wrap">
                                      {event.emailDetails.reply.body}
                                    </p>
                                  </div>
                                )}

                                {/* Attachments Section inside the same event */}
                                {event.emailDetails.attachments && event.emailDetails.attachments.length > 0 && (
                                  <div className="border-t border-border-warm/50 pt-2.5">
                                    <span className="block text-[9px] text-foreground/45 uppercase tracking-widest font-black mb-1.5">Attached Files (Inbound Mail)</span>
                                    <div className="flex flex-wrap gap-2">
                                      {event.emailDetails.attachments.map((file: { name: string; size: string }, fidx: number) => (
                                        <div key={fidx} className="flex items-center gap-2 bg-card border border-border-warm hover:border-gold rounded-lg px-2.5 py-1.5 shadow-2xs transition-colors group cursor-pointer">
                                          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 00-2-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                          </svg>
                                          <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-foreground/80 group-hover:text-gold transition-colors">{file.name}</span>
                                            <span className="text-[8px] text-foreground/40 font-mono mt-0.5">{file.size}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              </div>
                            )}

                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Document Repository</h3>
                <button onClick={() => setShowAddDoc(true)} className="px-3 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-white text-[10px] font-bold uppercase tracking-wider transition-colors">+ Upload Doc</button>
              </div>
              
              {showAddDoc && (
                <form onSubmit={handleAddDoc} className="p-4 bg-background border border-border-warm rounded-xl flex gap-3 items-end mb-4 animate-in fade-in slide-in-from-top-2 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5">Document Title</label>
                    <input required type="text" value={newDoc.title || ""} onChange={e => setNewDoc({...newDoc, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border-warm bg-card text-xs focus:outline-none focus:border-gold" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5">Upload File</label>
                    <input required type="file" className="w-full px-2 py-1.5 rounded-lg border border-border-warm bg-card text-xs focus:outline-none focus:border-gold file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:uppercase file:bg-gold-muted file:text-gold hover:file:bg-gold hover:file:text-white transition-colors cursor-pointer" />
                  </div>
                  <div className="w-48">
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5">Type</label>
                    <select required value={newDoc.type || ""} onChange={e => setNewDoc({...newDoc, type: e.target.value as any})} className="w-full px-3 py-2 rounded-lg border border-border-warm bg-card text-xs focus:outline-none focus:border-gold">
                      <option value="">Select Type...</option>
                      <option value="Identity">Identity</option>
                      <option value="Housing">Housing</option>
                      <option value="Income">Income</option>
                      <option value="Medical Report">Medical Report</option>
                      <option value="Bill">Bill</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-active-green hover:bg-green-600 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0">Save</button>
                  <button type="button" onClick={() => setShowAddDoc(false)} className="px-4 py-2 rounded-lg bg-card border border-border-warm hover:border-foreground/30 text-foreground/60 text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0">Cancel</button>
                </form>
              )}

              <div className="flex flex-col gap-3">
                {localDocs.length === 0 ? (
                  <div className="text-center py-10 text-foreground/40 border border-dashed border-border-warm rounded-xl text-xs uppercase tracking-widest font-bold">No Evidence or Documents attached</div>
                ) : (
                  localDocs.map(doc => (
                    <div key={doc.id} className="p-4 border border-border-warm bg-card rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background border border-border-warm flex items-center justify-center text-foreground/50 shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm text-foreground">{doc.title}</h4>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-foreground/10 text-foreground/60">
                              {doc.type || "Document"}
                            </span>
                          </div>
                          <span className="text-[10px] text-foreground/50 uppercase tracking-widest block">Added: {doc.dateAdded}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSummaryDoc(doc)} className="px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5" title="Extract & Summarize with AI">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          AI Summary
                        </button>
                        <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 rounded hover:bg-red-50 hover:text-red-600 text-foreground/40 transition-colors" title="Delete Document">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: CLOSURE */}
          {activeTab === "closure" && (
            <div className="max-w-2xl bg-card border border-border-warm rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4 border-b border-border-warm pb-2">Resolution & Closure Data</h3>
              
              {!activeCase.outcome ? (
                 <div className="text-center py-10 flex flex-col items-center gap-3">
                   <svg className="w-10 h-10 text-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
                   <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">Case is currently open. Cannot be closed yet.</span>
                 </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div>
                    <span className="block text-[9px] text-foreground/40 uppercase tracking-widest font-bold mb-1">Final Outcome</span>
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed bg-green-50 border border-green-200 p-4 rounded-xl text-green-900">{activeCase.outcome}</p>
                  </div>
                  <div>
                    <span className="block text-[9px] text-foreground/40 uppercase tracking-widest font-bold mb-1">Resolution Classification</span>
                    <span className="text-xs font-bold bg-background border border-border-warm px-3 py-1.5 rounded-lg">{activeCase.resolutionClassification}</span>
                  </div>
                  <div className="mt-4">
                     <button className="px-4 py-2 rounded-lg bg-card border border-border-warm hover:border-gold text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2">
                       <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                       View Proof of Closure Documents
                     </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Right-to-Left Drawer for Update Status */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[450px] bg-card h-full shadow-2xl flex flex-col border-l border-border-warm animate-in slide-in-from-right duration-300">
            <header className="px-6 py-5 border-b border-border-warm flex justify-between items-center bg-background shrink-0">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Update Case Status</h2>
              <button onClick={() => setShowStatusModal(false)} className="text-foreground/40 hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            
            <form onSubmit={handleStatusSubmit} className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">New Status</label>
                <select required value={newStatus} onChange={e => setNewStatus(e.target.value as CaseStatus)} className="w-full px-3 py-2.5 rounded-xl border border-border-warm bg-background text-sm font-semibold focus:outline-none focus:border-gold">
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Awaiting Citizen">Awaiting Citizen</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Reopened">Reopened</option>
                </select>
              </div>

              {/* Dynamic External Entity Routing dropdowns if status is set to Assigned */}
              {newStatus === "Assigned" && (
                <div className="bg-background/50 p-4 rounded-xl border border-border-warm flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest border-b border-border-warm pb-1 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Required External Entity Routing
                  </h4>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-foreground/60 uppercase tracking-widest">External Entity *</label>
                    <select 
                      required 
                      value={tempExternalEntity} 
                      onChange={e => {
                        const entity = e.target.value;
                        const defaultDept = ENTITY_DEPARTMENTS[entity]?.[0] || "";
                        const defaultLiaison = ENTITY_LIAISONS[entity]?.[0] || "";
                        setTempExternalEntity(entity);
                        setTempEntityDepartment(defaultDept);
                        setTempLiaisonOfficer(defaultLiaison);
                      }} 
                      className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:border-gold ${!tempExternalEntity ? "border-red-300" : "border-border-warm"}`}
                    >
                      <option value="">Select Entity...</option>
                      <option value="Sharjah Health Authority">Sharjah Health Authority</option>
                      <option value="Sharjah Housing Directorate">Sharjah Housing Directorate</option>
                      <option value="Ministry of Community Development">Ministry of Community Development</option>
                      <option value="Sharjah Police General Directorate">Sharjah Police General Directorate</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-foreground/60 uppercase tracking-widest">Entity Department *</label>
                    <select 
                      required 
                      value={tempEntityDepartment} 
                      onChange={e => setTempEntityDepartment(e.target.value)} 
                      className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:border-gold ${!tempEntityDepartment ? "border-red-300" : "border-border-warm"}`}
                      disabled={!tempExternalEntity}
                    >
                      {!tempExternalEntity ? (
                        <option value="">Select Entity First...</option>
                      ) : (
                        <>
                          <option value="">Select Department...</option>
                          {ENTITY_DEPARTMENTS[tempExternalEntity]?.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-foreground/60 uppercase tracking-widest">Liaison Officer *</label>
                    <select 
                      required 
                      value={tempLiaisonOfficer} 
                      onChange={e => setTempLiaisonOfficer(e.target.value)} 
                      className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:border-gold ${!tempLiaisonOfficer ? "border-red-300" : "border-border-warm"}`}
                      disabled={!tempExternalEntity}
                    >
                      {!tempExternalEntity ? (
                        <option value="">Select Entity First...</option>
                      ) : (
                        <>
                          <option value="">Select Liaison Officer...</option>
                          {ENTITY_LIAISONS[tempExternalEntity]?.map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Dynamic External Entity & Escalation Officer Routing dropdowns if status is set to Escalated */}
              {newStatus === "Escalated" && (
                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 flex flex-col gap-4">
                  <h4 className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest border-b border-red-500/20 pb-1 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Required Escalation Routing
                  </h4>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-foreground/60 uppercase tracking-widest">External Entity *</label>
                    <select 
                      required 
                      value={tempExternalEntity} 
                      onChange={e => {
                        const entity = e.target.value;
                        const defaultDept = ENTITY_DEPARTMENTS[entity]?.[0] || "";
                        const defaultLiaison = ENTITY_LIAISONS[entity]?.[0] || "";
                        const defaultEscalation = ENTITY_ESCALATION_OFFICERS[entity]?.[0] || "";
                        setTempExternalEntity(entity);
                        setTempEntityDepartment(defaultDept);
                        setTempLiaisonOfficer(defaultLiaison);
                        setTempEscalationOfficer(defaultEscalation);
                      }} 
                      className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:border-gold ${!tempExternalEntity ? "border-red-300" : "border-border-warm"}`}
                    >
                      <option value="">Select Entity...</option>
                      <option value="Sharjah Health Authority">Sharjah Health Authority</option>
                      <option value="Sharjah Housing Directorate">Sharjah Housing Directorate</option>
                      <option value="Ministry of Community Development">Ministry of Community Development</option>
                      <option value="Sharjah Police General Directorate">Sharjah Police General Directorate</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Escalation Officer *</label>
                    <select 
                      required 
                      value={tempEscalationOfficer || (ENTITY_ESCALATION_OFFICERS[tempExternalEntity]?.[0] || "")} 
                      onChange={e => setTempEscalationOfficer(e.target.value)} 
                      className="w-full px-3 py-2 rounded-xl border border-red-300 bg-background text-sm font-bold focus:outline-none focus:border-red-500 text-foreground"
                      disabled={!tempExternalEntity}
                    >
                      {!tempExternalEntity ? (
                        <option value="">Select Entity First...</option>
                      ) : (
                        <>
                          <option value="">Select Escalation Officer...</option>
                          {ENTITY_ESCALATION_OFFICERS[tempExternalEntity]?.map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Status Change Comment (Required for Timeline)</label>
                <textarea 
                  required 
                  value={statusComment} 
                  onChange={e => setStatusComment(e.target.value)} 
                  className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold h-24 resize-none"
                  placeholder="Explain why the status is changing..."
                ></textarea>
              </div>

              <div>
                <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${(newStatus === "Resolved" || newStatus === "Closed") ? "text-red-600" : "text-foreground/60"}`}>
                  Attach Proof of Resolution {(newStatus === "Resolved" || newStatus === "Closed") && "*"}
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-background hover:bg-foreground/5 hover:border-gold transition-colors ${
                    (newStatus === "Resolved" || newStatus === "Closed") && !attachedFile ? "border-red-300 hover:border-red-400" : "border-border-warm"
                  }`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {attachedFile ? (
                        <p className="text-xs font-bold text-active-green">✓ {attachedFile}</p>
                      ) : (
                        <>
                          <p className="mb-2 text-xs text-foreground/60"><span className="font-bold">Click to upload</span> or drag and drop</p>
                          <p className="text-[10px] text-foreground/40">SVG, PNG, JPG or PDF (MAX. 10MB)</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      required={(newStatus === "Resolved" || newStatus === "Closed")}
                      onChange={e => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          setAttachedFile(files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border-warm flex justify-end gap-3">
                <button type="button" onClick={() => setShowStatusModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-foreground/60 uppercase tracking-widest hover:text-foreground transition-colors">Cancel</button>
                <button type="submit" className="bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">Update Status & Timeline</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Right-to-Left Drawer for Create Task */}
      {showCreateTaskDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[450px] bg-card h-full shadow-2xl flex flex-col border-l border-border-warm animate-in slide-in-from-right duration-300">
            <header className="px-6 py-5 border-b border-border-warm flex justify-between items-center bg-background shrink-0">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Create New Task</h2>
              <button onClick={() => setShowCreateTaskDrawer(false)} className="text-foreground/40 hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            
            <form onSubmit={handleCreateTaskSubmit} className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Task Title</label>
                <input required value={newTaskForm.title} onChange={e => setNewTaskForm({...newTaskForm, title: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" placeholder="e.g. Call relevant department for updates" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Assignee</label>
                <input required value={newTaskForm.assignee} onChange={e => setNewTaskForm({...newTaskForm, assignee: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" placeholder="e.g. Khalid M." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-2">Deadline / SLA</label>
                <input required type="date" value={newTaskForm.deadline} onChange={e => setNewTaskForm({...newTaskForm, deadline: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-border-warm bg-background text-sm focus:outline-none focus:border-gold" />
              </div>
              
              <div className="mt-4 pt-4 border-t border-border-warm flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateTaskDrawer(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-foreground/60 uppercase tracking-widest hover:text-foreground transition-colors">Cancel</button>
                <button type="submit" className="bg-gold hover:bg-gold-hover text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Summary Right Drawer */}
      {summaryDoc && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSummaryDoc(null)} />
          <div className="fixed inset-y-0 right-0 z-[110] w-[400px] bg-background border-l border-border-warm shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <header className="p-5 border-b border-border-warm bg-card flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">AI Extraction</h3>
              </div>
              <button onClick={() => setSummaryDoc(null)} className="text-foreground/40 hover:text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div>
                <span className="block text-[9px] text-foreground/50 uppercase tracking-widest font-bold mb-1">Source Document</span>
                <div className="font-semibold text-sm text-foreground">{summaryDoc.title}</div>
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest mt-1">Type: {summaryDoc.type || "Document"}</div>
              </div>
              
              <div className="bg-gold/5 border border-gold/20 rounded-xl p-5 relative">
                <div className="absolute top-0 right-0 p-3">
                   <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                </div>
                <h4 className="text-[10px] font-bold text-gold uppercase tracking-widest mb-3 border-b border-gold/20 pb-2">Extracted Entities</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex justify-between border-b border-border-warm/50 pb-1">
                    <span className="text-foreground/60 font-medium">Confidence Score</span>
                    <span className="text-active-green font-bold">98.5%</span>
                  </li>
                  <li className="flex justify-between border-b border-border-warm/50 pb-1">
                    <span className="text-foreground/60 font-medium">Citizen Match</span>
                    <span className="text-foreground font-bold">Verified</span>
                  </li>
                  <li className="flex justify-between border-b border-border-warm/50 pb-1">
                    <span className="text-foreground/60 font-medium">Extracted Date</span>
                    <span className="text-foreground font-bold">{summaryDoc.dateAdded}</span>
                  </li>
                  <li className="flex justify-between pb-1">
                    <span className="text-foreground/60 font-medium">Key Finding</span>
                    <span className="text-foreground font-bold text-right max-w-[200px]">Meets criteria for Case resolution parameters</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-2">AI Summary</h4>
                <p className="text-sm text-foreground/80 leading-relaxed bg-card p-4 rounded-xl border border-border-warm shadow-inner">
                  This document indicates that the citizen meets all requisite parameters for the requested service. The AI model successfully extracted the identity metadata and confirmed it matches the case profile. No discrepancies found. Recommend proceeding with the resolution.
                </p>
              </div>
            </div>
            
            <footer className="p-5 border-t border-border-warm bg-card">
              <button onClick={() => setSummaryDoc(null)} className="w-full py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-white text-xs font-bold uppercase tracking-widest shadow-sm transition-colors">
                Append to Case Notes
              </button>
            </footer>
          </div>
        </>
      )}

      {/* Log Comm Drawer */}
      {showLogCommDrawer && (
        <LogCommunicationDrawer
          caseRecord={activeCase}
          initialType={initialLogType}
          onClose={() => setShowLogCommDrawer(false)}
          onSave={(log) => {
            const timelineEvent = {
              id: `TL-${Date.now()}`,
              action: `${COMM_ICONS[log.type]} ${log.type} ${log.direction === "Outbound" ? "to" : "from"} ${log.contactPerson}`,
              actor: "Current Operator",
              date: log.date,
              comment: log.summary,
            };
            onUpdateCase({ ...activeCase, timeline: [...activeCase.timeline, timelineEvent] });
            setShowLogCommDrawer(false);
          }}
        />
      )}
    </div>
  );
}
