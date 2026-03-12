// ─── Product Auto-Fill Database ───────────────────────────────────────────────
// Provides name, specs, and description for known brand/model combinations.
// Falls back to a smart generated template for unlisted models.

export interface AutoFillEntry {
  name: string;
  specs: string[];
  details: string;
}

type AutoFillDB = Record<string, Record<string, Record<string, AutoFillEntry>>>;

// ─── Main Database ─────────────────────────────────────────────────────────────
const PRODUCT_AUTO_FILL: AutoFillDB = {

  // ══════════════════════════════ PHONES ═══════════════════════════════════════
  Phones: {
    Apple: {
      'iPhone 7': {
        name: 'Apple iPhone 7',
        specs: ['4.7" Retina HD IPS LCD', 'Apple A10 Fusion chip', '12MP OIS rear camera f/1.8', '7MP FaceTime HD front camera', '1960mAh battery', 'IP67 water & dust resistance', 'Touch ID fingerprint sensor', '3D Touch display'],
        details: 'The Apple iPhone 7 was a landmark release that introduced IP67 water resistance and removed the headphone jack. The A10 Fusion chip delivers impressive performance, and the 12MP OIS camera captures sharp, vivid photos in any lighting condition. Its timeless design remains iconic.',
      },
      'iPhone 7 Plus': {
        name: 'Apple iPhone 7 Plus',
        specs: ['5.5" Retina HD IPS LCD', 'Apple A10 Fusion chip', 'Dual 12MP cameras: wide f/1.8 + telephoto f/2.8', '7MP TrueDepth front camera', '2900mAh battery', 'IP67 water resistance', 'Touch ID', 'Portrait Mode bokeh effect'],
        details: 'The iPhone 7 Plus introduced Apple\'s first dual-camera system, enabling Portrait Mode with stunning depth-of-field effects. The large 5.5-inch Retina display and 2900mAh battery deliver all-day performance, while the A10 Fusion handles the most demanding apps with ease.',
      },
      'iPhone 8': {
        name: 'Apple iPhone 8',
        specs: ['4.7" Retina HD IPS LCD', 'Apple A11 Bionic chip with Neural Engine', '12MP OIS rear camera, 4K video', '7MP FaceTime HD front camera', 'Wireless Qi charging', 'IP67 water resistance', 'Touch ID', 'Glass back design'],
        details: 'The iPhone 8 introduces wireless Qi charging and the A11 Bionic chip — the first smartphone chip with a dedicated Neural Engine. The upgraded 12MP camera records 4K at 60fps, and the premium glass design looks stunning in Midnight Black, Silver, or Gold.',
      },
      'iPhone 8 Plus': {
        name: 'Apple iPhone 8 Plus',
        specs: ['5.5" Retina HD IPS LCD', 'Apple A11 Bionic chip', 'Dual 12MP cameras: wide f/1.8 + telephoto f/2.8', '7MP TrueDepth front camera', '2691mAh battery', 'IP67 water resistance', 'Portrait Lighting', 'Wireless Qi charging'],
        details: 'The iPhone 8 Plus brings Portrait Lighting for studio-quality photos alongside the A11 Bionic chip with Neural Engine. The 5.5-inch display offers an immersive experience, and wireless charging makes it even more convenient. Its dual-camera system delivers 2× optical zoom and beautiful bokeh.',
      },
      'iPhone X': {
        name: 'Apple iPhone X',
        specs: ['5.8" Super Retina OLED 2436×1125', 'Apple A11 Bionic chip', 'Dual 12MP cameras with dual OIS', '7MP TrueDepth front camera', '2716mAh battery', 'IP67 water resistance', 'Face ID facial recognition', 'Wireless Qi charging', 'Animoji'],
        details: 'The iPhone X (ten) was Apple\'s most radical redesign in a decade — edge-to-edge Super Retina OLED display, no home button, and Face ID replacing Touch ID. The TrueDepth camera enables Animoji and Portrait Mode selfies, and the A11 Bionic chip leads all smartphones in performance.',
      },
      'iPhone XS': {
        name: 'Apple iPhone XS',
        specs: ['5.8" Super Retina OLED 2436×1125', 'Apple A12 Bionic chip (7nm)', 'Dual 12MP cameras with Smart HDR', '7MP TrueDepth front camera', 'IP68 water resistance (2m)', 'Face ID', 'Wireless charging', 'Dual SIM support'],
        details: 'The iPhone XS is powered by the A12 Bionic — the world\'s first 7nm chip — delivering up to 50% faster CPU and 60% faster GPU over the iPhone X. Smart HDR pulls out incredible detail in challenging lighting, and IP68 water resistance ensures durability in everyday situations.',
      },
      'iPhone XS Max': {
        name: 'Apple iPhone XS Max',
        specs: ['6.5" Super Retina OLED 2688×1242', 'Apple A12 Bionic chip (7nm)', 'Dual 12MP cameras with Smart HDR', '7MP TrueDepth front camera', '3174mAh battery', 'IP68 water resistance (2m)', 'Face ID', '4GB RAM'],
        details: 'The iPhone XS Max is the largest iPhone Apple had ever made, featuring a stunning 6.5-inch OLED display and all-day battery life. The A12 Bionic with 4GB RAM handles any task effortlessly, and Smart HDR makes every photo look professionally lit.',
      },
      'iPhone XR': {
        name: 'Apple iPhone XR',
        specs: ['6.1" Liquid Retina IPS LCD 1792×828', 'Apple A12 Bionic chip', '12MP wide camera f/1.8 with OIS', '7MP TrueDepth front camera', '2942mAh battery (best-ever for iPhone at launch)', 'IP67 water resistance', 'Face ID', '6 color options'],
        details: 'The iPhone XR delivers the best battery life ever in an iPhone up to that point, combined with Face ID and the A12 Bionic chip at a more accessible price. Available in six beautiful colors, the 6.1-inch Liquid Retina display offers vibrant visuals for everyday use.',
      },
      'iPhone 11': {
        name: 'Apple iPhone 11',
        specs: ['6.1" Liquid Retina IPS LCD', 'Apple A13 Bionic chip', 'Dual 12MP: ultra-wide f/2.4 + wide f/1.8', '12MP TrueDepth front camera', '3110mAh battery', 'IP68 water resistance (2m)', 'Night Mode photography', '4K video at 60fps', '5 color options'],
        details: 'The iPhone 11 introduces Night Mode for stunning low-light photography and an ultra-wide camera for expansive landscape shots. The A13 Bionic chip is the fastest in any smartphone, and the redesigned dual-camera system with audio zoom makes video creation more immersive than ever.',
      },
      'iPhone 11 Pro': {
        name: 'Apple iPhone 11 Pro',
        specs: ['5.8" Super Retina XDR OLED', 'Apple A13 Bionic chip', 'Triple 12MP: telephoto f/2.0 + wide f/1.8 + ultra-wide f/2.4', '12MP TrueDepth front camera', 'IP68 (4m)', 'Night Mode & Deep Fusion', 'ProRAW capable', 'Surgical-grade stainless steel frame'],
        details: 'The iPhone 11 Pro brought a breakthrough triple-camera system enabling wide, ultra-wide, and telephoto photography in one pocket-sized device. The Super Retina XDR display delivers the highest brightness and contrast ever on an iPhone, making it the first Pro-branded iPhone.',
      },
      'iPhone 11 Pro Max': {
        name: 'Apple iPhone 11 Pro Max',
        specs: ['6.5" Super Retina XDR OLED', 'Apple A13 Bionic chip', 'Triple 12MP cameras with Night Mode on all', '12MP TrueDepth front camera', '3969mAh battery (longest iPhone battery life at launch)', 'IP68 (4m)', 'Dolby Vision & HDR10 display', 'Deep Fusion'],
        details: 'The iPhone 11 Pro Max is the ultimate Pro iPhone of 2019, combining the triple-camera system with Apple\'s largest-ever battery for exceptional all-day (and beyond) performance. The 6.5-inch Super Retina XDR display with Dolby Vision support produces breathtaking visual quality.',
      },
      'iPhone SE (2020)': {
        name: 'Apple iPhone SE (2020)',
        specs: ['4.7" Retina HD IPS LCD', 'Apple A13 Bionic chip (same as iPhone 11)', '12MP wide camera f/1.8, 4K video', '7MP FaceTime front camera', 'IP67 water resistance', 'Touch ID home button', 'Wireless Qi charging', 'Compact one-handed design'],
        details: 'The iPhone SE (2020) packs the powerful A13 Bionic chip — the same found in iPhone 11 Pro — into the beloved compact 4.7-inch design at the most affordable new iPhone price ever. Perfect for those who love Touch ID and a smaller form factor without sacrificing performance.',
      },
      'iPhone 12': {
        name: 'Apple iPhone 12',
        specs: ['6.1" Super Retina XDR OLED 2532×1170', 'Apple A14 Bionic chip (5nm)', 'Dual 12MP: ultra-wide + wide f/1.6', '12MP TrueDepth front camera', 'IP68 (6m)', '5G connectivity', 'MagSafe magnetic wireless charging', 'Ceramic Shield front glass', 'Flat-edge design'],
        details: 'The iPhone 12 ushered in the 5G era for Apple in a bold flat-edge design reminiscent of iPhone 4. The A14 Bionic — the world\'s first 5nm chip — delivers massive efficiency gains, and MagSafe enables a new ecosystem of magnetically attaching accessories and chargers.',
      },
      'iPhone 12 Mini': {
        name: 'Apple iPhone 12 Mini',
        specs: ['5.4" Super Retina XDR OLED 2340×1080', 'Apple A14 Bionic chip (5nm)', 'Dual 12MP cameras with Night Mode', '12MP TrueDepth front camera', 'IP68 (6m)', '5G', 'MagSafe charging', 'Smallest 5G smartphone available', 'Flat-edge design'],
        details: 'The iPhone 12 Mini is the world\'s smallest 5G smartphone, fitting a full-power A14 Bionic chip and dual-camera system into a body smaller than iPhone SE. Perfect for one-handed use, it offers the complete iPhone 12 experience — 5G, OLED, Night Mode, and MagSafe — in a truly pocket-friendly size.',
      },
      'iPhone 12 Pro': {
        name: 'Apple iPhone 12 Pro',
        specs: ['6.1" Super Retina XDR OLED', 'Apple A14 Bionic chip', 'Triple 12MP cameras + LiDAR Scanner', '12MP TrueDepth front camera', 'IP68 (6m)', '5G + MagSafe', 'ProRAW photography', 'Stainless steel + Ceramic Shield', '4K Dolby Vision recording'],
        details: 'The iPhone 12 Pro introduces the LiDAR Scanner for dramatically improved AR and low-light autofocus. ProRAW support gives photographers unprecedented control in post-processing, and the 4K Dolby Vision video recording at 60fps delivers cinematic quality from a smartphone.',
      },
      'iPhone 12 Pro Max': {
        name: 'Apple iPhone 12 Pro Max',
        specs: ['6.7" Super Retina XDR OLED 2778×1284', 'Apple A14 Bionic chip', 'Triple 12MP cameras with sensor-shift OIS + LiDAR', '12MP TrueDepth front camera', '3687mAh battery', 'IP68 (6m)', '5G + MagSafe', 'Sensor-shift OIS (next-gen stabilization)', '47% larger main sensor'],
        details: 'The iPhone 12 Pro Max has the most capable camera system in iPhone history, featuring a 47% larger sensor on the main camera and sensor-shift optical image stabilization for dramatically stable handheld video. The 6.7-inch display is Apple\'s largest OLED screen yet.',
      },
      'iPhone 13': {
        name: 'Apple iPhone 13',
        specs: ['6.1" Super Retina XDR OLED 2532×1170', 'Apple A15 Bionic chip', 'Dual 12MP cameras with sensor-shift OIS', '12MP TrueDepth front camera', '3227mAh battery (+2.5 hrs vs iPhone 12)', 'IP68 (6m)', '5G + MagSafe', 'Cinematic mode video', 'Photographic Styles'],
        details: 'The iPhone 13 delivers a massive 2.5-hour battery improvement alongside Cinematic mode — a first-of-its-kind feature that automatically creates depth-of-field video — and Photographic Styles for consistent personalized photos. The A15 Bionic is the fastest chip in any smartphone.',
      },
      'iPhone 13 Mini': {
        name: 'Apple iPhone 13 Mini',
        specs: ['5.4" Super Retina XDR OLED 2340×1080', 'Apple A15 Bionic chip', 'Dual 12MP cameras with sensor-shift OIS on main', '12MP TrueDepth front camera', '2406mAh battery (+1.5 hrs vs iPhone 12 Mini)', 'IP68 (6m)', '5G + MagSafe', 'Cinematic mode video'],
        details: 'The iPhone 13 Mini improves on every aspect of the 12 Mini — bigger battery, better cameras with sensor-shift OIS, faster A15 Bionic chip, and Cinematic mode — all in the same compact form factor. It remains the most powerful small smartphone ever made.',
      },
      'iPhone 13 Pro': {
        name: 'Apple iPhone 13 Pro',
        specs: ['6.1" Super Retina XDR OLED, ProMotion 120Hz', 'Apple A15 Bionic chip (5-core GPU)', 'Triple 12MP cameras: macro + wide f/1.5 + 3× telephoto', 'LiDAR Scanner', '12MP TrueDepth front camera', '3095mAh battery', 'IP68 (6m)', 'ProRes video recording', '5G + MagSafe'],
        details: 'The iPhone 13 Pro introduced ProMotion 120Hz adaptive refresh rate and macro photography to iPhone for the first time. ProRes video recording supports professional post-production workflows, and the 77mm telephoto lens with 3× optical zoom is exceptional for portraits and candid photography.',
      },
      'iPhone 13 Pro Max': {
        name: 'Apple iPhone 13 Pro Max',
        specs: ['6.7" Super Retina XDR OLED, ProMotion 120Hz 458ppi', 'Apple A15 Bionic chip (5-core GPU)', 'Triple 12MP cameras with macro + 3× telephoto', 'LiDAR Scanner', '12MP TrueDepth front camera', '4352mAh battery (best iPhone battery at launch)', 'IP68 (6m)', 'ProRes video', '5G + MagSafe'],
        details: 'The iPhone 13 Pro Max offers Apple\'s best-ever battery life — up to 28 hours of video playback — alongside ProMotion 120Hz and ProRes video recording. Macro Photography reveals an entirely new world, capturing stunning close-ups down to 2cm with the ultra-wide camera.',
      },
      'iPhone SE (2022)': {
        name: 'Apple iPhone SE (2022)',
        specs: ['4.7" Retina HD IPS LCD', 'Apple A15 Bionic chip (same as iPhone 13 Pro)', '12MP wide camera f/1.8, Smart HDR 4', '7MP FaceTime front camera', 'IP67 water resistance', 'Touch ID home button', '5G connectivity', 'MagSafe wireless charging', 'Ceramic Shield'],
        details: 'The iPhone SE (2022) is the most affordable 5G iPhone, powered by the same A15 Bionic chip as the iPhone 13 Pro. Touch ID returns for those who prefer it, and Ceramic Shield front glass provides excellent drop protection. It\'s the perfect entry into the iOS ecosystem with future-proof 5G.',
      },
      'iPhone 14': {
        name: 'Apple iPhone 14',
        specs: ['6.1" Super Retina XDR OLED 2532×1170', 'Apple A15 Bionic chip', 'Dual 12MP: ultra-wide + main with sensor-shift OIS', '12MP TrueDepth front camera with autofocus (new)', '3279mAh battery', 'IP68 (6m)', 'Crash Detection & Emergency SOS via Satellite', 'Action Mode video stabilization', '5G + MagSafe'],
        details: 'The iPhone 14 introduces life-saving features including Crash Detection and Emergency SOS via Satellite for use in remote areas without cell coverage. The front camera gains autofocus for the first time, and Action Mode delivers gimbal-like stabilization for on-the-go video.',
      },
      'iPhone 14 Plus': {
        name: 'Apple iPhone 14 Plus',
        specs: ['6.7" Super Retina XDR OLED 2778×1284', 'Apple A15 Bionic chip', 'Dual 12MP cameras with autofocus front camera', '12MP TrueDepth front camera', '4323mAh battery (26h video — longest non-Pro iPhone)', 'IP68 (6m)', 'Crash Detection + Emergency SOS via Satellite', '5G + MagSafe'],
        details: 'The iPhone 14 Plus offers the large 6.7-inch Super Retina XDR experience of the Pro Max at the standard price, with exceptional 26-hour battery life making it the longest-lasting non-Pro iPhone ever. Crash Detection and Satellite SOS provide real-world safety on adventures.',
      },
      'iPhone 14 Pro': {
        name: 'Apple iPhone 14 Pro',
        specs: ['6.1" Super Retina XDR OLED, ProMotion 120Hz, Always-On display', 'Apple A16 Bionic chip (4nm)', 'Triple cameras: 48MP main + 12MP ultra-wide + 12MP 3× telephoto', '12MP TrueDepth autofocus front camera', '3200mAh battery', 'IP68 (6m)', 'Dynamic Island (replaces notch)', 'Emergency SOS via Satellite + Crash Detection', '5G + MagSafe'],
        details: 'The iPhone 14 Pro revolutionizes the iPhone experience with Dynamic Island — a software-defined pill that hosts Live Activities and notifications — and the Always-On display that keeps glanceable information visible at all times. The 48MP main camera captures extraordinary detail for later cropping and editing.',
      },
      'iPhone 14 Pro Max': {
        name: 'Apple iPhone 14 Pro Max',
        specs: ['6.7" Super Retina XDR OLED, ProMotion 120Hz, Always-On display', 'Apple A16 Bionic chip (4nm)', 'Triple cameras: 48MP main + 12MP ultra-wide + 12MP 3× telephoto', '12MP TrueDepth autofocus front camera', '4323mAh battery (29h video)', 'IP68 (6m)', 'Dynamic Island', 'Emergency SOS via Satellite', '5G + MagSafe'],
        details: 'The iPhone 14 Pro Max is the ultimate iPhone with the A16 Bionic chip, 48MP ProCamera system, Always-On Dynamic Island display, and 29-hour video playback battery life. Its extraordinary combination of power, camera capability, and safety features represents the pinnacle of Apple engineering.',
      },
      'iPhone 15': {
        name: 'Apple iPhone 15',
        specs: ['6.1" Super Retina XDR OLED 2556×1179, Dynamic Island', 'Apple A16 Bionic chip', 'Dual cameras: 48MP main f/1.6 + 12MP ultra-wide', '12MP TrueDepth autofocus front camera', '3349mAh battery', 'IP68 (6m)', 'USB-C connector (goodbye Lightning)', 'Emergency SOS via Satellite + Roadside Assistance', '5G + MagSafe'],
        details: 'The iPhone 15 brings the Dynamic Island and 48MP main camera from the previous Pro lineup to the standard model, alongside the long-awaited switch to USB-C. The A16 Bionic chip delivers outstanding performance and the improved camera system makes every photo and video look exceptional.',
      },
      'iPhone 15 Plus': {
        name: 'Apple iPhone 15 Plus',
        specs: ['6.7" Super Retina XDR OLED 2796×1290, Dynamic Island', 'Apple A16 Bionic chip', 'Dual cameras: 48MP main + 12MP ultra-wide', '12MP TrueDepth autofocus front camera', '4383mAh battery (longest-lasting Plus)', 'IP68 (6m)', 'USB-C connector', '5G + MagSafe'],
        details: 'The iPhone 15 Plus delivers Apple\'s best non-Pro battery life in the large 6.7-inch form factor with a 48MP main camera and USB-C connectivity. Dynamic Island transforms notifications into an interactive element, and the A16 Bionic ensures years of smooth performance ahead.',
      },
      'iPhone 15 Pro': {
        name: 'Apple iPhone 15 Pro',
        specs: ['6.1" Super Retina XDR OLED, ProMotion 120Hz, Always-On', 'Apple A17 Pro chip (3nm — world\'s first)', 'Triple cameras: 48MP main + 12MP ultra-wide + 12MP 3× telephoto', '12MP TrueDepth front camera', '3274mAh battery', 'IP68 (6m)', 'Titanium frame + Action Button', 'USB-C 3 (USB 3.2 Gen 2)', 'Log video + ProRes to external storage'],
        details: 'The iPhone 15 Pro is Apple\'s first smartphone with a titanium frame and the A17 Pro — the world\'s first 3nm chip — enabling hardware ray tracing for console-quality gaming. USB-C 3 unlocks blazing-fast file transfers, and ProRes video can now be recorded directly to external drives.',
      },
      'iPhone 15 Pro Max': {
        name: 'Apple iPhone 15 Pro Max',
        specs: ['6.7" Super Retina XDR OLED, ProMotion 120Hz, Always-On', 'Apple A17 Pro chip (3nm)', 'Triple cameras: 48MP main + 12MP ultra-wide + 12MP 5× tetraprism telephoto', '12MP TrueDepth front camera', '4422mAh battery', 'IP68 (6m)', 'Titanium frame + Action Button', 'USB-C 3', '5× optical zoom (first on iPhone)'],
        details: 'The iPhone 15 Pro Max exclusively features 5× optical zoom via a revolutionary tetraprism telephoto lens — the most versatile zoom ever in an iPhone. Combined with the A17 Pro chip, titanium frame, and massive battery, it stands as the definitive smartphone for photographers and power users.',
      },
      'iPhone 16': {
        name: 'Apple iPhone 16',
        specs: ['6.1" Super Retina XDR OLED 2556×1179, Dynamic Island', 'Apple A18 chip (3nm)', 'Dual cameras: 48MP main f/1.6 + 12MP ultra-wide with macro', '12MP TrueDepth front camera', '3561mAh battery', 'IP68 (6m)', 'Camera Control button + Action Button', 'Apple Intelligence capable', 'USB-C'],
        details: 'The iPhone 16 is the first iPhone built from the ground up for Apple Intelligence, featuring the A18 chip with an enhanced Neural Engine. The new Camera Control button provides tactile, dedicated camera access with analog scroll functionality. The ultra-wide camera gains macro photography, expanding creative possibilities.',
      },
      'iPhone 16 Plus': {
        name: 'Apple iPhone 16 Plus',
        specs: ['6.7" Super Retina XDR OLED 2796×1290, Dynamic Island', 'Apple A18 chip (3nm)', 'Dual cameras: 48MP main + 12MP ultra-wide with macro', '12MP TrueDepth front camera', '4674mAh battery (best-ever non-Pro)', 'IP68 (6m)', 'Camera Control + Action Button', 'Apple Intelligence', 'USB-C'],
        details: 'The iPhone 16 Plus delivers Apple\'s best-ever non-Pro battery life with a record-breaking 4674mAh cell, alongside full Apple Intelligence support powered by the A18 chip. Camera Control makes photography more intuitive than ever, and the spacious 6.7-inch OLED display is perfect for content creation and consumption.',
      },
      'iPhone 16 Pro': {
        name: 'Apple iPhone 16 Pro',
        specs: ['6.3" Super Retina XDR OLED, ProMotion 120Hz, Always-On', 'Apple A18 Pro chip (3nm)', 'Triple cameras: 48MP main + 48MP ultra-wide + 12MP 5× telephoto', '24MP TrueDepth front camera (new)', '3582mAh battery', 'IP68 (6m)', 'Camera Control + Action Button', 'USB-C 3', '4K 120fps ProRes video + Apple Intelligence'],
        details: 'The iPhone 16 Pro features the largest display ever on a Pro at 6.3 inches, alongside a 48MP ultra-wide camera for the first time and the ability to record 4K ProRes video at 120fps. The A18 Pro chip leads all smartphones in AI and GPU performance, powering the most advanced Apple Intelligence features.',
      },
      'iPhone 16 Pro Max': {
        name: 'Apple iPhone 16 Pro Max',
        specs: ['6.9" Super Retina XDR OLED, ProMotion 120Hz, Always-On', 'Apple A18 Pro chip (3nm)', 'Triple cameras: 48MP main + 48MP ultra-wide + 12MP 5× telephoto', '24MP TrueDepth front camera', '4685mAh battery (33h video — record)', 'IP68 (6m)', 'Camera Control + Action Button', 'USB-C 3', '4K 120fps ProRes + Apple Intelligence'],
        details: 'The iPhone 16 Pro Max is Apple\'s largest and most powerful iPhone ever, with a 6.9-inch Always-On ProMotion display, the record-breaking 33-hour video battery, and the A18 Pro chip\'s unmatched AI and computational photography capabilities. The 48MP ultra-wide and 4K 120fps ProRes make it a professional cinema tool in your pocket.',
      },
    },

    Samsung: {
      'Galaxy S7': {
        name: 'Samsung Galaxy S7',
        specs: ['5.1" QHD Super AMOLED 2560×1440 577ppi', 'Snapdragon 820 / Exynos 8890', '12MP Dual Pixel f/1.7 rear camera', '5MP front camera', '3000mAh battery, fast & wireless charging', 'IP68 water & dust resistance', 'Always-On Display', 'microSD slot (up to 200GB)'],
        details: 'The Galaxy S7 made a triumphant return of the microSD slot and introduced IP68 water resistance alongside groundbreaking Dual Pixel autofocus technology for lightning-fast focus in any lighting. The Always-On Display lets you glance at the time and notifications without waking the screen.',
      },
      'Galaxy S7 Edge': {
        name: 'Samsung Galaxy S7 Edge',
        specs: ['5.5" Dual Edge QHD Super AMOLED', 'Snapdragon 820 / Exynos 8890', '12MP Dual Pixel f/1.7 rear camera', '5MP front camera', '3600mAh battery', 'IP68 water resistance', 'Curved Edge screen + Edge Panels', 'microSD support'],
        details: 'The Galaxy S7 Edge is one of the most beautiful smartphones ever crafted, with its dual-curved AMOLED display wrapping elegantly around both sides. A larger 3600mAh battery provides all-day use, and Edge Panels offer quick-access shortcuts to favourite contacts and apps.',
      },
      'Galaxy S8': {
        name: 'Samsung Galaxy S8',
        specs: ['5.8" Infinity Display Super AMOLED 2960×1440 curved', 'Snapdragon 835 / Exynos 8895', '12MP Dual Pixel f/1.7 rear camera', '8MP front camera', '3000mAh battery', 'IP68 water resistance', 'Bixby AI assistant', 'Iris scanner + face recognition', 'USB-C'],
        details: 'The Galaxy S8 introduced the Infinity Display — edge-to-edge screen with minimal bezels — setting the standard for all modern smartphones. Bixby brings AI-powered smarts, and multiple biometric options (iris, face, and fingerprint) offer flexible unlocking.',
      },
      'Galaxy S8+': {
        name: 'Samsung Galaxy S8+',
        specs: ['6.2" Infinity Display Super AMOLED 2960×1440 curved', 'Snapdragon 835 / Exynos 8895', '12MP Dual Pixel f/1.7 rear camera', '8MP front camera', '3500mAh battery', 'IP68 water resistance', 'Samsung DeX desktop support', 'Bixby AI', 'USB-C'],
        details: 'The Galaxy S8+ expands on the S8 with a magnificent 6.2-inch Infinity Display. Samsung DeX support connects the phone to a monitor for a full desktop computing experience, making it the most versatile Galaxy flagship yet.',
      },
      'Galaxy Note 8': {
        name: 'Samsung Galaxy Note 8',
        specs: ['6.3" Infinity Display Super AMOLED 2960×1440', 'Snapdragon 835 / Exynos 8895', 'Dual 12MP cameras: wide f/1.7 + telephoto f/2.4 (both OIS)', '8MP front camera', '3300mAh battery', 'IP68 water resistance', 'S Pen with Live Message', 'DeX desktop support', 'USB-C'],
        details: 'The Galaxy Note 8 brought dual cameras — both with OIS — to Samsung\'s Note line for the first time. The S Pen\'s Live Message lets you write animated GIFs, and instant Translation works across any app. The expansive 6.3-inch display makes reading, writing, and creating a pleasure.',
      },
      'Galaxy S9': {
        name: 'Samsung Galaxy S9',
        specs: ['5.8" Infinity Display Super AMOLED 2960×1440', 'Snapdragon 845 / Exynos 9810', '12MP variable aperture camera (f/1.5–f/2.4)', '8MP front camera', '3000mAh battery', 'IP68 water resistance', 'Super Slow-Mo 960fps video', 'AR Emoji', 'Stereo speakers by AKG'],
        details: 'The Galaxy S9 features the world\'s first variable aperture camera lens, switching between f/1.5 (night) and f/2.4 (daylight) to optimise every shot. Super Slow-Mo at 960fps creates cinema-quality slow-motion clips, and stereo speakers tuned by AKG deliver rich audio.',
      },
      'Galaxy S9+': {
        name: 'Samsung Galaxy S9+',
        specs: ['6.2" Infinity Display Super AMOLED 2960×1440', 'Snapdragon 845 / Exynos 9810', 'Dual 12MP: variable aperture + telephoto f/2.4', '8MP front camera', '3500mAh battery', 'IP68 water resistance', '960fps Super Slow-Mo', '6GB RAM', 'microSD support'],
        details: 'The Galaxy S9+ brings the variable aperture innovation to a larger canvas with a dual-camera system adding 2× optical zoom. The 6GB RAM ensures effortless multitasking, and the larger 6.2-inch Infinity Display makes it perfect for media consumption and mobile gaming.',
      },
      'Galaxy Note 9': {
        name: 'Samsung Galaxy Note 9',
        specs: ['6.4" Infinity Display Super AMOLED 2960×1440', 'Snapdragon 845 / Exynos 9810', 'Dual 12MP: variable aperture + telephoto f/2.4', '8MP front camera', '4000mAh battery', 'IP68 water resistance', 'Bluetooth S Pen (remote shutter & presenter)', 'microSD up to 512GB', '6GB/8GB RAM'],
        details: 'The Galaxy Note 9 is Samsung\'s most powerful Note ever, with a revolutionary Bluetooth S Pen that works as a remote shutter and presentation clicker. The 4000mAh battery delivers all-day use, and massive microSD support combined with generous RAM makes it the ultimate productivity powerhouse.',
      },
      'Galaxy S10e': {
        name: 'Samsung Galaxy S10e',
        specs: ['5.8" Dynamic AMOLED 2280×1080 flat display', 'Snapdragon 855 / Exynos 9820', 'Dual cameras: 12MP wide f/1.5–2.4 + 16MP ultra-wide', '10MP punch-hole front camera', '3100mAh battery', 'IP68 water resistance', 'Side-mounted fingerprint sensor', '6GB RAM'],
        details: 'The Galaxy S10e brings flagship S10 performance and ultra-wide camera to a compact 5.8-inch flat display at a more accessible price. The fast side-mounted fingerprint sensor unlocks the phone in a natural thumbprint motion, and the Snapdragon 855 ensures class-leading performance.',
      },
      'Galaxy S10': {
        name: 'Samsung Galaxy S10',
        specs: ['6.1" Dynamic AMOLED 3040×1440 punch-hole Infinity-O', 'Snapdragon 855 / Exynos 9820', 'Triple cameras: 12MP wide + 12MP telephoto f/2.4 + 16MP ultra-wide', '10MP punch-hole front camera', '3400mAh battery', 'IP68 water resistance', 'In-display ultrasonic fingerprint sensor', 'Wireless PowerShare', '8GB RAM'],
        details: 'The Galaxy S10 pioneered the in-display ultrasonic fingerprint sensor and punch-hole Infinity-O display. Wireless PowerShare lets you charge Qi devices using your S10\'s back, and the triple-camera system with ultra-wide lens opens creative new perspectives.',
      },
      'Galaxy S10+': {
        name: 'Samsung Galaxy S10+',
        specs: ['6.4" Dynamic AMOLED 3040×1440 dual punch-hole', 'Snapdragon 855 / Exynos 9820', 'Triple cameras: 12MP wide + 12MP telephoto + 16MP ultra-wide', 'Dual 10MP + 8MP punch-hole front cameras', '4100mAh battery', 'IP68 water resistance', 'In-display ultrasonic fingerprint', 'Wireless PowerShare', '8GB/12GB RAM'],
        details: 'The Galaxy S10+ is Samsung\'s most capable S10, with a dual front-camera system in the punch-hole and a generous 4100mAh battery that easily lasts all day. The 12GB RAM option makes it a true multitasking monster capable of handling every task simultaneously.',
      },
      'Galaxy Note 10': {
        name: 'Samsung Galaxy Note 10',
        specs: ['6.3" Dynamic AMOLED 2280×1080 punch-hole', 'Snapdragon 855 / Exynos 9825', 'Triple cameras: 12MP wide + 12MP telephoto + 16MP ultra-wide', '10MP front camera', '3500mAh battery', 'IP68 water resistance', 'S Pen with Air Actions gestures', '45W USB-C fast charging', '8GB RAM'],
        details: 'The Galaxy Note 10 introduces Air Actions — gesture-based control of camera, media, and apps with a flick of the S Pen — making it the most interactive Note ever. The 45W USB-C fast charging tops up the battery quickly, and the Exynos 9825 7nm chip delivers efficient, powerful performance.',
      },
      'Galaxy Note 10+': {
        name: 'Samsung Galaxy Note 10+',
        specs: ['6.8" Dynamic AMOLED 3040×1440 punch-hole', 'Snapdragon 855 / Exynos 9825', 'Quad cameras: 12MP + 12MP telephoto + 16MP ultra-wide + ToF depth sensor', '10MP front camera', '4300mAh battery', 'IP68 water resistance', 'S Pen with Air Actions', '45W fast charging', '12GB RAM'],
        details: 'The Galaxy Note 10+ is the ultimate Note, featuring a massive 6.8-inch QHD Dynamic AMOLED display, quad rear cameras with ToF depth sensor, and 12GB RAM. Air Actions transform the S Pen into a gesture remote, and 45W fast charging restores the 4300mAh battery in about an hour.',
      },
      'Galaxy S20': {
        name: 'Samsung Galaxy S20',
        specs: ['6.2" Dynamic AMOLED 2X 120Hz 3200×1440', 'Snapdragon 865 / Exynos 990', 'Triple cameras: 12MP wide + 64MP telephoto (3× hybrid) + 12MP ultra-wide', '10MP front camera', '4000mAh battery, 25W charging', 'IP68 water resistance', '8K video recording', 'Single Take AI mode', '5G'],
        details: 'The Galaxy S20 ushered in the 120Hz Super Smooth display era alongside 5G and 8K video recording. Single Take captures photos and videos across all modes simultaneously with one press. The 64MP telephoto delivers impressive 30× Space Zoom for distant subjects.',
      },
      'Galaxy S20+': {
        name: 'Samsung Galaxy S20+',
        specs: ['6.7" Dynamic AMOLED 2X 120Hz 3200×1440', 'Snapdragon 865 / Exynos 990', 'Quad cameras: 12MP + 64MP telephoto + 12MP ultra-wide + ToF', '10MP front camera', '4500mAh battery', 'IP68 water resistance', '8K video', '5G', '12GB RAM'],
        details: 'The Galaxy S20+ is the sweet spot in the S20 lineup with a spacious 6.7-inch 120Hz display, quad rear cameras, and a generous 4500mAh battery. The ToF depth sensor improves Live Focus portrait effects, and 5G ensures you\'re on the fastest available networks.',
      },
      'Galaxy S20 Ultra': {
        name: 'Samsung Galaxy S20 Ultra',
        specs: ['6.9" Dynamic AMOLED 2X 120Hz 3200×1440', 'Snapdragon 865 / Exynos 990', 'Quad cameras: 108MP + 48MP periscope (100× Space Zoom) + 12MP ultra-wide + ToF', '40MP selfie camera', '5000mAh battery, 45W charging', 'IP68 water resistance', '8K video', '5G', '12GB/16GB RAM'],
        details: 'The Galaxy S20 Ultra pushes boundaries with a 108MP camera, 100× Space Zoom, and 8K video. The 5000mAh battery with 45W super-fast charging keeps pace with the demanding 120Hz QHD display, and a 40MP punch-hole selfie camera captures stunning self-portraits.',
      },
      'Galaxy S21': {
        name: 'Samsung Galaxy S21',
        specs: ['6.2" Dynamic AMOLED 2X 120Hz adaptive 2400×1080', 'Snapdragon 888 / Exynos 2100', 'Triple cameras: 12MP wide + 64MP telephoto + 12MP ultra-wide', '10MP front camera', '4000mAh battery, 25W charging', 'IP68 water resistance', 'Contour Cut camera design', '5G', '8GB RAM'],
        details: 'The Galaxy S21 features a bold Contour Cut camera housing and adaptive 120Hz display that saves battery by adjusting refresh rate intelligently. Director\'s View lets you see all camera perspectives simultaneously while recording, making mobile filmmaking more intuitive.',
      },
      'Galaxy S21+': {
        name: 'Samsung Galaxy S21+',
        specs: ['6.7" Dynamic AMOLED 2X 120Hz adaptive 2400×1080', 'Snapdragon 888 / Exynos 2100', 'Triple cameras: 12MP + 64MP telephoto + 12MP ultra-wide', '10MP front camera', '4800mAh battery, 25W charging', 'IP68 water resistance', '5G', '8GB RAM'],
        details: 'The Galaxy S21+ brings the S21 flagship experience to a larger 6.7-inch canvas with a bigger 4800mAh battery. The 30× Space Zoom and Director\'s View feature give mobile creators powerful storytelling tools at every scale.',
      },
      'Galaxy S21 Ultra': {
        name: 'Samsung Galaxy S21 Ultra',
        specs: ['6.8" Dynamic AMOLED 2X 120Hz adaptive 3200×1440', 'Snapdragon 888 / Exynos 2100', 'Quad cameras: 108MP + dual telephoto (3× + 10×) + 12MP ultra-wide', '40MP front camera', '5000mAh battery, 45W charging', 'IP68 water resistance', 'S Pen compatible (first S-series)', '100× Space Zoom', '12GB/16GB RAM'],
        details: 'The Galaxy S21 Ultra is the first S-series phone to support the S Pen, merging Note-class productivity with Ultra-level camera capabilities. The dual telephoto system offers 100× Space Zoom, and the 108MP sensor with a 40MP front camera makes it a complete photography powerhouse.',
      },
      'Galaxy S22': {
        name: 'Samsung Galaxy S22',
        specs: ['6.1" Dynamic AMOLED 2X 120Hz 2340×1080', 'Snapdragon 8 Gen 1 / Exynos 2200', 'Triple cameras: 50MP main f/1.8 + 12MP ultra-wide + 10MP telephoto 3×', '10MP front camera', '3700mAh battery, 25W charging', 'IP68 water resistance', 'Armour Aluminium frame', '5G', '8GB RAM'],
        details: 'The Galaxy S22 brings premium flagship performance to a compact 6.1-inch form, perfect for one-handed use. The 50MP Adaptive Pixel camera captures stunning photos by day and night, and the Exynos 2200 with AMD GPU delivers exceptional gaming visuals.',
      },
      'Galaxy S22+': {
        name: 'Samsung Galaxy S22+',
        specs: ['6.6" Dynamic AMOLED 2X 120Hz 2340×1080', 'Snapdragon 8 Gen 1 / Exynos 2200', 'Triple cameras: 50MP + 12MP ultra-wide + 10MP telephoto 3×', '10MP front camera', '4500mAh battery, 45W charging', 'IP68 water resistance', '5G', '8GB RAM'],
        details: 'The Galaxy S22+ offers the ideal balance of display size and battery capacity with a 6.6-inch Dynamic AMOLED and 45W fast charging. The ProVisual Engine processes photos with AI precision, delivering consistently vibrant and detailed results.',
      },
      'Galaxy S22 Ultra': {
        name: 'Samsung Galaxy S22 Ultra',
        specs: ['6.8" Dynamic AMOLED 2X 120Hz adaptive 3088×1440', 'Snapdragon 8 Gen 1 / Exynos 2200', 'Quad cameras: 108MP + 10MP 3× + 10MP 10× + 12MP ultra-wide', '40MP front camera', '5000mAh battery, 45W charging', 'IP68 water resistance', 'Built-in S Pen (0ms latency)', '100× Space Zoom', '8GB/12GB RAM'],
        details: 'The Galaxy S22 Ultra merges the Note and S series, with the S Pen permanently housed in the body itself. The 108MP camera with 100× Space Zoom and Expert RAW mode provides professional-grade photography, and the 6.8-inch QHD+ curved display is Samsung\'s most vivid ever.',
      },
      'Galaxy S23': {
        name: 'Samsung Galaxy S23',
        specs: ['6.1" Dynamic AMOLED 2X 120Hz 2340×1080', 'Snapdragon 8 Gen 2 (for Galaxy)', 'Triple cameras: 50MP main + 12MP ultra-wide + 10MP telephoto 3×', '12MP front camera', '3900mAh battery, 25W charging', 'IP68 water resistance', 'Armour Aluminium', '5G', '8GB RAM'],
        details: 'The Galaxy S23 is powered by the Snapdragon 8 Gen 2 for Galaxy — a performance-tuned variant delivering more speed and efficiency than any previous Galaxy. The 50MP main camera with a new sensor reduces noise significantly, and Gorilla Glass Victus 2 provides best-in-class drop protection.',
      },
      'Galaxy S23+': {
        name: 'Samsung Galaxy S23+',
        specs: ['6.6" Dynamic AMOLED 2X 120Hz 2340×1080', 'Snapdragon 8 Gen 2 (for Galaxy)', 'Triple cameras: 50MP + 12MP ultra-wide + 10MP 3×', '12MP front camera', '4700mAh battery, 45W charging', 'IP68 water resistance', '5G', '8GB RAM'],
        details: 'The Galaxy S23+ combines the Snapdragon 8 Gen 2 for Galaxy with a spacious 6.6-inch display and 4700mAh battery for sustained peak performance all day long. The 45W fast charging means less downtime, and the premium Armour Aluminium chassis is both light and extremely durable.',
      },
      'Galaxy S23 Ultra': {
        name: 'Samsung Galaxy S23 Ultra',
        specs: ['6.8" Dynamic AMOLED 2X 120Hz adaptive 3088×1440', 'Snapdragon 8 Gen 2 (for Galaxy)', 'Quad cameras: 200MP main + 10MP 3× + 10MP 10× + 12MP ultra-wide', '12MP front camera', '5000mAh battery, 45W charging', 'IP68 water resistance', 'Built-in S Pen', '5G', '8GB/12GB RAM'],
        details: 'The Galaxy S23 Ultra features the world\'s first 200MP camera sensor, capturing extraordinary detail that can be cropped to any dimension. The built-in S Pen with Note Assist uses Galaxy AI to summarise handwritten notes, and the Snapdragon 8 Gen 2 for Galaxy consistently leads Android in every benchmark.',
      },
      'Galaxy S24': {
        name: 'Samsung Galaxy S24',
        specs: ['6.2" Dynamic AMOLED 2X 120Hz 2340×1080', 'Snapdragon 8 Gen 3 (for Galaxy)', 'Triple cameras: 50MP main + 12MP ultra-wide + 10MP telephoto 3×', '12MP front camera', '4000mAh battery, 25W charging', 'IP68 water resistance', 'Galaxy AI: Circle to Search, Live Translate, Generative Edit', 'Titanium frame', '5G'],
        details: 'The Galaxy S24 introduces Galaxy AI, a suite of features including Circle to Search (draw around anything to search), Live Translate for real-time call translation, and Generative Edit to recompose photos. The titanium frame and Snapdragon 8 Gen 3 make it the most premium compact Galaxy ever.',
      },
      'Galaxy S24+': {
        name: 'Samsung Galaxy S24+',
        specs: ['6.7" Dynamic AMOLED 2X 120Hz QHD+ 3088×1440', 'Snapdragon 8 Gen 3 (for Galaxy)', 'Triple cameras: 50MP + 12MP ultra-wide + 10MP 3×', '12MP front camera', '4900mAh battery, 45W charging', 'IP68 water resistance', 'Galaxy AI', 'Titanium frame', '5G'],
        details: 'The Galaxy S24+ elevates the Galaxy AI experience on a larger QHD+ 6.7-inch display with peak brightness of 2600 nits — completely visible in direct sunlight. The titanium frame combines strength with reduced weight, and 45W fast charging restores power quickly.',
      },
      'Galaxy S24 Ultra': {
        name: 'Samsung Galaxy S24 Ultra',
        specs: ['6.8" Dynamic AMOLED 2X 120Hz 3088×1440', 'Snapdragon 8 Gen 3 (for Galaxy)', 'Quad cameras: 200MP main + 50MP 5× telephoto + 10MP 3× + 12MP ultra-wide', '12MP front camera', '5000mAh battery, 45W charging', 'IP68 water resistance', 'Built-in S Pen + Galaxy AI', 'Titanium frame', '5G'],
        details: 'The Galaxy S24 Ultra is the ultimate AI-powered flagship, combining a 200MP camera with a new 50MP 5× telephoto and the built-in S Pen. Note AI transforms handwritten notes into summaries and action items, and Sketch to Image converts drawings into detailed AI art. The titanium body sets a new standard for durability.',
      },
      'Galaxy Z Fold 4': {
        name: 'Samsung Galaxy Z Fold 4',
        specs: ['7.6" foldable Dynamic AMOLED 2X main 120Hz', '6.2" cover screen 120Hz', 'Snapdragon 8+ Gen 1', 'Triple cameras: 50MP + 10MP 3× + 12MP ultra-wide', '4400mAh battery, 25W charging', 'IPX8 water resistance', 'Under-display camera', 'Flex Mode multi-window', 'S Pen Fold Edition compatible'],
        details: 'The Galaxy Z Fold 4 is Samsung\'s most refined foldable, with a wider cover screen and improved hinge allowing three-app multi-tasking on the expansive 7.6-inch main display. Under-display camera keeps the inner screen uninterrupted, and S Pen support brings Note-class creativity to the foldable.',
      },
      'Galaxy Z Flip 4': {
        name: 'Samsung Galaxy Z Flip 4',
        specs: ['6.7" foldable Dynamic AMOLED 2X 120Hz', '1.9" cover screen', 'Snapdragon 8+ Gen 1', 'Dual cameras: 12MP wide f/1.8 + 12MP ultra-wide', '3700mAh battery, 25W charging', 'IPX8 water resistance', 'Flex Mode hands-free photography', 'Compact fold-in-half design', '8GB RAM'],
        details: 'The Galaxy Z Flip 4 combines fashion and function in a compact folding package. The improved Snapdragon 8+ Gen 1 and larger battery address previous generation limitations, while Flex Mode turns the phone into a tripod for hands-free photography and video calls.',
      },
      'Galaxy Z Fold 5': {
        name: 'Samsung Galaxy Z Fold 5',
        specs: ['7.6" foldable Dynamic AMOLED 2X main 120Hz', '6.2" cover screen 120Hz', 'Snapdragon 8 Gen 2 (for Galaxy)', 'Triple cameras: 50MP + 10MP 3× + 12MP ultra-wide', '4400mAh battery, 25W charging', 'IPX8 water resistance', 'Flex Hinge (flat close, no gap)', 'S Pen compatible', '12GB RAM'],
        details: 'The Galaxy Z Fold 5 introduces the Flex Hinge that closes completely flat for the first time — no gap, slimmer profile. The Snapdragon 8 Gen 2 for Galaxy delivers 43% faster GPU over its predecessor, and the hinge improvement makes it significantly thinner and lighter than the Fold 4.',
      },
      'Galaxy Z Flip 5': {
        name: 'Samsung Galaxy Z Flip 5',
        specs: ['6.7" foldable Dynamic AMOLED 2X 120Hz', '3.4" Flex Window cover screen (4× bigger — run apps without opening)', 'Snapdragon 8 Gen 2 (for Galaxy)', 'Dual cameras: 12MP wide + 12MP ultra-wide', '3700mAh battery, 25W charging', 'IPX8 water resistance', 'Flex Window apps', '8GB RAM'],
        details: 'The Galaxy Z Flip 5 features a dramatically larger 3.4-inch Flex Window — nearly four times bigger than the previous generation — functioning as a full secondary display to run apps, reply to messages, and shoot photos without ever unfolding the phone.',
      },
      'Galaxy Z Fold 6': {
        name: 'Samsung Galaxy Z Fold 6',
        specs: ['7.6" foldable Dynamic AMOLED 2X 120Hz 2160×1856', '6.3" cover screen 120Hz', 'Snapdragon 8 Gen 3 (for Galaxy)', 'Triple cameras: 50MP + 10MP 3× + 12MP ultra-wide', '4400mAh battery, 25W charging', 'IPX8 water resistance', 'Galaxy AI Fold features', 'Titanium frame', '12GB RAM'],
        details: 'The Galaxy Z Fold 6 is the thinnest, lightest Fold ever with a wider cover screen and titanium frame. Galaxy AI features are optimised for the foldable with Note Assist, Interpreter mode, and Circle to Search working seamlessly across both displays. The Snapdragon 8 Gen 3 keeps it at the forefront.',
      },
      'Galaxy Z Flip 6': {
        name: 'Samsung Galaxy Z Flip 6',
        specs: ['6.7" foldable Dynamic AMOLED 2X 120Hz', '3.4" Flex Window cover screen', 'Snapdragon 8 Gen 3 (for Galaxy)', 'Dual cameras: 50MP wide f/1.8 + 12MP ultra-wide (major upgrade)', '4000mAh battery, 25W charging (largest Flip ever)', 'IPX8 water resistance', 'Galaxy AI', '12GB RAM'],
        details: 'The Galaxy Z Flip 6 brings the biggest camera upgrade in Flip history with a 50MP main sensor, and the largest-ever Flip battery at 4000mAh. Galaxy AI features enhance every photo automatically, and the Snapdragon 8 Gen 3 ensures the Flex Window handles full app multitasking with ease.',
      },
    },

    Google: {
      'Pixel 7': {
        name: 'Google Pixel 7',
        specs: ['6.3" OLED FHD+ 90Hz 2400×1080', 'Google Tensor G2 chip', 'Dual cameras: 50MP wide f/1.85 OIS + 12MP ultra-wide', '10.8MP front camera', '4355mAh battery, 30W charging', 'IP68 water resistance', 'Face Unlock + fingerprint sensor', '5G', '8GB RAM'],
        details: 'The Pixel 7 is the best value flagship, combining Google\'s Tensor G2 chip with outstanding camera quality. Real Tone accurately represents all skin tones, Direct My Call navigates phone menus so you don\'t have to, and on-device AI keeps your data private while delivering powerful smart features.',
      },
      'Pixel 7 Pro': {
        name: 'Google Pixel 7 Pro',
        specs: ['6.7" LTPO OLED QHD+ 120Hz adaptive 3120×1440', 'Google Tensor G2 chip', 'Triple cameras: 50MP wide + 48MP 5× telephoto + 12MP ultra-wide', '10.8MP front camera', '5000mAh battery, 30W charging', 'IP68 water resistance', 'Face Unlock + in-display fingerprint', '5G', '12GB RAM'],
        details: 'The Pixel 7 Pro is Google\'s finest camera phone with an outstanding 5× optical zoom telephoto and Tensor G2\'s exceptional AI photography. Macro Focus captures extreme close-ups down to 3cm, and the LTPO display adapts from 1Hz to 120Hz to maximise battery life.',
      },
      'Pixel 7a': {
        name: 'Google Pixel 7a',
        specs: ['6.1" OLED FHD+ 90Hz 2400×1080', 'Google Tensor G2 chip', 'Dual cameras: 64MP wide f/1.89 OIS + 13MP ultra-wide', '13MP front camera', '4385mAh battery, wireless charging', 'IP67 water resistance', '5G', '8GB RAM', 'Lowest-priced Pixel with Tensor G2'],
        details: 'The Pixel 7a delivers the full Google AI photography experience — Magic Eraser, Photo Unblur, Real Tone, and Cinematic Blur — at the most accessible price. Wireless charging comes to the A-series for the first time, and the 64MP camera is a significant jump over its predecessor.',
      },
      'Pixel 8': {
        name: 'Google Pixel 8',
        specs: ['6.2" Actua OLED 120Hz FHD+ 2400×1080', 'Google Tensor G3 chip', 'Dual cameras: 50MP wide f/1.68 + 12MP ultra-wide with macro', '10.5MP front camera', '4575mAh battery, 27W charging', 'IP68 water resistance', 'Temperature sensor', '5G', '8GB RAM, 7 years of updates'],
        details: 'The Pixel 8 introduces the Tensor G3 chip and a new generation of AI features: Best Take combines best faces from group shots, Magic Editor manipulates entire scenes, and Audio Magic Eraser removes background noise from videos. Seven years of guaranteed OS updates make it one of the longest-supported phones ever.',
      },
      'Pixel 8 Pro': {
        name: 'Google Pixel 8 Pro',
        specs: ['6.7" Super Actua OLED QHD+ 1–120Hz LTPO 3120×1440', 'Google Tensor G3 chip', 'Triple cameras: 50MP wide + 48MP 5× telephoto + 48MP ultra-wide (macro)', '10.5MP front camera', '5050mAh battery, 30W charging', 'IP68 water resistance', 'Temperature sensor + thermometer', '5G', '12GB RAM, 7 years updates'],
        details: 'The Pixel 8 Pro is the most capable Pixel ever, with three 50MP-class cameras and on-device Gemini Nano AI. Video Boost post-processing delivers HDR+ quality video, and Pro controls provide full manual command of every camera parameter including ISO and shutter speed.',
      },
      'Pixel 8a': {
        name: 'Google Pixel 8a',
        specs: ['6.1" Actua OLED 120Hz FHD+', 'Google Tensor G3 chip', 'Dual cameras: 64MP wide OIS + 13MP ultra-wide', '13MP front camera', '4492mAh battery, wireless charging', 'IP67 water resistance', '5G', '8GB RAM', '7 years of OS updates, 120Hz for first time in A-series'],
        details: 'The Pixel 8a brings the Tensor G3 chip, 120Hz display, and wireless charging to the A-series for the first time. All flagship AI features — Magic Eraser, Photo Unblur, Best Take, and Magic Editor — are fully available, making it extraordinary value for AI photography.',
      },
      'Pixel 9': {
        name: 'Google Pixel 9',
        specs: ['6.3" Actua OLED 1–120Hz FHD+ 2424×1080', 'Google Tensor G4 chip', 'Dual cameras: 50MP wide + 48MP ultra-wide', '10.5MP front camera', '4700mAh battery, 27W charging', 'IP68 water resistance', 'Gemini AI built-in', '5G', '12GB RAM, 7 years updates'],
        details: 'The Pixel 9 is reimagined with a polished flat-edge design and features Gemini AI built into the assistant layer. The Tensor G4 chip is 20% faster for on-device AI, and Add Me places the photographer seamlessly into group shots by blending two separate images together with precision.',
      },
      'Pixel 9 Pro': {
        name: 'Google Pixel 9 Pro',
        specs: ['6.3" Super Actua OLED 1–120Hz QHD+ 2856×1280', 'Google Tensor G4 chip', 'Triple cameras: 50MP wide + 48MP 5× telephoto + 48MP ultra-wide', '42MP front camera', '4700mAh battery, 27W charging', 'IP68 water resistance', 'Gemini AI + Gemini Advanced', 'Temperature sensor', '16GB RAM'],
        details: 'The Pixel 9 Pro sets a new benchmark with three 48MP+ cameras and the most capable computational photography engine available. The 42MP front camera captures studio-quality selfies, and Gemini Advanced offers the most powerful on-device AI. The Super Actua display reaches 3000 nits peak brightness.',
      },
      'Pixel 9 Pro XL': {
        name: 'Google Pixel 9 Pro XL',
        specs: ['6.8" Super Actua OLED 1–120Hz QHD+ 3120×1440', 'Google Tensor G4 chip', 'Triple cameras: 50MP wide + 48MP 5× telephoto + 48MP ultra-wide', '42MP front camera', '5060mAh battery, 37W fast charging', 'IP68 water resistance', 'Gemini AI + Advanced', '16GB RAM', '7 years updates'],
        details: 'The Pixel 9 Pro XL combines the full Pixel 9 Pro camera capabilities in a larger 6.8-inch form with a bigger 5060mAh battery. The 37W fast charging is the fastest ever in a Pixel, and the QHD+ Super Actua display at 3000 nits peak is perfect for outdoor use in any conditions.',
      },
      'Pixel 9 Pro Fold': {
        name: 'Google Pixel 9 Pro Fold',
        specs: ['8.0" Super Actua OLED foldable main 120Hz 2076×2152', '6.3" cover screen 120Hz', 'Google Tensor G4 chip', 'Triple cameras: 50MP wide + 10.8MP 5× telephoto + 10.8MP ultra-wide', '48MP inner + 10.5MP outer front cameras', '4650mAh battery', 'IP68 water resistance', 'Gemini AI', '16GB RAM'],
        details: 'The Pixel 9 Pro Fold is Google\'s thinnest, most capable foldable — with an 8-inch Super Actua inner display and Tensor G4 chip bringing Gemini AI to a full foldable format. The wider cover screen and IP68 rating make it more practical and durable than any previous foldable Pixel.',
      },
      'Pixel Fold': {
        name: 'Google Pixel Fold',
        specs: ['7.6" OLED inner display 120Hz 2208×1840', '5.8" outer screen 120Hz', 'Google Tensor G2 chip', 'Triple cameras: 48MP wide + 10.8MP 5× telephoto + 10.8MP ultra-wide', '4821mAh battery', 'IPX8 water resistance', 'Dual front cameras (inner + outer)', 'Flat fold design', '12GB RAM'],
        details: 'The Google Pixel Fold is Google\'s first foldable smartphone, combining the renowned Pixel camera system with a unique flat folding design that closes more like a book than a phone. The 7.6-inch inner display delivers a full tablet experience, while Tensor G2 powers all the Pixel AI features across both screens.',
      },
    },
  },

  // ════════════════════════════ LAPTOPS ════════════════════════════════════════
  Laptops: {
    Apple: {
      'MacBook Air M1 (2020)': {
        name: 'Apple MacBook Air M1 (2020)',
        specs: ['Apple M1 chip (8-core CPU, 7/8-core GPU)', '8GB / 16GB unified memory', '256GB – 2TB SSD', '13.3" Retina IPS 2560×1600 True Tone', 'Up to 18 hours battery', 'Fanless silent operation', 'Touch ID', 'USB-C x2 (Thunderbolt/USB 4)', 'macOS'],
        details: 'The MacBook Air M1 was a revolution — Apple\'s first Mac with its own silicon delivering up to 3.5× faster CPU and 5× faster GPU than before, while running completely silently. Up to 18 hours of battery life makes it the longest-lasting MacBook Air ever made. It redefined the laptop industry.',
      },
      'MacBook Air M2 13" (2022)': {
        name: 'Apple MacBook Air M2 13" (2022)',
        specs: ['Apple M2 chip (8-core CPU, 8/10-core GPU)', '8GB / 16GB / 24GB unified memory', '256GB – 2TB SSD', '13.6" Liquid Retina 2560×1664 500 nits', 'Up to 18 hours battery', 'MagSafe 3 charging', '1080p webcam', 'Fanless, 1.24 kg', 'Midnight / Starlight / Silver / Space Grey'],
        details: 'The MacBook Air M2 completely reimagines the Air with a thin, flat design inspired by MacBook Pro. The M2 chip brings 18% faster CPU and 35% faster GPU over M1, the new 13.6-inch Liquid Retina display is significantly brighter, and the 1080p webcam delivers the clearest FaceTime calls ever on an Air.',
      },
      'MacBook Air M2 15" (2023)': {
        name: 'Apple MacBook Air M2 15" (2023)',
        specs: ['Apple M2 chip (8-core CPU, 10-core GPU)', '8GB / 16GB / 24GB unified memory', '256GB – 2TB SSD', '15.3" Liquid Retina 2880×1864 500 nits', 'Up to 18 hours battery', 'MagSafe 3', 'Six-speaker sound system with spatial audio', '1080p webcam', '1.51 kg'],
        details: 'The MacBook Air 15" brings the beloved Air experience to a larger canvas for those who want more screen without Pro pricing. The M2 chip runs in complete silence, and the six-speaker sound system with spatial audio delivers the best audio ever in a MacBook Air — filling a room with rich, immersive sound.',
      },
      'MacBook Air M3 13" (2024)': {
        name: 'Apple MacBook Air M3 13" (2024)',
        specs: ['Apple M3 chip (8-core CPU, 10-core GPU)', '8GB / 16GB / 24GB unified memory', '256GB – 2TB SSD', '13.6" Liquid Retina 2560×1664 500 nits', 'Up to 18 hours battery', 'Dual external display support (lid closed)', 'Wi-Fi 6E, Bluetooth 5.3', 'MagSafe 3', '1.24 kg'],
        details: 'The MacBook Air M3 is 60% faster than M1 and finally supports two external displays simultaneously. Hardware-accelerated ray tracing on the M3 GPU delivers stunning visuals for creative apps, and Wi-Fi 6E provides nearly 2× faster wireless performance. The most capable fanless laptop ever made.',
      },
      'MacBook Air M3 15" (2024)': {
        name: 'Apple MacBook Air M3 15" (2024)',
        specs: ['Apple M3 chip (8-core CPU, 10-core GPU)', '8GB / 16GB / 24GB unified memory', '256GB – 2TB SSD', '15.3" Liquid Retina 2880×1864 500 nits', 'Up to 18 hours battery', 'Dual external display support', 'Wi-Fi 6E, Bluetooth 5.3', 'MagSafe 3', '1.51 kg'],
        details: 'The MacBook Air M3 15" combines the spacious display with M3\'s 60% performance boost over M1. Dual external display support lets you drive two 6K monitors from a single Air, unlocking a true multi-monitor desktop setup previously exclusive to MacBook Pro.',
      },
      'MacBook Pro 13" M1 (2020)': {
        name: 'Apple MacBook Pro 13" M1 (2020)',
        specs: ['Apple M1 chip (8-core CPU, 8-core GPU)', '8GB / 16GB unified memory', '256GB – 2TB SSD', '13.3" Retina IPS 2560×1600 True Tone', 'Up to 20 hours battery', 'Active cooling (fan)', 'Touch Bar + Touch ID', 'Thunderbolt/USB 4 (×2)', 'macOS'],
        details: 'The MacBook Pro 13" M1 was the first Pro Mac with Apple Silicon, delivering extraordinary performance — up to 2.8× faster CPU — while lasting up to 20 hours on a single charge. The active cooling system maintains maximum performance for sustained professional workloads.',
      },
      'MacBook Pro 14" M3 (2023)': {
        name: 'Apple MacBook Pro 14" M3 (2023)',
        specs: ['Apple M3 chip (8-core CPU, 10-core GPU)', '8GB / 16GB / 24GB unified memory', '512GB – 2TB SSD', '14.2" Liquid Retina XDR ProMotion 120Hz 3024×1964', 'Up to 22 hours battery', 'MagSafe 3 + HDMI + SD card + 3× Thunderbolt', 'Hardware ray tracing', '1080p webcam', 'macOS'],
        details: 'The MacBook Pro 14" M3 brings pro-level performance and the Liquid Retina XDR ProMotion display to the entry MacBook Pro. Hardware-accelerated ray tracing in the M3 GPU delivers stunning visuals for 3D rendering and modern games, and up to 22 hours of battery life redefines professional laptop endurance.',
      },
      'MacBook Pro 14" M3 Pro (2023)': {
        name: 'Apple MacBook Pro 14" M3 Pro (2023)',
        specs: ['Apple M3 Pro chip (11/12-core CPU, 14/18-core GPU)', '18GB / 36GB unified memory', '512GB – 4TB SSD', '14.2" Liquid Retina XDR ProMotion 120Hz', 'Up to 18 hours battery', 'MagSafe 3 + HDMI + SD + 3× Thunderbolt 4', 'Active cooling', 'Wi-Fi 6E', 'Space Black finish'],
        details: 'The MacBook Pro 14" M3 Pro is the professional\'s compact powerhouse, with up to 18 cores of CPU power and hardware ray tracing. The stunning Space Black anodization resists fingerprints, and the full port selection — including HDMI, SD card, and three Thunderbolt 4 — means fewer adapters on your desk.',
      },
      'MacBook Pro 16" M3 Pro (2023)': {
        name: 'Apple MacBook Pro 16" M3 Pro (2023)',
        specs: ['Apple M3 Pro chip (11/12-core CPU, 14/18-core GPU)', '18GB / 36GB unified memory', '512GB – 4TB SSD', '16.2" Liquid Retina XDR ProMotion 120Hz 3456×2234', 'Up to 22 hours battery', 'MagSafe 3 + HDMI 2.1 + SD + 3× Thunderbolt 4', '140W fast charging', 'Wi-Fi 6E', '2.14 kg'],
        details: 'The MacBook Pro 16" M3 Pro combines the large immersive Liquid Retina XDR display with M3 Pro\'s extraordinary performance for demanding creative professionals. Up to 22 hours of battery life means a full day of intensive video editing, and 140W fast charging restores 50% in just 30 minutes.',
      },
      'MacBook Pro 16" M3 Max (2023)': {
        name: 'Apple MacBook Pro 16" M3 Max (2023)',
        specs: ['Apple M3 Max chip (14/16-core CPU, 30/40-core GPU)', '36GB / 48GB / 96GB / 128GB unified memory', '512GB – 8TB SSD', '16.2" Liquid Retina XDR ProMotion 120Hz', 'Up to 22 hours battery', 'Supports up to 4 external displays', 'HDMI 2.1 + SD + 3× Thunderbolt 4', 'Wi-Fi 6E', '2.14 kg'],
        details: 'The MacBook Pro 16" M3 Max is the most powerful laptop Apple has ever made. The 40-core GPU rivals dedicated workstation graphics, and up to 128GB of unified memory handles the most intensive video, 3D, and machine learning workloads. Supports up to four external displays simultaneously for an expansive pro setup.',
      },
    },
    Dell: {
      'XPS 13 9340 (2024)': {
        name: 'Dell XPS 13 9340 (2024)',
        specs: ['Intel Core Ultra 5 / Ultra 7 (Meteor Lake) with NPU', '16GB / 32GB LPDDR5x RAM', '512GB – 2TB PCIe Gen 4 SSD', '13.4" FHD+ or OLED 3.5K touch display', 'Intel Arc integrated graphics', 'Up to 12 hours battery, 60Wh', 'Thunderbolt 4 ×2, USB-A, MicroSD', 'Machined aluminium, 1.18 kg'],
        details: 'The Dell XPS 13 9340 continues the XPS legacy of premium craftsmanship, with Intel Core Ultra processors featuring dedicated NPU for AI-accelerated tasks. The optional 3.5K OLED display delivers stunning colour for creative work, and the compact machined aluminium chassis is one of the thinnest in its class.',
      },
      'XPS 13 9315 (2023)': {
        name: 'Dell XPS 13 9315 (2023)',
        specs: ['Intel Core i5/i7-1235U or i7-1255U (12th Gen)', '8GB / 16GB / 32GB LPDDR5 RAM', '512GB – 1TB SSD', '13.4" FHD+ non-touch or touch, or OLED 3.5K', 'Intel Iris Xe graphics', 'Up to 12 hours battery', 'Thunderbolt 4 ×2, USB-A', '1.17 kg', 'CNC machined aluminium'],
        details: 'The XPS 13 9315 offers the iconic Dell XPS design with 12th Gen Intel performance. The optional 3.5K OLED touch display provides gorgeous colour accuracy for designers, and the machined aluminium body feels premium in hand while remaining ultra-portable at just 1.17kg.',
      },
      'XPS 15 9530 (2023)': {
        name: 'Dell XPS 15 9530 (2023)',
        specs: ['Intel Core i7-13700H / i9-13900H (13th Gen)', '16GB – 64GB DDR5 RAM', '512GB – 4TB PCIe Gen 4 SSD', '15.6" FHD+ or OLED 3.5K (3456×2160)', 'NVIDIA GeForce RTX 4060 / 4070', 'Up to 13 hours battery, 86Wh', 'Thunderbolt 4 ×2, USB-C 3.2, SD card', 'Killer Wi-Fi 6E', '1.86 kg'],
        details: 'The Dell XPS 15 9530 is the creative professional\'s laptop of choice, combining the RTX 40-series GPU for AI-accelerated workflows with the optional 3.5K OLED display covering 100% DCI-P3. The 86Wh battery provides exceptional endurance for a 15-inch creative workstation.',
      },
      'XPS 15 9540 (2024)': {
        name: 'Dell XPS 15 9540 (2024)',
        specs: ['Intel Core Ultra 7 / Ultra 9 (Meteor Lake)', '16GB – 64GB LPDDR5x RAM', '512GB – 4TB SSD', '15.6" FHD+ InfinityEdge or OLED 3.2K', 'NVIDIA GeForce RTX 4070', 'Intel AI Boost NPU', 'Up to 13 hours battery', 'Thunderbolt 4 ×2, USB-C, SD card', '1.86 kg'],
        details: 'The XPS 15 9540 brings Intel\'s latest Core Ultra platform to the XPS 15, adding AI acceleration via the NPU for intelligent workloads in Microsoft 365 and creative apps. The new OLED 3.2K panel option delivers exceptional contrast and colour for photographers and video editors.',
      },
      'XPS 17 9730 (2023)': {
        name: 'Dell XPS 17 9730 (2023)',
        specs: ['Intel Core i7-13700H / i9-13900H', '16GB – 64GB DDR5 RAM', '512GB – 8TB SSD', '17.0" FHD+ or UHD+ (3840×2400) touch', 'NVIDIA GeForce RTX 4060 / 4070', 'Up to 12 hours battery, 97Wh', 'Thunderbolt 4 ×2, USB-C 3.2, SD card', 'Killer Wi-Fi 6E', '2.21 kg'],
        details: 'The XPS 17 9730 is the largest and most powerful XPS laptop, with a massive 17-inch display offering up to 4K+ resolution and 100% Adobe RGB colour coverage. The RTX 4070 GPU handles 3D rendering, video colour grading, and complex simulations with ease.',
      },
      'Alienware m15 R7': {
        name: 'Dell Alienware m15 R7',
        specs: ['AMD Ryzen 9 6900HX (8-core)', 'NVIDIA GeForce RTX 3070 Ti / 3080 Ti', '16GB / 32GB DDR5 RAM', '512GB – 2TB SSD', '15.6" QHD 240Hz or FHD 360Hz display', 'Cherry MX ultra-low-profile keyboard', 'Up to 6 hours gaming battery, 86Wh', 'Thunderbolt 4, USB-A, HDMI 2.1', '2.35 kg'],
        details: 'The Alienware m15 R7 packs extreme gaming performance into a relatively portable 15-inch chassis, with the Ryzen 9 6900HX and RTX 3080 Ti delivering blistering framerates at high settings. The Cherry MX keyboard provides the most satisfying tactile typing experience in any gaming laptop.',
      },
    },
    HP: {
      'Spectre x360 14 (2023)': {
        name: 'HP Spectre x360 14 (2023)',
        specs: ['Intel Core i7-1355U / i7-1360P (13th Gen)', '16GB / 32GB LPDDR4x RAM', '512GB – 2TB PCIe SSD', '13.5" 2.8K OLED touch or 2.2K IPS', 'Intel Iris Xe graphics', 'Up to 17 hours battery, 66Wh', '360° convertible hinge + included active stylus', 'Thunderbolt 4 ×2, USB-A, microSD', '1.36 kg'],
        details: 'The HP Spectre x360 14 is the pinnacle of premium 2-in-1 design, with OLED touch display, included active pen, and a stunning gem-cut aluminium chassis. The 360° hinge transforms it between laptop, tent, stand, and tablet modes seamlessly for any use case.',
      },
      'Spectre x360 16 (2024)': {
        name: 'HP Spectre x360 16 (2024)',
        specs: ['Intel Core Ultra 7 (Meteor Lake)', '16GB / 32GB LPDDR5x RAM', '512GB – 2TB SSD', '16" 3K2K OLED touch (3072×1920)', 'Intel Arc / NVIDIA RTX discrete option', 'Up to 17 hours battery', '360° convertible, active pen included', 'Thunderbolt 4 ×2, USB-A, HDMI, MicroSD', '2.24 kg'],
        details: 'The Spectre x360 16 delivers a cinematic 3K2K OLED experience in a premium convertible form, with Intel Core Ultra AI performance for creative professionals. The spacious 16-inch display with 120Hz refresh rate is perfect for drawing, photo editing, and video consumption in any mode.',
      },
      'EliteBook 840 G10': {
        name: 'HP EliteBook 840 G10',
        specs: ['Intel Core i5/i7-1335U or vPro options (13th Gen)', '16GB / 32GB LPDDR5 RAM', '256GB – 2TB SSD', '14" FHD IPS or 2.8K OLED display', 'Intel Iris Xe graphics', 'Up to 13 hours battery, 51Wh', 'Thunderbolt 4 ×2, USB-A, HDMI, SD card', 'HP Wolf Security', 'MIL-SPEC tested, 1.3 kg'],
        details: 'The HP EliteBook 840 G10 is the trusted business laptop for enterprise customers, with HP Wolf Security providing hardware-enforced protection against firmware attacks. MIL-SPEC testing ensures it survives the rigours of business travel, and optional 5G keeps you connected anywhere.',
      },
    },
    Lenovo: {
      'ThinkPad X1 Carbon Gen 12 (2024)': {
        name: 'Lenovo ThinkPad X1 Carbon Gen 12 (2024)',
        specs: ['Intel Core Ultra 5 / Ultra 7 (Meteor Lake) with Intel AI Boost NPU', '16GB / 32GB / 64GB LPDDR5x RAM', '256GB – 2TB PCIe Gen 4 SSD', '14" 2.8K OLED or 2.8K IPS display', 'Intel Arc graphics', 'Up to 15 hours battery', 'Thunderbolt 4 ×2, USB-A, HDMI 2.1, SD card', 'MIL-STD-810H certified', '1.12 kg (world\'s lightest 14" business laptop)'],
        details: 'The ThinkPad X1 Carbon Gen 12 is the world\'s lightest 14" business laptop at 1.12kg, meeting 12 MIL-SPEC tests while running Intel\'s latest Core Ultra with dedicated AI NPU. The OLED display option delivers perfect blacks for professionals, and the legendary ThinkPad keyboard remains the best in the laptop industry.',
      },
      'ThinkPad X1 Carbon Gen 11 (2023)': {
        name: 'Lenovo ThinkPad X1 Carbon Gen 11 (2023)',
        specs: ['Intel Core i5/i7-1365U / i7-1370P (13th Gen vPro)', '16GB / 32GB LPDDR5 RAM', '256GB – 2TB SSD', '14" 2.8K IPS or OLED display', 'Intel Iris Xe graphics', 'Up to 15 hours battery', 'Thunderbolt 4 ×2, USB-A, HDMI, SD', '1.12 kg', 'MIL-STD-810H'],
        details: 'The ThinkPad X1 Carbon Gen 11 maintains its reputation as the definitive professional laptop with 13th Gen Intel vPro performance, outstanding keyboard, and best-in-class durability. The OLED display option provides professional-grade colour accuracy for demanding business applications.',
      },
      'IdeaPad Slim 5': {
        name: 'Lenovo IdeaPad Slim 5',
        specs: ['AMD Ryzen 5 / Ryzen 7 or Intel Core i5/i7', '8GB / 16GB RAM', '512GB – 1TB SSD', '14" or 16" FHD IPS or OLED display options', 'AMD Radeon / Intel Iris Xe graphics', 'Up to 12 hours battery', 'USB-C, USB-A, HDMI, SD card', 'Rapid Charge (80% in 1 hour)', 'Slim lightweight design'],
        details: 'The IdeaPad Slim 5 delivers exceptional value with AMD Ryzen or Intel Core power in an ultra-thin chassis. Optional OLED display provides brilliant visuals, and Rapid Charge restores 80% battery in under an hour. The perfect laptop for students and everyday users who want reliable performance.',
      },
      'Legion 5 Gen 9': {
        name: 'Lenovo Legion 5 Gen 9',
        specs: ['AMD Ryzen 7 8745H / Ryzen 9 8945H (8-core)', 'NVIDIA GeForce RTX 4060 / 4070', '16GB / 32GB DDR5 RAM', '512GB – 2TB PCIe Gen 4 SSD', '15.6" FHD 144Hz / 165Hz or QHD 165Hz IPS', 'Up to 7.5 hours battery, 80Wh', 'USB-C, USB-A ×4, HDMI 2.1, Ethernet', 'Legion Coldfront 5.0 cooling', '2.38 kg'],
        details: 'The Legion 5 Gen 9 delivers outstanding gaming performance at a competitive price, with Ryzen 8000 series processors and up to RTX 4070 GPU. Legion Coldfront 5.0 cooling keeps thermals managed during extended gaming sessions, and the high-refresh-rate display ensures smooth, tear-free gameplay.',
      },
      'Yoga 9i (2024)': {
        name: 'Lenovo Yoga 9i (2024)',
        specs: ['Intel Core Ultra 7 (Meteor Lake)', '16GB / 32GB LPDDR5x RAM', '1TB – 2TB SSD', '14" 2.8K OLED touch (2880×1800) 120Hz', 'Intel Arc graphics', 'Up to 15 hours battery', '360° convertible hinge', 'Thunderbolt 4 ×2, USB-A, HDMI', 'Active stylus included', '1.39 kg'],
        details: 'The Yoga 9i (2024) is Lenovo\'s flagship 2-in-1 premium laptop, with Intel Core Ultra\'s AI capabilities and a stunning 2.8K OLED 120Hz touch display. The 360° hinge enables tablet mode for creative work with the included stylus, and the premium aluminium chassis is as beautiful as it is functional.',
      },
    },
    ASUS: {
      'ROG Zephyrus G14 (2024)': {
        name: 'ASUS ROG Zephyrus G14 (2024)',
        specs: ['AMD Ryzen 9 8945HS (Zen 4, 45W)', 'NVIDIA GeForce RTX 4070 / 4090', '32GB LPDDR5X RAM', '1TB / 2TB PCIe Gen 4 SSD', '14" 3K OLED 120Hz or QHD+ Mini LED 165Hz', '73Wh battery', 'AniMe Matrix LED lid display (optional)', 'MUX Switch', '1.65 kg'],
        details: 'The ROG Zephyrus G14 (2024) is the world\'s most powerful 14" gaming laptop, packing RTX 4090 into a 1.65kg chassis. The optional 3K OLED with Dolby Vision delivers cinema-quality visuals, and the AniMe Matrix LED lid enables custom LED animations. MUX Switch bypasses the iGPU for maximum gaming performance.',
      },
      'ROG Zephyrus G14 (2023)': {
        name: 'ASUS ROG Zephyrus G14 (2023)',
        specs: ['AMD Ryzen 9 7940HS (8-core Zen 4)', 'NVIDIA GeForce RTX 4060 / 4070', '16GB / 32GB DDR5 RAM', '512GB – 1TB SSD', '14" 2.5K QHD+ OLED 120Hz', '72Wh battery', 'MUX Switch', 'AniMe Matrix LED lid', '1.65 kg'],
        details: 'The ROG Zephyrus G14 (2023) combines the Ryzen 9 7940HS with RTX 4060/4070 and a stunning 2.5K OLED display in a compact 1.65kg chassis. The OLED screen with 120Hz refresh rate and 0.2ms response time delivers exceptional gaming visuals with vibrant colours and perfect blacks.',
      },
      'ZenBook 14 OLED (2023)': {
        name: 'ASUS ZenBook 14 OLED (2023)',
        specs: ['AMD Ryzen 7 7730U / Intel Core i5/i7-1335U', '16GB LPDDR4x / DDR5 RAM', '512GB – 1TB SSD', '14" 2.8K OLED 90Hz 2880×1800 120% DCI-P3', 'AMD Radeon / Intel Iris Xe', 'Up to 15 hours battery', 'USB-C ×2, USB-A, HDMI 2.1, MicroSD', '1.35 kg', 'ASUS Dial for creative apps'],
        details: 'The ZenBook 14 OLED features a stunning 2.8K OLED display covering 120% DCI-P3 colour space with VESA DisplayHDR True Black 600 certification. The ASUS Dial on the keyboard enables precise control of creative applications, making it a powerful compact tool for photographers and designers.',
      },
    },
    Microsoft: {
      'Surface Laptop 6 (2024)': {
        name: 'Microsoft Surface Laptop 6 (2024)',
        specs: ['Intel Core Ultra 5 / Ultra 7 (Meteor Lake) with NPU for Copilot+', '16GB / 32GB / 64GB LPDDR5x RAM', '256GB – 1TB SSD', '13.5" or 15" PixelSense touchscreen 120Hz', 'Intel Arc graphics', 'Up to 19 hours battery', 'USB-C Thunderbolt 4, USB-A, Surface Connect, 3.5mm', 'Windows 11 Copilot+ PC', 'Alcantara keyboard option'],
        details: 'The Surface Laptop 6 is a Copilot+ PC with Intel Core Ultra NPU enabling real-time AI features like Live Captions and Cocreator in Paint. The PixelSense 120Hz touchscreen offers premium responsiveness, and up to 19 hours of battery life with 50% charge in 30 minutes makes it the most capable Surface Laptop ever.',
      },
      'Surface Laptop 5 (2022)': {
        name: 'Microsoft Surface Laptop 5 (2022)',
        specs: ['Intel Core i5-1245U / i7-1265U (12th Gen)', '8GB / 16GB / 32GB RAM', '256GB – 1TB SSD', '13.5" or 15" PixelSense touch 2256×1504 / 2496×1664', 'Intel Iris Xe graphics', 'Up to 18 hours battery', 'Thunderbolt 4, USB-A, Surface Connect', '1.27 / 1.56 kg', 'Alcantara keyboard on 13.5"'],
        details: 'The Surface Laptop 5 brings 12th Gen Intel Evo performance to the elegant Surface Laptop design with Thunderbolt 4 for the first time. The PixelSense 2K touchscreen with 3:2 aspect ratio is ideal for documents and productivity, and the Alcantara keyboard provides a uniquely comfortable typing experience.',
      },
      'Surface Laptop Studio 2 (2023)': {
        name: 'Microsoft Surface Laptop Studio 2 (2023)',
        specs: ['Intel Core i7-13700H / Core i7-13800H', 'NVIDIA GeForce RTX 4050 or RTX 4060', '16GB / 32GB / 64GB RAM', '512GB – 2TB SSD', '14.4" PixelSense Flow touch 2400×1600 120Hz', 'Up to 19 hours battery', 'Thunderbolt 4 ×2, USB-A ×2, SD card', 'Unique pull-forward hinge for drawing', '1.98 kg'],
        details: 'The Surface Laptop Studio 2 features a unique pull-forward hinge allowing the display to lie flat for drawing with Surface Pen or fold into stage mode for media. The RTX 40-series GPU handles demanding creative workloads, and the PixelSense Flow 120Hz display is one of the smoothest available.',
      },
    },
    Acer: {
      'Swift X (2023)': {
        name: 'Acer Swift X (2023)',
        specs: ['AMD Ryzen 5 7530U / Ryzen 7 7730U', 'NVIDIA GeForce RTX 3050 / RTX 4050', '16GB / 32GB LPDDR4x RAM', '512GB – 1TB SSD', '14" or 16" FHD / 2.5K IPS display', 'Up to 12 hours battery', 'USB-C, USB-A ×2, HDMI, SD card reader', '1.4 kg', 'Good price-to-performance ratio'],
        details: 'The Acer Swift X delivers a dedicated GPU in a thin, lightweight form at an exceptional price. The Ryzen 7000 series processor and NVIDIA GPU combination handles photo editing, light 3D work, and casual gaming far beyond typical thin-and-light laptops.',
      },
      'Predator Helios 300 (2023)': {
        name: 'Acer Predator Helios 300 (2023)',
        specs: ['Intel Core i7-13700HX (16-core)', 'NVIDIA GeForce RTX 4070', '16GB / 32GB DDR5 RAM', '1TB – 2TB PCIe Gen 4 SSD', '15.6" QHD 165Hz or FHD 360Hz IPS', 'Up to 6 hours battery, 90Wh', 'USB-C (Thunderbolt 4), USB-A ×3, HDMI 2.1, Ethernet', 'IceTunnel 3.0 cooling', '2.3 kg'],
        details: 'The Predator Helios 300 delivers enthusiast-class gaming performance at a competitive price. The 16-core i7-13700HX paired with RTX 4070 pushes high framerates at QHD settings, and IceTunnel 3.0 cooling with four exhaust vents maintains performance during extended gaming sessions.',
      },
    },
    Razer: {
      'Razer Blade 15 (2023)': {
        name: 'Razer Blade 15 (2023)',
        specs: ['Intel Core i7-13800H (14-core)', 'NVIDIA GeForce RTX 4070 / 4080', '16GB DDR5 RAM (upgradeable)', '1TB PCIe Gen 4 SSD', '15.6" FHD 360Hz or QHD 240Hz or UHD 144Hz OLED', 'Up to 6 hours battery, 80Wh', 'Thunderbolt 4 ×2, USB-A ×3, HDMI 2.1, SD card', 'CNC aluminium unibody chassis', '2.01 kg'],
        details: 'The Razer Blade 15 (2023) is the definitive premium gaming laptop, with a flawless CNC aluminium unibody chassis, Intel 13th Gen and RTX 40-series performance. The OLED display option with 240Hz refresh rate delivers zero motion blur alongside the richest colours of any gaming laptop screen.',
      },
      'Razer Blade 16 (2024)': {
        name: 'Razer Blade 16 (2024)',
        specs: ['Intel Core i9-14900HX (24-core)', 'NVIDIA GeForce RTX 4090', '32GB DDR5 RAM', '2TB PCIe Gen 5 SSD', '16" OLED 240Hz QHD+ or Mini LED 165Hz UHD+', 'Up to 5 hours gaming battery', 'Thunderbolt 5 ×2, USB-A ×2, HDMI 2.1, SD card', '2.14 kg', 'CNC aluminium unibody'],
        details: 'The Razer Blade 16 (2024) is the world\'s first laptop with Thunderbolt 5 connectivity and PCIe Gen 5 SSD, paired with the RTX 4090 and Core i9-14900HX for absolute maximum performance. The dual-mode display technology switches between OLED and Mini LED modes for different use cases.',
      },
    },
    MSI: {
      'MSI Raider GE78 HX': {
        name: 'MSI Raider GE78 HX',
        specs: ['Intel Core i9-14900HX (24-core, 5.8GHz)', 'NVIDIA GeForce RTX 4080 / 4090', '32GB / 64GB DDR5 RAM', '1TB / 2TB PCIe Gen 5 SSD', '17.3" 4K 144Hz UHD+ / QHD+ 240Hz / FHD 360Hz', 'Up to 5 hours battery, 99.9Wh', 'Thunderbolt 4 ×2, USB-A ×3, HDMI 2.1, SD card, Ethernet', 'CoolerBoost 5 with dual fans', '2.9 kg'],
        details: 'The MSI Raider GE78 HX is an uncompromising gaming powerhouse with the Core i9-14900HX and RTX 4090 delivering desktop-class performance in a laptop. PCIe Gen 5 SSD delivers blistering storage speeds, and CoolerBoost 5 cooling maintains sustained maximum performance during the most intense gaming sessions.',
      },
    },
    Samsung: {
      'Galaxy Book4 Pro': {
        name: 'Samsung Galaxy Book4 Pro',
        specs: ['Intel Core Ultra 7 155H (16-core, Meteor Lake)', '16GB / 32GB LPDDR5x RAM', '512GB – 1TB NVMe SSD', '14" or 16" Dynamic AMOLED 2X 120Hz 3K (2880×1800)', 'Intel Arc integrated graphics', 'Up to 25 hours battery', 'Thunderbolt 4 ×2, USB-A, HDMI 2.1, MicroSD', 'Galaxy AI features', '1.46 / 1.75 kg'],
        details: 'The Galaxy Book4 Pro features Samsung\'s Dynamic AMOLED 2X display technology — the same used in Galaxy S24 Ultra — delivering extraordinary colour and brightness in a laptop for the first time. Galaxy AI features enable intelligent writing assistance, translation, and photo editing in collaboration with Galaxy phones.',
      },
    },
  },

  // ════════════════════════════ TABLETS ════════════════════════════════════════
  Tablets: {
    Apple: {
      'iPad Pro 11" M4 (2024)': {
        name: 'Apple iPad Pro 11" M4 (2024)',
        specs: ['Apple M4 chip (9-core CPU, 10-core GPU)', '8GB / 16GB RAM', '256GB – 2TB storage', '11" Ultra Retina XDR OLED (tandem OLED), 2420×1668', 'Apple Pencil Pro support', 'Magic Keyboard with function row', 'Wi-Fi 6E, optional 5G', 'USB-C Thunderbolt 4', '5.1mm thin — thinnest Apple product ever'],
        details: 'The iPad Pro M4 is Apple\'s thinnest product ever at just 5.1mm, with a tandem OLED display achieving 1000 nits full-screen brightness — matching professional monitors. The M4 chip\'s 10-core GPU rivals the MacBook Pro, making it a true professional tool for any creative workflow.',
      },
      'iPad Pro 13" M4 (2024)': {
        name: 'Apple iPad Pro 13" M4 (2024)',
        specs: ['Apple M4 chip (9-core CPU, 10-core GPU)', '8GB / 16GB RAM', '256GB – 2TB storage', '13" Ultra Retina XDR OLED (tandem OLED), 2752×2064', 'Apple Pencil Pro + Magic Keyboard', 'Wi-Fi 6E, optional 5G', 'USB-C Thunderbolt 4', 'Landscape TrueDepth front camera', '5.1mm thin'],
        details: 'The iPad Pro 13" M4 is the most powerful and thinest iPad ever, featuring the tandem OLED display at a massive 13-inch scale with 1000 nits full-screen brightness. The M4 chip with Apple Intelligence capabilities makes it a complete workstation replacement for creative professionals.',
      },
      'iPad Pro 11" M2 (2022)': {
        name: 'Apple iPad Pro 11" M2 (2022)',
        specs: ['Apple M2 chip', '8GB / 16GB RAM', '128GB – 2TB storage', '11" Liquid Retina XDR 2388×1668 ProMotion 120Hz', 'LiDAR Scanner', 'Apple Pencil 2 hover support', 'Wi-Fi 6E, optional 5G', 'USB-C Thunderbolt 4', 'Center Stage + 12MP front camera'],
        details: 'The iPad Pro 11" M2 introduces hover detection for Apple Pencil 2, enabling preview before you draw. The LiDAR Scanner powers instant AR experiences, and the M2 chip delivers desktop-class performance. ProMotion 120Hz adapts from 24Hz to 120Hz for smooth, battery-efficient scrolling.',
      },
      'iPad Air M2 11" (2024)': {
        name: 'Apple iPad Air M2 11" (2024)',
        specs: ['Apple M2 chip (8-core CPU, 9-core GPU)', '8GB RAM', '128GB – 1TB storage', '11" Liquid Retina 2360×1640 500 nits True Tone', 'Apple Pencil Pro compatible', 'Magic Keyboard compatible', 'Wi-Fi 6E, optional 5G', 'USB-C', 'Available in Blue, Purple, Starlight, Space Grey'],
        details: 'The iPad Air M2 brings the M2 chip to Apple\'s mid-tier tablet for outstanding sustained performance. Apple Pencil Pro compatibility introduces hover detection and squeeze gesture, and the Liquid Retina display covers the P3 wide colour space for accurate, vivid visuals.',
      },
      'iPad Air M2 13" (2024)': {
        name: 'Apple iPad Air M2 13" (2024)',
        specs: ['Apple M2 chip', '8GB RAM', '128GB – 1TB storage', '13" Liquid Retina 2732×2048 500 nits', 'Apple Pencil Pro + Magic Keyboard compatible', 'Wi-Fi 6E, optional 5G', 'USB-C', 'Landscape TrueDepth front camera', 'Available in 4 colours'],
        details: 'The iPad Air M2 13" is the largest iPad Air ever, with a 13-inch Liquid Retina display that\'s ideal for multi-page documents, side-by-side apps, and large-canvas creative work. The M2 chip and Apple Pencil Pro make it a compelling creative workstation.',
      },
      'iPad (10th Gen, 2022)': {
        name: 'Apple iPad 10th Generation (2022)',
        specs: ['Apple A14 Bionic chip', '4GB RAM', '64GB / 256GB storage', '10.9" Liquid Retina 2360×1640 True Tone', '12MP rear camera', '12MP ultra-wide landscape front camera (Center Stage)', 'USB-C', 'Wi-Fi 6, optional 5G', 'Available in Blue, Yellow, Pink, Silver'],
        details: 'The iPad 10th generation brings a complete redesign with a 10.9-inch Liquid Retina display, USB-C connector, and a 12MP landscape front camera optimised for video calls with Center Stage. The A14 Bionic chip ensures years of capable performance for learning, creativity, and entertainment.',
      },
      'iPad mini (6th Gen, 2021)': {
        name: 'Apple iPad mini 6th Generation (2021)',
        specs: ['Apple A15 Bionic chip', '4GB RAM', '64GB / 256GB storage', '8.3" Liquid Retina 2266×1488 True Tone', '12MP rear camera', '12MP front camera with Center Stage', 'USB-C', 'Wi-Fi 6, optional 5G', 'Touch ID in power button', 'Available in 5 colours'],
        details: 'The iPad mini 6th generation is the ultimate portable iPad, with A15 Bionic performance in a compact 8.3-inch design. USB-C connectivity and 5G option make it incredibly versatile, and Touch ID in the power button enables quick, convenient unlocking. Apple Pencil (2nd gen) attaches magnetically.',
      },
      'iPad mini (7th Gen, 2024)': {
        name: 'Apple iPad mini 7th Generation (2024)',
        specs: ['Apple A17 Pro chip (same as iPhone 15 Pro)', '8GB RAM', '128GB / 512GB storage', '8.3" Liquid Retina 2266×1488 True Tone 60Hz', '12MP rear camera', '12MP front camera with Center Stage', 'USB-C', 'Wi-Fi 6E, optional 5G', 'Apple Intelligence capable'],
        details: 'The iPad mini 7th generation upgrades to the A17 Pro chip from iPhone 15 Pro, making it the first iPad mini capable of Apple Intelligence features. Despite the same design, the performance leap is significant, and the 8GB RAM enables all AI features to run smoothly on the compact 8.3-inch display.',
      },
    },
    Samsung: {
      'Galaxy Tab S9 Ultra (2023)': {
        name: 'Samsung Galaxy Tab S9 Ultra (2023)',
        specs: ['14.6" Dynamic AMOLED 2X 120Hz 2960×1848', 'Snapdragon 8 Gen 2 (for Galaxy)', '12GB / 16GB RAM', '256GB – 1TB storage', 'Dual 12MP + 12MP front cameras (notch)', '13MP + 8MP rear cameras', '11200mAh battery, 45W charging', 'IP68 water resistance', 'S Pen included, DeX desktop mode'],
        details: 'The Galaxy Tab S9 Ultra is the most ambitious Android tablet ever, with a laptop-sized 14.6-inch Dynamic AMOLED display. IP68 water resistance on a tablet this size is unprecedented, and the included S Pen with DeX desktop mode transforms it into a powerful workstation for creators and professionals.',
      },
      'Galaxy Tab S9+ (2023)': {
        name: 'Samsung Galaxy Tab S9+ (2023)',
        specs: ['12.4" Dynamic AMOLED 2X 120Hz 2800×1752', 'Snapdragon 8 Gen 2 (for Galaxy)', '12GB RAM', '256GB / 512GB storage', '13MP rear + 12MP front cameras', '10090mAh battery, 45W charging', 'IP68 water resistance', 'S Pen included', 'Wi-Fi 6E, optional 5G'],
        details: 'The Galaxy Tab S9+ delivers the premium Tab S9 experience on a 12.4-inch Dynamic AMOLED canvas with IP68 water resistance. The Snapdragon 8 Gen 2 for Galaxy delivers smartphone-class performance for seamless multitasking, creative work, and the smoothest Android tablet experience available.',
      },
      'Galaxy Tab S9 (2023)': {
        name: 'Samsung Galaxy Tab S9 (2023)',
        specs: ['11" Dynamic AMOLED 2X 120Hz 2560×1600', 'Snapdragon 8 Gen 2 (for Galaxy)', '8GB / 12GB RAM', '128GB / 256GB storage', '13MP rear + 12MP front cameras', '8400mAh battery, 45W charging', 'IP68 water resistance (first mid-size tablet with IP68)', 'S Pen included', 'Wi-Fi 6E, optional 5G'],
        details: 'The Galaxy Tab S9 is the first mid-size Samsung tablet with IP68 water resistance, making it safe poolside or in light rain. Vision Booster keeps the Dynamic AMOLED 2X display readable in direct sunlight, and the included S Pen with 2.8ms latency feels remarkably natural for writing and drawing.',
      },
      'Galaxy Tab S10 (2024)': {
        name: 'Samsung Galaxy Tab S10 (2024)',
        specs: ['11" Dynamic AMOLED 2X 120Hz 2560×1600', 'Snapdragon 8 Gen 3 (for Galaxy)', '12GB RAM', '256GB storage', '13MP rear + 12MP front cameras', '8000mAh battery, 45W charging', 'IP68 water resistance', 'S Pen included', 'Galaxy AI features, Wi-Fi 6E, optional 5G'],
        details: 'The Galaxy Tab S10 upgrades to the Snapdragon 8 Gen 3 and brings Galaxy AI features to the tablet, enabling Note Assist, Transcript Assist, and Circle to Search. IP68 remains for durability, and the S Pen is included as standard for handwriting and creative tasks.',
      },
    },
    Microsoft: {
      'Surface Pro 10 (2024)': {
        name: 'Microsoft Surface Pro 10 (2024)',
        specs: ['Intel Core Ultra 5 / Ultra 7 (Meteor Lake) Copilot+ PC', '16GB / 32GB / 64GB LPDDR5x RAM', '256GB – 1TB SSD', '13" PixelSense Flow display 2880×1920 120Hz touch', 'Intel Arc graphics with NPU', 'Up to 14 hours battery', 'Thunderbolt 4, USB-A, Surface Connect, SD card', 'Kickstand adjustable, detachable keyboard', '895g without keyboard'],
        details: 'The Surface Pro 10 is a Copilot+ PC, enabling real-time AI features with the Intel Core Ultra NPU. The 13-inch PixelSense Flow 120Hz display delivers smooth, precise touch and Surface Pen interactions, and the versatile kickstand design makes it equally capable as a tablet or laptop.',
      },
      'Surface Pro 9 (2022)': {
        name: 'Microsoft Surface Pro 9 (2022)',
        specs: ['Intel Core i5/i7-1255U or Microsoft SQ3 (ARM) variants', '8GB – 32GB RAM', '128GB – 1TB SSD', '13" PixelSense Flow 2880×1920 120Hz', 'Intel Iris Xe or Microsoft SQ3 Adreno GPU', 'Up to 15.5 hours battery', 'Thunderbolt 4, USB-A, Surface Connect', '5G option (SQ3 model)', '879g without keyboard'],
        details: 'The Surface Pro 9 introduces colour for the first time — available in Sapphire, Forest, Platinum, and Graphite — alongside 120Hz refresh rate. The optional 5G SQ3 variant provides always-on connectivity for true anywhere computing, and the adjustable kickstand angles to any position for comfortable use.',
      },
    },
  },

  // ════════════════════════════ WEARABLES ══════════════════════════════════════
  Wearables: {
    Apple: {
      'Apple Watch Series 9 (2023)': {
        name: 'Apple Watch Series 9 (2023)',
        specs: ['S9 SiP chip (dual-core CPU)', '41mm or 45mm case', 'Always-On Retina display, 2000 nits peak', 'Double Tap gesture (new)', 'Heart rate, ECG, Blood Oxygen sensor', 'Crash Detection + Fall Detection', 'Up to 18h battery (36h Low Power Mode)', 'IP6X dust + WR50 water resistance', 'On-device Siri with watchOS 10'],
        details: 'The Apple Watch Series 9 introduces Double Tap — squeeze index finger and thumb to control your watch hands-free — and processes Siri requests entirely on-device for faster, private responses. The S9 chip is 60% faster than S8, and the 2000-nit display is twice as bright as Series 8.',
      },
      'Apple Watch Ultra 2 (2023)': {
        name: 'Apple Watch Ultra 2 (2023)',
        specs: ['S9 SiP chip', '49mm titanium case', 'MicroLED-class display 3000 nits peak brightness', 'Precision dual-frequency GPS (L1 + L5)', 'Depth gauge + water temperature sensor', 'Up to 60 hours battery (Low Power Mode)', 'WR100 / IP6X / MIL-STD-810H', 'Action Button + Digital Crown + Side Button', 'Compatible with dive apps to 40m'],
        details: 'The Apple Watch Ultra 2 is engineered for the extreme, with a 49mm titanium case and 3000-nit microLED-class display that\'s readable in any sunlight. Precision L1+L5 dual-frequency GPS locks onto your position in just 2 seconds even in dense city canyons, and 60-hour battery life supports ultra-distance triathlons.',
      },
      'Apple Watch Series 10 (2024)': {
        name: 'Apple Watch Series 10 (2024)',
        specs: ['S10 chip', '42mm or 46mm case (largest Apple Watch displays ever)', '9.7mm thin (thinnest Apple Watch)', 'Wide-angle OLED display, 2000 nits', 'Sleep Apnea detection (FDA-cleared)', 'Heart rate, ECG, Blood Oxygen, Crash Detection', 'Up to 18h battery (36h LPM)', 'Faster charging (0-80% in 30 min)', 'watchOS 11'],
        details: 'Apple Watch Series 10 is the thinnest Apple Watch ever while featuring the largest displays in Series history. FDA-cleared Sleep Apnea detection identifies breathing disturbances at night, potentially alerting users to a serious condition before diagnosis. 30-minute fast charging makes it practical even when you forget to charge overnight.',
      },
      'Apple Watch Series 8 (2022)': {
        name: 'Apple Watch Series 8 (2022)',
        specs: ['S8 SiP chip', '41mm or 45mm case', 'Always-On Retina display', 'Body temperature sensor (new)', 'Crash Detection (new)', 'Heart rate, ECG, Blood Oxygen, irregular rhythm', 'Up to 18h battery (36h LPM)', 'IP6X + WR50', 'International emergency calling'],
        details: 'The Apple Watch Series 8 adds Crash Detection and a body temperature sensor for cycle tracking and health insights. International emergency calling works in 150+ countries even without a cellular plan, and the Always-On display keeps your information at a glance without a wrist raise.',
      },
      'Apple Watch Ultra (2022)': {
        name: 'Apple Watch Ultra (2022)',
        specs: ['S8 SiP chip', '49mm aerospace-grade titanium case', 'Flat sapphire crystal display, 2000 nits', 'Dual-frequency GPS (L1 + L5)', 'Depth gauge to 40m', 'Up to 60 hours battery', 'WR100 + IP6X + MIL-STD-810H', 'Action Button (programmable)', 'Compatible with Ocean and Trail Loop bands'],
        details: 'The original Apple Watch Ultra set a new standard for adventure wearables with its 49mm titanium case, sapphire crystal display, and dual-frequency GPS. Designed in collaboration with athletes and adventurers, it withstands the most extreme environments while providing the full Apple Watch health and connectivity experience.',
      },
      'Apple Watch SE 2nd Gen (2022)': {
        name: 'Apple Watch SE 2nd Generation (2022)',
        specs: ['S8 SiP chip', '40mm or 44mm case', 'Retina LTPO display (always-on not available)', 'Crash Detection (new)', 'Heart rate, irregular rhythm notification, Fall Detection', 'Up to 18h battery', 'WR50 water resistance', 'Most affordable Apple Watch with Crash Detection', 'Available in Midnight, Starlight, Silver'],
        details: 'The Apple Watch SE (2nd gen) brings Crash Detection and the S8 chip to the most affordable Apple Watch. It\'s the ideal choice for those entering the Apple Watch ecosystem or as a first watch for kids via Family Setup, offering all essential health and safety features at an accessible price.',
      },
    },
    Samsung: {
      'Galaxy Watch 7 (2024)': {
        name: 'Samsung Galaxy Watch 7 (2024)',
        specs: ['Exynos W1000 3nm chip (first 3nm wearable)', '40mm or 44mm case', 'Super AMOLED 3000 nits peak', 'BioActive Sensor: heart rate, SpO2, ECG, body composition', 'Energy Score AI health analysis', 'Up to 40h battery (40mm)', '5ATM + IP68', 'Galaxy AI', 'Wear OS 5 + One UI Watch 6'],
        details: 'The Galaxy Watch 7 is powered by the world\'s first 3nm wearable chip, delivering faster performance and better battery efficiency than any previous Galaxy Watch. Galaxy AI\'s Energy Score provides a holistic daily wellness assessment, and the 3000-nit display is perfectly readable in the brightest sunlight.',
      },
      'Galaxy Watch Ultra (2024)': {
        name: 'Samsung Galaxy Watch Ultra (2024)',
        specs: ['Exynos W1000 3nm chip', '47mm titanium case', 'Super AMOLED 3000 nits', 'BioActive Sensor + body composition', 'Dual-frequency GPS (L1 + L5)', 'Up to 60h battery', '10ATM + IP68 + MIL-STD-810H', 'Galaxy AI + advanced sports tracking', 'Wear OS 5'],
        details: 'The Galaxy Watch Ultra is Samsung\'s most premium and rugged smartwatch, featuring a titanium case, 10ATM water resistance, and dual-frequency GPS for precise outdoor navigation. The 60-hour battery with Advanced Power Saving Mode ensures it lasts through the most demanding multi-day adventures.',
      },
      'Galaxy Watch 6 (2023)': {
        name: 'Samsung Galaxy Watch 6 (2023)',
        specs: ['Exynos W930 (4nm)', '40mm or 44mm case', 'Super AMOLED 2000 nits', 'Advanced Sleep Coaching', 'BioActive Sensor: HR, SpO2, ECG, body composition', 'Up to 40h battery', '5ATM + IP68', 'Sapphire crystal display option', 'Wear OS 4 + One UI Watch 5'],
        details: 'The Galaxy Watch 6 introduces Advanced Sleep Coaching powered by AI, providing personalised programmes to improve your sleep quality over time. The redesigned bezel adds more display space, and the 2000-nit screen stays readable outdoors. Body composition analysis gives detailed insight into your health metrics.',
      },
      'Galaxy Watch 6 Classic (2023)': {
        name: 'Samsung Galaxy Watch 6 Classic (2023)',
        specs: ['Exynos W930 (4nm)', '43mm or 47mm case with rotating bezel', 'Super AMOLED 2000 nits', 'Physical rotating bezel for intuitive navigation', 'Advanced Sleep Coaching + BioActive Sensor', 'Up to 44h battery (47mm)', '5ATM + IP68', 'Sapphire crystal glass', 'Wear OS 4'],
        details: 'The Galaxy Watch 6 Classic brings back the iconic physical rotating bezel for intuitive, glove-friendly navigation — a feature beloved by Galaxy Watch enthusiasts. The larger 47mm case houses a 44-hour battery, and the overall classic watch design makes it equally at home in the boardroom as on the trail.',
      },
    },
    Garmin: {
      'Garmin Fenix 8': {
        name: 'Garmin Fenix 8 Multisport GPS Watch',
        specs: ['MIP or AMOLED display options (Fenix 8 AMOLED)', '47mm / 51mm / 51mm Solar cases', 'Multi-band GPS with SatIQ technology', 'All-day health tracking + HRV Status', 'Up to 16 days battery (smartwatch mode)', 'Dive computer to 40m (Sapphire Solar)', 'Built-in LED torch', 'Tri-band GPS: GPS, GLONASS, Galileo, BDS', 'ANT+, Bluetooth, Wi-Fi'],
        details: 'The Garmin Fenix 8 is the ultimate outdoor sports watch with built-in LED torch, dive computer capability, and optional AMOLED display — the first in the Fenix line. SatIQ automatically selects the best satellite configuration for maximum accuracy and efficiency, and HRV Status provides a daily readiness score.',
      },
      'Garmin Fenix 7': {
        name: 'Garmin Fenix 7 Multisport GPS Watch',
        specs: ['1.3" MIP display with touchscreen + buttons', '47mm / 51mm / Solar options', 'Multi-band GPS (Fenix 7X)', 'Up to 18 days smartwatch battery (standard)', 'Solar charging extends battery indefinitely in sunlight', 'All sports tracking: run, bike, swim, ski, golf', 'Topographic maps, turn-by-turn navigation', 'Pulse Ox, HRV, Body Battery', 'ANT+, Bluetooth, Wi-Fi'],
        details: 'The Garmin Fenix 7 introduces touchscreen to the Fenix line while retaining the physical buttons beloved by outdoor athletes. Solar charging with glass lens extends battery life beyond the already impressive 18 days, and multi-band GPS delivers exceptional positional accuracy on trails and technical routes.',
      },
    },
    Fitbit: {
      'Fitbit Charge 6': {
        name: 'Fitbit Charge 6 Fitness Tracker',
        specs: ['Google integration (Google Maps, Google Wallet, YouTube Music)', 'Built-in GPS (no phone needed)', 'ECG app + SpO2 sensor', 'Skin conductance sensor for stress management', 'Active Zone Minutes + Daily Readiness Score', 'Up to 7 days battery', '5ATM water resistance', 'AMOLED colour display', '6-month Fitbit Premium trial'],
        details: 'The Fitbit Charge 6 is the most capable Fitbit tracker ever, with built-in GPS, Google Wallet for contactless payments, and deep Google Maps integration for navigation. The ECG app and electrodermal activity sensor provide medical-grade heart health monitoring and stress tracking in a slim band.',
      },
      'Fitbit Sense 2': {
        name: 'Fitbit Sense 2 Advanced Health Smartwatch',
        specs: ['cEDA sensor for continuous stress tracking', 'ECG app + SpO2 sensor', 'Skin temperature tracking', 'Built-in GPS', 'Up to 6 days battery', 'Compatible with Alexa + Google Assistant', 'Sleep stages + Sleep Score', '5ATM water resistance', '40mm AMOLED display'],
        details: 'The Fitbit Sense 2 is the most comprehensive health smartwatch Fitbit has made, with continuous electrodermal activity sensing for real-time stress detection throughout the day. Combined with ECG, SpO2, skin temperature, and sleep tracking, it provides the most complete picture of your wellness.',
      },
    },
  },

  // ════════════════════════════ AUDIO ══════════════════════════════════════════
  Audio: {
    Sony: {
      'WH-1000XM5': {
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        specs: ['Industry-leading ANC (8 microphones + 2 dedicated ANC processors)', 'New 30mm driver for clearer natural sound', 'Up to 30 hours battery with ANC on', '3-minute quick charge = 3 hours playback', 'LDAC Hi-Res Wireless codec support', 'Multipoint connection (2 devices simultaneously)', 'Speak-to-Chat auto-pause', 'Ultra-lightweight 250g design'],
        details: 'The Sony WH-1000XM5 sets the gold standard for wireless noise-cancelling headphones with an 8-microphone array and two dedicated ANC processors delivering unprecedented silence. New 30mm driver architecture produces clearer, more natural sound, and LDAC delivers Hi-Res audio equivalent to wired performance.',
      },
      'WH-1000XM4': {
        name: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
        specs: ['Industry-leading ANC (HD QN1 processor)', '40mm driver unit', 'Up to 30 hours battery, 10 min charge = 5 hours', 'LDAC Hi-Res Wireless', 'Multipoint (2 devices)', 'Adaptive Sound Control', 'Speak-to-Chat', '254g', 'Wearing detection, auto pause/play'],
        details: 'The Sony WH-1000XM4 set the benchmark for noise-cancelling headphones with best-in-class ANC, 30-hour battery, and LDAC Hi-Res support. Multipoint seamlessly switches between laptop and phone, and Speak-to-Chat automatically pauses music when you begin a conversation.',
      },
      'WF-1000XM5': {
        name: 'Sony WF-1000XM5 Truly Wireless Noise Cancelling Earbuds',
        specs: ['Integrated Processor V2 + QN2e ANC chip', '8.4mm driver unit', '8h battery (earbuds) + 24h total with case', 'LDAC Hi-Res Wireless + LC3 codec', 'Multipoint (2 devices)', 'Speak-to-Chat + adaptive ANC', 'IPX4 splash resistance', 'Smallest Sony premium earbuds yet'],
        details: 'The WF-1000XM5 are Sony\'s smallest and best-performing noise-cancelling earbuds, 25% smaller than the XM4 but with full V2 Integrated Processor and 8.4mm dynamic driver. LDAC wirelessly transmits at 3× the data rate of standard Bluetooth for true Hi-Res audio without the cable.',
      },
      'WF-1000XM4': {
        name: 'Sony WF-1000XM4 Truly Wireless Noise Cancelling Earbuds',
        specs: ['Integrated Processor V1 + QN1e ANC chip', '6mm Carbon Fibre Composite driver', '8h battery + 24h with case', 'LDAC Hi-Res Wireless', 'IPX4 splash resistance', 'Speak-to-Chat', 'DSEE Extreme upscaling', 'Three-mic system for calls'],
        details: 'The WF-1000XM4 raised the bar for truly wireless ANC earbuds with industry-leading noise cancellation in a compact form. LDAC high-resolution audio and DSEE Extreme upscaling ensure any audio source sounds its best, and the six-hour battery per charge handles a full workday.',
      },
    },
    Bose: {
      'QuietComfort Ultra Headphones': {
        name: 'Bose QuietComfort Ultra Headphones',
        specs: ['World-class ANC with CustomTune technology', 'Immersive Audio with head tracking (spatial audio)', 'Up to 24 hours battery with ANC', '15 min quick charge = 2.5 hours', 'Aware Mode with ActiveSense', 'Multipoint (2 devices)', 'OpenAudio spatial sound without plug-in', '250g premium build'],
        details: 'The Bose QC Ultra Headphones introduce Immersive Audio — spatial audio that tracks head movement — alongside CustomTune technology that auto-calibrates ANC and EQ to your unique ear shape every time you wear them. Best-in-class noise cancellation meets world-class spatial audio for the ultimate listening experience.',
      },
      'QuietComfort 45': {
        name: 'Bose QuietComfort 45 Wireless Headphones',
        specs: ['World-class noise cancellation', 'Awareness Mode for ambient sound', 'Up to 24 hours battery with ANC', '15 min quick charge = 3 hours', 'Multipoint Bluetooth (2 devices)', 'Simple Mode + Quiet Mode switch', 'Lightweight foldable design, 238g', 'USB-C charging'],
        details: 'The Bose QC45 delivers Bose\'s signature world-class noise cancellation alongside an Awareness Mode that lets in ambient sound when needed. The simple two-mode design (Quiet Mode / Awareness Mode) makes it intuitive for everyday use, and the 24-hour battery provides all-day comfort.',
      },
      'QuietComfort Ultra Earbuds': {
        name: 'Bose QuietComfort Ultra Earbuds',
        specs: ['Bose QuietComfort Ultra noise cancellation', 'Immersive Audio (spatial sound with head tracking)', '6h battery (earbuds) + 24h total', '20 min quick charge = 2 hours', 'Multipoint Bluetooth (2 devices)', 'Aware Mode', 'IPX4 water resistance', 'Three stability bands included'],
        details: 'The Bose QC Ultra Earbuds bring Immersive Audio to completely wireless earbuds for the first time, with head-tracked spatial sound that keeps audio anchored in space as you move. CustomTune automatically calibrates to your ear canal for optimal ANC performance and sound quality.',
      },
    },
    JBL: {
      'Charge 6': {
        name: 'JBL Charge 6 Portable Wireless Speaker',
        specs: ['40W RMS two-way speaker system', 'JBL Pro Sound with dual passive radiators', 'Up to 20 hours playback', 'IP67 waterproof + dustproof', 'USB-C output to charge your devices (power bank)', 'PartyBoost to connect multiple JBL speakers', 'Bluetooth 5.3', 'Detachable shoulder strap'],
        details: 'The JBL Charge 6 delivers 40W of powerful sound in a rugged IP67 package, and its built-in power bank charges your phone while it plays music. PartyBoost lets you wirelessly link compatible JBL speakers for stereo or a massive outdoor soundscape — perfect for any gathering.',
      },
      'Flip 6': {
        name: 'JBL Flip 6 Portable Wireless Speaker',
        specs: ['30W RMS racetrack driver + tweeter', 'JBL Pro Sound, deep bass', 'Up to 12 hours playback', 'IP67 waterproof + dustproof', 'PartyBoost for multi-speaker connection', 'Bluetooth 5.1', 'USB-C charging', 'Available in 11+ vibrant colours'],
        details: 'The JBL Flip 6 packs impressive 30W sound into a compact, fully waterproof cylinder. A separate tweeter delivers clearer highs alongside the racetrack woofer, resulting in a balanced sound that outperforms any speaker of its size. IP67 rating means it survives total immersion.',
      },
      'Tour Pro 2': {
        name: 'JBL Tour Pro 2 Truly Wireless Noise Cancelling Earbuds',
        specs: ['True Adaptive Noise Cancelling', 'Smart Charging Case with 1.45" touchscreen display', '10h battery (earbuds ANC) + 40h total', 'JBL Spatial Sound (Dolby Atmos + 3D audio)', 'Multipoint Bluetooth 5.3 (2 devices)', '6-mic system for calls', 'IPX5 water resistance', 'LDAC Hi-Res Wireless'],
        details: 'The JBL Tour Pro 2 is the world\'s first truly wireless earbuds with a smart charging case featuring a 1.45-inch touchscreen that controls music, calls, and noise cancellation without taking out your phone. LDAC support and JBL Spatial Sound with Dolby Atmos deliver a concert-hall listening experience.',
      },
    },
    Apple: {
      'AirPods Pro (2nd Gen)': {
        name: 'Apple AirPods Pro (2nd Generation)',
        specs: ['H2 chip for ANC (2× more ANC than 1st gen)', 'Adaptive Transparency Mode (48,000 processes/second)', 'Personalised Spatial Audio with head tracking', '6h battery (ANC on) + 30h total with MagSafe case', 'MagSafe case with built-in speaker + Find My', 'IPX4 earbuds + IP54 case', 'Touch volume swipe gesture (new)', 'Precision Finding in Find My app'],
        details: 'AirPods Pro 2nd gen deliver twice the noise cancellation with the H2 chip, and Adaptive Transparency processes ambient sound 48,000 times per second. The MagSafe case has a built-in speaker for easy locating with Find My, and the new volume swipe gesture makes adjustments effortless.',
      },
      'AirPods (3rd Gen)': {
        name: 'Apple AirPods (3rd Generation)',
        specs: ['H1 chip', 'Adaptive EQ for personalised sound', 'Personalised Spatial Audio with head tracking', '6h battery + 30h total with case', 'MagSafe charging case', 'IPX4 sweat & water resistance', 'Skin-detect sensor', 'Force sensor for controls', 'Open-ear design (no ear tips)'],
        details: 'AirPods 3rd gen bring Personalised Spatial Audio and Adaptive EQ to the open-ear AirPods design, tuning music to your unique ear shape in real time. The MagSafe case and IPX4 rating make them rugged daily companions, and 6 hours battery with a quick 5-minute charge for 1 hour keeps the music going.',
      },
      'AirPods Max': {
        name: 'Apple AirPods Max',
        specs: ['H1 chip in each ear cup (2 chips, 9 billion operations/sec)', 'Active Noise Cancellation + Transparency Mode', 'Personalised Spatial Audio with head tracking', 'Custom 40mm Apple-designed dynamic driver', 'Up to 20 hours battery (ANC + spatial audio)', 'Digital Crown + noise control button', 'Stainless steel headband with mesh canopy', 'Available in 5 colours'],
        details: 'AirPods Max deliver the ultimate over-ear listening experience, with two H1 chips and nine microphones working together to provide computational audio. The custom 40mm driver with Apple-designed neodymium magnet produces breathtaking bass, mids, and treble with near-zero distortion even at full volume.',
      },
    },
    Sennheiser: {
      'Momentum 4 Wireless': {
        name: 'Sennheiser Momentum 4 Wireless Headphones',
        specs: ['42mm audiophile-grade transducer driver', 'Up to 60 hours battery (best-in-class)', 'Adaptive Noise Cancellation', 'Clear Voice pickup for calls', 'Transparent Hearing mode', 'Bluetooth 5.2 + aptX Adaptive for Hi-Res Wireless', 'Customisable EQ via Smart Control app', 'Foldable design, 293g'],
        details: 'The Sennheiser Momentum 4 Wireless delivers an extraordinary 60 hours of battery life — the most of any premium noise-cancelling headphones — alongside Sennheiser\'s acclaimed audiophile sound tuning. Adaptive ANC continuously adjusts to your environment, and aptX Adaptive provides lossless Hi-Res wireless audio.',
      },
    },
    Samsung: {
      'Galaxy Buds 3 Pro': {
        name: 'Samsung Galaxy Buds 3 Pro Truly Wireless Earbuds',
        specs: ['360 Audio with 24-bit Hi-Fi sound', 'Intelligent Active Noise Cancellation + Ambient Sound', 'Galaxy AI with Interpreter mode', '6h battery (ANC) + 30h total', 'IP57 earbuds + IP54 case', 'Multipoint (2 devices)', 'Wing-tip design for sports', 'Blade Lights for notification', 'Works with Android and iPhone'],
        details: 'The Galaxy Buds 3 Pro feature a new open-top Wing design that passively reduces wind noise and fits securely for sports. Galaxy AI enables real-time Interpreter mode directly in your ear, and 360 Audio with 24-bit processing delivers Hi-Fi sound quality that reveals details most earbuds miss.',
      },
    },
  },

  // ════════════════════════════ GAMING ═════════════════════════════════════════
  Gaming: {
    Sony: {
      'PlayStation 5': {
        name: 'Sony PlayStation 5',
        specs: ['AMD Zen 2 CPU (8-core, 3.5GHz variable)', 'AMD RDNA 2 GPU (10.28 TFLOPS, 36 CUs)', '16GB GDDR6 RAM', '825GB custom SSD (5.5GB/s raw)', '4K gaming up to 120fps, 8K output', 'Ray tracing support', 'DualSense haptic feedback + adaptive triggers', 'Tempest 3D AudioTech', 'Ultra-HD Blu-ray drive'],
        details: 'The PlayStation 5 represents the biggest leap in PlayStation history, with an ultra-high-speed custom SSD eliminating load times and enabling new gameplay mechanics. The DualSense controller\'s adaptive triggers and haptic feedback create a new dimension of immersion — feel rain on your fingertips and resistance on a bowstring.',
      },
      'PlayStation 5 Digital Edition': {
        name: 'Sony PlayStation 5 Digital Edition',
        specs: ['AMD Zen 2 CPU (8-core, 3.5GHz variable)', 'AMD RDNA 2 GPU (10.28 TFLOPS)', '16GB GDDR6 RAM', '825GB custom SSD (5.5GB/s)', '4K up to 120fps, ray tracing', 'DualSense controller with haptics + adaptive triggers', 'Tempest 3D AudioTech', 'Digital games only (no disc drive)', 'Same performance as disc version'],
        details: 'The PS5 Digital Edition offers identical performance to the standard PS5 at a lower price, with the only difference being no disc drive. All PS5 games from PlayStation Store deliver the same ultra-fast SSD experience and DualSense immersion as the disc-based version.',
      },
      'PlayStation 5 Slim (2023)': {
        name: 'Sony PlayStation 5 Slim (2023)',
        specs: ['AMD Zen 2 CPU (8-core)', 'AMD RDNA 2 GPU (10.28 TFLOPS)', '16GB GDDR6 RAM', '1TB custom SSD (upgraded from 825GB)', 'Detachable disc drive (Ultra HD Blu-ray)', '4K 120fps + ray tracing', 'DualSense controller', '30% smaller than original PS5', 'Tempest 3D AudioTech'],
        details: 'The PS5 Slim is 30% smaller than the original while maintaining identical gaming performance and upgrading storage to 1TB. The detachable disc drive is now an optional add-on, letting you choose between disc and digital models — and switch later by purchasing the add-on drive separately.',
      },
      'DualSense Wireless Controller': {
        name: 'Sony DualSense Wireless Controller',
        specs: ['Haptic feedback (replaces traditional rumble)', 'Adaptive triggers with variable resistance (L2/R2)', 'Built-in microphone array', 'Built-in speaker', 'USB-C charging, ~12 hours battery', 'Create button for sharing', '3.5mm headphone jack', 'Integrated light bar', 'Touchpad with click'],
        details: 'The DualSense transforms gaming interaction — adaptive triggers that resist and react to in-game actions let you feel the tension of a bowstring or the resistance of wet snow. Haptic feedback granular enough to simulate textures underfoot creates a completely new sense of immersion that must be felt to be understood.',
      },
      'PlayStation VR2': {
        name: 'Sony PlayStation VR2',
        specs: ['4K HDR OLED (2000×2040 per eye), 90/120Hz', 'Foveated rendering with eye tracking', '110° field of view', 'Adaptive triggers + haptic feedback in controllers (Sense controllers)', 'Headset vibration motor', 'Inside-out tracking (no external camera)', 'USB-C single cable connection to PS5', 'Passthrough view camera'],
        details: 'The PlayStation VR2 is the most advanced consumer VR headset available, with OLED 4K displays, eye tracking for foveated rendering, and adaptive triggers and haptic feedback in both the headset and Sense controllers. Single-cable USB-C setup is dramatically simpler than original PSVR.',
      },
    },
    Microsoft: {
      'Xbox Series X': {
        name: 'Microsoft Xbox Series X',
        specs: ['AMD Zen 2 CPU (8-core, 3.8GHz)', 'AMD RDNA 2 GPU (12 TFLOPS, 52 CUs)', '16GB GDDR6 RAM', '1TB custom NVMe SSD (2.4GB/s)', '4K at 60fps (up to 120fps), 8K ready', 'Ray tracing + DirectX 12 Ultimate', 'Quick Resume (multiple games simultaneously)', 'Backward compatible with 4 Xbox generations', 'Xbox Wireless controller'],
        details: 'The Xbox Series X is Microsoft\'s most powerful console with 12 TFLOPS and true 4K gaming with ray tracing. Quick Resume suspends and instantly resumes multiple games within seconds — just switch between them. Backward compatibility with thousands of Xbox, 360, One, and Series games means your entire library comes forward.',
      },
      'Xbox Series S': {
        name: 'Microsoft Xbox Series S',
        specs: ['AMD Zen 2 CPU (8-core)', 'AMD RDNA 2 GPU (4 TFLOPS)', '10GB GDDR6 RAM', '512GB custom SSD', '1440p gaming up to 120fps, 4K upscaling', 'Ray tracing + DirectX 12 Ultimate', 'Quick Resume', 'Backward compatible (digital only)', 'Most affordable next-gen console', 'Xbox Game Pass compatible'],
        details: 'The Xbox Series S is the most affordable next-gen console and the perfect entry point for Xbox Game Pass. Despite targeting 1440p rather than native 4K, it delivers true next-generation features including SSD-powered instant loading, Quick Resume, and ray tracing at an incredibly competitive price.',
      },
    },
    Nintendo: {
      'Nintendo Switch OLED (2021)': {
        name: 'Nintendo Switch OLED Model (2021)',
        specs: ['7" vibrant OLED screen (vs 6.2" LCD on original)', 'NVIDIA custom Tegra processor', '64GB internal storage (2× original)', 'Adjustable wide stand', 'Enhanced audio via built-in speakers', 'LAN port on dock', 'Three modes: TV, Tabletop, Handheld', '4-6 hours battery (handheld)', 'Joy-Con controllers included'],
        details: 'The Nintendo Switch OLED Model upgrades the beloved Switch with a stunning 7-inch OLED display — deep blacks and rich colours make every game pop in handheld mode. The wider adjustable stand and enhanced speakers significantly improve tabletop play, and doubled storage handles your growing game library.',
      },
      'Nintendo Switch (2017)': {
        name: 'Nintendo Switch (2017)',
        specs: ['6.2" IPS multi-touch screen', 'NVIDIA custom Tegra processor', '32GB internal storage, microSD support', '3-mode play: TV, Tabletop, Handheld', 'Joy-Con controllers (motion controls + HD rumble)', '2-6 hours battery', 'USB-C charging', 'Wi-Fi + Bluetooth', '297g with Joy-Cons'],
        details: 'The Nintendo Switch revolutionised gaming as both a home console and handheld in one. At home it connects to the TV via the dock; on the go it\'s a portable console with detachable Joy-Cons. The versatility and Nintendo\'s exclusive game lineup make it one of the best-selling consoles of all time.',
      },
      'Nintendo Switch Lite (2019)': {
        name: 'Nintendo Switch Lite',
        specs: ['5.5" IPS touch screen', 'NVIDIA Tegra processor', '32GB internal storage', 'Dedicated handheld-only design', 'Integrated controls (no detachable Joy-Cons)', '3-7 hours battery', 'USB-C charging', 'Smaller and lighter than original Switch', 'Available in Yellow, Grey, Coral, Turquoise, Pokémon editions'],
        details: 'The Nintendo Switch Lite is the compact, fully handheld-dedicated Switch at a lower price. Lighter and smaller with longer battery life than the original, it\'s perfect for gaming on the go. Compatible with the vast Nintendo Switch game library that supports handheld mode.',
      },
    },
    Razer: {
      'Razer DeathAdder V3 Pro': {
        name: 'Razer DeathAdder V3 Pro Wireless Gaming Mouse',
        specs: ['Focus Pro 30K optical sensor', 'Up to 300 IPS tracking', 'HyperSpeed wireless (4000Hz polling)', 'Up to 90 hours battery life', '5 programmable buttons (Razer Gen-3 Optical Switches)', '63g ultra-lightweight design', '30 metre wireless range', 'Razer Chroma RGB', 'Razer HyperPolling compatible'],
        details: 'The Razer DeathAdder V3 Pro is a wireless esports mouse combining the iconic ergonomic shape with the Focus Pro 30K sensor and HyperSpeed wireless for zero-compromise competitive performance. At 63g, it\'s lighter than most wired mice while delivering 90 hours of battery life.',
      },
    },
    Logitech: {
      'Logitech G Pro X Superlight 2': {
        name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
        specs: ['HERO 2 sensor (32,000 DPI)', 'LIGHTSPEED wireless (1ms report rate)', 'Up to 95 hours battery life', '60g ultra-lightweight (lightest G Pro yet)', 'LIGHTFORCE optical-mechanical hybrid switches', '5 programmable buttons', 'PTFE feet for ultra-smooth glide', 'POWERPLAY wireless charging compatible'],
        details: 'The G Pro X Superlight 2 is the definitive esports wireless mouse, used and endorsed by professional gamers worldwide. At 60g, it\'s imperceptibly light, and the HERO 2 sensor with LIGHTFORCE hybrid switches provides the most accurate and responsive clicks at any speed.',
      },
    },
  },

  // ════════════════════════════ CAMERAS ════════════════════════════════════════
  Cameras: {
    Sony: {
      'Sony A7 IV (2021)': {
        name: 'Sony Alpha A7 IV Mirrorless Camera',
        specs: ['33MP full-frame BSI CMOS sensor', 'BIONZ XR processor', 'ISO 50–204,800 expanded', '4K 60p (Super 35mm) + 4K 30p full-frame', '759-point phase-detect AF with AI subject recognition', '10fps burst', 'In-Body Image Stabilisation (5.5 stops)', 'Dual card slots (CFexpress Type A + UHS-II SD)', 'Tilting touchscreen + EVF'],
        details: 'The Sony A7 IV is the ultimate all-around mirrorless for stills and video. The 33MP sensor captures incredible detail, 4K 60p with 10-bit S-Log3 gives filmmakers outstanding dynamic range, and AI-powered AF tracks eyes, animals, birds, insects, cars, and trains with uncanny reliability.',
      },
      'Sony A6700 (2023)': {
        name: 'Sony Alpha A6700 APS-C Mirrorless Camera',
        specs: ['26MP APS-C Exmor R CMOS sensor', 'AI-based subject recognition AF (same as A7R V)', 'BIONZ XR + Dedicated AI Processing Unit', '4K 60p Super 35mm 10-bit', '5-axis In-Body Image Stabilisation (5 stops)', '11fps burst with AE/AF', 'Compact body (493g with battery)', 'LCD articulating touchscreen + EVF', 'E-mount lenses compatible'],
        details: 'The Sony A6700 brings the AI subject recognition AF from the flagship A7R V to an APS-C camera for the first time, wrapped in a compact, lightweight body. The dedicated AI processor allows simultaneous subject tracking and in-camera computational tasks, making it the smartest compact mirrorless ever made.',
      },
    },
    Canon: {
      'Canon EOS R5 Mark II (2024)': {
        name: 'Canon EOS R5 Mark II Mirrorless Camera',
        specs: ['45MP full-frame stacked BSI CMOS sensor', 'DIGIC X + DIGIC Accelerator dual processors', '8K RAW internal video at 60fps', '4K 120fps recording', '30fps burst with Mechanical/Electronic shutter', 'In-Body IS 8 stops combined', 'Dual CFexpress Type B slots', 'Advanced Subject AF (AI deep learning)', 'Canon Log 3 + Canon Log for grading'],
        details: 'The Canon EOS R5 Mark II is a landmark professional mirrorless — the stacked sensor eliminates rolling shutter for action and video, 8K RAW 60fps internal recording rivals dedicated cinema cameras, and 8-stop IBIS enables handheld shooting in near-darkness. A true hybrid powerhouse for the world\'s best photographers and filmmakers.',
      },
      'Canon EOS R6 (2020)': {
        name: 'Canon EOS R6 Mirrorless Camera',
        specs: ['20MP full-frame CMOS sensor (based on 1DX Mark III)', 'DIGIC X processor', '4K 60p 10-bit C-Log video', 'In-Body IS (8 stops with compatible lenses)', 'Dual Pixel AF II (6,072 AF points)', '12fps mechanical + 20fps electronic burst', 'Dual SD card slots (UHS-II)', 'Weather-sealed body', 'Eye tracking + Animal AF'],
        details: 'The Canon EOS R6 delivers extraordinary speed and subject tracking in a mid-sized body. The sensor based on Canon\'s 1DX Mark III sports flagship captures stunning low-light images at ISO 102,400 expanded, and 8-stop IBIS with compatible IS lenses is the world\'s best optical stabilisation for handheld video.',
      },
      'Canon EOS R10 (2022)': {
        name: 'Canon EOS R10 APS-C Mirrorless Camera',
        specs: ['24.2MP APS-C CMOS sensor', 'DIGIC X processor', '4K UHD 30p (4K 60p cropped)', '15fps electronic burst (23fps with pre-burst)', 'Dual Pixel AF II with subject tracking', 'ISO 100–32,000', 'Single SD card slot', 'Lightweight 429g body', 'Vari-angle touchscreen + EVF'],
        details: 'The Canon EOS R10 is the most affordable way into the Canon RF ecosystem, delivering impressive speed with up to 15fps burst and reliable Dual Pixel AF II subject tracking including animals. The compact lightweight body and vari-angle screen make it an ideal travel and everyday mirrorless camera.',
      },
    },
    Nikon: {
      'Nikon Z6 III (2024)': {
        name: 'Nikon Z6 III Mirrorless Camera',
        specs: ['24.5MP partially stacked full-frame CMOS sensor', 'EXPEED 7 processor', '6K ProRes RAW internal video', '4K 60p full-frame + 4K 120p crop', '20fps burst with RAW', 'In-Body VR (6 stops)', 'Multi-Selector AF with 273 points', 'CFexpress Type B + SD dual slots', 'Fully articulating touchscreen + high-res EVF'],
        details: 'The Nikon Z6 III is the world\'s first full-frame mirrorless with a partially stacked sensor, enabling 6K ProRes RAW internal video and 120fps 4K recording. The EXPEED 7 processor delivers 20fps RAW burst and the most accurate subject detection Nikon has ever offered, in a compact all-weather body.',
      },
      'Nikon Zf (2023)': {
        name: 'Nikon Zf Mirrorless Camera',
        specs: ['24.5MP BSI full-frame CMOS sensor', 'EXPEED 7 processor', 'Retro-styled body with physical control dials', '4K 30p full-frame + 4K 60p DX crop', 'Subject Detection AF (people, animals, vehicles)', 'In-Body VR (8 stops)', 'Single CFexpress Type B / SD card slot', '705g body', 'Leatherette grip + metal top plate'],
        details: 'The Nikon Zf combines the modern performance of the Z8 in a strikingly retro body with dedicated exposure control dials for Shutter Speed, ISO, and Exposure Compensation. The BSI full-frame sensor delivers 8 stops of stabilisation and outstanding high-ISO performance for available-light photography.',
      },
    },
    Fujifilm: {
      'Fujifilm X100VI (2024)': {
        name: 'Fujifilm X100VI Compact Camera',
        specs: ['40.2MP APS-C X-Trans CMOS 5 HR sensor', 'X-Processor 5', '6.2K video + 4K 60p', '7-stop In-Body Image Stabilisation (new)', 'Built-in ND filter (up to 4-stops)', '23mm f/2 fixed lens (35mm equivalent)', '20fps burst', '40 Film Simulations including Reala Ace', 'Electronic + Optical Viewfinder'],
        details: 'The Fujifilm X100VI is the most anticipated camera in years, adding 7-stop IBIS and a 40MP sensor to the legendary X100 design for the first time. The built-in ND filter, Film Simulations, and fixed 35mm-equivalent lens combine to make it the perfect every-carry camera for street, travel, and everyday photography.',
      },
      'Fujifilm X-T5 (2022)': {
        name: 'Fujifilm X-T5 Mirrorless Camera',
        specs: ['40.2MP APS-C X-Trans CMOS 5 HR sensor', 'X-Processor 5', '6.2K video at 30fps', '7-stop In-Body VR (new highest for X-T)', '20fps burst with phase-detect AF', '40 Film Simulations', 'Compact stills-oriented body (476g)', 'Triple dial design', 'Dual SD card slots (UHS-II)'],
        details: 'The Fujifilm X-T5 is a return to form — a small, stills-focused body with the most impressive imaging hardware Fujifilm has ever shipped. The 40MP sensor resolves extraordinary detail, 7-stop IBIS enables handheld shooting in near-darkness, and the classic triple-dial design is the most intuitive camera interface in the industry.',
      },
    },
    GoPro: {
      'GoPro Hero 13 Black': {
        name: 'GoPro HERO13 Black Action Camera',
        specs: ['27MP photos, 5.3K 60fps / 4K 120fps video', 'HyperSmooth 6.0 stabilisation with horizon lock', 'Waterproof to 10m without housing', 'Interchangeable lens system (Ultra Wide, Max Lens, Macro)', 'Night Effects + Light Painting modes', 'GPS + full sensor suite', 'Enduro battery for cold weather', 'Front + rear LCD screens', 'Bluetooth 5.0 + Wi-Fi 5'],
        details: 'The GoPro HERO13 Black is the most versatile action camera ever, with an interchangeable lens system enabling Ultra Wide, 4K Macro, and Max Lens perspectives. HyperSmooth 6.0 delivers gimbal-like stabilisation, and the Enduro battery maintains performance in sub-zero temperatures for winter adventures.',
      },
      'GoPro Hero 12 Black': {
        name: 'GoPro HERO12 Black Action Camera',
        specs: ['27MP photos, 5.3K 60fps / 4K 120fps video', 'HyperSmooth 6.0 stabilisation', 'Waterproof to 10m', 'Vertical video (9:16) for social media', 'HDR video for the first time', 'Bluetooth 5.0 + Wi-Fi 5', 'Front + rear LCD screens', 'Max Lens Mod 2.0 compatible', '1080p 240fps slow motion'],
        details: 'The GoPro HERO12 Black introduces vertical video and HDR video modes for the first time in a GoPro. HyperSmooth 6.0 ensures every shot is smooth regardless of activity level, and native vertical shooting makes the HERO12 the ideal action camera for Instagram Reels and TikTok creators.',
      },
    },
    DJI: {
      'DJI Mini 4 Pro': {
        name: 'DJI Mini 4 Pro Drone',
        specs: ['1/1.3" CMOS sensor, f/1.7 aperture', '4K 100fps HDR video', '10-bit D-Log M colour profile', '360° obstacle sensing (first on Mini series)', 'Omnidirectional obstacle avoidance', 'Up to 34 minutes flight time', '249g (no registration required in many countries)', 'RC-N1 / RC2 controller options', 'ActiveTrack 360° subject tracking'],
        details: 'The DJI Mini 4 Pro is the first Mini drone with omnidirectional obstacle sensing, making it the safest and most capable sub-250g drone ever made. The 1/1.3-inch sensor with f/1.7 aperture and 10-bit D-Log M delivers professional image quality, and ActiveTrack 360° keeps subjects centred from any angle.',
      },
      'DJI Osmo Pocket 3': {
        name: 'DJI Osmo Pocket 3 Compact Gimbal Camera',
        specs: ['1" CMOS sensor, f/2.0 aperture', '4K 120fps video', '10-bit D-Log M colour profile', '3-axis stabilised gimbal', '2" rotatable touchscreen (landscape/portrait)', 'ActiveTrack 3.0 subject tracking', '166 minute battery life', 'OLED display', 'Compact 179g handheld design'],
        details: 'The DJI Osmo Pocket 3 upgrades to a 1-inch sensor and 2-inch rotatable touchscreen, enabling professional-quality 4K 120fps video in a pocket-sized handheld stabiliser. The gimbal eliminates shake and jitter completely, while 10-bit D-Log M gives colourists the latitude to create any look in post.',
      },
    },
  },
};

