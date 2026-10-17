import os
import json
import random
from datetime import datetime, timedelta, timezone

# Base products from StarTech catalog
PRODUCTS = [
  {
    "id": "prod-1",
    "name": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
    "sku": "GPU-RTX4070TI-16G",
    "category": "Graphics Cards",
    "brand": "Zotac Gaming",
    "retailPrice": 118500,
    "costPrice": 94000,
    "stockCount": 38,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Banani Central Vault #B4",
    "warranty": "3 Years Official"
  },
  {
    "id": "prod-2",
    "name": "MSI GeForce RTX 4060 Ventus 2X Black 8GB OC GDDR6",
    "sku": "GPU-RTX4060-8G",
    "category": "Graphics Cards",
    "brand": "MSI",
    "retailPrice": 38500,
    "costPrice": 31500,
    "stockCount": 74,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Showroom Shelf #G2",
    "warranty": "3 Years Replacement"
  },
  {
    "id": "prod-3",
    "name": "ASUS TUF Gaming GeForce RTX 4080 Super 16GB GDDR6X",
    "sku": "GPU-RTX4080S-16G",
    "category": "Graphics Cards",
    "brand": "ASUS",
    "retailPrice": 148000,
    "costPrice": 122000,
    "stockCount": 14,
    "unit": "Units",
    "minThreshold": 10,
    "location": "Banani Vault #B1",
    "warranty": "3 Years Official"
  },
  {
    "id": "prod-4",
    "name": "Sapphire PULSE AMD Radeon RX 7800 XT 16GB Gaming GPU",
    "sku": "GPU-RX7800XT-16G",
    "category": "Graphics Cards",
    "brand": "Sapphire",
    "retailPrice": 68500,
    "costPrice": 55000,
    "stockCount": 22,
    "unit": "Units",
    "minThreshold": 12,
    "location": "Multiplan Branch #M1",
    "warranty": "2 Years"
  },
  {
    "id": "prod-5",
    "name": "Intel Core i7-14700K 20-Core 28-Thread LGA1700 Processor",
    "sku": "CPU-INTEL-14700K",
    "category": "Processors",
    "brand": "Intel",
    "retailPrice": 48000,
    "costPrice": 38500,
    "stockCount": 28,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Banani Central Vault #A1",
    "warranty": "3 Years Replacement"
  },
  {
    "id": "prod-6",
    "name": "Intel Core i5-14400 10-Core 16-Thread Desktop Processor",
    "sku": "CPU-INTEL-14400",
    "category": "Processors",
    "brand": "Intel",
    "retailPrice": 24500,
    "costPrice": 19800,
    "stockCount": 65,
    "unit": "Units",
    "minThreshold": 25,
    "location": "Showroom Shelf #C1",
    "warranty": "3 Years Replacement"
  },
  {
    "id": "prod-7",
    "name": "AMD Ryzen 7 7800X3D 8-Core 16-Thread Gaming Processor",
    "sku": "CPU-AMD-7800X3D",
    "category": "Processors",
    "brand": "AMD",
    "retailPrice": 52000,
    "costPrice": 41000,
    "stockCount": 19,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Banani Central Vault #A2",
    "warranty": "3 Years Official"
  },
  {
    "id": "prod-8",
    "name": "AMD Ryzen 5 7600X 6-Core 12-Thread AM5 Gaming Processor",
    "sku": "CPU-AMD-7600X",
    "category": "Processors",
    "brand": "AMD",
    "retailPrice": 26000,
    "costPrice": 20500,
    "stockCount": 42,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Multiplan Branch #A3",
    "warranty": "3 Years Official"
  },
  {
    "id": "prod-9",
    "name": "ASUS ROG Strix Z790-E Gaming WiFi II DDR5 Motherboard",
    "sku": "MB-ASUS-Z790E-WIFI",
    "category": "Motherboards",
    "brand": "ASUS",
    "retailPrice": 62000,
    "costPrice": 49500,
    "stockCount": 16,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Banani Vault #M2",
    "warranty": "3 Years Official"
  },
  {
    "id": "prod-10",
    "name": "MSI PRO B760M-A WiFi DDR5 mATX Motherboard",
    "sku": "MB-MSI-B760M-PRO",
    "category": "Motherboards",
    "brand": "MSI",
    "retailPrice": 19500,
    "costPrice": 15200,
    "stockCount": 48,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Warehouse Shelf #M4",
    "warranty": "3 Years"
  },
  {
    "id": "prod-11",
    "name": "Gigabyte B650M Gaming WiFi AM5 Motherboard",
    "sku": "MB-GIGABYTE-B650M",
    "category": "Motherboards",
    "brand": "Gigabyte",
    "retailPrice": 17800,
    "costPrice": 14000,
    "stockCount": 54,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Showroom Shelf #M5",
    "warranty": "3 Years"
  },
  {
    "id": "prod-12",
    "name": "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30",
    "sku": "RAM-CORSAIR-32GB-DDR5",
    "category": "Memory (RAM)",
    "brand": "Corsair",
    "retailPrice": 15200,
    "costPrice": 11800,
    "stockCount": 95,
    "unit": "Kits",
    "minThreshold": 30,
    "location": "Warehouse Shelf #R2",
    "warranty": "Lifetime Official"
  },
  {
    "id": "prod-13",
    "name": "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5 6400MHz",
    "sku": "RAM-GSKILL-32GB-DDR5",
    "category": "Memory (RAM)",
    "brand": "G.Skill",
    "retailPrice": 18500,
    "costPrice": 14200,
    "stockCount": 58,
    "unit": "Kits",
    "minThreshold": 25,
    "location": "Banani Vault #R1",
    "warranty": "Lifetime Official"
  },
  {
    "id": "prod-14",
    "name": "Team T-Force Delta RGB 16GB (2x8GB) DDR4 3200MHz",
    "sku": "RAM-TEAM-16GB-DDR4",
    "category": "Memory (RAM)",
    "brand": "TeamGroup",
    "retailPrice": 5800,
    "costPrice": 4200,
    "stockCount": 120,
    "unit": "Kits",
    "minThreshold": 40,
    "location": "Warehouse Shelf #R3",
    "warranty": "Lifetime Official"
  },
  {
    "id": "prod-15",
    "name": "Samsung 990 Pro 2TB PCIe 4.0 M.2 NVMe Internal SSD",
    "sku": "SSD-SAMSUNG-990P-2TB",
    "category": "Storage",
    "brand": "Samsung",
    "retailPrice": 22500,
    "costPrice": 17200,
    "stockCount": 62,
    "unit": "Units",
    "minThreshold": 25,
    "location": "Warehouse Shelf #S1",
    "warranty": "5 Years"
  },
  {
    "id": "prod-16",
    "name": "Western Digital Black SN850X 1TB PCIe 4.0 NVMe SSD",
    "sku": "SSD-WD-BLACK-1TB",
    "category": "Storage",
    "brand": "Western Digital",
    "retailPrice": 12800,
    "costPrice": 9800,
    "stockCount": 82,
    "unit": "Units",
    "minThreshold": 30,
    "location": "Warehouse Shelf #S2",
    "warranty": "5 Years"
  },
  {
    "id": "prod-17",
    "name": "Kingston NV2 1TB PCIe 4.0 M.2 NVMe SSD",
    "sku": "SSD-KINGSTON-NV2-1TB",
    "category": "Storage",
    "brand": "Kingston",
    "retailPrice": 7400,
    "costPrice": 5600,
    "stockCount": 145,
    "unit": "Units",
    "minThreshold": 50,
    "location": "Showroom Shelf #S3",
    "warranty": "3 Years"
  },
  {
    "id": "prod-18",
    "name": "Corsair RM850x 850W 80 PLUS Gold Fully Modular PSU",
    "sku": "PSU-CORSAIR-850W",
    "category": "Power Supplies",
    "brand": "Corsair",
    "retailPrice": 16800,
    "costPrice": 13000,
    "stockCount": 38,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Warehouse Shelf #P3",
    "warranty": "10 Years"
  },
  {
    "id": "prod-19",
    "name": "DeepCool PK650D 650W 80 PLUS Bronze Power Supply",
    "sku": "PSU-DEEPCOOL-650W",
    "category": "Power Supplies",
    "brand": "DeepCool",
    "retailPrice": 5600,
    "costPrice": 4200,
    "stockCount": 72,
    "unit": "Units",
    "minThreshold": 25,
    "location": "Showroom Shelf #P1",
    "warranty": "5 Years"
  },
  {
    "id": "prod-20",
    "name": "MSI MAG CoreLiquid 360R V2 ARGB AIO Liquid CPU Cooler",
    "sku": "COOL-MSI-360R-V2",
    "category": "Cooling",
    "brand": "MSI",
    "retailPrice": 14500,
    "costPrice": 11000,
    "stockCount": 28,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Warehouse Shelf #C1",
    "warranty": "2 Years"
  },
  {
    "id": "prod-21",
    "name": "DeepCool AK400 Zero Dark Performance CPU Air Cooler",
    "sku": "COOL-DEEPCOOL-AK400",
    "category": "Cooling",
    "brand": "DeepCool",
    "retailPrice": 3800,
    "costPrice": 2800,
    "stockCount": 68,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Showroom Shelf #C2",
    "warranty": "3 Years"
  },
  {
    "id": "prod-22",
    "name": "Lian Li O11 Dynamic EVO RGB Gaming Desktop Casing",
    "sku": "CASE-LIANLI-O11D",
    "category": "Casings",
    "brand": "Lian Li",
    "retailPrice": 21500,
    "costPrice": 16800,
    "stockCount": 20,
    "unit": "Units",
    "minThreshold": 12,
    "location": "Banani Vault #K1",
    "warranty": "1 Year"
  },
  {
    "id": "prod-23",
    "name": "Montech Air 903 Max E-ATX Mid-Tower Case with 4x ARGB",
    "sku": "CASE-MONTECH-AIR903",
    "category": "Casings",
    "brand": "Montech",
    "retailPrice": 8200,
    "costPrice": 6200,
    "stockCount": 46,
    "unit": "Units",
    "minThreshold": 20,
    "location": "Warehouse Shelf #K2",
    "warranty": "1 Year"
  },
  {
    "id": "prod-24",
    "name": "LG UltraGear 27GN800-B 27\" QHD 144Hz 1ms IPS Gaming Monitor",
    "sku": "MON-LG-27GN800",
    "category": "Monitors",
    "brand": "LG",
    "retailPrice": 34500,
    "costPrice": 27000,
    "stockCount": 25,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Multiplan Branch #D1",
    "warranty": "3 Years"
  },
  {
    "id": "prod-25",
    "name": "MSI G2412 23.8\" FHD 170Hz 1ms IPS Esports Gaming Monitor",
    "sku": "MON-MSI-G2412",
    "category": "Monitors",
    "brand": "MSI",
    "retailPrice": 18500,
    "costPrice": 14500,
    "stockCount": 35,
    "unit": "Units",
    "minThreshold": 15,
    "location": "Showroom Shelf #D2",
    "warranty": "3 Years"
  },
  {
    "id": "prod-26",
    "name": "ASUS TUF Gaming A15 (Ryzen 7 7735HS, RTX 4060, 16GB, 512GB)",
    "sku": "LAPTOP-ASUS-TUF-A15",
    "category": "Laptops",
    "brand": "ASUS",
    "retailPrice": 142000,
    "costPrice": 118000,
    "stockCount": 11,
    "unit": "Units",
    "minThreshold": 8,
    "location": "Banani Vault #L1",
    "warranty": "2 Years International"
  },
  {
    "id": "prod-27",
    "name": "Lenovo IdeaPad Slim 3 15IRH8 (Core i5 13th Gen, 16GB, 512GB)",
    "sku": "LAPTOP-LENOVO-IP3",
    "category": "Laptops",
    "brand": "Lenovo",
    "retailPrice": 72000,
    "costPrice": 59000,
    "stockCount": 16,
    "unit": "Units",
    "minThreshold": 10,
    "location": "Showroom Shelf #L2",
    "warranty": "2 Years Official"
  }
]

