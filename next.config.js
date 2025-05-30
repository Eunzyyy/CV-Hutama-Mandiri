/** @type {import('next').NextConfig} */
const nextConfig = {
  // Matikan React Strict Mode untuk mengurangi rendering ganda saat development
  reactStrictMode: false,
  
  // Aktifkan SWC minifier untuk build yang lebih cepat
  swcMinify: true,
  
  // Konfigurasi untuk gambar/images
  images: {
    // Domain yang diizinkan untuk gambar (untuk gambar lokal)
    domains: ['localhost'],
    
    // Pattern untuk gambar dari domain eksternal
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Izinkan semua domain HTTPS
      },
      {
        protocol: 'http',
        hostname: 'localhost', // Izinkan localhost HTTP
      },
    ],
    
    // Matikan optimisasi gambar Next.js (untuk menghindari error)
    unoptimized: true,
  },
  
  // Konfigurasi ESLint
  eslint: {
    // Abaikan error ESLint saat build (berguna untuk development)
    ignoreDuringBuilds: true,
  },
  
  // Konfigurasi TypeScript
  typescript: {
    // Abaikan error TypeScript saat build (berguna untuk development)
    ignoreBuildErrors: true,
  },
  
  // Konfigurasi compiler
  compiler: {
    // Aktifkan dukungan styled-components (jika Anda menggunakannya)
    styledComponents: true,
  },
  
  // Konfigurasi tambahan untuk development
  env: {
    // Anda bisa menambahkan environment variables di sini
    CUSTOM_KEY: 'value',
  },
  
  // Redirect rules (opsional)
  async redirects() {
    return [
      // Contoh redirect (hapus jika tidak diperlukan)
      // {
      //   source: '/old-page',
      //   destination: '/new-page',
      //   permanent: false,
      // },
    ];
  },
  
  // Headers kustom (opsional)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;