// ─── Smart Fallback Generator ─────────────────────────────────────────────────
function generateFallback(category: string, brand: string, model: string): AutoFillEntry {
  const cat = category.toLowerCase();

  if (cat === 'phones') {
    return {
      name: `${brand} ${model}`,
      specs: [
        `${model} display`,
        `${brand} processor`,
        'Multi-lens rear camera system',
        'Selfie front camera',
        'Long-lasting battery with fast charging',
        'Biometric security',
        'Water resistance',
        '5G connectivity',
      ],
      details: `The ${brand} ${model} is a feature-rich smartphone offering impressive camera performance, a vibrant display, and all-day battery life. Designed for everyday versatility, it combines solid build quality with the powerful processor and connectivity options you need in a modern mobile device.`,
    };
  }

  if (cat === 'laptops') {
    return {
      name: `${brand} ${model}`,
      specs: [
        `${brand} / Intel / AMD processor`,
        '8GB – 32GB RAM',
        '512GB – 1TB SSD storage',
        `${model} display`,
        'Integrated or dedicated graphics',
        'Up to 12 hours battery life',
        'USB-C + USB-A + HDMI ports',
        'Wi-Fi 6 + Bluetooth 5',
      ],
      details: `The ${brand} ${model} is a capable, well-rounded laptop designed for productivity, creativity, and everyday computing. It combines solid processor performance with a quality display and reliable battery life, making it a dependable companion for professionals and students alike.`,
    };
  }

  if (cat === 'tablets') {
    return {
      name: `${brand} ${model}`,
      specs: [
        `${model} display`,
        `${brand} processor`,
        'Rear and front cameras',
        'Long battery life',
        'Wi-Fi 6, optional 5G cellular',
        'Stylus compatible',
        'Keyboard accessory compatible',
        'Compact and lightweight',
      ],
      details: `The ${brand} ${model} bridges the gap between smartphone and laptop, offering a spacious display perfect for productivity, media, and creative work. Stylus and keyboard accessories transform it into a versatile workstation that goes anywhere you do.`,
    };
  }

  if (cat === 'wearables') {
    return {
      name: `${brand} ${model}`,
      specs: [
        `${model} case and display`,
        'Heart rate monitoring',
        'Blood oxygen (SpO2) sensor',
        'GPS (built-in or connected)',
        'Activity and fitness tracking',
        'Smart notifications',
        'Multi-day battery life',
        'Water resistant',
      ],
      details: `The ${brand} ${model} keeps you connected and on top of your health goals with comprehensive health sensors and intelligent fitness tracking. Smart notifications keep you informed at a glance, and durable water resistance means you can wear it through any activity or weather.`,
    };
  }

  if (cat === 'audio') {
    return {
      name: `${brand} ${model}`,
      specs: [
        `${model} driver configuration`,
        'Active Noise Cancellation',
        'Transparency / Ambient Mode',
        'Hi-Res wireless audio codec',
        'Long battery life',
        'Quick charge support',
        'Multipoint Bluetooth connection',
        'Built-in microphone for calls',
      ],
      details: `The ${brand} ${model} delivers exceptional audio quality with effective noise cancellation and clear, balanced sound across the full frequency range. Extended battery life and quick charging keep the music going, while the multi-microphone system ensures crystal-clear calls in any environment.`,
    };
  }

  if (cat === 'gaming') {
    return {
      name: `${brand} ${model}`,
      specs: [
        `${model} hardware platform`,
        'High-performance CPU/GPU',
        'Fast storage with quick load times',
        'High-refresh-rate display support',
        'Wireless connectivity',
        'Next-generation gaming features',
        'Ergonomic design',
        'Compatible gaming ecosystem',
      ],
      details: `The ${brand} ${model} is engineered for gamers demanding peak performance and immersive experiences. Cutting-edge hardware ensures smooth gameplay at maximum settings, while the thoughtful design reduces fatigue during extended sessions. Deep ecosystem integration maximises your gaming setup\'s potential.`,
    };
  }

  if (cat === 'cameras') {
    return {
      name: `${brand} ${model}`,
      specs: [
        `${model} sensor`,
        'Advanced phase-detect autofocus',
        'RAW + JPEG capture',
        '4K video recording',
        'In-body image stabilisation',
        'Weather-sealed body',
        'Dual card slots',
        'Large-capacity battery',
      ],
      details: `The ${brand} ${model} is a professional-grade camera delivering exceptional image quality in a rugged, ergonomic body. Its advanced autofocus tracks subjects reliably in challenging conditions, and the sensor's wide dynamic range preserves detail in highlights and shadows for stunning stills and video alike.`,
    };
  }

  // Generic fallback
  return {
    name: `${brand} ${model}`,
    specs: [
      `${brand} ${model}`,
      category,
      'Premium build quality',
      'Reliable performance',
      'Modern connectivity',
    ],
    details: `The ${brand} ${model} is a premium ${category.toLowerCase()} product offering the quality performance and build you expect from ${brand}. Designed to deliver a superior user experience with features suited to both everyday use and more demanding tasks.`,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function getAutoFill(category: string, brand: string, model: string): AutoFillEntry {
  const exact = PRODUCT_AUTO_FILL[category]?.[brand]?.[model];
  if (exact) return exact;
  return generateFallback(category, brand, model);
}
