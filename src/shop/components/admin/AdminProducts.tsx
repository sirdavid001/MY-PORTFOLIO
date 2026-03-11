import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload, X, Star, Search, RefreshCw, Link2, Image as ImageIcon, Layers, ArrowLeftRight, Save, Package, CheckCircle2, CircleOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api } from '../../lib/api';
import { getAutoFill } from './productAutoFill';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  brand: string;
  model?: string;
  category: string;
  condition: string;
  priceUSD: number;
  details: string;
  images: string[];
  specs?: string[];
  isActive: boolean;
  storageGb?: number | string;
  batteryHealth?: number | string;
  networkLock?: string;
  networkCarrier?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductFormData {
  name: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  priceNGN: number;
  storageGb: string;
  batteryHealth: string;
  networkLock: string;
  networkCarrier: string;
  details: string;
  images: string[];
  specs: string[];
  isActive: boolean;
}

interface AdminProductsProps {
  isAuthenticated: boolean;
  onAuthError?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Phones', 'Laptops', 'Tablets', 'Wearables', 'Audio', 'Gaming',
  'Accessories', 'Smart Home', 'Cameras', 'Networking', 'Storage', 'Monitors', 'Components',
];
const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Refurbished'];
const STORAGE_OPTIONS = ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
const NETWORK_LOCK_OPTIONS = ['Unlocked', 'Locked'];
const BATTERY_HEALTH_CATEGORIES = ['Phones', 'Tablets', 'Wearables'];
const NETWORK_CATEGORIES = ['Phones', 'Tablets'];
const DEFAULT_NGN_PER_USD = 1600;

const BRAND_SUGGESTIONS: Record<string, string[]> = {
  Phones:     ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Motorola', 'Nokia', 'Sony', 'Realme', 'Infinix', 'Tecno', 'Oppo', 'Vivo'],
  Laptops:    ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Microsoft', 'Acer', 'Samsung', 'MSI', 'Razer'],
  Tablets:    ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Amazon', 'Huawei'],
  Wearables:  ['Apple', 'Samsung', 'Fitbit', 'Garmin', 'Xiaomi', 'Huawei', 'Fossil'],
  Audio:      ['Sony', 'Bose', 'JBL', 'Apple', 'Samsung', 'Sennheiser', 'Jabra', 'Anker', 'Audio-Technica'],
  Gaming:     ['Sony', 'Microsoft', 'Nintendo', 'Razer', 'Logitech', 'SteelSeries', 'Corsair'],
  Cameras:    ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Panasonic', 'GoPro', 'DJI'],
  default:    ['Apple', 'Samsung', 'Sony', 'LG', 'Microsoft', 'Lenovo', 'HP', 'ASUS', 'Anker', 'Xiaomi'],
};

// ─── Model Suggestions (2016–2025) ────────────────────────────────────────────
const MODEL_SUGGESTIONS: Record<string, Record<string, string[]>> = {
  Phones: {
    Apple: [
      'iPhone 7', 'iPhone 7 Plus',
      'iPhone 8', 'iPhone 8 Plus', 'iPhone X',
      'iPhone XS', 'iPhone XS Max', 'iPhone XR',
      'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
      'iPhone SE (2020)', 'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
      'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
      'iPhone SE (2022)', 'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
      'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
      'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
    ],
    Samsung: [
      'Galaxy S7', 'Galaxy S7 Edge',
      'Galaxy S8', 'Galaxy S8+', 'Galaxy Note 8',
      'Galaxy S9', 'Galaxy S9+', 'Galaxy Note 9',
      'Galaxy S10e', 'Galaxy S10', 'Galaxy S10+', 'Galaxy Note 10', 'Galaxy Note 10+',
      'Galaxy S20', 'Galaxy S20+', 'Galaxy S20 Ultra', 'Galaxy Note 20', 'Galaxy Note 20 Ultra',
      'Galaxy A51', 'Galaxy A71',
      'Galaxy S21', 'Galaxy S21+', 'Galaxy S21 Ultra', 'Galaxy A52', 'Galaxy A52s', 'Galaxy A72',
      'Galaxy S22', 'Galaxy S22+', 'Galaxy S22 Ultra', 'Galaxy A53', 'Galaxy A73',
      'Galaxy Z Fold 4', 'Galaxy Z Flip 4',
      'Galaxy S23', 'Galaxy S23+', 'Galaxy S23 Ultra', 'Galaxy A54', 'Galaxy A34',
      'Galaxy Z Fold 5', 'Galaxy Z Flip 5',
      'Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra', 'Galaxy A55', 'Galaxy A35',
      'Galaxy Z Fold 6', 'Galaxy Z Flip 6',
    ],
    Google: [
      'Pixel 2', 'Pixel 2 XL',
      'Pixel 3', 'Pixel 3 XL', 'Pixel 3a', 'Pixel 3a XL',
      'Pixel 4', 'Pixel 4 XL', 'Pixel 4a', 'Pixel 4a 5G',
      'Pixel 5', 'Pixel 5a',
      'Pixel 6', 'Pixel 6 Pro', 'Pixel 6a',
      'Pixel 7', 'Pixel 7 Pro', 'Pixel 7a', 'Pixel Fold',
      'Pixel 8', 'Pixel 8 Pro', 'Pixel 8a',
      'Pixel 9', 'Pixel 9 Pro', 'Pixel 9 Pro XL', 'Pixel 9 Pro Fold',
    ],
    OnePlus: [
      'OnePlus 3T', 'OnePlus 5', 'OnePlus 5T',
      'OnePlus 6', 'OnePlus 6T',
      'OnePlus 7', 'OnePlus 7 Pro', 'OnePlus 7T', 'OnePlus 7T Pro',
      'OnePlus 8', 'OnePlus 8 Pro', 'OnePlus 8T',
      'OnePlus 9', 'OnePlus 9 Pro', 'OnePlus 9RT',
      'OnePlus 10 Pro', 'OnePlus 10T',
      'OnePlus 11', 'OnePlus Nord 4',
      'OnePlus 12', 'OnePlus 12R',
    ],
    Xiaomi: [
      'Xiaomi Mi 6', 'Xiaomi Mi 8', 'Xiaomi Mi 9', 'Xiaomi Mi 10', 'Xiaomi Mi 11',
      'Xiaomi 12', 'Xiaomi 12 Pro', 'Xiaomi 13', 'Xiaomi 13 Pro', 'Xiaomi 14', 'Xiaomi 14 Pro',
      'Redmi Note 8', 'Redmi Note 9', 'Redmi Note 10', 'Redmi Note 11', 'Redmi Note 12', 'Redmi Note 13',
      'POCO X3', 'POCO X4 Pro', 'POCO X5 Pro', 'POCO X6 Pro', 'POCO F5', 'POCO F6',
    ],
    Huawei: [
      'P20', 'P20 Pro', 'P30', 'P30 Pro', 'P40', 'P40 Pro', 'P50', 'P50 Pro',
      'Mate 20', 'Mate 20 Pro', 'Mate 30 Pro', 'Mate 40 Pro', 'Mate 50 Pro', 'Mate 60 Pro',
      'Nova 9', 'Nova 10', 'Nova 11',
    ],
    Motorola: [
      'Moto G6', 'Moto G7', 'Moto G8', 'Moto G9', 'Moto G10', 'Moto G20', 'Moto G30',
      'Moto G40', 'Moto G50', 'Moto G60', 'Moto G82', 'Moto G84', 'Moto G85',
      'Moto Edge 20', 'Moto Edge 30', 'Moto Edge 40', 'Moto Edge 50',
      'Motorola Razr 40', 'Motorola Razr 50',
    ],
    Nokia: [
      'Nokia 6', 'Nokia 7 Plus', 'Nokia 8', 'Nokia 8.1', 'Nokia 9 PureView',
      'Nokia 3.4', 'Nokia 5.4', 'Nokia G50', 'Nokia X30', 'Nokia G42',
    ],
    Sony: [
      'Xperia XZ2', 'Xperia XZ3',
      'Xperia 1', 'Xperia 5',
      'Xperia 1 II', 'Xperia 5 II',
      'Xperia 1 III', 'Xperia 5 III',
      'Xperia 1 IV', 'Xperia 5 IV',
      'Xperia 1 V', 'Xperia 5 V',
      'Xperia 1 VI', 'Xperia 10 VI',
    ],
    Realme: [
      'Realme X2 Pro', 'Realme 7 Pro', 'Realme 8 Pro', 'Realme 9 Pro+',
      'Realme 10 Pro+', 'Realme 11 Pro+', 'Realme 12 Pro+',
      'Realme GT 2 Pro', 'Realme GT 5 Pro', 'Realme GT 6',
    ],
    Infinix: [
      'Infinix Hot 12', 'Infinix Hot 20', 'Infinix Hot 30', 'Infinix Hot 40',
      'Infinix Note 12', 'Infinix Note 30', 'Infinix Note 40',
      'Infinix Zero 30', 'Infinix Zero Ultra',
    ],
    Tecno: [
      'Tecno Camon 19', 'Tecno Camon 20', 'Tecno Camon 30',
      'Tecno Spark 10', 'Tecno Spark 20',
      'Tecno Phantom X2', 'Tecno Phantom V Fold',
    ],
    Oppo: [
      'OPPO Find X3', 'OPPO Find X5', 'OPPO Find X6', 'OPPO Find X7 Ultra',
      'OPPO Reno 8', 'OPPO Reno 10', 'OPPO Reno 12',
      'OPPO A74', 'OPPO A98',
    ],
    Vivo: [
      'Vivo X70 Pro', 'Vivo X80 Pro', 'Vivo X90 Pro', 'Vivo X100 Pro',
      'Vivo V23', 'Vivo V25', 'Vivo V27', 'Vivo V29',
    ],
    LG: [
      'LG G7 ThinQ', 'LG G8 ThinQ', 'LG V40 ThinQ', 'LG V50 ThinQ',
      'LG Velvet', 'LG Wing',
    ],
    HTC: ['HTC U11', 'HTC U12+', 'HTC U20 5G', 'HTC Desire 20 Pro'],
  },

  Laptops: {
    Apple: [
      'MacBook Air (2017)', 'MacBook Air (2018)', 'MacBook Air (2019)', 'MacBook Air (2020 Intel)',
      'MacBook Air M1 (2020)', 'MacBook Air M2 13" (2022)', 'MacBook Air M2 15" (2023)',
      'MacBook Air M3 13" (2024)', 'MacBook Air M3 15" (2024)',
      'MacBook Pro 13" (2017)', 'MacBook Pro 13" (2018)', 'MacBook Pro 13" (2019)', 'MacBook Pro 13" (2020)',
      'MacBook Pro 13" M1 (2020)', 'MacBook Pro 13" M2 (2022)',
      'MacBook Pro 14" M1 Pro (2021)', 'MacBook Pro 14" M1 Max (2021)',
      'MacBook Pro 14" M2 Pro (2023)', 'MacBook Pro 14" M2 Max (2023)',
      'MacBook Pro 14" M3 (2023)', 'MacBook Pro 14" M3 Pro (2023)', 'MacBook Pro 14" M3 Max (2023)',
      'MacBook Pro 16" M1 Pro (2021)', 'MacBook Pro 16" M1 Max (2021)',
      'MacBook Pro 16" M2 Pro (2023)', 'MacBook Pro 16" M2 Max (2023)',
      'MacBook Pro 16" M3 Pro (2023)', 'MacBook Pro 16" M3 Max (2023)',
    ],
    Dell: [
      'XPS 13 (2017)', 'XPS 13 (2018)', 'XPS 13 (2019)', 'XPS 13 (2020)', 'XPS 13 (2021)',
      'XPS 13 Plus (2022)', 'XPS 13 9315 (2023)', 'XPS 13 9340 (2024)',
      'XPS 15 (2017)', 'XPS 15 (2018)', 'XPS 15 9500 (2020)', 'XPS 15 9510 (2021)',
      'XPS 15 9520 (2022)', 'XPS 15 9530 (2023)', 'XPS 15 9540 (2024)',
      'XPS 17 9700 (2020)', 'XPS 17 9710 (2021)', 'XPS 17 9730 (2023)',
      'Inspiron 15 3000', 'Inspiron 15 5000', 'Inspiron 14 7420', 'Inspiron 16 Plus',
      'Latitude 7420', 'Latitude 7440', 'Latitude 9420', 'Latitude 9440',
      'Alienware m15 R7', 'Alienware m18 R2', 'Alienware x17 R2',
    ],
    HP: [
      'Spectre x360 13 (2018)', 'Spectre x360 13 (2020)',
      'Spectre x360 14 (2021)', 'Spectre x360 14 (2022)', 'Spectre x360 14 (2023)',
      'Spectre x360 16 (2024)',
      'Envy x360 13 (2021)', 'Envy x360 14 (2022)', 'Envy x360 15 (2023)',
      'EliteBook 840 G8', 'EliteBook 840 G9', 'EliteBook 840 G10', 'EliteBook 1040 G10',
      'Pavilion 15', 'Pavilion x360 14', 'HP Omen 16', 'HP Victus 16',
    ],
    Lenovo: [
      'ThinkPad X1 Carbon Gen 5 (2017)', 'ThinkPad X1 Carbon Gen 6 (2018)',
      'ThinkPad X1 Carbon Gen 7 (2019)', 'ThinkPad X1 Carbon Gen 8 (2020)',
      'ThinkPad X1 Carbon Gen 9 (2021)', 'ThinkPad X1 Carbon Gen 10 (2022)',
      'ThinkPad X1 Carbon Gen 11 (2023)', 'ThinkPad X1 Carbon Gen 12 (2024)',
      'ThinkPad T14 Gen 1', 'ThinkPad T14 Gen 2', 'ThinkPad T14 Gen 3', 'ThinkPad T14 Gen 4',
      'IdeaPad 5 14', 'IdeaPad Slim 5', 'IdeaPad Slim 3',
      'Yoga 9i (2021)', 'Yoga 9i (2022)', 'Yoga 9i (2023)', 'Yoga 9i (2024)',
      'Legion 5 Gen 6', 'Legion 5 Gen 7', 'Legion 5 Gen 8', 'Legion 5 Gen 9',
      'Legion 7 Gen 7', 'Legion 7 Gen 8', 'Legion Pro 7 Gen 8',
    ],
    ASUS: [
      'ZenBook 14 (2019)', 'ZenBook 14 (2020)', 'ZenBook 14X (2022)', 'ZenBook 14 OLED (2023)',
      'ZenBook Pro 15', 'ZenBook Pro Duo 15',
      'ROG Zephyrus G14 (2020)', 'ROG Zephyrus G14 (2021)', 'ROG Zephyrus G14 (2022)',
      'ROG Zephyrus G14 (2023)', 'ROG Zephyrus G14 (2024)',
      'ROG Strix G15 (2021)', 'ROG Strix G15 (2022)', 'ROG Strix SCAR 16 (2023)',
      'VivoBook 15', 'VivoBook S15', 'ExpertBook B9',
      'TUF Gaming A15', 'TUF Gaming F15',
    ],
    Microsoft: [
      'Surface Laptop 3 (2019)', 'Surface Laptop 4 (2021)', 'Surface Laptop 5 (2022)', 'Surface Laptop 6 (2024)',
      'Surface Laptop Go (2020)', 'Surface Laptop Go 2 (2022)', 'Surface Laptop Go 3 (2023)',
      'Surface Laptop Studio (2021)', 'Surface Laptop Studio 2 (2023)',
      'Surface Book 3 13.5" (2020)', 'Surface Book 3 15" (2020)',
    ],
    Acer: [
      'Swift 5 (2019)', 'Swift 5 (2020)', 'Swift 5 (2022)',
      'Swift X (2021)', 'Swift X (2022)', 'Swift X (2023)',
      'Aspire 5 (2020)', 'Aspire 5 (2022)', 'Aspire 5 (2023)',
      'Predator Helios 300 (2021)', 'Predator Helios 300 (2022)', 'Predator Helios 300 (2023)',
      'Nitro 5 (2021)', 'Nitro 5 (2022)', 'Nitro 5 (2023)', 'Nitro V 15 (2024)',
    ],
    Samsung: [
      'Galaxy Book2 Pro', 'Galaxy Book2 Pro 360', 'Galaxy Book3 Pro', 'Galaxy Book3 Pro 360',
      'Galaxy Book4 Pro', 'Galaxy Book4 360',
    ],
    MSI: [
      'MSI GS66 Stealth', 'MSI GS76 Stealth',
      'MSI Raider GE76', 'MSI Raider GE78 HX',
      'MSI Creator Z16', 'MSI Prestige 14', 'MSI Modern 14',
      'MSI Titan GT77 HX', 'MSI Titan 18 HX',
      'MSI Katana 15', 'MSI Cyborg 15',
    ],
    Razer: [
      'Razer Blade 15 (2018)', 'Razer Blade 15 (2019)', 'Razer Blade 15 (2020)',
      'Razer Blade 15 (2021)', 'Razer Blade 15 (2022)', 'Razer Blade 15 (2023)',
      'Razer Blade 16 (2023)', 'Razer Blade 16 (2024)',
      'Razer Blade 14 (2021)', 'Razer Blade 14 (2022)', 'Razer Blade 14 (2023)', 'Razer Blade 14 (2024)',
      'Razer Blade 17 (2022)', 'Razer Blade 18 (2023)',
    ],
  },

  Tablets: {
    Apple: [
      'iPad (7th Gen, 2019)', 'iPad (8th Gen, 2020)', 'iPad (9th Gen, 2021)', 'iPad (10th Gen, 2022)',
      'iPad Air (3rd Gen, 2019)', 'iPad Air (4th Gen, 2020)', 'iPad Air (5th Gen, 2022)',
      'iPad Air M2 11" (2024)', 'iPad Air M2 13" (2024)',
      'iPad Pro 11" (1st Gen, 2018)', 'iPad Pro 11" (2nd Gen, 2020)', 'iPad Pro 11" (3rd Gen, 2021)',
      'iPad Pro 11" M2 (2022)', 'iPad Pro 11" M4 (2024)',
      'iPad Pro 12.9" (3rd Gen, 2018)', 'iPad Pro 12.9" (4th Gen, 2020)',
      'iPad Pro 12.9" (5th Gen, 2021)', 'iPad Pro 12.9" M2 (2022)',
      'iPad Pro 13" M4 (2024)',
      'iPad mini (5th Gen, 2019)', 'iPad mini (6th Gen, 2021)', 'iPad mini (7th Gen, 2024)',
    ],
    Samsung: [
      'Galaxy Tab S4 (2018)', 'Galaxy Tab S5e (2019)', 'Galaxy Tab S6 (2019)', 'Galaxy Tab S6 Lite (2020)',
      'Galaxy Tab S7 (2020)', 'Galaxy Tab S7+ (2020)', 'Galaxy Tab S7 FE (2021)',
      'Galaxy Tab S8 (2022)', 'Galaxy Tab S8+ (2022)', 'Galaxy Tab S8 Ultra (2022)',
      'Galaxy Tab S9 (2023)', 'Galaxy Tab S9+ (2023)', 'Galaxy Tab S9 Ultra (2023)', 'Galaxy Tab S9 FE (2023)',
      'Galaxy Tab S10 (2024)', 'Galaxy Tab S10+ (2024)', 'Galaxy Tab S10 Ultra (2024)',
      'Galaxy Tab A8 (2022)', 'Galaxy Tab A9 (2023)', 'Galaxy Tab A9+ (2023)',
    ],
    Microsoft: [
      'Surface Pro 6 (2018)', 'Surface Pro 7 (2019)', 'Surface Pro 7+ (2021)',
      'Surface Pro 8 (2021)', 'Surface Pro 9 (2022)', 'Surface Pro 10 (2024)',
      'Surface Go 2 (2020)', 'Surface Go 3 (2021)', 'Surface Go 4 (2023)',
    ],
    Lenovo: [
      'Tab P12 Pro', 'Tab P11 Pro Gen 2', 'Tab P11 Gen 2', 'Tab P12',
      'Tab M10 Plus Gen 3', 'Tab M9',
    ],
    Amazon: [
      'Fire HD 8 (2020)', 'Fire HD 8 (2022)', 'Fire HD 8 Plus (2022)',
      'Fire HD 10 (2021)', 'Fire HD 10 (2023)',
      'Fire Max 11 (2023)',
    ],
    Huawei: [
      'MatePad Pro 10.8 (2021)', 'MatePad Pro 11 (2022)', 'MatePad Pro 13.2 (2023)',
      'MatePad 11 (2021)', 'MatePad 11.5 (2023)',
    ],
  },

  Wearables: {
    Apple: [
      'Apple Watch Series 2 (2016)', 'Apple Watch Series 3 (2017)', 'Apple Watch Series 4 (2018)',
      'Apple Watch Series 5 (2019)', 'Apple Watch SE (2020)', 'Apple Watch Series 6 (2020)',
      'Apple Watch Series 7 (2021)', 'Apple Watch Series 8 (2022)', 'Apple Watch Ultra (2022)',
      'Apple Watch SE 2nd Gen (2022)', 'Apple Watch Series 9 (2023)', 'Apple Watch Ultra 2 (2023)',
      'Apple Watch Series 10 (2024)',
      'AirPods (2nd Gen)', 'AirPods (3rd Gen)', 'AirPods Pro (1st Gen)', 'AirPods Pro (2nd Gen)',
    ],
    Samsung: [
      'Galaxy Watch (2018)', 'Galaxy Watch Active (2019)', 'Galaxy Watch Active 2 (2019)',
      'Galaxy Watch 3 (2020)', 'Galaxy Watch 4 (2021)', 'Galaxy Watch 4 Classic (2021)',
      'Galaxy Watch 5 (2022)', 'Galaxy Watch 5 Pro (2022)',
      'Galaxy Watch 6 (2023)', 'Galaxy Watch 6 Classic (2023)',
      'Galaxy Watch 7 (2024)', 'Galaxy Watch Ultra (2024)',
      'Galaxy Buds Pro', 'Galaxy Buds 2 Pro', 'Galaxy Buds FE', 'Galaxy Buds 3 Pro',
    ],
    Fitbit: [
      'Fitbit Charge 3', 'Fitbit Charge 4', 'Fitbit Charge 5', 'Fitbit Charge 6',
      'Fitbit Versa 2', 'Fitbit Versa 3', 'Fitbit Versa 4',
      'Fitbit Sense', 'Fitbit Sense 2',
      'Fitbit Luxe', 'Fitbit Inspire 3',
    ],
    Garmin: [
      'Garmin Fenix 5 Plus', 'Garmin Fenix 6', 'Garmin Fenix 6 Pro', 'Garmin Fenix 7', 'Garmin Fenix 8',
      'Garmin Forerunner 745', 'Garmin Forerunner 945', 'Garmin Forerunner 955', 'Garmin Forerunner 965',
      'Garmin Venu 2', 'Garmin Venu 3', 'Garmin Venu Sq 2',
      'Garmin Vivoactive 4', 'Garmin Vivoactive 5',
    ],
    Xiaomi: [
      'Mi Band 4', 'Mi Band 5', 'Mi Band 6', 'Mi Band 7', 'Mi Band 8', 'Mi Band 9',
      'Xiaomi Watch S1', 'Xiaomi Watch S2', 'Xiaomi Watch S3',
      'Xiaomi Smart Band 8 Pro',
    ],
    Huawei: [
      'Huawei Watch GT 2', 'Huawei Watch GT 3', 'Huawei Watch GT 4',
      'Huawei Watch 4 Pro', 'Huawei Band 7', 'Huawei Band 8', 'Huawei Band 9',
    ],
    Fossil: [
      'Fossil Gen 5', 'Fossil Gen 6', 'Fossil Gen 6 Wellness',
      'Fossil Sport', 'Fossil Hybrid HR',
    ],
  },

  Audio: {
    Sony: [
      'WH-1000XM3', 'WH-1000XM4', 'WH-1000XM5',
      'WF-1000XM3', 'WF-1000XM4', 'WF-1000XM5',
      'WH-CH720N', 'WF-C700N', 'LinkBuds S', 'LinkBuds Open',
      'WH-XB910N', 'Extra Bass WH-XB700',
    ],
    Bose: [
      'QuietComfort 35 II', 'QuietComfort 45', 'QuietComfort Ultra Headphones',
      'QuietComfort Earbuds', 'QuietComfort Earbuds II', 'QuietComfort Ultra Earbuds',
      'SoundLink Flex', 'SoundLink Mini II', 'SoundLink Revolve+',
      'Bose 700', 'Sport Earbuds',
    ],
    JBL: [
      'Tune 760NC', 'Live 770NC', 'Club One', 'Quantum 910',
      'Charge 5', 'Charge 6', 'Flip 6', 'Xtreme 3', 'Boombox 3',
      'Live Pro 2', 'Tour Pro 2', 'Vibe Beam',
    ],
    Apple: [
      'AirPods (2nd Gen)', 'AirPods (3rd Gen)',
      'AirPods Pro (1st Gen)', 'AirPods Pro (2nd Gen)',
      'AirPods Max', 'HomePod mini', 'HomePod (2nd Gen)',
    ],
    Sennheiser: [
      'Momentum 3 Wireless', 'Momentum 4 Wireless',
      'Momentum True Wireless 3', 'CX Plus True Wireless', 'CX 400BT',
      'HD 660S', 'HD 660S2',
    ],
    Jabra: [
      'Jabra Elite 85h', 'Jabra Elite 85t', 'Jabra Elite 4 Active',
      'Jabra Elite 7 Pro', 'Jabra Elite 10', 'Jabra Evolve2 65',
    ],
    Anker: [
      'Soundcore Q45', 'Soundcore Q35', 'Soundcore Life Q30',
      'Soundcore Liberty 4', 'Soundcore Liberty Air 2 Pro',
      'Soundcore P40i', 'Soundcore Space One',
    ],
    Samsung: [
      'Galaxy Buds Pro', 'Galaxy Buds 2 Pro', 'Galaxy Buds FE', 'Galaxy Buds 3 Pro',
      'Galaxy Buds 2', 'Galaxy Buds Live',
    ],
  },

  Gaming: {
    Sony: [
      'PlayStation 4', 'PlayStation 4 Pro', 'PlayStation 4 Slim',
      'PlayStation 5', 'PlayStation 5 Digital Edition', 'PlayStation 5 Slim (2023)',
      'DualSense Wireless Controller', 'DualSense Edge Controller',
      'PlayStation VR2', 'PlayStation Portal',
    ],
    Microsoft: [
      'Xbox One X', 'Xbox One S',
      'Xbox Series X', 'Xbox Series S', 'Xbox Series S 1TB (2024)',
      'Xbox Elite Wireless Controller Series 2',
      'Xbox Wireless Controller',
    ],
    Nintendo: [
      'Nintendo Switch (2017)', 'Nintendo Switch V2 (2019)',
      'Nintendo Switch Lite (2019)', 'Nintendo Switch OLED (2021)',
    ],
    Razer: [
      'Razer DeathAdder V3 Pro', 'Razer Viper V3 Pro',
      'Razer BlackWidow V4 Pro', 'Razer Huntsman V3 Pro',
      'Razer Kraken V3 HyperSense', 'Razer BlackShark V2 Pro',
      'Razer Hammerhead Pro HyperSpeed',
    ],
    Logitech: [
      'Logitech G Pro X Superlight 2', 'Logitech G502 X Plus',
      'Logitech G915 TKL', 'Logitech G Pro X Keyboard',
      'Logitech G733', 'Logitech G Pro X 2 Lightspeed',
      'Logitech G Cloud Gaming Handheld',
    ],
    SteelSeries: [
      'SteelSeries Arctis Nova Pro', 'SteelSeries Arctis 7+',
      'SteelSeries Apex Pro', 'SteelSeries Prime+',
    ],
    Corsair: [
      'Corsair K100 RGB', 'Corsair K70 RGB Pro',
      'Corsair HS80 RGB Wireless', 'Corsair Virtuoso RGB Wireless XT',
      'Corsair Scimitar RGB Elite', 'Corsair Ironclaw RGB Wireless',
    ],
  },

  Cameras: {
    Sony: [
      'Sony A7 III (2018)', 'Sony A7 IV (2021)', 'Sony A7R V (2022)', 'Sony A7C (2020)', 'Sony A7C II (2023)',
      'Sony A6400 (2019)', 'Sony A6600 (2019)', 'Sony A6700 (2023)',
      'Sony FX3 (2021)', 'Sony ZV-E10 (2021)', 'Sony ZV-E1 (2023)', 'Sony ZV-E10 II (2024)',
    ],
    Canon: [
      'Canon EOS R (2018)', 'Canon EOS RP (2019)', 'Canon EOS R5 (2020)', 'Canon EOS R6 (2020)',
      'Canon EOS R3 (2021)', 'Canon EOS R7 (2022)', 'Canon EOS R10 (2022)',
      'Canon EOS R6 Mark II (2022)', 'Canon EOS R8 (2023)', 'Canon EOS R50 (2023)',
      'Canon EOS R5 Mark II (2024)', 'Canon EOS R1 (2024)',
    ],
    Nikon: [
      'Nikon Z6 (2018)', 'Nikon Z7 (2018)', 'Nikon Z50 (2019)', 'Nikon Z5 (2020)',
      'Nikon Z6 II (2020)', 'Nikon Z7 II (2020)', 'Nikon Z fc (2021)',
      'Nikon Z9 (2021)', 'Nikon Zf (2023)', 'Nikon Z6 III (2024)', 'Nikon Z8 (2023)',
    ],
    Fujifilm: [
      'Fujifilm X-T3 (2018)', 'Fujifilm X-T4 (2020)', 'Fujifilm X-T5 (2022)',
      'Fujifilm X-S10 (2020)', 'Fujifilm X-S20 (2023)',
      'Fujifilm X100V (2020)', 'Fujifilm X100VI (2024)',
      'Fujifilm GFX 100S (2021)', 'Fujifilm GFX 100 II (2023)',
    ],
    GoPro: [
      'GoPro Hero 7 Black', 'GoPro Hero 8 Black', 'GoPro Hero 9 Black',
      'GoPro Hero 10 Black', 'GoPro Hero 11 Black', 'GoPro Hero 12 Black', 'GoPro Hero 13 Black',
    ],
    DJI: [
      'DJI Osmo Action 3', 'DJI Osmo Action 4',
      'DJI Pocket 2', 'DJI Osmo Pocket 3',
      'DJI Mini 3 Pro', 'DJI Mini 4 Pro', 'DJI Air 3',
    ],
  },
};

const CARRIER_SUGGESTIONS = ['MTN', 'Glo', 'Airtel', 'Etisalat/9mobile', 'AT&T', 'Verizon', 'T-Mobile', 'EE', 'Vodafone', 'O2'];

const EMPTY_FORM: ProductFormData = {
  name: '', brand: '', model: '', category: '', condition: 'New',
  priceNGN: 0, storageGb: '', batteryHealth: '',
  networkLock: 'Unlocked', networkCarrier: '', details: '',
  images: [], specs: [], isActive: true,
};

function ngnToUsd(ngn: number, rate: number) { return Math.round((ngn / rate) * 100) / 100; }
function usdToNgn(usd: number, rate: number) { return Math.round(usd * rate); }

export default function AdminProducts({ isAuthenticated, onAuthError }: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [ngnPerUsd, setNgnPerUsd] = useState(DEFAULT_NGN_PER_USD);
  const [rateInput, setRateInput] = useState('');
  const [savingRate, setSavingRate] = useState(false);
  const [specsInput, setSpecsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  // tracks whether the model/brand field is in custom-entry mode
  const [modelCustomMode, setModelCustomMode] = useState(false);
  const [brandCustomMode, setBrandCustomMode] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
      loadExchangeRate();
    }
  }, [isAuthenticated]);

  async function loadProducts() {
    try {
      setLoading(true);
      const result = await api.getAdminProducts();
      setProducts(result.products || []);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('403')) onAuthError?.();
      else toast.error('Failed to load products: ' + err.message);
    } finally { setLoading(false); }
  }

  async function loadExchangeRate() {
    try {
      const result = await api.getExchangeRate();
      if (result.ngnPerUsd) {
        setNgnPerUsd(result.ngnPerUsd);
        setRateInput(String(result.ngnPerUsd));
      }
    } catch { /* silently fall back to default */ }
  }

  async function saveExchangeRate() {
    const parsed = parseFloat(rateInput);
    if (!parsed || parsed <= 0) { toast.error('Enter a valid positive rate'); return; }
    setSavingRate(true);
    try {
      await api.updateExchangeRate(parsed);
      setNgnPerUsd(parsed);
      toast.success(`Rate updated: ₦${parsed.toLocaleString()} = $1 USD`);
    } catch (err: any) {
      toast.error('Failed to save rate: ' + err.message);
    } finally { setSavingRate(false); }
  }

  // ── Filters ──
  const allCategories = useMemo(() => [
    'All',
    ...Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort(),
  ], [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      const matchAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'active' ? p.isActive : !p.isActive);
      if (!q) return matchCat && matchAvailability;
      return matchCat && matchAvailability && [p.name, p.brand, p.model, p.category, p.id].join(' ').toLowerCase().includes(q);
    });
  }, [products, categoryFilter, availabilityFilter, search]);

  const productStats = useMemo(() => ({
    total: products.length,
    active: products.filter((product) => product.isActive).length,
    inactive: products.filter((product) => !product.isActive).length,
    categories: new Set(products.map((product) => product.category).filter(Boolean)).size,
  }), [products]);

  const hasFilters = search.trim() || categoryFilter !== 'All' || availabilityFilter !== 'all';

  const grouped = useMemo(() => {
    if (categoryFilter !== 'All' || availabilityFilter !== 'all') return null;
    const map: Record<string, Product[]> = {};
    filtered.forEach(p => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, [filtered, categoryFilter]);

  // ── Dialog ──
  function openNew() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setSpecsInput('');
    setErrors({});
    setModelCustomMode(false);
    setBrandCustomMode(false);
    setShowDialog(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    const existingModel = p.model || '';
    const existingModelList = MODEL_SUGGESTIONS[p.category]?.[p.brand] || [];
    const existingBrandList = BRAND_SUGGESTIONS[p.category] || BRAND_SUGGESTIONS.default;
    setModelCustomMode(existingModel !== '' && !existingModelList.includes(existingModel));
    setBrandCustomMode(p.brand !== '' && !existingBrandList.includes(p.brand));
    setForm({
      name: p.name, brand: p.brand, model: existingModel,
      category: p.category, condition: p.condition,
      priceNGN: usdToNgn(p.priceUSD || 0, ngnPerUsd),
      storageGb: p.storageGb != null ? String(p.storageGb) : '',
      batteryHealth: p.batteryHealth != null ? String(p.batteryHealth) : '',
      networkLock: p.networkLock || 'Unlocked',
      networkCarrier: p.networkCarrier || '',
      details: p.details || '',
      images: p.images || [], specs: p.specs || [],
      isActive: p.isActive,
    });
    setSpecsInput((p.specs || []).join(', '));
    setErrors({});
    setShowDialog(true);
  }

  function set(key: keyof ProductFormData, val: any) {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  }

  // ── Auto-fill ──
  function applyAutoFill(category: string, brand: string, model: string) {
    if (!category || !brand || !model) return;
    const fill = getAutoFill(category, brand, model);
    setForm(prev => ({
      ...prev,
      name: fill.name,
      specs: fill.specs,
      details: fill.details,
    }));
    setSpecsInput(fill.specs.join(', '));
    toast.success('✨ Auto-filled from model database', { duration: 2000 });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.brand.trim()) e.brand = 'Brand is required';
    if (!form.category) e.category = 'Category is required';
    if (form.priceNGN <= 0) e.priceNGN = 'Price must be greater than 0';
    if (form.networkLock === 'Locked' && !form.networkCarrier.trim())
      e.networkCarrier = 'Carrier is required when network is locked';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const specs = specsInput.split(',').map(s => s.trim()).filter(Boolean);
      const payload: any = {
        name: form.name.trim(), brand: form.brand.trim(), category: form.category,
        condition: form.condition, priceUSD: ngnToUsd(form.priceNGN, ngnPerUsd),
        details: form.details.trim(),
        images: form.images, specs, isActive: form.isActive,
      };
      if (form.model.trim()) payload.model = form.model.trim();
      if (form.storageGb && form.storageGb !== '__none__') payload.storageGb = form.storageGb;
      if (BATTERY_HEALTH_CATEGORIES.includes(form.category) && form.batteryHealth)
        payload.batteryHealth = Number(form.batteryHealth);
      if (NETWORK_CATEGORIES.includes(form.category)) {
        payload.networkLock = form.networkLock;
        if (form.networkLock === 'Locked') payload.networkCarrier = form.networkCarrier.trim();
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await api.createProduct(payload);
        toast.success('Product created successfully');
      }
      setShowDialog(false);
      loadProducts();
    } catch (err: any) {
      toast.error('Failed to save product: ' + err.message);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.deleteProduct(id);
      toast.success('Product deleted');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { toast.error('Failed to delete product'); }
  }

  // ── Image helpers ──
  function addImageUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (form.images.length >= 5) { toast.error('Maximum 5 images allowed'); return; }
    if (form.images.includes(url)) { toast.error('This image URL is already added'); return; }
    set('images', [...form.images, url]);
    setUrlInput('');
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (form.images.length >= 5) { toast.error('Maximum 5 images allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max file size is 5MB'); return; }
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      if (result.url) {
        set('images', [...form.images, result.url]);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(result.error || 'Upload failed — no URL returned');
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      toast.error(`Upload failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeImage(idx: number) { set('images', form.images.filter((_, i) => i !== idx)); }
  function setPrimary(idx: number) {
    const imgs = [...form.images];
    const [item] = imgs.splice(idx, 1);
    set('images', [item, ...imgs]);
  }

  const brandList = BRAND_SUGGESTIONS[form.category] || BRAND_SUGGESTIONS.default;
  const modelList = MODEL_SUGGESTIONS[form.category]?.[form.brand] || [];
  const showBattery = BATTERY_HEALTH_CATEGORIES.includes(form.category);
  const showNetwork = NETWORK_CATEGORIES.includes(form.category);

  if (loading) return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto" />
        <p className="text-gray-500 text-sm mt-3">Loading products…</p>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* ── Exchange Rate Settings Card ── */}
      <Card className="overflow-hidden border-gray-200">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-purple-600" />
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">

            {/* Icon + label */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-sm">
                <ArrowLeftRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">USD ↔ NGN Exchange Rate</p>
                <p className="text-xs text-gray-500 mt-0.5">Set how many naira equal one US dollar</p>
              </div>
            </div>

            {/* Input row */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-[180px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">₦</span>
                <Input
                  type="number"
                  min="1"
                  step="50"
                  value={rateInput}
                  onChange={e => setRateInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveExchangeRate(); }}
                  placeholder={String(DEFAULT_NGN_PER_USD)}
                  className="pl-7 h-10 text-sm border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <span className="text-sm font-medium text-gray-400 shrink-0">= $1 USD</span>
              <Button
                size="sm"
                onClick={saveExchangeRate}
                disabled={savingRate}
                className="shrink-0 h-10 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-sm"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {savingRate ? 'Saving…' : 'Save Rate'}
              </Button>
            </div>

            {/* Active badge */}
            <div className="flex items-center gap-1.5 shrink-0 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-semibold text-blue-700">
                Active: ₦{ngnPerUsd.toLocaleString()} / $1
              </span>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ── Products Management Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="flex-1">Products Management</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border rounded-md w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={loadProducts}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={openNew} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Total Listings', value: productStats.total, icon: <Package className="h-4 w-4 text-gray-500" />, tone: 'text-gray-800' },
              { label: 'Active', value: productStats.active, icon: <CheckCircle2 className="h-4 w-4 text-green-600" />, tone: 'text-green-700' },
              { label: 'Inactive', value: productStats.inactive, icon: <CircleOff className="h-4 w-4 text-amber-600" />, tone: 'text-amber-700' },
              { label: 'Categories', value: productStats.categories, icon: <Layers className="h-4 w-4 text-blue-600" />, tone: 'text-blue-700' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-500">
                  {stat.icon}
                  <span>{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.tone}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {[
              { value: 'all', label: 'All listings' },
              { value: 'active', label: 'Active only' },
              { value: 'inactive', label: 'Inactive only' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setAvailabilityFilter(option.value as 'all' | 'active' | 'inactive')}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  availabilityFilter === option.value
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {option.label}
              </button>
            ))}
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('All');
                  setAvailabilityFilter('all');
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>

          <p className="mb-4 text-xs text-gray-500">
            Showing {filtered.length} of {products.length} listing{products.length === 1 ? '' : 's'}.
          </p>

          {/* Category filter pills */}
          {allCategories.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {cat}
                  {cat !== 'All' && (
                    <span className={`ml-1 ${categoryFilter === cat ? 'text-blue-200' : 'text-gray-400'}`}>
                      {products.filter(p => p.category === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">{products.length === 0 ? 'No products yet' : 'No products match'}</p>
              <p className="text-gray-400 text-sm mt-1">
                {products.length === 0 ? 'Click "Add Product" to create your first listing' : 'Try a different search or filter'}
              </p>
              {products.length === 0 && (
                <Button onClick={openNew} className="mt-4" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add first product
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {grouped ? (
                Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{cat}</span>
                      <span className="text-xs text-gray-400">({items.length})</span>
                    </div>
                    <ProductTable products={items} onEdit={openEdit} onDelete={handleDelete} ngnPerUsd={ngnPerUsd} />
                  </div>
                ))
              ) : (
                <ProductTable products={filtered} onEdit={openEdit} onDelete={handleDelete} ngnPerUsd={ngnPerUsd} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the product details below' : 'Fill in the details for your new product listing'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Row 1: Category + Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={v => {
                    set('category', v);
                    set('model', ''); setModelCustomMode(false);
                    set('brand', ''); setBrandCustomMode(false);
                  }}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <Label>Brand *</Label>
                <Select
                  value={brandCustomMode ? '__other__' : (form.brand || '__none__')}
                  onValueChange={val => {
                    if (val === '__none__') {
                      set('brand', ''); setBrandCustomMode(false);
                      set('model', ''); setModelCustomMode(false);
                    } else if (val === '__other__') {
                      setBrandCustomMode(true);
                      set('brand', ''); set('model', ''); setModelCustomMode(false);
                    } else {
                      set('brand', val); setBrandCustomMode(false);
                      set('model', ''); setModelCustomMode(false);
                    }
                  }}
                >
                  <SelectTrigger className={errors.brand ? 'border-red-500' : ''}>
                    <SelectValue placeholder="— Select a brand —" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="__none__">— Select a brand —</SelectItem>
                    {brandList.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    <SelectItem value="__other__">✏️ Other (enter manually)</SelectItem>
                  </SelectContent>
                </Select>
                {brandCustomMode && (
                  <Input
                    className="mt-2"
                    value={form.brand}
                    onChange={e => { set('brand', e.target.value); set('model', ''); setModelCustomMode(false); }}
                    placeholder="Type brand name…"
                    autoFocus
                  />
                )}
                {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
              </div>
            </div>

            {/* Row 2: Model + Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Model</Label>
                {modelList.length > 0 ? (
                  <>
                    <Select
                      value={modelCustomMode ? '__other__' : (form.model || '__none__')}
                      onValueChange={val => {
                        if (val === '__none__') {
                          set('model', ''); setModelCustomMode(false);
                        } else if (val === '__other__') {
                          setModelCustomMode(true); set('model', '');
                        } else {
                          set('model', val); setModelCustomMode(false);
                          applyAutoFill(form.category, form.brand, val);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="— Select a model —" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectItem value="__none__">— Select a model —</SelectItem>
                        {modelList.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        <SelectItem value="__other__">✏️ Other (enter manually)</SelectItem>
                      </SelectContent>
                    </Select>
                    {modelCustomMode && (
                      <div className="mt-2 flex gap-2">
                        <Input
                          className="flex-1"
                          value={form.model}
                          onChange={e => set('model', e.target.value)}
                          placeholder="Type custom model name…"
                          autoFocus
                          onBlur={() => {
                            if (form.model.trim()) applyAutoFill(form.category, form.brand, form.model.trim());
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => { if (form.model.trim()) applyAutoFill(form.category, form.brand, form.model.trim()); }}
                          className="shrink-0 px-2.5 py-1.5 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 rounded-md hover:bg-violet-100 transition-colors whitespace-nowrap"
                        >
                          ✨ Auto-fill
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{modelList.length} models available</p>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        id="f-model"
                        className="flex-1"
                        value={form.model}
                        onChange={e => set('model', e.target.value)}
                        placeholder="e.g. Galaxy S24 Ultra"
                        onBlur={() => {
                          if (form.model.trim() && form.brand && form.category)
                            applyAutoFill(form.category, form.brand, form.model.trim());
                        }}
                      />
                      {form.model.trim() && form.brand && form.category && (
                        <button
                          type="button"
                          onClick={() => applyAutoFill(form.category, form.brand, form.model.trim())}
                          className="shrink-0 px-2.5 py-1.5 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 rounded-md hover:bg-violet-100 transition-colors whitespace-nowrap"
                        >
                          ✨ Auto-fill
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Select brand + category first for suggestions</p>
                  </>
                )}
              </div>
              <div>
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={v => set('condition', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Product Name — auto-filled from model, editable */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="f-name">Product Name *</Label>
                {form.model && form.brand && form.category && (
                  <button
                    type="button"
                    onClick={() => applyAutoFill(form.category, form.brand, form.model)}
                    className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1 font-medium"
                  >
                    ✨ Re-apply auto-fill
                  </button>
                )}
              </div>
              <Input
                id="f-name" value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max 256GB Natural Titanium"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Row 4: Price NGN */}
            <div>
              <Label htmlFor="f-price">Price (NGN) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                <Input
                  id="f-price" type="number" min="0" step="100"
                  value={form.priceNGN || ''}
                  onChange={e => set('priceNGN', parseFloat(e.target.value) || 0)}
                  className={`pl-7 ${errors.priceNGN ? 'border-red-500' : ''}`}
                  placeholder="0"
                />
              </div>
              {form.priceNGN > 0 && (
                <p className="text-xs text-gray-500 mt-1">≈ ${ngnToUsd(form.priceNGN, ngnPerUsd).toFixed(2)} USD (÷ {ngnPerUsd.toLocaleString()})</p>
              )}
              {errors.priceNGN && <p className="text-red-500 text-xs mt-1">{errors.priceNGN}</p>}
            </div>

            {/* Row 5: Specs row (storage + battery + network) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Storage</Label>
                <Select
                  value={form.storageGb || '__none__'}
                  onValueChange={v => set('storageGb', v === '__none__' ? '' : v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {STORAGE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {showBattery && (
                <div>
                  <Label htmlFor="f-battery">Battery Health (%)</Label>
                  <Input
                    id="f-battery" type="number" min="0" max="100"
                    value={form.batteryHealth}
                    onChange={e => set('batteryHealth', e.target.value)}
                    placeholder="e.g. 92"
                  />
                </div>
              )}

              {showNetwork && (
                <div>
                  <Label>Network Lock</Label>
                  <Select value={form.networkLock} onValueChange={v => set('networkLock', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NETWORK_LOCK_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Network carrier (conditional) */}
            {showNetwork && form.networkLock === 'Locked' && (
              <div>
                <Label htmlFor="f-carrier">Network Carrier *</Label>
                <Input
                  id="f-carrier" value={form.networkCarrier}
                  onChange={e => set('networkCarrier', e.target.value)}
                  list="carrier-list" placeholder="e.g. MTN, AT&T"
                  className={errors.networkCarrier ? 'border-red-500' : ''}
                />
                <datalist id="carrier-list">
                  {CARRIER_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                </datalist>
                {errors.networkCarrier && <p className="text-red-500 text-xs mt-1">{errors.networkCarrier}</p>}
              </div>
            )}

            {/* Specs */}
            <div>
              <Label htmlFor="f-specs">Specs (comma-separated)</Label>
              <Input
                id="f-specs" value={specsInput}
                onChange={e => setSpecsInput(e.target.value)}
                placeholder="e.g. 6.7-inch display, A17 Pro chip, 5G, USB-C, 3x Optical Zoom"
              />
              {specsInput && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {specsInput.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs">{s}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <Label htmlFor="f-details">Description</Label>
              <Textarea
                id="f-details" value={form.details}
                onChange={e => set('details', e.target.value)}
                placeholder="Detailed product description…" rows={3}
              />
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Images ({form.images.length} / 5)</Label>
                <span className="text-xs text-gray-400">First image is the primary</span>
              </div>

              {form.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {form.images.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-50">
                      <img src={url} alt="" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {idx !== 0 && (
                          <button onClick={() => setPrimary(idx)}
                            className="p-1 bg-amber-500 text-white rounded hover:bg-amber-400" title="Set primary">
                            <Star className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={() => removeImage(idx)}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-400" title="Remove">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] px-1 rounded flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5" /> Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {form.images.length < 5 && (
                <div className="space-y-2">
                  {/* Drag-and-drop / click-to-upload zone */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (!file) return;
                      // synthesise a change event
                      handleFileUpload({ target: { files: e.dataTransfer.files, value: '' } } as any);
                    }}
                    className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
                      ${uploading ? 'opacity-50 cursor-not-allowed border-gray-200' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'}`}
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {uploading ? 'Uploading…' : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP up to 5MB</p>
                    </div>
                  </div>

                  {/* URL paste row */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <Input
                        value={urlInput} onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                        placeholder="…or paste an image URL and press Enter"
                        className="pl-8 text-sm"
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={addImageUrl} className="shrink-0">Add URL</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium">Active / Published</p>
                <p className="text-xs text-gray-500">Visible in the storefront when enabled</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={v => set('isActive', v)} id="f-active" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Product Table Sub-component ──
function ProductTable({
  products, onEdit, onDelete, ngnPerUsd,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string, name: string) => void;
  ngnPerUsd: number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Brand / Model</TableHead>
            <TableHead>Price (NGN)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(p => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name}
                      className="w-9 h-9 rounded-md object-cover bg-gray-100 shrink-0 border" />
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-gray-100 border flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate max-w-[160px]">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.condition}{p.storageGb ? ` · ${p.storageGb}` : ''}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium">{p.brand}</p>
                {p.model && <p className="text-xs text-gray-500 truncate max-w-[120px]">{p.model}</p>}
              </TableCell>
              <TableCell>
                <p className="font-semibold text-sm">₦{usdToNgn(p.priceUSD || 0, ngnPerUsd).toLocaleString()}</p>
                <p className="text-xs text-gray-400">${(p.priceUSD || 0).toFixed(2)}</p>
              </TableCell>
              <TableCell>
                <Badge variant={p.isActive ? 'default' : 'secondary'}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(p)}
                    className="h-8 w-8 p-0 hover:text-blue-600">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(p.id, p.name)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