CUSTOMERS = [
  {
    "id": "cust-1",
    "name": "Apex Computer Systems",
    "contactNumber": "+880 1711-234567",
    "deliveryAddress": "Shop 402, Level 4, Multiplan Center, Elephant Road, Dhaka-1205",
    "customerType": "Wholesale",
    "binNumber": "003492817-0101",
    "totalPurchases": 3450000
  },
  {
    "id": "cust-2",
    "name": "Star IT Solutions Ltd.",
    "contactNumber": "+880 1819-876543",
    "deliveryAddress": "BCS Computer City, IDB Bhaban, Rokeya Sarani, Agargaon, Dhaka",
    "customerType": "Wholesale",
    "binNumber": "002918471-0203",
    "totalPurchases": 2850000
  },
  {
    "id": "cust-3",
    "name": "Dhaka Cyber Gaming Cafe",
    "contactNumber": "+880 1610-998877",
    "deliveryAddress": "House 14, Road 27, Dhanmondi, Dhaka-1209",
    "customerType": "Corporate",
    "binNumber": "001837492-0104",
    "totalPurchases": 1650000
  },
  {
    "id": "cust-4",
    "name": "TechLand BD Partner Store",
    "contactNumber": "+880 1912-345678",
    "deliveryAddress": "Level 3, Multiplan Center, Elephant Road, Dhaka",
    "customerType": "Wholesale",
    "binNumber": "004829103-0102",
    "totalPurchases": 4200000
  },
  {
    "id": "cust-5",
    "name": "UCC Tech World B2B Consignment",
    "contactNumber": "+880 1722-334455",
    "deliveryAddress": "Eastern Plus Market, Shantinagar, Dhaka-1217",
    "customerType": "Wholesale",
    "binNumber": "005829183-0201",
    "totalPurchases": 3100000
  },
  {
    "id": "cust-6",
    "name": "Chittagong Tech Point",
    "contactNumber": "+880 1611-987654",
    "deliveryAddress": "Shop 12, Ground Floor, Central Plaza, GEC Circle, Chattogram",
    "customerType": "Wholesale",
    "binNumber": "005829103-0402",
    "totalPurchases": 2600000
  },
  {
    "id": "cust-7",
    "name": "Daffodil International University Robotics Lab",
    "contactNumber": "+880 1515-456789",
    "deliveryAddress": "Engineering Dept, Daffodil Smart City, Ashulia, Dhaka",
    "customerType": "Corporate",
    "binNumber": "006918274-0201",
    "totalPurchases": 1480000
  },
  {
    "id": "cust-8",
    "name": "Brain Station 23 Workstation Unit",
    "contactNumber": "+880 1733-112233",
    "deliveryAddress": "Building 2, Mohakhali DOHS, Dhaka-1206",
    "customerType": "Corporate",
    "binNumber": "007829102-0105",
    "totalPurchases": 2950000
  },
  {
    "id": "cust-9",
    "name": "Sylhet Digital World",
    "contactNumber": "+880 1822-445566",
    "deliveryAddress": "Millennium Market, Zindabazar, Sylhet-3100",
    "customerType": "Wholesale",
    "binNumber": "008918273-0301",
    "totalPurchases": 1950000
  },
  {
    "id": "cust-10",
    "name": "Rajshahi IT Zone",
    "contactNumber": "+880 1933-556677",
    "deliveryAddress": "Shop 8, New Market, Alokar More, Rajshahi-6000",
    "customerType": "Wholesale",
    "binNumber": "009817263-0401",
    "totalPurchases": 1250000
  },
  {
    "id": "cust-11",
    "name": "Khulna Computer Hub",
    "contactNumber": "+880 1644-667788",
    "deliveryAddress": "Jolil Tower, Upper Jashore Road, Khulna-9100",
    "customerType": "Wholesale",
    "binNumber": "001928374-0501",
    "totalPurchases": 980000
  },
  {
    "id": "cust-12",
    "name": "Bogura Tech Express",
    "contactNumber": "+880 1755-778899",
    "deliveryAddress": "Rangpur Road, Jaleshwaritola, Bogura-5800",
    "customerType": "Wholesale",
    "binNumber": "002837465-0601",
    "totalPurchases": 820000
  },
  {
    "id": "cust-13",
    "name": "RedLine eSports Club",
    "contactNumber": "+880 1866-889900",
    "deliveryAddress": "Sector 7, Uttara Model Town, Dhaka-1230",
    "customerType": "Corporate",
    "binNumber": "003746582-0108",
    "totalPurchases": 740000
  },
  {
    "id": "cust-14",
    "name": "Banani Showroom Walk-in Client",
    "contactNumber": "+880 1700-000001",
    "deliveryAddress": "Plot 18, Road 11, Block D, Banani, Dhaka",
    "customerType": "Retail",
    "totalPurchases": 185000
  },
  {
    "id": "cust-15",
    "name": "Elephant Road Walk-in Client",
    "contactNumber": "+880 1700-000002",
    "deliveryAddress": "Level 4, Multiplan Center, Elephant Road, Dhaka",
    "customerType": "Retail",
    "totalPurchases": 142000
  }
]

