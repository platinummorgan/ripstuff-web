import { Metadata } from "next";
import { UserManagementContent } from "@/components/moderation/UserManagementContent";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "User Management - RipStuff",
  description: "Manage user accounts and moderation actions",
};

type SearchParams = {
  query?: string;
  status?: string;
  cursor?: string;
};

interface UserManagementPageProps {
  searchParams: SearchParams;
}

export default function UserManagementPage({ searchParams }: UserManagementPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black">
      <div className="container mx-auto px-4 py-8">
        <UserManagementContent searchParams={searchParams} />
      </div>
    </main>
  );
}