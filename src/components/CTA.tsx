import { PrimaryButton } from "./Buttons";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl border border-pink-500/10 bg-linear-to-br from-pink-600/10 to-pink-800/10 p-10 text-center">
          <h2 className="text-3xl font-semibold text-pink-500 mb-4">
            Ready to launch your next campaign?
          </h2>
          <p className="text-gray-400 mb-8">
            Create polished visuals and high resolution images with CoreClip.
          </p>
          <Link href="/generate">
            <PrimaryButton>Start Creating</PrimaryButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
