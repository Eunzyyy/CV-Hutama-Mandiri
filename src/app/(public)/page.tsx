// src/app/(public)/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen bg-black overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/bg-hutama.png" // Ganti dengan path gambar Anda
          alt="CNC Machine Background"
          fill
          className="object-cover object-center"
          priority
          quality={85}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-3xl text-cyan-100">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-emerald-300">
                CV Hutama Mandiri Indotech
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-slate-200">
                Jasa Bubut Berkualitas dan Penjualan Sparepart Terpercaya untuk
                Kebutuhan Industri Anda
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-yellow-100 rounded-md font-medium transition"
                >
                  Lihat Produk
                </Link>
                <Link
                  href="/services"
                  className="px-6 py-3 bg-white text-indigo-700 hover:bg-gray-100 rounded-md font-medium transition"
                >
                  Layanan Jasa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-800">Layanan Kami</h2>
            <p className="text-lg text-stone-600 max-w-3xl mx-auto">
              Menyediakan berbagai jasa bubut dan sparepart berkualitas untuk
              memenuhi kebutuhan industri Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Layanan Cards */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-teal-700">Jasa Bubut Presisi</h3>
                <p className="text-gray-500 mb-4">
                  Layanan bubut dengan tingkat presisi tinggi untuk komponen
                  mesin yang membutuhkan akurasi maksimal
                </p>
                <Link
                  href="/services"
                  className="text-orange-600 font-medium hover:underline"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-purple-700">CNC Milling</h3>
                <p className="text-gray-500 mb-4">
                  Pembuatan komponen menggunakan teknologi CNC untuk hasil yang
                  akurat dan konsisten
                </p>
                <Link
                  href="/services"
                  className="text-rose-600 font-medium hover:underline"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-emerald-700">Penjualan Sparepart</h3>
                <p className="text-gray-500 mb-4">
                  Menyediakan berbagai sparepart berkualitas untuk kebutuhan
                  industri dan otomotif
                </p>
                <Link
                  href="/products"
                  className="text-violet-600 font-medium hover:underline"
                >
                  Lihat Katalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-amber-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-lime-200">
            Siap untuk Bekerja Sama dengan Kami?
          </h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto text-sky-100">
            Hubungi kami sekarang untuk mendapatkan konsultasi gratis tentang
            kebutuhan industri dan sparepart Anda
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-white text-indigo-600 hover:bg-gray-100 rounded-md font-medium transition"
            >
              Hubungi Kami
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 border border-white hover:bg-blue-700 rounded-md font-medium transition text-pink-100"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}