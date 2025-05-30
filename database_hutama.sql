-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 27, 2025 at 11:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `database_hutama`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cartId` int(11) NOT NULL,
  `productId` int(11) DEFAULT NULL,
  `serviceId` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `publicId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `type` enum('PRODUCT','SERVICE') NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `publicId`, `name`, `description`, `type`, `createdAt`, `updatedAt`) VALUES
(1, 'cmb57q2n1000011mtftcnjeiy', 'Spare Part', 'Suku cadang mesin industri', 'PRODUCT', '2025-05-26 14:58:40.478', '2025-05-26 14:58:40.478'),
(2, 'cmb57q2nb000111mtnfdpvls3', 'Tools', 'Peralatan kerja dan mesin', 'PRODUCT', '2025-05-26 14:58:40.488', '2025-05-26 14:58:40.488'),
(3, 'cmb57q2nh000211mtto3u6ytn', 'Jasa Bubut', 'Layanan bubut dan machining', 'SERVICE', '2025-05-26 14:58:40.493', '2025-05-26 14:58:40.493'),
(4, 'cmb57q2nn000311mtjh3haw55', 'Jasa Repair', 'Layanan perbaikan mesin', 'SERVICE', '2025-05-26 14:58:40.499', '2025-05-26 14:58:40.499');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `type` enum('ORDER_CREATED','ORDER_UPDATED','ORDER_CANCELLED','PAYMENT_RECEIVED','PAYMENT_CONFIRMED','REVIEW_ADDED','USER_REGISTERED','SYSTEM_ALERT') NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` varchar(191) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `data`, `isRead`, `createdAt`) VALUES
(1, 1, 'ORDER_CREATED', 'Pesanan Baru', 'Pesanan baru ORD-001 telah dibuat', '{\"orderId\":2}', 0, '2025-05-26 14:58:40.665'),
(2, 1, 'PAYMENT_RECEIVED', 'Pembayaran Diterima', 'Pembayaran untuk pesanan ORD-1748268483374-PKMKR telah dikonfirmasi', '{\"orderId\":1}', 0, '2025-05-26 14:58:40.665'),
(3, 4, 'PAYMENT_CONFIRMED', 'Pembayaran Dikonfirmasi', 'Pembayaran untuk pesanan ORD-001 telah dikonfirmasi', '{\"orderId\":2,\"paymentId\":2}', 0, '2025-05-26 15:17:17.857'),
(4, NULL, 'ORDER_UPDATED', 'Status Pesanan Diupdate', 'Pesanan #ORD-001 diupdate menjadi SHIPPED', '{\"orderId\":2,\"orderNumber\":\"ORD-001\",\"newStatus\":\"SHIPPED\"}', 0, '2025-05-26 15:44:10.787'),
(5, NULL, 'ORDER_UPDATED', 'Status Pesanan Diupdate', 'Pesanan #ORD-001 diupdate menjadi DELIVERED', '{\"orderId\":2,\"orderNumber\":\"ORD-001\",\"newStatus\":\"DELIVERED\"}', 0, '2025-05-26 15:44:15.703'),
(6, NULL, 'ORDER_CREATED', 'Pesanan Baru', 'Pesanan baru #ORD-1748274468543-QKGR2', '{\"orderId\":3,\"orderNumber\":\"ORD-1748274468543-QKGR2\"}', 0, '2025-05-26 15:47:48.644'),
(7, 5, 'PAYMENT_CONFIRMED', 'Pembayaran Dikonfirmasi', 'Pembayaran untuk pesanan ORD-1748274468543-QKGR2 telah dikonfirmasi', '{\"orderId\":3,\"paymentId\":3}', 0, '2025-05-26 15:49:14.511');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `orderNumber` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `totalAmount` double NOT NULL,
  `status` enum('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `paymentMethod` enum('CASH','BANK_TRANSFER','CREDIT_CARD','E_WALLET','COD') DEFAULT NULL,
  `shippingAddress` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `customerDesign` varchar(191) DEFAULT NULL,
  `paymentProof` varchar(191) DEFAULT NULL,
  `paymentStatus` enum('PENDING','PENDING_VERIFICATION','PAID','FAILED','CANCELLED','REFUNDED','UNPAID','PARTIAL','COMPLETED') NOT NULL DEFAULT 'PENDING'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `orderNumber`, `userId`, `totalAmount`, `status`, `paymentMethod`, `shippingAddress`, `notes`, `createdAt`, `updatedAt`, `customerDesign`, `paymentProof`, `paymentStatus`) VALUES
(1, 'ORD-1748268483374-PKMKR', 5, 10190000, 'DELIVERED', 'BANK_TRANSFER', 'Jl. Sudirman No. 456, Surabaya, Jawa Timur 60123', 'Pesanan urgent, mohon diprioritaskan', '2025-05-26 14:58:40.601', '2025-05-26 14:58:40.601', NULL, NULL, 'PENDING'),
(2, 'ORD-001', 4, 170000, 'DELIVERED', 'BANK_TRANSFER', 'Jl. Dago No. 123, Bandung, Jawa Barat 40123', 'Kirim segera ya', '2025-05-26 14:58:40.625', '2025-05-26 15:44:15.666', NULL, NULL, 'PENDING'),
(3, 'ORD-1748274468543-QKGR2', 5, 350000, 'PROCESSING', 'BANK_TRANSFER', 'Bandung', 'Cepetan', '2025-05-26 15:47:48.565', '2025-05-26 15:49:14.500', NULL, NULL, 'PENDING');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `productId` int(11) DEFAULT NULL,
  `serviceId` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `orderId`, `productId`, `serviceId`, `quantity`, `price`) VALUES
(1, 1, 1, NULL, 1, 20000),
(2, 1, 2, NULL, 1, 150000),
(3, 1, NULL, 1, 1, 500000),
(4, 2, 1, NULL, 1, 20000),
(5, 2, 2, NULL, 1, 150000),
(6, 3, 3, NULL, 9, 20000),
(7, 3, 2, NULL, 1, 150000),
(8, 3, 1, NULL, 1, 20000);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `amount` double NOT NULL,
  `method` enum('CASH','BANK_TRANSFER','CREDIT_CARD','E_WALLET','COD') NOT NULL,
  `status` enum('PENDING','PENDING_VERIFICATION','PAID','FAILED','CANCELLED','REFUNDED','UNPAID','PARTIAL','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `transactionId` varchar(191) DEFAULT NULL,
  `paymentProof` varchar(191) DEFAULT NULL,
  `proofFileName` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `verifiedAt` datetime(3) DEFAULT NULL,
  `verifiedBy` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `orderId`, `amount`, `method`, `status`, `transactionId`, `paymentProof`, `proofFileName`, `notes`, `paidAt`, `verifiedAt`, `verifiedBy`, `createdAt`, `updatedAt`) VALUES
(1, 1, 10190000, 'BANK_TRANSFER', 'PAID', NULL, NULL, NULL, 'Pembayaran telah dikonfirmasi', '2025-05-26 14:58:40.616', '2025-05-26 14:58:40.616', 1, '2025-05-26 14:58:40.618', '2025-05-26 14:58:40.618'),
(2, 2, 170000, 'BANK_TRANSFER', 'PAID', NULL, NULL, NULL, NULL, '2025-05-26 15:17:17.794', '2025-05-26 15:17:17.794', 3, '2025-05-26 14:58:40.643', '2025-05-26 15:17:17.799'),
(3, 3, 350000, 'BANK_TRANSFER', 'PAID', NULL, '/uploads/payment-proofs/3-1748274484330-piston.png', '3-1748274484330-piston.png', 'Payment for order ORD-1748274468543-QKGR2', '2025-05-26 15:49:14.468', '2025-05-26 15:49:14.468', 3, '2025-05-26 15:47:48.627', '2025-05-26 15:49:14.473');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `publicId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `price` double NOT NULL,
  `stock` int(11) NOT NULL,
  `sku` varchar(191) DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `categoryId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `publicId`, `name`, `description`, `price`, `stock`, `sku`, `weight`, `categoryId`, `createdAt`, `updatedAt`, `isActive`) VALUES
(1, 'cmb57q2nu000511mt8ojla5g0', 'Neckring M50', 'Neckring berkualitas tinggi untuk mesin', 20000, 45, 'NK001', 150, 1, '2025-05-26 14:58:40.507', '2025-05-26 15:47:48.620', 1),
(2, 'cmb57q2o4000711mtyp9w0z5i', 'Bearing SKF', 'Bearing berkualitas tinggi untuk mesin industri', 150000, 48, 'BRG001', 300, 1, '2025-05-26 14:58:40.516', '2025-05-26 15:47:48.612', 1),
(3, 'cmb57q2pb000911mtsozehfs1', 'Obeng', 'Obeng multifungsi berkualitas tinggi', 20000, 0, 'OBG001', 100, 2, '2025-05-26 14:58:40.559', '2025-05-26 15:47:48.590', 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `url` varchar(191) NOT NULL,
  `productId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) DEFAULT NULL,
  `serviceId` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `comment` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `publicId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `price` double NOT NULL,
  `categoryId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `publicId`, `name`, `description`, `price`, `categoryId`, `createdAt`, `updatedAt`, `isActive`) VALUES
