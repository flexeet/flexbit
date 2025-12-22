import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-extrabold tracking-tighter text-primary">
            404
          </h1>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Halaman Tidak Ditemukan
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
            Maaf, kami tidak dapat menemukan halaman yang Anda cari. Mungkin URL salah atau halaman telah dipindahkan.
          </p>
        </div>
        
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
