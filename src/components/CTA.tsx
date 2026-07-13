import { PrimaryButton } from "./Buttons";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl border border-pink-500/20 bg-linear-to from-pink-950/60 to-black p-10 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Ready to launch your next campaign?
          </h2>
          <p className="text-pink-300 mb-8">
            Create polished ad visuals and short-form videos in minutes with
            CoreClip.
          </p>
          <Link href="/generate">
            <PrimaryButton>Start Creating</PrimaryButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