(1, 'cmb57q2pt000b11mte8zp60mj', 'Jasa Repair Dies Blanking', 'Layanan perbaikan dies blanking dengan presisi tinggi', 500000, 4, '2025-05-26 14:58:40.577', '2025-05-26 15:36:31.748', 1),
(2, 'cmb57q2pz000d11mt7de7l4q4', 'Bubut CNC', 'Jasa bubut presisi tinggi menggunakan mesin CNC', 300000, 3, '2025-05-26 14:58:40.583', '2025-05-26 15:36:21.294', 1);

-- --------------------------------------------------------

--
-- Table structure for table `service_images`
--

CREATE TABLE `service_images` (
  `id` int(11) NOT NULL,
  `url` varchar(191) NOT NULL,
  `serviceId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `sessionToken` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `description`, `createdAt`, `updatedAt`) VALUES
(1, 'company_name', 'CV Hutama Mandiri', 'Nama perusahaan', '2025-05-26 14:58:40.658', '2025-05-26 14:58:40.658'),
(2, 'company_address', 'Jl. Industri Raya No. 123, Jakarta', 'Alamat perusahaan', '2025-05-26 14:58:40.658', '2025-05-26 14:58:40.658'),
(3, 'company_phone', '021-1234567', 'Nomor telepon perusahaan', '2025-05-26 14:58:40.658', '2025-05-26 14:58:40.658'),
(4, 'bank_account', '1234567890', 'Nomor rekening bank', '2025-05-26 14:58:40.658', '2025-05-26 14:58:40.658'),
(5, 'bank_name', 'BCA', 'Nama bank', '2025-05-26 14:58:40.658', '2025-05-26 14:58:40.658'),
(6, 'account_holder', 'CV Hutama Mandiri', 'Nama pemegang rekening', '2025-05-26 14:58:40.658', '2025-05-26 14:58:40.658');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `phoneNumber` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('ADMIN','OWNER','FINANCE','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `emailVerified` datetime(3) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `name`, `phone`, `phoneNumber`, `address`, `password`, `role`, `emailVerified`, `image`, `createdAt`, `updatedAt`) VALUES
(1, 'admin@hutama.com', 'Admin Hutama', '081234567890', '081234567890', 'Jl. Admin No. 1, Jakarta Pusat, DKI Jakarta 10110', '$2a$10$xlvh6hGErEeHdeDPxY53sO./cu4lFQlFLOQUG5nhiSlDAD/u.aLsq', 'ADMIN', '2025-05-26 14:58:40.439', NULL, '2025-05-26 14:58:40.442', '2025-05-26 14:58:40.442'),
(2, 'owner@hutama.com', 'Owner Hutama', '081234567891', '081234567891', 'Jl. Owner No. 2, Jakarta Selatan, DKI Jakarta 12345', '$2a$10$PANhnosXNMNOVico64a/N.r3sYLt.RfpRWEweRnHYljrIeKcjTOAK', 'OWNER', '2025-05-26 14:58:40.447', NULL, '2025-05-26 14:58:40.449', '2025-05-26 14:58:40.449'),
(3, 'finance@hutama.com', 'Finance Hutama', '081234567892', '081234567892', 'Jl. Finance No. 3, Jakarta Barat, DKI Jakarta 11111', '$2a$10$BBDS1RQwM/.NXDhCSW/7QO.KHnGZh1diXK/0O/kY9aEf2QXF7zne.', 'FINANCE', '2025-05-26 14:58:40.452', NULL, '2025-05-26 14:58:40.454', '2025-05-26 14:58:40.454'),
(4, 'customer@gmail.com', 'Customer Test', '081111111111', '081111111111', 'Jl. Dago No. 123, Bandung, Jawa Barat 40123', '$2a$10$TG/HKZwwwAVgyd75lzzt0.ghrAtTiB8zMKsLCu/CP7GuIWMX0jIkW', 'CUSTOMER', '2025-05-26 14:58:40.463', NULL, '2025-05-26 14:58:40.465', '2025-05-26 14:58:40.465'),
(5, 'customer2@gmail.com', 'Customer 2', '08494723', '08494723', 'Jl. Sudirman No. 456, Surabaya, Jawa Timur 60123', '$2a$10$TG/HKZwwwAVgyd75lzzt0.ghrAtTiB8zMKsLCu/CP7GuIWMX0jIkW', 'CUSTOMER', '2025-05-26 14:58:40.468', NULL, '2025-05-26 14:58:40.470', '2025-05-26 14:58:40.470');

-- --------------------------------------------------------

--
-- Table structure for table `user_notification_settings`
--

CREATE TABLE `user_notification_settings` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `emailNotifications` tinyint(1) NOT NULL DEFAULT 1,
  `pushNotifications` tinyint(1) NOT NULL DEFAULT 1,
  `smsNotifications` tinyint(1) NOT NULL DEFAULT 0,
  `orderUpdates` tinyint(1) NOT NULL DEFAULT 1,
  `promotionalEmails` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `verification_tokens`
--

CREATE TABLE `verification_tokens` (
  `identifier` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('0d60a9da-b147-4d1f-b332-347383232a8d', '719896c479402f452b2fe928eb556bc063a06a6dc8c604518886d84b15242df6', '2025-05-26 14:55:22.457', '20250521175945_add_sku_and_weight', NULL, NULL, '2025-05-26 14:55:22.438', 1),
('64e5d694-12f7-4b26-b170-330fec739d6b', 'ae15ab97f903a5d8e57ddc0a8462b651023c9349798c725513ecb87f9be2fa5f', '2025-05-26 14:55:22.226', '20250521111459_init', NULL, NULL, '2025-05-26 14:55:21.137', 1),
('bdfaee8d-21f5-4917-8c34-d382c1a21665', '96544d986fbd6b0a4623aefbcd20c7abf3dcb87aa8b2ebc84d47e50ba0511004', '2025-05-26 14:55:27.377', '20250526145525_add_payment_proof_and_verification', NULL, NULL, '2025-05-26 14:55:25.653', 1),
('da1bfc97-2c9a-4b60-b841-6c001e6d8cb2', '43f37975bd9e1d978565538af0f5d995f4dbe594a93740292e48e492bdb5d41c', '2025-05-26 14:55:22.434', '20250521114446_update_image_models', NULL, NULL, '2025-05-26 14:55:22.230', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `accounts_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  ADD KEY `accounts_userId_fkey` (`userId`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `carts_userId_key` (`userId`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_publicId_key` (`publicId`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_userId_fkey` (`userId`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_orderNumber_key` (`orderNumber`),
  ADD KEY `orders_userId_fkey` (`userId`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_orderId_fkey` (`orderId`),
  ADD KEY `order_items_productId_fkey` (`productId`),
  ADD KEY `order_items_serviceId_fkey` (`serviceId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_orderId_fkey` (`orderId`),
  ADD KEY `payments_verifiedBy_fkey` (`verifiedBy`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_publicId_key` (`publicId`),
  ADD KEY `products_categoryId_fkey` (`categoryId`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_productId_fkey` (`productId`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviews_userId_fkey` (`userId`),
  ADD KEY `reviews_productId_fkey` (`productId`),
  ADD KEY `reviews_serviceId_fkey` (`serviceId`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `services_publicId_key` (`publicId`),
  ADD KEY `services_categoryId_fkey` (`categoryId`);

--
-- Indexes for table `service_images`
--
ALTER TABLE `service_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_images_serviceId_fkey` (`serviceId`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sessions_sessionToken_key` (`sessionToken`),
  ADD KEY `sessions_userId_fkey` (`userId`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_key` (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`);

--
-- Indexes for table `user_notification_settings`
--
ALTER TABLE `user_notification_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_notification_settings_userId_key` (`userId`);

--
-- Indexes for table `verification_tokens`
--
ALTER TABLE `verification_tokens`
  ADD UNIQUE KEY `verification_tokens_token_key` (`token`),
  ADD UNIQUE KEY `verification_tokens_identifier_token_key` (`identifier`,`token`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `service_images`
--
ALTER TABLE `service_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_notification_settings`
--
ALTER TABLE `user_notification_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
