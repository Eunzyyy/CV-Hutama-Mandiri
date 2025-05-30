// prisma/seed.ts - UPDATED dengan data CNC Machining yang sesuai
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Mulai seeding database...')

  // Hapus data lama dengan urutan yang benar (foreign key constraints)
  console.log('🗑️ Menghapus data lama...')
  await prisma.notification.deleteMany()
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.serviceImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.service.deleteMany()
  await prisma.category.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.userNotificationSettings.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Hash passwords
  const adminPass = await bcrypt.hash('admin123', 10)
  const ownerPass = await bcrypt.hash('owner123', 10)
  const financePass = await bcrypt.hash('finance123', 10)
  const customerPass = await bcrypt.hash('customer123', 10)

  console.log('👤 Membuat users...')

  // Buat admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Hutama',
      email: 'admin@hutama.com',
      password: adminPass,
      role: 'ADMIN',
      phoneNumber: '081234567890',
      phone: '081234567890',
      address: 'Jl. Admin No. 1, Jakarta Pusat, DKI Jakarta 10110',
      emailVerified: new Date()
    }
  })

  // Buat owner user
  const owner = await prisma.user.create({
    data: {
      name: 'Owner Hutama Mandiri',
      email: 'owner@hutama.com',
      password: ownerPass,
      role: 'OWNER',
      phoneNumber: '081234567891',
      phone: '081234567891',
      address: 'Jl. Owner No. 2, Jakarta Selatan, DKI Jakarta 12345',
      emailVerified: new Date()
    }
  })

  // Buat finance user
  const finance = await prisma.user.create({
    data: {
      name: 'Finance Hutama',
      email: 'finance@hutama.com',
      password: financePass,
      role: 'FINANCE',
      phoneNumber: '081234567892',
      phone: '081234567892',
      address: 'Jl. Finance No. 3, Jakarta Barat, DKI Jakarta 11111',
      emailVerified: new Date()
    }
  })

  // Buat customer 1
  const customer1 = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@gmail.com', 
      password: customerPass,
      role: 'CUSTOMER',
      phoneNumber: '081111111111',
      phone: '081111111111',
      address: 'Jl. Dago No. 123, Bandung, Jawa Barat 40123',
      emailVerified: new Date()
    }
  })

  // Buat customer 2
  const customer2 = await prisma.user.create({
    data: {
      name: 'Siti Rahayu',
      email: 'siti@gmail.com', 
      password: customerPass,
      role: 'CUSTOMER',
      phoneNumber: '082222222222',
      phone: '082222222222',
      address: 'Jl. Sudirman No. 456, Surabaya, Jawa Timur 60123',
      emailVerified: new Date()
    }
  })

  // Buat customer 3
  const customer3 = await prisma.user.create({
    data: {
      name: 'Ahmad Wijaya',
      email: 'ahmad@gmail.com',
      password: customerPass,
      role: 'CUSTOMER',
      phoneNumber: '083333333333',
      phone: '083333333333',
      address: 'Jl. Gatot Subroto No. 789, Medan, Sumatera Utara 20111',
      emailVerified: new Date()
    }
  })

  console.log('⚙️ Membuat kategori jasa...')

  // ===== KATEGORI JASA =====
  const kategoriCNCMachining = await prisma.category.create({
    data: {
      name: 'CNC Machining',
      description: 'Layanan berbasis mesin CNC (Computer Numerical Control) untuk pemrosesan logam dan bahan lain dengan tingkat presisi tinggi. Cocok untuk pembuatan komponen industri, otomotif, dan manufaktur.',
      type: 'SERVICE'
    }
  })

  const kategoriPerakitanFabrikasi = await prisma.category.create({
    data: {
      name: 'Perakitan & Fabrikasi',
      description: 'Layanan penyusunan dan pembuatan komponen mekanik menjadi satu kesatuan fungsional. Biasanya digunakan untuk produksi alat bantu kerja atau bagian mesin khusus.',
      type: 'SERVICE'
    }
  })

  const kategoriPengelasanFinishing = await prisma.category.create({
    data: {
      name: 'Pengelasan & Finishing',
      description: 'Layanan pelengkap seperti penggabungan, penyambungan, dan penyempurnaan produk hasil machining.',
      type: 'SERVICE'
    }
  })

  console.log('📦 Membuat kategori produk...')

  // ===== KATEGORI PRODUK =====
  const kategoriKomponenMesinCNC = await prisma.category.create({
    data: {
      name: 'Komponen Mesin CNC',
      description: 'Produk hasil bubut atau milling CNC untuk digunakan dalam mesin industri atau otomotif. Dibuat dari logam tahan aus.',
      type: 'PRODUCT'
    }
  })

  const kategoriMaterialPlat = await prisma.category.create({
    data: {
      name: 'Material & Plat',
      description: 'Bahan mentah atau setengah jadi untuk pembuatan mesin atau rangka, seperti plat aluminium, stainless, dan teflon.',
      type: 'PRODUCT'
    }
  })

  const kategoriSparePartMesin = await prisma.category.create({
    data: {
      name: 'Spare Part Mesin',
      description: 'Komponen pengganti untuk pemeliharaan mesin produksi industri.',
      type: 'PRODUCT'
    }
  })

  const kategoriAksesorisAlatBantu = await prisma.category.create({
    data: {
      name: 'Aksesoris & Alat Bantu',
      description: 'Produk tambahan untuk mendukung proses kerja seperti fixture, jig, atau adapter.',
      type: 'PRODUCT'
    }
  })

  const kategoriKomponenCustom = await prisma.category.create({
    data: {
      name: 'Komponen Custom',
      description: 'Produk yang dibuat berdasarkan permintaan dan gambar teknik dari pelanggan.',
      type: 'PRODUCT'
    }
  })

  console.log('🔧 Membuat jasa...')

  // ===== JASA CNC MACHINING =====
  const jasaCNCBubut = await prisma.service.create({
    data: {
      name: 'CNC Bubut',
      description: 'Pengerjaan bentuk silindris dari bahan logam menggunakan mesin bubut CNC. Digunakan untuk poros, as, dan komponen rotasi.',
      price: 150000,
      categoryId: kategoriCNCMachining.id
    }
  })

  const jasaCNCMilling = await prisma.service.create({
    data: {
      name: 'CNC Milling',
      description: 'Pemesinan permukaan datar dan bentuk kompleks dengan akurasi tinggi. Digunakan untuk slot, lubang, dan komponen 3D.',
      price: 200000,
      categoryId: kategoriCNCMachining.id
    }
  })

  const jasaCNCDrilling = await prisma.service.create({
    data: {
      name: 'CNC Drilling',
      description: 'Proses pengeboran presisi menggunakan CNC, untuk lubang berulir atau polos pada bahan keras.',
      price: 80000,
      categoryId: kategoriCNCMachining.id
    }
  })

  const jasaCNCCutting = await prisma.service.create({
    data: {
      name: 'CNC Cutting',
      description: 'Pemotongan bahan berbasis program digital untuk menghasilkan bentuk akhir sesuai desain CAD.',
      price: 120000,
      categoryId: kategoriCNCMachining.id
    }
  })

  const jasaCNCThreading = await prisma.service.create({
    data: {
      name: 'CNC Threading',
      description: 'Pembuatan ulir luar atau dalam dengan tingkat presisi tinggi. Cocok untuk baut atau mur mesin khusus.',
      price: 100000,
      categoryId: kategoriCNCMachining.id
    }
  })

  const jasaCNCEngraving = await prisma.service.create({
    data: {
      name: 'CNC Engraving (Gravir)',
      description: 'Jasa ukir logo, tulisan, atau kode unik ke permukaan logam menggunakan CNC engraving.',
      price: 75000,
      categoryId: kategoriCNCMachining.id
    }
  })

  // ===== JASA PERAKITAN & FABRIKASI =====
  const jasaPerakitanKomponen = await prisma.service.create({
    data: {
      name: 'Perakitan Komponen Mesin',
      description: 'Penyusunan berbagai part menjadi unit fungsional, misalnya dudukan, panel, atau mekanik gerak.',
      price: 300000,
      categoryId: kategoriPerakitanFabrikasi.id
    }
  })

  const jasaModifikasiKomponen = await prisma.service.create({
    data: {
      name: 'Modifikasi Komponen',
      description: 'Ubah dimensi, bentuk, atau fungsi part lama menjadi lebih sesuai kebutuhan baru.',
      price: 250000,
      categoryId: kategoriPerakitanFabrikasi.id
    }
  })

  const jasaPembuatanJigFixture = await prisma.service.create({
    data: {
      name: 'Pembuatan Jig & Fixture',
      description: 'Pembuatan alat bantu kerja presisi untuk proses pengelasan, perakitan, atau pengeboran.',
      price: 400000,
      categoryId: kategoriPerakitanFabrikasi.id
    }
  })

  const jasaPembuatanPrototipe = await prisma.service.create({
    data: {
      name: 'Pembuatan Prototipe Produk',
      description: 'Produksi awal sample produk berbahan logam/plastik untuk pengujian sebelum produksi massal.',
      price: 500000,
      categoryId: kategoriPerakitanFabrikasi.id
    }
  })

  // ===== JASA PENGELASAN & FINISHING =====
  const jasaPengelasanMIGTIG = await prisma.service.create({
    data: {
      name: 'Pengelasan MIG/TIG',
      description: 'Penyambungan logam dengan hasil kuat dan bersih. Cocok untuk proyek presisi.',
      price: 180000,
      categoryId: kategoriPengelasanFinishing.id
    }
  })

  const jasaSurfaceGrinding = await prisma.service.create({
    data: {
      name: 'Surface Grinding',
      description: 'Penghalusan permukaan benda kerja dengan presisi tinggi.',
      price: 120000,
      categoryId: kategoriPengelasanFinishing.id
    }
  })

  const jasaPolishingSandblasting = await prisma.service.create({
    data: {
      name: 'Polishing / Sandblasting',
      description: 'Proses finishing untuk merapikan dan mempercantik permukaan logam.',
      price: 90000,
      categoryId: kategoriPengelasanFinishing.id
    }
  })

  console.log('🛠️ Membuat produk...')

  // ===== PRODUK KOMPONEN MESIN CNC =====
  const produkShaft = await prisma.product.create({
    data: {
      name: 'Shaft (As) Baja',
      description: 'Poros pemutar dengan toleransi presisi tinggi. Digunakan di motor dan gearbox.',
      price: 250000,
      stock: 15,
      categoryId: kategoriKomponenMesinCNC.id,
      sku: 'CNC-SHAFT-001',
      weight: 2500
    }
  })

  const produkCoupling = await prisma.product.create({
    data: {
      name: 'Coupling',
      description: 'Penghubung antara dua poros agar dapat memutar bersama.',
      price: 180000,
      stock: 22,
      categoryId: kategoriKomponenMesinCNC.id,
      sku: 'CNC-COUP-001',
      weight: 800
    }
  })

  const produkNozzle = await prisma.product.create({
    data: {
      name: 'Nozzle',
      description: 'Komponen untuk mengarahkan aliran fluida/gas.',
      price: 120000,
      stock: 35,
      categoryId: kategoriKomponenMesinCNC.id,
      sku: 'CNC-NOZL-001',
      weight: 300
    }
  })

  const produkHolderCNC = await prisma.product.create({
    data: {
      name: 'Holder CNC',
      description: 'Dudukan tool/pisau untuk mesin CNC.',
      price: 350000,
      stock: 18,
      categoryId: kategoriKomponenMesinCNC.id,
      sku: 'CNC-HOLD-001',
      weight: 1200
    }
  })

  const produkBushing = await prisma.product.create({
    data: {
      name: 'Bushing',
      description: 'Sleeve yang digunakan untuk mengurangi gesekan antara dua bagian logam.',
      price: 85000,
      stock: 42,
      categoryId: kategoriKomponenMesinCNC.id,
      sku: 'CNC-BUSH-001',
      weight: 150
    }
  })

  // ===== PRODUK MATERIAL & PLAT =====
  const produkEXPPlateAluminium = await prisma.product.create({
    data: {
      name: 'EXP Plate Aluminium',
      description: 'Plat presisi tinggi untuk baseframe atau panel mesin.',
      price: 450000,
      stock: 12,
      categoryId: kategoriMaterialPlat.id,
      sku: 'MAT-EXP-AL001',
      weight: 5000
    }
  })

  const produkTeflonBlock = await prisma.product.create({
    data: {
      name: 'Teflon Block',
      description: 'Material anti panas dan anti aus untuk komponen gesek.',
      price: 320000,
      stock: 8,
      categoryId: kategoriMaterialPlat.id,
      sku: 'MAT-TEF-BLK001',
      weight: 2200
    }
  })

  const produkPlatStainless304 = await prisma.product.create({
    data: {
      name: 'Plat Stainless 304',
      description: 'Plat tahan karat untuk produk makanan dan farmasi.',
      price: 680000,
      stock: 9,
      categoryId: kategoriMaterialPlat.id,
      sku: 'MAT-SS304-PLT',
      weight: 8500
    }
  })

  const produkRoundBarAluminium = await prisma.product.create({
    data: {
      name: 'Round Bar Aluminium',
      description: 'Batang bulat aluminium untuk part bubutan.',
      price: 185000,
      stock: 25,
      categoryId: kategoriMaterialPlat.id,
      sku: 'MAT-AL-RB001',
      weight: 1800
    }
  })

  // ===== PRODUK SPARE PART MESIN =====
  const produkPunchInsertTeflon = await prisma.product.create({
    data: {
      name: 'Punch Insert Teflon',
      description: 'Komponen untuk mesin stamping, tahan aus & panas.',
      price: 275000,
      stock: 16,
      categoryId: kategoriSparePartMesin.id,
      sku: 'SPR-PUN-TEF001',
      weight: 650
    }
  })

  const produkBautLSpringPanjang = await prisma.product.create({
    data: {
      name: 'Baut L Spring Panjang',
      description: 'Baut presisi dengan drat khusus dan bentuk L.',
      price: 45000,
      stock: 85,
      categoryId: kategoriSparePartMesin.id,
      sku: 'SPR-BAUT-LSP',
      weight: 120
    }
  })

  const produkShaftGearCustom = await prisma.product.create({
    data: {
      name: 'Shaft Gear Custom',
      description: 'Poros dengan gigi gear khusus untuk mesin otomatis.',
      price: 420000,
      stock: 7,
      categoryId: kategoriSparePartMesin.id,
      sku: 'SPR-SHF-GR001',
      weight: 3200
    }
  })

  // ===== PRODUK AKSESORIS & ALAT BANTU =====
  const produkJigWelding = await prisma.product.create({
    data: {
      name: 'Jig Welding',
      description: 'Alat bantu untuk memastikan posisi saat pengelasan.',
      price: 385000,
      stock: 11,
      categoryId: kategoriAksesorisAlatBantu.id,
      sku: 'ACC-JIG-WLD001',
      weight: 4500
    }
  })

  const produkAdapterHolder = await prisma.product.create({
    data: {
      name: 'Adapter Holder',
      description: 'Dudukan adaptor custom untuk berbagai ukuran alat.',
      price: 165000,
      stock: 23,
      categoryId: kategoriAksesorisAlatBantu.id,
      sku: 'ACC-ADP-HLD001',
      weight: 800
    }
  })

  const produkClampBesi = await prisma.product.create({
    data: {
      name: 'Clamp Besi',
      description: 'Alat penjepit saat proses permesinan.',
      price: 125000,
      stock: 34,
      categoryId: kategoriAksesorisAlatBantu.id,
      sku: 'ACC-CLP-BSI001',
      weight: 1200
    }
  })

  const produkCoolingBlockCNC = await prisma.product.create({
    data: {
      name: 'Cooling Block CNC',
      description: 'Pendingin blok untuk menjaga suhu tool CNC.',
      price: 295000,
      stock: 14,
      categoryId: kategoriAksesorisAlatBantu.id,
      sku: 'ACC-COL-BLK001',
      weight: 2800
    }
  })

  const produkFixtureCustom = await prisma.product.create({
    data: {
      name: 'Fixture Custom',
      description: 'Dudukan kerja untuk menahan benda saat proses.',
      price: 455000,
      stock: 9,
      categoryId: kategoriAksesorisAlatBantu.id,
      sku: 'ACC-FIX-CST001',
      weight: 5200
    }
  })

  // ===== PRODUK KOMPONEN CUSTOM =====
  const produkBracketAluminiumCustom = await prisma.product.create({
    data: {
      name: 'Bracket Aluminium Custom',
      description: 'Dudukan berbahan aluminium untuk rangka atau mesin.',
      price: 235000,
      stock: 18,
      categoryId: kategoriKomponenCustom.id,
      sku: 'CST-BRK-AL001',
      weight: 1500
    }
  })

  const produkRollerConveyor = await prisma.product.create({
    data: {
      name: 'Roller Conveyor',
      description: 'Roda penuntun barang pada conveyor pabrik.',
      price: 185000,
      stock: 26,
      categoryId: kategoriKomponenCustom.id,
      sku: 'CST-ROL-CNV001',
      weight: 2200
    }
  })

  const produkEngselHeavyDuty = await prisma.product.create({
    data: {
      name: 'Engsel Heavy Duty',
      description: 'Engsel besar untuk alat industri atau pintu tebal.',
      price: 145000,
      stock: 31,
      categoryId: kategoriKomponenCustom.id,
      sku: 'CST-ENG-HD001',
      weight: 1800
    }
  })

  const produkPanelMekanik = await prisma.product.create({
    data: {
      name: 'Panel Mekanik',
      description: 'Panel logam dengan lubang dan slot khusus.',
      price: 375000,
      stock: 12,
      categoryId: kategoriKomponenCustom.id,
      sku: 'CST-PNL-MKN001',
      weight: 4200
    }
  })

  // Buat gambar produk dan jasa
  console.log('🖼️ Membuat gambar produk dan jasa...')
  
  await prisma.productImage.createMany({
    data: [
      // Komponen Mesin CNC
      { url: '/images/products/shaft-baja.jpg', productId: produkShaft.id },
      { url: '/images/products/coupling.jpg', productId: produkCoupling.id },
      { url: '/images/products/nozzle.jpg', productId: produkNozzle.id },
      { url: '/images/products/holder-cnc.jpg', productId: produkHolderCNC.id },
      { url: '/images/products/bushing.jpg', productId: produkBushing.id },
      
      // Material & Plat
      { url: '/images/products/exp-plate-aluminium.jpg', productId: produkEXPPlateAluminium.id },
      { url: '/images/products/teflon-block.jpg', productId: produkTeflonBlock.id },
      { url: '/images/products/plat-stainless-304.jpg', productId: produkPlatStainless304.id },
      { url: '/images/products/round-bar-aluminium.jpg', productId: produkRoundBarAluminium.id },
      
      // Spare Part Mesin
      { url: '/images/products/punch-insert-teflon.jpg', productId: produkPunchInsertTeflon.id },
      { url: '/images/products/baut-l-spring.jpg', productId: produkBautLSpringPanjang.id },
      { url: '/images/products/shaft-gear-custom.jpg', productId: produkShaftGearCustom.id },
      
      // Aksesoris & Alat Bantu
      { url: '/images/products/jig-welding.jpg', productId: produkJigWelding.id },
      { url: '/images/products/adapter-holder.jpg', productId: produkAdapterHolder.id },
      { url: '/images/products/clamp-besi.jpg', productId: produkClampBesi.id },
      { url: '/images/products/cooling-block-cnc.jpg', productId: produkCoolingBlockCNC.id },
      { url: '/images/products/fixture-custom.jpg', productId: produkFixtureCustom.id },
      
      // Komponen Custom
      { url: '/images/products/bracket-aluminium-custom.jpg', productId: produkBracketAluminiumCustom.id },
      { url: '/images/products/roller-conveyor.jpg', productId: produkRollerConveyor.id },
      { url: '/images/products/engsel-heavy-duty.jpg', productId: produkEngselHeavyDuty.id },
      { url: '/images/products/panel-mekanik.jpg', productId: produkPanelMekanik.id }
    ]
  })

  await prisma.serviceImage.createMany({
    data: [
      // CNC Machining
      { url: '/images/services/cnc-bubut.jpg', serviceId: jasaCNCBubut.id },
      { url: '/images/services/cnc-milling.jpg', serviceId: jasaCNCMilling.id },
      { url: '/images/services/cnc-drilling.jpg', serviceId: jasaCNCDrilling.id },
      { url: '/images/services/cnc-cutting.jpg', serviceId: jasaCNCCutting.id },
      { url: '/images/services/cnc-threading.jpg', serviceId: jasaCNCThreading.id },
      { url: '/images/services/cnc-engraving.jpg', serviceId: jasaCNCEngraving.id },
      
      // Perakitan & Fabrikasi
      { url: '/images/services/perakitan-komponen.jpg', serviceId: jasaPerakitanKomponen.id },
      { url: '/images/services/modifikasi-komponen.jpg', serviceId: jasaModifikasiKomponen.id },
      { url: '/images/services/pembuatan-jig-fixture.jpg', serviceId: jasaPembuatanJigFixture.id },
      { url: '/images/services/pembuatan-prototipe.jpg', serviceId: jasaPembuatanPrototipe.id },
      
      // Pengelasan & Finishing
      { url: '/images/services/pengelasan-mig-tig.jpg', serviceId: jasaPengelasanMIGTIG.id },
      { url: '/images/services/surface-grinding.jpg', serviceId: jasaSurfaceGrinding.id },
      { url: '/images/services/polishing-sandblasting.jpg', serviceId: jasaPolishingSandblasting.id }
    ]
  })

  console.log('🛒 Membuat pesanan...')

  // Buat contoh pesanan 1 (DELIVERED dengan payment PAID)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-1748268483374-PKMKR',
      userId: customer2.id,
      totalAmount: 1020000,
      status: 'DELIVERED',
      paymentMethod: 'BANK_TRANSFER',
      paymentStatus: 'PAID',
      shippingAddress: 'Jl. Sudirman No. 456, Surabaya, Jawa Timur 60123',
      notes: 'Pesanan CNC urgent, mohon diprioritaskan'
    }
  })

  // Buat order items untuk pesanan 1
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        productId: produkShaft.id,
        quantity: 2,
        price: 250000
      },
      {
        orderId: order1.id,
        productId: produkCoupling.id,
        quantity: 1,
        price: 180000
      },
      {
        orderId: order1.id,
        serviceId: jasaCNCMilling.id,
        quantity: 1,
        price: 200000
      }
    ]
  })

  // Buat payment untuk pesanan 1
  await prisma.payment.create({
    data: {
      orderId: order1.id,
      amount: 1020000,
      method: 'BANK_TRANSFER',
      status: 'PAID',
      paidAt: new Date(),
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      notes: 'Pembayaran telah dikonfirmasi'
    }
  })

  // Buat contoh pesanan 2 (PENDING)
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-CNC-002',
      userId: customer1.id,
      totalAmount: 650000,
      status: 'PENDING',
      paymentMethod: 'BANK_TRANSFER',
      paymentStatus: 'PENDING',
      shippingAddress: 'Jl. Dago No. 123, Bandung, Jawa Barat 40123',
      notes: 'Butuh jasa CNC drilling dan threading'
    }
  })

  // Buat order items untuk pesanan 2
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order2.id,
        serviceId: jasaCNCDrilling.id,
        quantity: 3,
        price: 80000
      },
      {
        orderId: order2.id,
        serviceId: jasaCNCThreading.id,
        quantity: 2,
        price: 100000
      },
      {
        orderId: order2.id,
        productId: produkHolderCNC.id,
        quantity: 1,
        price: 350000
      }
    ]
  })

  // Buat payment untuk pesanan 2 (menunggu pembayaran)
  await prisma.payment.create({
    data: {
      orderId: order2.id,
      amount: 650000,
      method: 'BANK_TRANSFER',
      status: 'PENDING'
    }
  })

  console.log('⚙️ Membuat pengaturan...')

  // Buat settings
  await prisma.setting.createMany({
    data: [
      {
        key: 'company_name',
        value: 'CV Hutama Mandiri',
        description: 'Nama perusahaan'
      },
      {
        key: 'company_address',
        value: 'Jl. Industri CNC No. 123, Jakarta',
        description: 'Alamat perusahaan'
      },
      {
        key: 'company_phone',
        value: '021-1234567',
        description: 'Nomor telepon perusahaan'
      },
      {
        key: 'bank_account',
        value: '1234567890',
        description: 'Nomor rekening bank'
      },
      {
        key: 'bank_name',
        value: 'BCA',
        description: 'Nama bank'
      },
      {
        key: 'account_holder',
        value: 'CV Hutama Mandiri',
        description: 'Nama pemegang rekening'
      },
      {
        key: 'business_type',
        value: 'CNC Machining & Manufacturing',
        description: 'Jenis usaha'
      }
    ]
  })

  console.log('🔔 Membuat notifikasi...')

  // Buat contoh notifikasi
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        type: 'ORDER_CREATED',
        title: 'Pesanan CNC Baru',
        message: `Pesanan baru ${order2.orderNumber} telah dibuat untuk jasa CNC`,
        data: { orderId: order2.id }
      },
      {
        userId: admin.id,
        type: 'PAYMENT_RECEIVED',
        title: 'Pembayaran Diterima',
        message: `Pembayaran untuk pesanan ${order1.orderNumber} telah dikonfirmasi`,
        data: { orderId: order1.id }
      },
      {
        userId: finance.id,
        type: 'PAYMENT_CONFIRMED',
        title: 'Konfirmasi Pembayaran',
        message: `Pembayaran pesanan CNC sebesar Rp 1.020.000 telah dikonfirmasi`,
        data: { orderId: order1.id }
      }
    ]
  })

  // Buat notification settings untuk semua user
  await prisma.userNotificationSettings.createMany({
    data: [
      { userId: admin.id },
      { userId: owner.id },
      { userId: finance.id },
      { userId: customer1.id },
      { userId: customer2.id },
      { userId: customer3.id }
    ]
  })

  console.log('✅ Seeding berhasil!')
  console.log('')
  console.log('=== AKUN LOGIN ===')
  console.log('👤 Admin    : admin@hutama.com / admin123')
  console.log('👤 Owner    : owner@hutama.com / owner123')
  console.log('👤 Finance  : finance@hutama.com / finance123')
  console.log('👤 Customer 1: budi@gmail.com / customer123')
  console.log('👤 Customer 2: siti@gmail.com / customer123')
  console.log('👤 Customer 3: ahmad@gmail.com / customer123')
  console.log('')
  console.log('=== DATA CNC MACHINING YANG DIBUAT ===')
  console.log('📂 Kategori Jasa: 3 buah (CNC Machining, Perakitan & Fabrikasi, Pengelasan & Finishing)')
  console.log('📂 Kategori Produk: 5 buah (Komponen CNC, Material & Plat, Spare Part, Aksesoris, Komponen Custom)')
  console.log('🔧 Jasa: 13 buah (6 CNC + 4 Perakitan + 3 Pengelasan)')
  console.log('🛠️ Produk: 21 buah dengan gambar dan variasi kategori')
  console.log('🛒 Pesanan: 2 buah dengan items CNC')
  console.log('💰 Payment: 2 buah (1 paid, 1 pending)')
  console.log('⚙️ Settings: 7 pengaturan perusahaan CNC')
  console.log('🔔 Notifikasi: 3 contoh notifikasi')
  console.log('👥 Users: 6 user (1 admin, 1 owner, 1 finance, 3 customer)')
  console.log('')
  console.log('🎯 Database CNC Machining siap digunakan!')
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })