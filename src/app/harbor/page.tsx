import type { Metadata } from "next";
import HarborLeadPage from "./lead-page";

export const metadata: Metadata = {
  title: "Kestrel Works for Harbor Collective founders",
  description:
    "We built the founder intelligence platform the Harbor Collective community team uses every day. A portfolio build with fictional content.",
};

export default function Page() {
  return <HarborLeadPage />;
}