# Supplier POs
SUPPLIER_POS = [
  {
    "id": "po-1",
    "poNumber": "PO-2026-ASUS-091",
    "supplierName": "ASUS Regional Distribution (Singapore)",
    "items": "30x ROG Strix Z790-E Motherboards, 15x TUF RTX 4080 Super",
    "productId": "prod-9",
    "quantity": 45,
    "totalCost": 3315000,
    "orderDate": "08 Oct 2026",
    "status": "Port Customs",
    "expectedDelivery": "Chittagong Port Terminal (Customs Clearance)"
  },
  {
    "id": "po-2",
    "poNumber": "PO-2026-INTEL-084",
    "supplierName": "Intel South Asia Authorized Distributor",
    "items": "50x Core i7-14700K, 60x Core i5-14400 Processors",
    "productId": "prod-5",
    "quantity": 110,
    "totalCost": 3113000,
    "orderDate": "11 Oct 2026",
    "status": "In Transit",
    "expectedDelivery": "En route to Banani Vault via DHL Freight"
  },
  {
    "id": "po-3",
    "poNumber": "PO-2026-ZOTAC-112",
    "supplierName": "Zotac Technology Limited (Hong Kong)",
    "items": "40x GeForce RTX 4070 Ti Super 16GB",
    "productId": "prod-1",
    "quantity": 40,
    "totalCost": 3760000,
    "orderDate": "25 Sep 2026",
    "status": "Received",
    "expectedDelivery": "Warehouse Received & Serialized"
  },
  {
    "id": "po-4",
    "poNumber": "PO-2026-SAMSUNG-045",
    "supplierName": "Samsung Electronics APAC Logistics",
    "items": "100x Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD",
    "productId": "prod-15",
    "quantity": 100,
    "totalCost": 1720000,
    "orderDate": "14 Sep 2026",
    "status": "Received",
    "expectedDelivery": "Warehouse Stocked"
  },
  {
    "id": "po-5",
    "poNumber": "PO-2026-CORSAIR-063",
    "supplierName": "Corsair Components Pte Ltd",
    "items": "80x Vengeance RGB 32GB DDR5, 40x RM850x 850W Gold PSUs",
    "productId": "prod-12",
    "quantity": 120,
    "totalCost": 1464000,
    "orderDate": "28 Aug 2026",
    "status": "Received",
    "expectedDelivery": "Warehouse Stocked"
  },
  {
    "id": "po-6",
    "poNumber": "PO-2026-MSI-078",
    "supplierName": "Micro-Star International Taiwan Co.",
    "items": "50x MSI RTX 4060 Ventus, 40x MSI G2412 170Hz Monitors",
    "productId": "prod-2",
    "quantity": 90,
    "totalCost": 2155000,
    "orderDate": "12 Aug 2026",
    "status": "Received",
    "expectedDelivery": "Warehouse Stocked"
  }
]

