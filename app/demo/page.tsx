"use client";

import PortalView from "@/components/PortalView";
import { DEMO_SOPS, DEMO_SIGNOFFS } from "@/lib/demoData";

export default function DemoPage() {
  return (
    <PortalView
      demo={{ sops: DEMO_SOPS, signoffs: DEMO_SIGNOFFS, spaName: "Demo Aesthetics", firstName: "Jordan" }}
    />
  );
}
