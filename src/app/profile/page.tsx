import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="mb-4 text-3xl font-semibold text-white">Profile & Settings</h1>
      <p className="mb-8 text-pink-300">Manage your account preferences and billing information.</p>
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