print("Loaded base product and customer catalogues.")

# Realistic sales schedule across 5 months (May to Oct 2026)
ORDER_SCHEDULE = [
  # May 2026 (8 orders)
  {"num": "ORD-2026-0501", "date": "04 May 2026, 11:30 AM", "iso": "2026-05-04T11:30:00Z", "cust_idx": 0, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(0, 2), (11, 4)]},
  {"num": "ORD-2026-0502", "date": "08 May 2026, 02:15 PM", "iso": "2026-05-08T14:15:00Z", "cust_idx": 1, "type": "online", "courier": "Pathao", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(4, 3), (8, 3), (14, 3)]},
  {"num": "ORD-2026-0503", "date": "12 May 2026, 04:45 PM", "iso": "2026-05-12T16:45:00Z", "cust_idx": 5, "type": "online", "courier": "Steadfast", "city": "Chattogram", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(1, 5), (5, 5), (9, 5)]},
  {"num": "ORD-2026-0504", "date": "16 May 2026, 12:10 PM", "iso": "2026-05-16T12:10:00Z", "cust_idx": 2, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "bkash", "pay_s": "Paid", "stat": "Counter Collected", "salesman": "Tanvir Ahmed", "items": [(6, 2), (11, 2), (17, 2)]},
  {"num": "ORD-2026-0505", "date": "19 May 2026, 03:30 PM", "iso": "2026-05-19T15:30:00Z", "cust_idx": 3, "type": "online", "courier": "Pathao", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(2, 2), (4, 2), (14, 4)]},
  {"num": "ORD-2026-0506", "date": "22 May 2026, 05:00 PM", "iso": "2026-05-22T17:00:00Z", "cust_idx": 13, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "cash", "pay_s": "Paid", "stat": "Counter Collected", "salesman": "Tanvir Ahmed", "items": [(1, 1), (5, 1), (18, 1), (22, 1)]},
  {"num": "ORD-2026-0507", "date": "27 May 2026, 01:20 PM", "iso": "2026-05-27T13:20:00Z", "cust_idx": 8, "type": "online", "courier": "Pathao", "city": "Sylhet", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(3, 2), (7, 2), (10, 2)]},
  {"num": "ORD-2026-0508", "date": "30 May 2026, 06:15 PM", "iso": "2026-05-30T18:15:00Z", "cust_idx": 6, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(4, 4), (12, 4), (14, 4), (23, 2)]},

  # June 2026 (8 orders)
  {"num": "ORD-2026-0601", "date": "03 Jun 2026, 11:00 AM", "iso": "2026-06-03T11:00:00Z", "cust_idx": 0, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(0, 3), (17, 3), (21, 3)]},
  {"num": "ORD-2026-0602", "date": "07 Jun 2026, 02:40 PM", "iso": "2026-06-07T14:40:00Z", "cust_idx": 4, "type": "online", "courier": "Pathao", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(1, 4), (11, 4), (16, 8)]},
  {"num": "ORD-2026-0603", "date": "11 Jun 2026, 04:10 PM", "iso": "2026-06-11T16:10:00Z", "cust_idx": 9, "type": "online", "courier": "Steadfast", "city": "Rajshahi", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(5, 3), (9, 3), (18, 3), (20, 3)]},
  {"num": "ORD-2026-0604", "date": "16 Jun 2026, 12:30 PM", "iso": "2026-06-16T12:30:00Z", "cust_idx": 7, "type": "online", "courier": "Pathao", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(2, 1), (4, 2), (12, 2), (25, 2)]},
  {"num": "ORD-2026-0605", "date": "20 Jun 2026, 03:50 PM", "iso": "2026-06-20T15:50:00Z", "cust_idx": 14, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "cash", "pay_s": "Paid", "stat": "Counter Collected", "salesman": "Tanvir Ahmed", "items": [(6, 1), (10, 1), (15, 1)]},
  {"num": "ORD-2026-0606", "date": "24 Jun 2026, 05:15 PM", "iso": "2026-06-24T17:15:00Z", "cust_idx": 1, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(0, 2), (8, 2), (19, 2)]},
  {"num": "ORD-2026-0607", "date": "27 Jun 2026, 01:45 PM", "iso": "2026-06-27T13:45:00Z", "cust_idx": 10, "type": "online", "courier": "Steadfast", "city": "Khulna", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(3, 2), (7, 2), (17, 2)]},
  {"num": "ORD-2026-0608", "date": "29 Jun 2026, 06:00 PM", "iso": "2026-06-29T18:00:00Z", "cust_idx": 12, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "bkash", "pay_s": "Paid", "stat": "Counter Collected", "salesman": "Tanvir Ahmed", "items": [(1, 3), (5, 3), (24, 3)]},

  # July 2026 (8 orders)
  {"num": "ORD-2026-0701", "date": "02 Jul 2026, 11:20 AM", "iso": "2026-07-02T11:20:00Z", "cust_idx": 0, "type": "online", "courier": "Pathao", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(2, 2), (4, 4), (14, 4)]},
  {"num": "ORD-2026-0702", "date": "06 Jul 2026, 02:10 PM", "iso": "2026-07-06T14:10:00Z", "cust_idx": 5, "type": "online", "courier": "Steadfast", "city": "Chattogram", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(0, 2), (1, 3), (11, 5)]},
  {"num": "ORD-2026-0703", "date": "10 Jul 2026, 04:30 PM", "iso": "2026-07-10T16:30:00Z", "cust_idx": 2, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Counter Collected", "salesman": "Tanvir Ahmed", "items": [(6, 3), (12, 3), (21, 3)]},
  {"num": "ORD-2026-0704", "date": "15 Jul 2026, 12:45 PM", "iso": "2026-07-15T12:45:00Z", "cust_idx": 11, "type": "online", "courier": "Steadfast", "city": "Bogura", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(1, 2), (5, 2), (16, 4)]},
  {"num": "ORD-2026-0705", "date": "19 Jul 2026, 03:15 PM", "iso": "2026-07-19T15:15:00Z", "cust_idx": 3, "type": "online", "courier": "Pathao", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(3, 2), (7, 2), (17, 2), (23, 2)]},
  {"num": "ORD-2026-0706", "date": "23 Jul 2026, 05:40 PM", "iso": "2026-07-23T17:40:00Z", "cust_idx": 13, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "bkash", "pay_s": "Paid", "stat": "Counter Collected", "salesman": "Tanvir Ahmed", "items": [(25, 1)]},
  {"num": "ORD-2026-0707", "date": "27 Jul 2026, 01:10 PM", "iso": "2026-07-27T13:10:00Z", "cust_idx": 8, "type": "online", "courier": "Pathao", "city": "Sylhet", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(4, 2), (8, 2), (14, 2)]},
  {"num": "ORD-2026-0708", "date": "31 Jul 2026, 06:20 PM", "iso": "2026-07-31T18:20:00Z", "cust_idx": 1, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(0, 2), (9, 2), (12, 4)]},

  # August 2026 (8 orders)
  {"num": "ORD-2026-0801", "date": "04 Aug 2026, 11:40 AM", "iso": "2026-08-04T11:40:00Z", "cust_idx": 4, "type": "online", "courier": "Pathao", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(1, 5), (5, 5), (16, 10)]},
  {"num": "ORD-2026-0802", "date": "08 Aug 2026, 02:30 PM", "iso": "2026-08-08T14:30:00Z", "cust_idx": 0, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(2, 2), (4, 3), (14, 3)]},
  {"num": "ORD-2026-0803", "date": "12 Aug 2026, 04:15 PM", "iso": "2026-08-12T16:15:00Z", "cust_idx": 6, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(6, 4), (12, 4), (18, 4), (21, 2)]},
  {"num": "ORD-2026-0804", "date": "16 Aug 2026, 12:20 PM", "iso": "2026-08-16T12:20:00Z", "cust_idx": 5, "type": "online", "courier": "Pathao", "city": "Chattogram", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(0, 2), (3, 2), (11, 4)]},
  {"num": "ORD-2026-0805", "date": "20 Aug 2026, 03:40 PM", "iso": "2026-08-20T15:40:00Z", "cust_idx": 14, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "cash", "pay_s": "Paid", "stat": "Counter Collected", "salesman": "Tanvir Ahmed", "items": [(26, 1)]},
  {"num": "ORD-2026-0806", "date": "24 Aug 2026, 05:00 PM", "iso": "2026-08-24T17:00:00Z", "cust_idx": 7, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(4, 3), (8, 3), (14, 4), (23, 2)]},
  {"num": "ORD-2026-0807", "date": "27 Aug 2026, 01:30 PM", "iso": "2026-08-27T13:30:00Z", "cust_idx": 9, "type": "online", "courier": "Steadfast", "city": "Rajshahi", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(1, 3), (5, 3), (17, 3)]},
  {"num": "ORD-2026-0808", "date": "30 Aug 2026, 06:10 PM", "iso": "2026-08-30T18:10:00Z", "cust_idx": 2, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Counter Collected", "salesman": "Tanvir Ahmed", "items": [(7, 2), (10, 2), (18, 2)]},

  # September 2026 (8 orders) - 2 Overdue / Credit 30D for AR tracking
  {"num": "ORD-2026-0901", "date": "03 Sep 2026, 11:15 AM", "iso": "2026-09-03T11:15:00Z", "cust_idx": 1, "type": "online", "courier": "Pathao", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(0, 3), (8, 3), (14, 3)]},
  {"num": "ORD-2026-0902", "date": "07 Sep 2026, 02:20 PM", "iso": "2026-09-07T14:20:00Z", "cust_idx": 0, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(2, 2), (4, 3), (12, 4)]},
  {"num": "ORD-2026-0903", "date": "12 Sep 2026, 04:30 PM", "iso": "2026-09-12T16:30:00Z", "cust_idx": 5, "type": "online", "courier": "Steadfast", "city": "Chattogram", "pay_m": "credit_30d", "pay_s": "Credit 30D", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(0, 3), (1, 4), (11, 5)]},
  {"num": "ORD-2026-0904", "date": "16 Sep 2026, 12:40 PM", "iso": "2026-09-16T12:40:00Z", "cust_idx": 4, "type": "online", "courier": "Pathao", "city": "Dhaka City", "pay_m": "credit_30d", "pay_s": "Credit 30D", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(3, 3), (7, 3), (16, 6)]},
  {"num": "ORD-2026-0905", "date": "20 Sep 2026, 03:10 PM", "iso": "2026-09-20T15:10:00Z", "cust_idx": 10, "type": "online", "courier": "Steadfast", "city": "Khulna", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(4, 2), (9, 2), (18, 2)]},
  {"num": "ORD-2026-0906", "date": "23 Sep 2026, 05:30 PM", "iso": "2026-09-23T17:30:00Z", "cust_idx": 8, "type": "online", "courier": "Pathao", "city": "Sylhet", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(1, 3), (5, 3), (17, 3)]},
  {"num": "ORD-2026-0907", "date": "27 Sep 2026, 01:15 PM", "iso": "2026-09-27T13:15:00Z", "cust_idx": 3, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(0, 1), (6, 2), (12, 2)]},
  {"num": "ORD-2026-0908", "date": "29 Sep 2026, 06:00 PM", "iso": "2026-09-29T18:00:00Z", "cust_idx": 13, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "bkash", "pay_s": "Paid", "stat": "Counter Collected", "salesman": "Tanvir Ahmed", "items": [(19, 1), (20, 1), (22, 1)]},

  # October 2026 (8 orders) - Present day active operations
  {"num": "ORD-2026-1001", "date": "02 Oct 2026, 11:30 AM", "iso": "2026-10-02T11:30:00Z", "cust_idx": 0, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(0, 2), (8, 2), (14, 2)]},
  {"num": "ORD-2026-1002", "date": "05 Oct 2026, 02:45 PM", "iso": "2026-10-05T14:45:00Z", "cust_idx": 1, "type": "online", "courier": "Pathao", "city": "Dhaka City", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "Delivered", "salesman": "Tanvir Ahmed", "items": [(2, 1), (4, 2), (12, 4)]},
  {"num": "ORD-2026-1003", "date": "08 Oct 2026, 04:20 PM", "iso": "2026-10-08T16:20:00Z", "cust_idx": 5, "type": "online", "courier": "Steadfast", "city": "Chattogram", "pay_m": "bank_transfer", "pay_s": "Paid", "stat": "In Transit", "salesman": "Tanvir Ahmed", "items": [(0, 2), (9, 2), (18, 2)]},
  {"num": "ORD-2026-1004", "date": "11 Oct 2026, 12:15 PM", "iso": "2026-10-11T12:15:00Z", "cust_idx": 8, "type": "online", "courier": "Pathao", "city": "Sylhet", "pay_m": "cash", "pay_s": "COD Pending", "stat": "In Transit", "salesman": "Tanvir Ahmed", "items": [(1, 2), (5, 2), (16, 2)]},
  {"num": "ORD-2026-1005", "date": "14 Oct 2026, 03:30 PM", "iso": "2026-10-14T15:30:00Z", "cust_idx": 9, "type": "online", "courier": "Pathao", "city": "Rajshahi", "pay_m": "cash", "pay_s": "COD Pending", "stat": "In Transit", "salesman": "Tanvir Ahmed", "items": [(3, 1), (7, 1), (17, 2)]},
  {"num": "ORD-2026-1006", "date": "16 Oct 2026, 05:10 PM", "iso": "2026-10-16T17:10:00Z", "cust_idx": 2, "type": "online", "courier": "Steadfast", "city": "Dhaka City", "pay_m": "bkash", "pay_s": "Paid", "stat": "Ready for Dispatch", "salesman": "Tanvir Ahmed", "items": [(6, 2), (11, 2), (23, 2)]},
  {"num": "ORD-2026-1007", "date": "17 Oct 2026, 02:25 PM", "iso": "2026-10-17T14:25:00Z", "cust_idx": 13, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "cash", "pay_s": "Paid", "stat": "Counter Collected", "salesman": "Tanvir Ahmed", "items": [(1, 1), (18, 1), (20, 1)]},
  {"num": "ORD-2026-1008", "date": "17 Oct 2026, 04:50 PM", "iso": "2026-10-17T16:50:00Z", "cust_idx": 14, "type": "offline", "courier": None, "city": "Dhaka", "pay_m": "cash", "pay_s": "Paid", "stat": "Processing", "salesman": "Tanvir Ahmed", "items": [(25, 1)]}
]

