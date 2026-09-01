"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export type BroadcastSource = "HotLine" | "YouTubeLive" | "LiveTV" | "RadioAoIP";

export interface ScreenerTicket {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  category: string;
  region: string;
  notes: string;
}

export interface TranscriptLine {
  speaker: string;
  text: string;
  textAr?: string;
  timestamp: string;
  detectionType?: "directive" | "suggested_case";
  citizenName?: string;
  category?: string;
  entity?: string;
}

export interface AIPromptCard {
  id: string;
  title: string;
  content: string;
}

export interface LiveYTComment {
  username: string;
  comment: string;
}

export interface ExtractedDirective {
  id: string;
  type: "directive" | "suggested_case";
  text: string;
  category: string;
  entity: string;
  citizenName: string;
  priority: "Critical" | "High" | "Standard";
}

export interface ChecklistItem {
  name: string;
  status: "extracted" | "missing";
}

interface BroadcastContextType {
  activeSource: BroadcastSource;
  switchSource: (source: BroadcastSource) => void;
  scheduleDateTime: string;
  setScheduleDateTime: (dateTime: string) => void;
  feedTitle: string;
  setFeedTitle: (title: string) => void;
  callerQueue: ScreenerTicket[];
  activeCaller: ScreenerTicket | null;
  addCallerToQueue: (ticket: Omit<ScreenerTicket, "id">) => void;
  removeFromQueue: (id: string) => void;
  goOnAir: (ticket: ScreenerTicket) => void;
  goOnAirStream: () => void;
  endCall: () => void;
  disconnectCaller: () => void;
  isLive: boolean;
  transcriptLines: TranscriptLine[];
  aiPrompts: AIPromptCard[];
  ytComments: LiveYTComment[];
  extractedDirectives: ExtractedDirective[];
  sttConfidence: number;
  priorCaseMatch: string | null;
  entityChecklist: ChecklistItem[];
}

const BroadcastContext = createContext<BroadcastContextType | undefined>(undefined);

// Simulated transcripts data matching different sources
const MOCK_HOTLINE_TRANSCRIPT = [
  { 
    speaker: "Host", 
    text: "Welcome back to Direct Line. Let's take our first caller, Abdullah Al-Mansoori from Al Dhaid.",
    textAr: "أهلاً بكم في الخط المباشر. دعونا نستقبل المتصل الأول، عبد الله المنصوري من الذيد."
  },
  { 
    speaker: "Caller", 
    text: "Assalamu Alaikum, Abu Majid. I am calling regarding my housing application.",
    textAr: "السلام عليكم يا أبو ماجد. أنا أتصل بخصوص طلب الإسكان الخاص بي."
  },
  { 
    speaker: "Host", 
    text: "Wa Alaikum Assalaam. Tell me, Abdullah, what is the status of your application?",
    textAr: "وعليكم السلام. أخبرني يا عبد الله، ما هو وضع طلبك؟"
  },
  { 
    speaker: "Caller", 
    text: "I submitted the application to the Sharjah Housing Department in January 2025. It is still under review.",
    textAr: "قدمت الطلب إلى دائرة الإسكان في الشارقة في يناير ٢٠٢٥. ولا يزال قيد المراجعة.",
    detectionType: "suggested_case" as const,
    citizenName: "Abdullah Al-Mansoori",
    category: "Housing Allocation",
    entity: "Sharjah Housing Department"
  },
  { 
    speaker: "Host", 
    text: "Do you have the housing request number, Abdullah?",
    textAr: "هل لديك رقم طلب الإسكان يا عبد الله؟"
  },
  { 
    speaker: "Caller", 
    text: "Yes, it is SHJ-HSG-9841. My family is currently living in a rented apartment, and the rent is increasing.",
    textAr: "نعم، هو SHJ-HSG-9841. عائلتي تعيش حالياً في شقة مستأجرة، والإيجار يرتفع.",
    detectionType: "directive" as const,
    citizenName: "Abdullah Al-Mansoori",
    category: "Housing Allocation",
    entity: "Sharjah Housing Directorate"
  },
  { 
    speaker: "Host", 
    text: "We understand your situation. We will contact the Housing Department immediately to speed up the process.",
    textAr: "نحن نتفهم وضعك. سنتصل بدائرة الإسكان فوراً لتسريع العملية."
  }
];

