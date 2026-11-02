import type { SOP, Signoff } from "@/components/PortalView";

// Fictional sample data for the public /demo page. No real spa, staff or patients.

const sec = (heading: string, steps: string[]) => ({ heading, steps });

export const DEMO_SOPS: SOP[] = [
  {
    id: "demo-sop-intake",
    title: "New Patient Intake Process",
    category: "Patient Experience",
    purpose: "Give every new patient a consistent, professional first visit and make sure all paperwork is complete before treatment.",
    scope: "Applies to front desk staff and nurse practitioners for all first-time patients.",
    owner: "Front Desk Manager",
    created_at: "2026-10-06T15:00:00Z",
    edited_at: null,
    sections: [
      sec("Before the visit", [
        "Confirm the appointment 24 hours ahead by phone or text.",
        "Send new patient paperwork by email or text for completion before arrival.",
        "Review the schedule and confirm the treatment room and provider are available.",
        "Prepare a blank consent packet for the provider.",
      ]),
      sec("Arrival and check-in", [
        "Greet the patient by name within 30 seconds of entry.",
        "Verify identity with photo ID and confirm contact details.",
        "Collect completed forms or provide a tablet for digital completion.",
        "Explain what to expect and offer a beverage in the waiting area.",
      ]),
      sec("Handoff to the provider", [
        "Review forms for completeness and flag any concerns for the nurse practitioner.",
        "Escort the patient to the consultation room and introduce the provider.",
        "Confirm consent signatures are on file before treatment begins.",
        "Schedule follow-up care and collect payment at checkout.",
      ]),
    ],
  },
  {
    id: "demo-sop-neuromodulator",
    title: "Neuromodulator Visit: Check-In to Aftercare",
    category: "Clinical Operations",
    purpose: "Keep every neuromodulator appointment organized, documented and handed off cleanly between front desk, tech and provider.",
    scope: "Applies to front desk, technicians and nurse practitioners. Clinical protocols are set by the Medical Director.",
    owner: "Clinical Director",
    created_at: "2026-10-08T15:00:00Z",
    edited_at: "2026-10-18T16:30:00Z",
    sections: [
      sec("Check-in", [
        "Verify identity with two identifiers and confirm the consent form is on file.",
        "Confirm the patient's medical history was updated within the required window.",
        "Notify the technician that the patient is ready and which room to use.",
      ]),
      sec("Room preparation", [
        "Stock the room with supplies listed on the room checklist at the start of each shift.",
        "Confirm the camera or tablet is charged for before and after photos.",
        "Print the aftercare sheet and place it in the room.",
      ]),
      sec("Documentation", [
        "Provider records product, lot number and expiration in the patient chart during the visit.",
        "Technician confirms photos are saved to the correct chart.",
        "Provider signs the treatment note the same day.",
      ]),
      sec("Aftercare and checkout", [
        "Review the written aftercare instructions with the patient and answer questions.",
        "Schedule the follow-up appointment before the patient leaves.",
        "Front desk confirms the patient knows who to call with concerns.",
      ]),
    ],
  },
  {
    id: "demo-sop-turnover",
    title: "Treatment Room Turnover and Sanitation",
    category: "Clinical Operations",
    purpose: "Make sure every room is clean, stocked and ready before the next patient.",
    scope: "Applies to all technicians and providers between appointments and at close.",
    owner: "Lead Technician",
    created_at: "2026-10-10T15:00:00Z",
    edited_at: null,
    sections: [
      sec("Between patients", [
        "Dispose of used supplies and sharps in the correct containers.",
        "Disinfect the treatment chair, counters and any touched equipment with the approved product.",
        "Replace linens and restock single-use supplies.",
        "Mark the room ready in the schedule so the front desk can see it.",
      ]),
      sec("End of day", [
        "Empty sharps and waste containers per the policy schedule.",
        "Complete the room checklist and report any low inventory to the manager.",
        "Power down equipment and secure the room.",
      ]),
    ],
  },
  {
    id: "demo-sop-onboarding",
    title: "New Staff Onboarding: Week One",
    category: "Staff & Training",
    purpose: "Get new team members productive and confident in their first week.",
    scope: "Applies to every new hire and the manager responsible for their onboarding.",
    owner: "Practice Manager",
    created_at: "2026-10-12T15:00:00Z",
    edited_at: null,
    sections: [
      sec("Day one", [
        "Complete HR paperwork and receive login credentials.",
        "Tour the spa and meet the team.",
        "Read the SOPs for your role and sign off on each one.",
      ]),
      sec("Days two to five", [
        "Shadow three full patient visits from check-in to checkout.",
        "Practice phone and front desk scripts with your manager.",
        "Meet with your supervisor on Friday to review questions and set goals.",
      ]),
    ],
  },
];

const so = (id: string, sop: string, name: string, email: string, signed: string): Signoff => ({
  id, sop_id: sop, staff_name: name, staff_email: email, signed_at: signed,
});

export const DEMO_SIGNOFFS: Signoff[] = [
  so("s1", "demo-sop-intake", "Maya Torres", "maya@example.com", "2026-10-07T14:12:00Z"),
  so("s2", "demo-sop-intake", "Devon Brooks", "devon@example.com", "2026-10-07T16:40:00Z"),
  so("s3", "demo-sop-intake", "Priya Shah", "priya@example.com", "2026-10-08T13:05:00Z"),
  so("s4", "demo-sop-intake", "Sam Whitaker", "sam@example.com", "2026-10-08T17:22:00Z"),
  so("s5", "demo-sop-intake", "Alicia Nguyen", "alicia@example.com", "2026-10-09T15:48:00Z"),

  // Signed the neuromodulator SOP before its 10/18 edit, so these show "before last edit".
  so("s6", "demo-sop-neuromodulator", "Maya Torres", "maya@example.com", "2026-10-09T14:30:00Z"),
  so("s7", "demo-sop-neuromodulator", "Priya Shah", "priya@example.com", "2026-10-10T12:15:00Z"),
  so("s8", "demo-sop-neuromodulator", "Devon Brooks", "devon@example.com", "2026-10-19T14:02:00Z"),
  so("s9", "demo-sop-neuromodulator", "Marcus Hale", "marcus@example.com", "2026-10-19T18:45:00Z"),
  so("s10", "demo-sop-neuromodulator", "Alicia Nguyen", "alicia@example.com", "2026-10-20T13:20:00Z"),

  so("s11", "demo-sop-turnover", "Maya Torres", "maya@example.com", "2026-10-11T14:00:00Z"),
  so("s12", "demo-sop-turnover", "Devon Brooks", "devon@example.com", "2026-10-11T15:10:00Z"),
  so("s13", "demo-sop-turnover", "Priya Shah", "priya@example.com", "2026-10-12T13:35:00Z"),
  so("s14", "demo-sop-turnover", "Sam Whitaker", "sam@example.com", "2026-10-12T16:50:00Z"),
  so("s15", "demo-sop-turnover", "Marcus Hale", "marcus@example.com", "2026-10-13T14:25:00Z"),
  so("s16", "demo-sop-turnover", "Alicia Nguyen", "alicia@example.com", "2026-10-13T17:05:00Z"),

  so("s17", "demo-sop-onboarding", "Marcus Hale", "marcus@example.com", "2026-10-14T15:30:00Z"),
  so("s18", "demo-sop-onboarding", "Sam Whitaker", "sam@example.com", "2026-10-15T14:40:00Z"),
];
