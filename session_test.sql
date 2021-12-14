-- MySQL dump 10.13  Distrib 8.0.18, for macos10.14 (x86_64)
--
-- Host: localhost    Database: session_test
-- ------------------------------------------------------
-- Server version	8.0.18

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `EmailTemplates`
--

DROP TABLE IF EXISTS `EmailTemplates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EmailTemplates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EmailTemplates`
--

LOCK TABLES `EmailTemplates` WRITE;
/*!40000 ALTER TABLE `EmailTemplates` DISABLE KEYS */;
INSERT INTO `EmailTemplates` VALUES (1,'welcome','Welcome to builderbook.org','<%= userName %>, <p> Thanks for signing up for Builder Book! </p> <p> In our books, we teach you how to build complete, production-ready web apps from scratch. </p> Kelly & Timur, Team Builder Book','2021-10-26 15:07:18','2021-10-26 15:07:18');
/*!40000 ALTER TABLE `EmailTemplates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Groups`
--

DROP TABLE IF EXISTS `Groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Groups`
--

LOCK TABLES `Groups` WRITE;
/*!40000 ALTER TABLE `Groups` DISABLE KEYS */;
INSERT INTO `Groups` VALUES (6,'chloe.cai@nhfc.com','management','2021-11-18 18:21:07','2021-11-18 18:21:07'),(7,'mindy.eng@nhfc.com','management','2021-11-18 18:21:07','2021-11-18 18:21:07'),(8,'rachel.miller@nhfc.com','management','2021-11-18 18:21:07','2021-11-18 18:21:07'),(9,'nhfc-mgmt-test@nhfc.com','management','2021-11-18 18:21:07','2021-11-18 18:21:07'),(10,'jia.wang@nhfc.com','ai','2021-11-18 18:21:07','2021-11-18 18:21:07'),(11,'johnzhang98@yahoo.com','management','2021-12-09 16:03:57','2021-12-09 16:04:03');
/*!40000 ALTER TABLE `Groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sessions`
--

DROP TABLE IF EXISTS `Sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sessions` (
  `session_id` varchar(32) NOT NULL,
  `expires` datetime DEFAULT NULL,
  `data` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sessions`
--

LOCK TABLES `Sessions` WRITE;
/*!40000 ALTER TABLE `Sessions` DISABLE KEYS */;
INSERT INTO `Sessions` VALUES ('DCWmxBwWqsyk19_YtsdAJYlyqEkBaPAV','2021-12-14 21:05:23','{\"cookie\":{\"originalMaxAge\":1209600000,\"expires\":\"2021-12-14T21:05:04.445Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":7},\"expires\":\"2021-12-14T21:05:04.445Z\"}','2021-11-19 15:25:04','2021-11-30 21:05:23'),('G0I5ZLdLiXHg0JwvEbFOiwonySq5vn-H','2021-12-23 21:15:28','{\"cookie\":{\"originalMaxAge\":1209600000,\"expires\":\"2021-12-23T20:54:34.942Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":7},\"expires\":\"2021-12-23T20:54:34.942Z\"}','2021-12-01 01:21:29','2021-12-09 21:15:28'),('rycRWvdsUogssXc68FE59rlP6YIl8UzR','2021-12-15 01:02:43','{\"cookie\":{\"originalMaxAge\":1209600000,\"expires\":\"2021-12-14T22:26:45.431Z\",\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":7},\"expires\":\"2021-12-14T22:26:45.431Z\"}','2021-11-30 22:26:45','2021-12-01 01:02:43');
/*!40000 ALTER TABLE `Sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `displayName` varchar(255) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `avatarUrl` varchar(255) NOT NULL,
  `googleAccessToken` varchar(255) DEFAULT NULL,
  `googleRefreshToken` varchar(255) DEFAULT NULL,
  `googleId` varchar(255) NOT NULL,
  `isAdmin` tinyint(1) DEFAULT '0',
  `isManagement` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `googleId` (`googleId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (6,'Jia Wang','jia-wang','jia.wang@nhfc.com','ai','https://lh3.googleusercontent.com/a/AATXAJx69e3M3zpk5k1pQbmVliXY_qjruvxeXcBtxqZ3=s96-c','ya29.a0ARrdaM_RLLM5IvAxJzb9qeeWIwprGpIjnBFLonLPAvzIjv-2FBxmgHsBLnUk2IVUX7g7-Gn0WVgQKyAXmSoAoFl344Y6vHMzNp84clXsM136Uvpctor3ln-RR4UdHslWTXkOoRd4KK6sf6P8eOaEwSG5j5jGKg',NULL,'100018576009784682395',1,0,'2021-11-18 20:01:56','2021-11-30 01:20:39'),(7,'nhfc mgmt test','nhfc-mgmt-test','nhfc-mgmt-test@nhfc.com','management','https://lh3.googleusercontent.com/a/AATXAJxq3bvikm6Tf2cjh4mW_7B7pA7seUOkcnyHJZQz=s96-c','ya29.a0ARrdaM_kj6m_czeVpC84vWJ5cew0lz9f-UKUc4FqQiW_dsxZ95u7dTAzfMleuyq4EPQE0j8h-sNfjK0dW5tEQL-sRf8zU8ELWEaeV53whhvKAorGhbGj1sKJvzFeS9DUO3iOZBoq6BWlYTzu0vnKpu3HH32lAQ',NULL,'109147215967440968788',0,1,'2021-11-18 20:17:35','2021-12-09 20:54:34');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-12-13 11:23:38