const MOCK_STREAM_TRANSCRIPT = [
  { 
    speaker: "Presenter", 
    text: "We are live on television and YouTube, monitoring direct communications from the executive council.",
    textAr: "نحن على الهواء مباشرة عبر التلفزيون واليوتيوب، لمتابعة الاتصالات المباشرة من المجلس التنفيذي."
  },
  { 
    speaker: "Presenter", 
    text: "Citizen Abdullah Al-Mansoori from Al Dhaid reports housing grant application SHJ-HSG-9841 pending review since January 2025.",
    textAr: "المواطن عبد الله المنصوري من الذيد يبلغ عن تأخر طلب منح الإسكان SHJ-HSG-9841 قيد المراجعة منذ يناير 2025.",
    detectionType: "suggested_case" as const,
    citizenName: "Abdullah Al-Mansoori",
    category: "Housing Allocation",
    entity: "Sharjah Housing Department"
  },
  { 
    speaker: "Presenter", 
    text: "His Highness the Sheikh is currently listening to local concerns in the central region.",
    textAr: "صاحب السمو الشيخ يستمع حالياً إلى الشواغل المحلية في المنطقة الوسطى."
  },
  { 
    speaker: "Leadership", 
    text: "Regarding citizen Ahmed Al-Suwaidi in Al Dhaid, I direct the Sharjah Health Authority to cover his medical debt immediately.",
    textAr: "بخصوص المواطن أحمد السويدي في الذيد، أوجه هيئة الشارقة الصحية بتغطية ديونه الطبية فوراً.",
    detectionType: "directive" as const,
    citizenName: "Ahmed Al-Suwaidi",
    category: "Health & Medical",
    entity: "Sharjah Health Authority"
  },
  { 
    speaker: "Presenter", 
    text: "May Allah protect His Highness. A clear directive has been issued for Ahmed Al-Suwaidi.",
    textAr: "حفظ الله صاحب السمو. صدر توجيه واضح لأحمد السويدي."
  }
];

const MOCK_YT_COMMENTS = [
  { username: "Salem_AlKetbi", comment: "May Allah protect His Highness, always connecting directly with local people!" },
  { username: "Fatima_SHJ", comment: "We hope the Housing Department reviews the Al Dhaid applications soon." },
  { username: "Ali_Mansoori", comment: "Direct Line is the best channel for community transparency." },
  { username: "Hassan_AlAli", comment: "Sharjah Health Authority is always quick to resolve these directives." }
];