print(f"Total scheduled orders: {len(ORDER_SCHEDULE)}")

GENERATED_ORDERS = []
for idx, entry in enumerate(ORDER_SCHEDULE):
    cust = CUSTOMERS[entry["cust_idx"]]
    items = []
    summary_parts = []
    subtotal = 0
    for p_idx, qty in entry["items"]:
        p = PRODUCTS[p_idx]
        item_tot = p["retailPrice"] * qty
        subtotal += item_tot
        items.append({
            "productId": p["id"],
            "name": p["name"],
            "sku": p["sku"],
            "quantity": qty,
            "unitPrice": p["retailPrice"],
            "total": item_tot
        })
        summary_parts.append(f"{qty}x {p['name']}")
    
    # Wholesale discount for bulk
    disc_pct = 5 if len(items) > 2 or subtotal > 150000 else 0
    disc_amt = round(subtotal * (disc_pct / 100))
    vat_amt = round((subtotal - disc_amt) * 0.05)
    total_amt = subtotal - disc_amt + vat_amt

    courier_obj = None
    if entry["type"] == "online" and entry["courier"]:
        prov = entry["courier"]
        city = entry["city"]
        is_dhaka = "Dhaka" in city
        fee = 150 if is_dhaka else 250
        cid = f"PTH-{city[:3].upper()}-{10000 + idx * 147}" if prov == "Pathao" else f"STDF-{city[:3].upper()}-{20000 + idx * 231}"
        track_url = f"https://merchant.pathao.com/tracking?consignment_id={cid}" if prov == "Pathao" else f"https://steadfast.com.bd/t/{cid}"
        c_stat = "Delivered" if entry["stat"] == "Delivered" else ("In Transit" if entry["stat"] == "In Transit" else "Awaiting Rider Pickup")
        cod = total_amt if entry["pay_s"] == "COD Pending" else 0
        courier_obj = {
            "provider": prov,
            "consignmentId": cid,
            "trackingUrl": track_url,
            "status": c_stat,
            "codAmount": cod,
            "deliveryFee": fee,
            "recipientCity": city,
            "dispatchedAt": entry["date"]
        }

    GENERATED_ORDERS.append({
        "id": f"ord-{idx + 1}",
        "orderNumber": entry["num"],
        "orderType": entry["type"],
        "customerName": cust["name"],
        "contactNumber": cust["contactNumber"],
        "deliveryAddress": cust["deliveryAddress"],
        "items": items,
        "itemsSummary": ", ".join(summary_parts),
        "subtotal": subtotal,
        "discountAmount": disc_amt,
        "discountPercent": disc_pct,
        "vatAmount": vat_amt,
        "totalAmount": total_amt,
        "paymentMethod": entry["pay_m"],
        "paymentStatus": entry["pay_s"],
        "status": entry["stat"],
        "courier": courier_obj,
        "orderDate": entry["date"],
        "salesman": entry["salesman"]
    })

