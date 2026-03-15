export default function SoftBackdrop() {
    return (
        <div className="fixed inset-0 -z-1 pointer-events-none">
            <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[980px] h-[460px] bg-linear-to-tr from-pink-800/50 to-transparent rounded-full blur-3xl" />
            <div className="absolute right-12 bottom-10 w-[420px] h-[220px] bg-linear-to-bl from-pink-700/50 to-transparent rounded-full blur-2xl" />
        </div>
    )
}