// src/components/footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CV Hutama Mandiri Indotech</h3>
            <p className="text-gray-400">
              Jasa bubut berkualitas dan penjualan sparepart terpercaya untuk
              kebutuhan industri Anda.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Layanan</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white">
                  Jasa Bubut
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white">
                  Sparepart
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white">
                  Pesanan Khusus
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Perusahaan</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Kontak</h4>
            <address className="text-gray-400 not-italic">
              <p>Jl. Raya Binong No. 79 Kamp. Parigi Sukabakti, Curug</p>
              <p>Tangerang 15810</p>
              <p className="mt-2">Email: hutama.mardiman@gmail.com</p>
              <p>Telepon: 021 - 5983117</p>
              <p>Whatsapp: +62-85213382805</p>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CV Hutama Mandiri Indotech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}