tot_revenue = sum(o["totalAmount"] for o in GENERATED_ORDERS)
print(f"Generated {len(GENERATED_ORDERS)} orders. Total 5-month sales: ৳{tot_revenue:,.2f}")

# -------------------------------------------------------------
# 1. Output StoreContext.tsx
# -------------------------------------------------------------
ts_content = f"""import React, {{ createContext, useContext, useState, useEffect }} from 'react';

export interface Product {{
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  retailPrice: number;
  costPrice: number;
  stockCount: number;
  unit: string;
  minThreshold: number;
  location: string;
  warranty: string;
}}

export interface Customer {{
  id: string;
  name: string;
  contactNumber: string;
  deliveryAddress: string;
  customerType: 'Wholesale' | 'Retail' | 'Corporate';
  binNumber?: string;
  totalPurchases?: number;
}}

export interface CourierDispatch {{
  provider: 'Pathao' | 'Steadfast' | 'RedX';
  consignmentId: string;
  trackingUrl: string;
  status: 'Awaiting Rider Pickup' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  codAmount: number;
  deliveryFee: number;
  recipientCity: string;
  dispatchedAt: string;
}}

export interface OrderItem {{
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}}

export interface Order {{
  id: string;
  orderNumber: string;
  orderType: 'online' | 'offline';
  customerName: string;
  contactNumber: string;
  deliveryAddress: string;
  items: OrderItem[];
  itemsSummary: string;
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bkash' | 'bank_transfer' | 'credit_30d';
  paymentStatus: 'Paid' | 'Credit 30D' | 'Partial' | 'COD Pending';
  status: 'Processing' | 'Ready for Dispatch' | 'In Transit' | 'Delivered' | 'Counter Collected';
  courier?: CourierDispatch | null;
  orderDate: string;
  salesman: string;
}}

export interface SupplierPO {{
  id: string;
  poNumber: string;
  supplierName: string;
  items: string;
  productId: string;
  quantity: number;
  totalCost: number;
  orderDate: string;
  status: 'In Transit' | 'Port Customs' | 'Received';
  expectedDelivery: string;
}}

interface StoreContextType {{
  products: Product[];
  orders: Order[];
  customers: Customer[];
  purchaseOrders: SupplierPO[];
  addStock: (productId: string, quantity: number, unitCost?: number) => void;
  addNewProduct: (product: Omit<Product, 'id'>) => void;
  addNewCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  dispatchWithCourier: (
    orderId: string, 
    provider: 'Pathao' | 'Steadfast' | 'RedX', 
    options?: {{ deliveryFee?: number; codAmount?: number }}
  ) => void;
  createPurchaseOrder: (poData: {{
    supplierName: string;
    productId: string;
    quantity: number;
    totalCost: number;
    itemsSummary: string;
  }}) => void;
  createSaleOrder: (orderData: {{
    customerName: string;
    contactNumber: string;
    deliveryAddress: string;
    items: {{ product: Product; quantity: number; unitPrice?: number }}[];
    discountPercent: number;
    discountAmountFlat?: number;
    orderType?: 'online' | 'offline';
    paymentMethod: 'cash' | 'bkash' | 'bank_transfer' | 'credit_30d';
    salesman: string;
  }}) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  receivePurchaseOrder: (poId: string) => void;
  metrics: {{
    totalSalesRevenue: number;
    salesTodayCount: number;
    salesTodayRevenue: number;
    pendingOrdersCount: number;
    totalStockUnits: number;
    totalStockValue: number;
    totalCostValue: number;
    salesmanMonthSales: number;
    salesmanCommission: number;
  }};
}}

export const defaultProducts: Product[] = {json.dumps(PRODUCTS, indent=2)};

export const defaultCustomers: Customer[] = {json.dumps(CUSTOMERS, indent=2)};

export const defaultOrders: Order[] = {json.dumps(GENERATED_ORDERS, indent=2)};

export const defaultPOs: SupplierPO[] = {json.dumps(SUPPLIER_POS, indent=2)};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{{ children: React.ReactNode }}> = ({{ children }}) => {{
  // Load products (fallback to latest full catalogue if cached catalogue has fewer items)
  const [products, setProducts] = useState<Product[]>(() => {{
    const saved = localStorage.getItem('dhaka_silicon_products_v2') || localStorage.getItem('dhaka_silicon_products');
    if (saved) {{
      try {{
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) return parsed;
      }} catch (e) {{}}
    }}
    return defaultProducts;
  }});

  // Load orders (fallback to full 5-month history if cached orders is small)
  const [orders, setOrders] = useState<Order[]>(() => {{
    const saved = localStorage.getItem('dhaka_silicon_orders_v2') || localStorage.getItem('dhaka_silicon_orders');
    if (saved) {{
      try {{
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 25) return parsed;
      }} catch (e) {{}}
    }}
    return defaultOrders;
  }});

  const [customers, setCustomers] = useState<Customer[]>(() => {{
    const saved = localStorage.getItem('dhaka_silicon_customers_v2') || localStorage.getItem('dhaka_silicon_customers');
    if (saved) {{
      try {{
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }} catch (e) {{}}
    }}
    return defaultCustomers;
  }});

  const [purchaseOrders, setPurchaseOrders] = useState<SupplierPO[]>(() => {{
    const saved = localStorage.getItem('dhaka_silicon_pos_v2') || localStorage.getItem('dhaka_silicon_pos');
    if (saved) {{
      try {{
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
      }} catch (e) {{}}
    }}
    return defaultPOs;
  }});

  // Save changes to localStorage for state persistence
  useEffect(() => {{
    localStorage.setItem('dhaka_silicon_products_v2', JSON.stringify(products));
    localStorage.setItem('dhaka_silicon_products', JSON.stringify(products));
  }}, [products]);

  useEffect(() => {{
    localStorage.setItem('dhaka_silicon_orders_v2', JSON.stringify(orders));
    localStorage.setItem('dhaka_silicon_orders', JSON.stringify(orders));
  }}, [orders]);

  useEffect(() => {{
    localStorage.setItem('dhaka_silicon_customers_v2', JSON.stringify(customers));
    localStorage.setItem('dhaka_silicon_customers', JSON.stringify(customers));
  }}, [customers]);

  useEffect(() => {{
    localStorage.setItem('dhaka_silicon_pos_v2', JSON.stringify(purchaseOrders));
    localStorage.setItem('dhaka_silicon_pos', JSON.stringify(purchaseOrders));
  }}, [purchaseOrders]);

  // Add stock to an existing product
  const addStock = (productId: string, quantity: number, unitCost?: number) => {{
    setProducts((prev) =>
      prev.map((p) => {{
        if (p.id === productId) {{
          const newStock = p.stockCount + quantity;
          const updatedCost = unitCost ? unitCost : p.costPrice;
          return {{ ...p, stockCount: newStock, costPrice: updatedCost }};
        }}
        return p;
      }})
    );
  }};

  // Add a brand new hardware product
  const addNewProduct = (newProdData: Omit<Product, 'id'>) => {{
    const newProduct: Product = {{
      ...newProdData,
      id: `prod-${{Date.now()}}`
    }};
    setProducts((prev) => [newProduct, ...prev]);
  }};

  // Add a new customer to the database
  const addNewCustomer = (newCust: Omit<Customer, 'id'>) => {{
    const created: Customer = {{
      ...newCust,
      id: `cust-${{Date.now()}}`,
      totalPurchases: 0
    }};
    setCustomers((prev) => [created, ...prev]);
    return created;
  }};

  // Dispatch an online delivery order via Bangladeshi courier partner (Pathao / Steadfast / RedX)
  const dispatchWithCourier = (
    orderId: string, 
    provider: 'Pathao' | 'Steadfast' | 'RedX', 
    options?: {{ deliveryFee?: number; codAmount?: number }}
  ) => {{
    const prefix = provider === 'Pathao' ? 'PTH-DHK' : provider === 'Steadfast' ? 'STDF-DHK' : 'REDX-LOG';
    const consignmentId = `${{prefix}}-${{Math.floor(10000 + Math.random() * 90000)}}`;
    const trackingUrl = provider === 'Pathao' 
      ? `https://merchant.pathao.com/tracking?consignment_id=${{consignmentId}}`
      : provider === 'Steadfast'
      ? `https://steadfast.com.bd/t/${{consignmentId}}`
      : `https://redx.com.bd/track/${{consignmentId}}`;

    setOrders((prev) =>
      prev.map((o) => {{
        if (o.id === orderId) {{
          const cod = options?.codAmount !== undefined 
            ? options.codAmount 
            : (o.paymentStatus === 'COD Pending' ? o.totalAmount : 0);
          const fee = options?.deliveryFee !== undefined ? options.deliveryFee : (o.deliveryAddress.includes('Dhaka') ? 150 : 250);
          return {{
            ...o,
            status: 'In Transit',
            courier: {{
              provider,
              consignmentId,
              trackingUrl,
              status: 'Awaiting Rider Pickup',
              codAmount: cod,
              deliveryFee: fee,
              recipientCity: o.deliveryAddress.includes('Dhaka') ? 'Dhaka Metro' : 'Outside Dhaka',
              dispatchedAt: 'Just now'
            }}
          }};
        }}
        return o;
      }})
    );
  }};

  // Create a sales order via POS
  const createSaleOrder = (orderData: {{
    customerName: string;
    contactNumber: string;
    deliveryAddress: string;
    items: {{ product: Product; quantity: number; unitPrice?: number }}[];
    discountPercent: number;
    discountAmountFlat?: number;
    orderType?: 'online' | 'offline';
    paymentMethod: 'cash' | 'bkash' | 'bank_transfer' | 'credit_30d';
    salesman: string;
  }}) => {{
    // 1. Deduct stock for each sold product
    setProducts((prev) =>
      prev.map((p) => {{
        const itemSold = orderData.items.find((i) => i.product.id === p.id);
        if (itemSold) {{
          const remaining = Math.max(0, p.stockCount - itemSold.quantity);
          return {{ ...p, stockCount: remaining }};
        }}
        return p;
      }})
    );

    // 2. Compute accurate financial line items with custom salesman unit price if provided
    const orderItems: OrderItem[] = orderData.items.map((i) => {{
      const finalPrice = i.unitPrice !== undefined && i.unitPrice >= 0 ? i.unitPrice : i.product.retailPrice;
      return {{
        productId: i.product.id,
        name: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        unitPrice: finalPrice,
        total: finalPrice * i.quantity
      }};
    }});

    const subtotal = orderItems.reduce((acc, curr) => acc + curr.total, 0);

    let discountAmount = 0;
    let discountPercent = 0;
    if (orderData.discountAmountFlat !== undefined && orderData.discountAmountFlat > 0) {{
      discountAmount = Math.min(orderData.discountAmountFlat, subtotal);
      discountPercent = subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;
    }} else {{
      discountPercent = Math.max(0, orderData.discountPercent || 0);
      discountAmount = Math.round((subtotal * discountPercent) / 100);
    }}

    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const vatAmount = Math.round(taxableSubtotal * 0.05);
    const totalAmount = taxableSubtotal + vatAmount;

    const summaryText = orderItems.map((i) => `${{i.quantity}}x ${{i.name.split(' ')[0]}} ${{i.name.split(' ')[1] || ''}}`).join(', ');

    const type = orderData.orderType || 'offline';
    const initialStatus: Order['status'] = type === 'online' ? 'Ready for Dispatch' : 'Counter Collected';

    const newOrder: Order = {{
      id: `ord-${{Date.now()}}`,
      orderNumber: `ORD-DS-2026-${{Math.floor(1000 + Math.random() * 9000)}}`,
      orderType: type,
      customerName: orderData.customerName,
      contactNumber: orderData.contactNumber,
      deliveryAddress: orderData.deliveryAddress,
      items: orderItems,
      itemsSummary: summaryText,
      subtotal,
      discountPercent,
      discountAmount,
      vatAmount,
      totalAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'credit_30d' ? 'Credit 30D' : 'Paid',
      status: initialStatus,
      orderDate: 'Today, Just now',
      salesman: orderData.salesman
    }};

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }};

  // Update order status
  const updateOrderStatus = (orderId: string, status: Order['status']) => {{
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? {{ ...o, status }} : o))
    );
  }};

  // Create a new purchase order
  const createPurchaseOrder = (poData: {{
    supplierName: string;
    productId: string;
    quantity: number;
    totalCost: number;
    itemsSummary: string;
  }}) => {{
    const newPO: SupplierPO = {{
      id: `po-${{Date.now()}}`,
      poNumber: `PO-2026-${{Math.floor(100 + Math.random() * 900)}}`,
      supplierName: poData.supplierName,
      items: poData.itemsSummary,
      productId: poData.productId,
      quantity: poData.quantity,
      totalCost: poData.totalCost,
      orderDate: 'Today',
      status: 'In Transit',
      expectedDelivery: 'En route to Banani Vault'
    }};
    setPurchaseOrders((prev) => [newPO, ...prev]);
  }};

  // Receive a purchase order shipment from a supplier
  const receivePurchaseOrder = (poId: string) => {{
    setPurchaseOrders((prev) =>
      prev.map((po) => {{
        if (po.id === poId && po.status !== 'Received') {{
          addStock(po.productId, po.quantity);
          return {{ ...po, status: 'Received', expectedDelivery: 'Delivered to Banani Vault' }};
        }}
        return po;
      }})
    );
  }};

  // Dynamically computed metrics across the application
  const totalSalesRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const salesTodayOrders = orders.filter((o) => o.orderDate.includes('Today') || o.orderDate.includes('17 Oct 2026') || o.orderDate.includes('Just now'));
  const salesTodayCount = salesTodayOrders.length;
  const salesTodayRevenue = salesTodayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'Processing' || o.status === 'Ready for Dispatch' || o.status === 'In Transit').length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockCount, 0);
  const totalStockValue = products.reduce((sum, p) => sum + p.stockCount * p.retailPrice, 0);
  const totalCostValue = products.reduce((sum, p) => sum + p.stockCount * p.costPrice, 0);
  const currentMonthSales = orders
    .filter((o) => o.orderDate.includes('Oct 2026') || o.orderDate.includes('Today') || o.orderDate.includes('Just now'))
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const salesmanMonthSales = currentMonthSales;
  const salesmanCommission = Math.round(salesmanMonthSales * 0.02);

  return (
    <StoreContext.Provider
      value={{{{
        products,
        orders,
        customers,
        purchaseOrders,
        addStock,
        addNewProduct,
        addNewCustomer,
        dispatchWithCourier,
        createPurchaseOrder,
        createSaleOrder,
        updateOrderStatus,
        receivePurchaseOrder,
        metrics: {{
          totalSalesRevenue,
          salesTodayCount,
          salesTodayRevenue,
          pendingOrdersCount,
          totalStockUnits,
          totalStockValue,
          totalCostValue,
          salesmanMonthSales,
          salesmanCommission
        }}
      }}}}
    >
      {{children}}
    </StoreContext.Provider>
  );
}};

export const useStore = () => {{
  const context = useContext(StoreContext);
  if (!context) {{
    throw new Error('useStore must be used within a StoreProvider');
  }}
  return context;
}};
"""

with open("finpilot/frontend/src/context/StoreContext.tsx", "w") as f:
    f.write(ts_content)

print("Updated finpilot/frontend/src/context/StoreContext.tsx successfully!")
