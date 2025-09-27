import { ModerationPanel } from "@/components/moderation/ModerationPanel";
import { ModerationContent } from "@/components/moderation/ModerationContent";

export const dynamic = 'force-dynamic';

type SearchParams = {
  status?: string;
  reported?: string;
  cursor?: string;
};

export default function ModerationPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <ModerationPanel>
      <ModerationContent searchParams={searchParams} />
    </ModerationPanel>
  );
}
