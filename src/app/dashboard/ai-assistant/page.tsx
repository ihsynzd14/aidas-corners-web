import { PageHeader } from "@/components/ui/page-header";
import AIAssistantClient from "./AIAssistantClient";

export const metadata = {
  title: "AI Köməkçi",
  description: "Aida's Corner AI Köməkçi",
};

export default function AIAssistantPage() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-amber-50/30 via-white to-amber-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex-1 overflow-hidden">
        <AIAssistantClient />
      </div>
    </div>
  );
} 