export const BroadcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSource, setActiveSource] = useState<BroadcastSource>("YouTubeLive");
  const [scheduleDateTime, setScheduleDateTime] = useState<string>("2026-09-01T15:30");
  const [feedTitle, setFeedTitle] = useState<string>("Sharjah TV Live Stream Feed");
  const [callerQueue, setCallerQueue] = useState<ScreenerTicket[]>([
    {
      id: "caller-mock-1",
      fullName: "Salem Al-Ketbi",
      email: "salem.alketbi@example.ae",
      mobile: "+971-50-1234567",
      category: "Housing Allocation",
      region: "Eastern Region (Khorfakkan)",
      notes: "Requesting updates regarding housing allotment application submitted in Jan 2025. Family currently living in a high-rent apartment."
    },
    {
      id: "caller-mock-2",
      fullName: "Fatima Al-Ali",
      email: "fatima.alali@example.ae",
      mobile: "+971-56-7654321",
      category: "Health & Medical",
      region: "Sharjah City",
      notes: "Seeking financial assistance for overseas medical treatment approval for her father's chronic respiratory illness."
    }
  ]);
  const [activeCaller, setActiveCaller] = useState<ScreenerTicket | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [aiPrompts, setAiPrompts] = useState<AIPromptCard[]>([]);
  const [ytComments, setYtComments] = useState<LiveYTComment[]>([]);
  const [extractedDirectives, setExtractedDirectives] = useState<ExtractedDirective[]>([]);
  
  // New Enhanced States
  const [sttConfidence, setSttConfidence] = useState<number>(100);
  const [priorCaseMatch, setPriorCaseMatch] = useState<string | null>(null);
  const [entityChecklist, setEntityChecklist] = useState<ChecklistItem[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const commentTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Switch source and reset current active session
  const switchSource = (source: BroadcastSource) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (commentTimerRef.current) {
      clearInterval(commentTimerRef.current);
      commentTimerRef.current = null;
    }
    setActiveSource(source);
    setIsLive(false);
    setActiveCaller(null);
    setTranscriptLines([]);
    setAiPrompts([]);
    setYtComments([]);
    setExtractedDirectives([]);
    setSttConfidence(100);
    setPriorCaseMatch(null);
    setEntityChecklist([]);
  };

  const addCallerToQueue = (ticket: Omit<ScreenerTicket, "id">) => {
    const newTicket: ScreenerTicket = {
      ...ticket,
      id: "caller-" + Date.now()
    };
    setCallerQueue((prev) => [...prev, newTicket]);
  };

  const removeFromQueue = (id: string) => {
    setCallerQueue((prev) => prev.filter((c) => c.id !== id));
  };

  // Simulate Hot Line call transcription
  const goOnAir = (ticket: ScreenerTicket) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (commentTimerRef.current) clearInterval(commentTimerRef.current);
    switchSource("HotLine");
    setActiveCaller(ticket);
    setIsLive(true);
    setSttConfidence(94);
    setPriorCaseMatch("Case #CASE-9410 (Resolved - Housing Delay, 2024)");
    setExtractedDirectives([
      {
        id: "item-hotline-case-1",
        type: "suggested_case",
        text: "Housing grant application SHJ-HSG-9841 pending review since Jan 2025.",
        category: "Housing Allocation",
        entity: "Sharjah Housing Department",
        citizenName: ticket.fullName || "Abdullah Al-Mansoori",
        priority: "Standard"
      }
    ]);
    setEntityChecklist([
      { name: "Caller Identity", status: "extracted" },
      { name: "Region / Area", status: "extracted" },
      { name: "Housing Request ID", status: "missing" },
      { name: "Department Contacted", status: "missing" }
    ]);

    let lineIndex = 0;
    timerRef.current = setInterval(() => {
      if (lineIndex < MOCK_HOTLINE_TRANSCRIPT.length) {
        const line = MOCK_HOTLINE_TRANSCRIPT[lineIndex];
        const speakerLabel = line.speaker === "Caller" ? ticket.fullName : line.speaker;

        // Dynamic confidence jitter
        setSttConfidence(Math.floor(Math.random() * (99 - 91 + 1) + 91));

        setTranscriptLines((prev) => [
          ...prev,
          {
            speaker: speakerLabel,
            text: line.text,
            textAr: line.textAr,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            detectionType: line.detectionType,
            citizenName: line.citizenName || ticket.fullName,
            category: line.category,
            entity: line.entity
          }
        ]);

        // Trigger simulated AI prompt card
        if (lineIndex === 3) {
          setAiPrompts((prev) => [
            ...prev,
            {
              id: "prompt-1",
              title: "Identify Housing Request Number",
              content: "The caller mentioned a housing application in Jan 2025. Suggest asking for their application reference number."
            }
          ]);
          setEntityChecklist([
            { name: "Caller Identity", status: "extracted" },
            { name: "Region / Area", status: "extracted" },
            { name: "Housing Request ID", status: "missing" },
            { name: "Department Contacted", status: "extracted" }
          ]);
        }

        // Checklist completion and prompt resolution
        if (lineIndex === 5) {
          setEntityChecklist([
            { name: "Caller Identity", status: "extracted" },
            { name: "Region / Area", status: "extracted" },
            { name: "Housing Request ID", status: "extracted" },
            { name: "Department Contacted", status: "extracted" }
          ]);
          // Resolve prompt card
          setAiPrompts((prev) => prev.filter(p => p.id !== "prompt-1"));
        }

        lineIndex++;
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 4500);
  };

  // Simulate YouTube / TV Stream Monitoring transcription
  const goOnAirStream = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (commentTimerRef.current) clearInterval(commentTimerRef.current);
    setIsLive(true);
    setTranscriptLines([]);
    setAiPrompts([]);
    setYtComments([]);
    setExtractedDirectives([]);
    setSttConfidence(97);
    setPriorCaseMatch(null);
    setEntityChecklist([
      { name: "Subject Name", status: "extracted" },
      { name: "Target Entity", status: "missing" },
      { name: "Core Grievance", status: "missing" }
    ]);

    let lineIndex = 0;
    
    // Simulate YouTube comments
    let commentIndex = 0;
    commentTimerRef.current = setInterval(() => {
      if (commentIndex < MOCK_YT_COMMENTS.length) {
        const commentObj = MOCK_YT_COMMENTS[commentIndex];
        if (commentObj) {
          setYtComments((prev) => [...prev, commentObj]);
        }
        commentIndex++;
      } else {
        if (commentTimerRef.current) {
          clearInterval(commentTimerRef.current);
          commentTimerRef.current = null;
        }
      }
    }, 3000);

    timerRef.current = setInterval(() => {
      if (lineIndex < MOCK_STREAM_TRANSCRIPT.length) {
        const line = MOCK_STREAM_TRANSCRIPT[lineIndex];

        // Dynamic confidence jitter
        setSttConfidence(Math.floor(Math.random() * (99 - 95 + 1) + 95));

        setTranscriptLines((prev) => [
          ...prev,
          {
            speaker: line.speaker,
            text: line.text,
            textAr: line.textAr,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            detectionType: line.detectionType,
            citizenName: line.citizenName,
            category: line.category,
            entity: line.entity
          }
        ]);

        // Trigger simulated AI Case Suggestion
        if (lineIndex === 1) {
          setAiPrompts((prev) => [
            ...prev,
            {
              id: "case-prompt-1",
              title: "💡 AI Case Suggested: Housing Delay",
              content: "Citizen concern detected: Abdullah Al-Mansoori (SHJ-HSG-9841). Target: Sharjah Housing Department."
            }
          ]);
          setExtractedDirectives((prev) => [
            ...prev,
            {
              id: "item-case-1",
              type: "suggested_case",
              text: "Housing grant application SHJ-HSG-9841 pending review since Jan 2025.",
              category: "Housing Allocation",
              entity: "Sharjah Housing Department",
              citizenName: "Abdullah Al-Mansoori",
              priority: "Standard"
            }
          ]);
        }

        // Trigger simulated AI Royal Directive detection card
        if (lineIndex === 3) {
          setAiPrompts((prev) => [
            ...prev,
            {
              id: "directive-prompt-1",
              title: "👑 Royal Directive: His Highness",
              content: "Royal order issued to Sharjah Health Authority to cover medical debt for citizen Ahmed Al-Suwaidi."
            }
          ]);
          setExtractedDirectives((prev) => [
            {
              id: "item-dir-1",
              type: "directive",
              text: "Cover outstanding medical debt immediately.",
              category: "Health & Medical",
              entity: "Sharjah Health Authority",
              citizenName: "Ahmed Al-Suwaidi",
              priority: "Critical"
            },
            ...prev
          ]);
          setEntityChecklist([
            { name: "Subject Name", status: "extracted" },
            { name: "Target Entity", status: "extracted" },
            { name: "Core Grievance", status: "extracted" }
          ]);
        }

        lineIndex++;
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 4500);
  };

  const endCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (commentTimerRef.current) {
      clearInterval(commentTimerRef.current);
      commentTimerRef.current = null;
    }
    setIsLive(false);
    // Remove the caller from queue if they were active
    if (activeCaller) {
      setCallerQueue((prev) => prev.filter(c => c.id !== activeCaller.id));
    }
  };

  const disconnectCaller = () => {
    if (activeCaller) {
      setCallerQueue((prev) => {
        const exists = prev.some((c) => c.id === activeCaller.id);
        if (!exists) {
          return [activeCaller, ...prev];
        }
        return prev;
      });
      setActiveCaller(null);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (commentTimerRef.current) clearInterval(commentTimerRef.current);
    };
  }, []);

  return (
    <BroadcastContext.Provider
      value={{
        activeSource,
        switchSource,
        scheduleDateTime,
        setScheduleDateTime,
        feedTitle,
        setFeedTitle,
        callerQueue,
        activeCaller,
        addCallerToQueue,
        removeFromQueue,
        goOnAir,
        goOnAirStream,
        endCall,
        disconnectCaller,
        isLive,
        transcriptLines,
        aiPrompts,
        ytComments,
        extractedDirectives,
        sttConfidence,
        priorCaseMatch,
        entityChecklist
      }}
    >
      {children}
    </BroadcastContext.Provider>
  );
};

export const useBroadcast = () => {
  const context = useContext(BroadcastContext);
  if (!context) {
    throw new Error("useBroadcast must be used within a BroadcastProvider");
  }
  return context;
};
