// src/app/about/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Tentang Kami</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Mengenal CV Hutama Mandiri Indotech dan komitmen kami
            </p>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-6">Sejarah Perusahaan</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                CV Hutama Mandiri Indotech didirikan pada tahun 2010 dengan visi untuk menjadi penyedia solusi berkualitas dalam bidang jasa bubut dan penjualan sparepart untuk industri manufaktur dan otomotif di Indonesia.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Berawal dari bengkel kecil di Tangerang, kami terus berkembang menjadi perusahaan yang dipercaya oleh berbagai kalangan industri untuk kebutuhan komponen presisi dan jasa bubut berkualitas tinggi.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Kini kami telah melayani ratusan pelanggan dari berbagai sektor industri dan berkomitmen untuk terus berinovasi dan meningkatkan layanan kami.
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Image 
                src="/images/about/bg-hutama.png" 
                alt="Sejarah Perusahaan" 
                width={600} 
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-4">Visi & Misi</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Kami hadir dengan tujuan yang jelas untuk memajukan industri manufaktur Indonesia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Visi</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Menjadi perusahaan terdepan dalam bidang jasa bubut dan penyedia sparepart berkualitas yang dipercaya oleh industri manufaktur dan otomotif di Indonesia.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">Misi</h3>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• Menyediakan produk dan jasa dengan standar kualitas tertinggi</li>
                  <li>• Memberikan pelayanan terbaik dan solusi yang tepat untuk setiap kebutuhan pelanggan</li>
                  <li>• Menerapkan teknologi modern dalam proses produksi</li>
                  <li>• Mengembangkan sumber daya manusia yang kompeten dan profesional</li>
                  <li>• Membangun hubungan jangka panjang dengan pelanggan dan mitra bisnis</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-20">
            <div className="bg-blue-600 text-white rounded-lg overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-2xl font-bold mb-6">Siap Bekerja Sama dengan Kami?</h2>
                  <p className="mb-8">
                    Hubungi kami untuk konsultasi kebutuhan produk dan jasa bubut untuk bisnis Anda
                  </p>
                  <Link 
                    href="/contact" 
                    className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100 transition"
                  >
                    Hubungi Kami
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}