import { CATEGORIES, POPULAR_BIKE_MODELS } from "./appDefaults.js";

const catalog = {
  Brakes: {
    prefix: "BRK",
    basePrice: 220,
    priceStep: 65,
    modelStep: 35,
    brands: ["OEM", "Endurance", "ASK", "TVS Girling"],
    parts: [
      "Front Disc Brake Pad Set",
      "Rear Drum Brake Shoe Set",
      "Front Brake Disc Rotor",
      "Rear Brake Disc Rotor",
      "Front Brake Caliper Assembly",
      "Rear Brake Caliper Assembly",
      "Brake Master Cylinder",
      "Front Brake Hose",
      "Rear Brake Lever",
      "DOT 4 Brake Fluid"
    ],
    illustration: `<circle cx="120" cy="80" r="34"/><circle cx="120" cy="80" r="13"/><path d="M145 56l17-5 10 13-7 16-18 2M91 59l-15-8-12 12 7 15 18 2M120 46v13m0 42v13M86 80h13m42 0h13"/>`,
    color: "#dc2626"
  },
  "Clutch & Transmission": {
    prefix: "CLT",
    basePrice: 320,
    priceStep: 85,
    modelStep: 45,
    brands: ["OEM", "Endurance", "FCC", "Lumax"],
    parts: [
      "Clutch Plate Set",
      "Clutch Pressure Plate",
      "Clutch Cable Assembly",
      "Gear Shift Lever",
      "Gear Pedal Rubber",
      "Clutch Basket Assembly",
      "Clutch Release Bearing",
      "Transmission Gear Set",
      "Clutch Spring Set",
      "Gear Shift Return Spring"
    ],
    illustration: `<circle cx="105" cy="80" r="27"/><circle cx="105" cy="80" r="9"/><circle cx="148" cy="80" r="18"/><circle cx="148" cy="80" r="6"/><path d="M105 44v9m0 54v9M69 80h9m54 0h9M80 55l7 7m36 36 7 7m0-50-7 7m-36 36-7 7m59-24h-8m0 0-5-7m5 7-5 7"/>`,
    color: "#7c3aed"
  },
  "Drive & Chains": {
    prefix: "DCH",
    basePrice: 260,
    priceStep: 70,
    modelStep: 45,
    brands: ["OEM", "Rolon", "SFR", "Endurance"],
    parts: [
      "Motorcycle Drive Chain Kit",
      "Front Drive Sprocket",
      "Rear Drive Sprocket",
      "Chain Master Link",
      "Chain Adjuster Pair",
      "Swingarm Chain Slider",
      "Drive Chain Guard",
      "Heavy Duty Chain Link",
      "Chain Roller Set",
      "Chain Lubricant Spray"
    ],
    illustration: `<g transform="rotate(-25 120 80)"><rect x="76" y="58" width="31" height="22" rx="11"/><rect x="105" y="75" width="31" height="22" rx="11"/><rect x="134" y="58" width="31" height="22" rx="11"/><path d="M91 58v22m29-5v22m29-39v22"/></g>`,
    color: "#d97706"
  },
  "Engine Oil & Lubes": {
    prefix: "OIL",
    basePrice: 180,
    priceStep: 85,
    modelStep: 30,
    brands: ["Sample OEM", "Motul", "Castrol", "Shell Advance"],
    parts: [
      "4T Engine Oil 10W-40",
      "4T Engine Oil 20W-50",
      "Fully Synthetic Oil 10W-40",
      "Semi Synthetic Oil 10W-30",
      "Motorcycle Gear Oil 80W-90",
      "Front Fork Oil",
      "Engine Coolant",
      "Chain Lube Spray",
      "Engine Assembly Grease",
      "Engine Flush Treatment"
    ],
    illustration: `<path d="M105 48h30v12l9 9v43a8 8 0 0 1-8 8h-32a8 8 0 0 1-8-8V69l9-9z"/><path d="M105 48v-9h30v9m-37 34h46m-39 16h31"/><path d="M120 69l-8 17h9l-3 15 12-20h-10l4-12z"/>`,
    color: "#0891b2"
  },
  Filters: {
    prefix: "FLT",
    basePrice: 90,
    priceStep: 45,
    modelStep: 25,
    brands: ["OEM", "Hiflofiltro", "UNO Minda", "Endurance"],
    parts: [
      "Engine Air Filter Element",
      "Oil Filter Cartridge",
      "Fuel Filter Assembly",
      "Foam Air Filter",
      "Oil Strainer Screen",
      "Fuel Tap Filter",
      "Air Cleaner Cover Seal",
      "Air Filter Housing Gasket",
      "Oil Filter O-Ring Set",
      "Intake Filter Mesh"
    ],
    illustration: `<path d="M78 61h84l-9 47H87z"/><path d="M89 64l7 40m8-40 5 40m9-40 3 40m9-40 1 40m9-40-3 40m12-40-6 40"/><path d="M72 57h96v8H72z"/>`,
    color: "#16a34a"
  },
  "Electrical & Ignition": {
    prefix: "ELC",
    basePrice: 150,
    priceStep: 95,
    modelStep: 60,
    brands: ["OEM", "NGK", "UNO Minda", "Exide"],
    parts: [
      "Iridium Spark Plug",
      "Ignition Coil Assembly",
      "Stator Charging Coil",
      "Regulator Rectifier",
      "CDI Ignition Unit",
      "12V Motorcycle Battery",
      "Starter Relay Solenoid",
      "Horn Assembly",
      "Main Wiring Harness",
      "Spark Plug Cap"
    ],
    illustration: `<path d="M118 46 91 86h22l-5 31 39-48h-25l10-23z"/><path d="M75 64h18m54 32h18M83 105l13-13m48-25 13-13"/>`,
    color: "#2563eb"
  },
  "Tyres & Wheels": {
    prefix: "TYR",
    basePrice: 620,
    priceStep: 180,
    modelStep: 100,
    brands: ["Sample OEM", "MRF", "CEAT", "Eurogrip"],
    parts: [
      "Front Motorcycle Tyre",
      "Rear Motorcycle Tyre",
      "Inner Tube 17 Inch",
      "Alloy Wheel Assembly",
      "Spoke Set with Nipples",
      "Front Wheel Bearing Set",
      "Rear Wheel Bearing Set",
      "Tubeless Tyre Valve",
      "Wheel Rim Strip",
      "Tyre Repair Patch Kit"
    ],
    illustration: `<circle cx="120" cy="80" r="39" stroke-width="12"/><circle cx="120" cy="80" r="15"/><path d="M120 41v24m0 30v24m39-39h-24m-30 0H81m66-27-17 17m-20 20-17 17m54 0-17-17m-20-20L93 53"/>`,
    color: "#475569"
  },
  "Lighting & Body": {
    prefix: "LGT",
    basePrice: 230,
    priceStep: 130,
    modelStep: 65,
    brands: ["OEM", "Lumax", "UNO Minda", "Hella"],
    parts: [
      "LED Headlamp Assembly",
      "Tail Lamp Assembly",
      "Front Indicator Pair",
      "Rear View Mirror Pair",
      "Side Panel Cover",
      "Front Mudguard",
      "Headlamp Visor",
      "Motorcycle Seat Cover",
      "Handlebar End Cap Pair",
      "Number Plate Holder"
    ],
    illustration: `<path d="M82 75q38-39 76 0v19q-38 39-76 0z"/><path d="M94 79q26-21 52 0v11q-26 21-52 0z"/><path d="M67 84H51m138 0h-16M76 58 64 46m112 12 12-12M120 37V24"/>`,
    color: "#ea580c"
  },
  "Suspension & Steering": {
    prefix: "SUS",
    basePrice: 280,
    priceStep: 115,
    modelStep: 70,
    brands: ["OEM", "Endurance", "Gabriel", "SKF"],
    parts: [
      "Front Fork Seal Pair",
      "Front Fork Assembly",
      "Rear Shock Absorber",
      "Steering Bearing Kit",
      "Swingarm Bush Set",
      "Fork Dust Seal Pair",
      "Steering Stem Assembly",
      "Ball Race Kit",
      "Fork Oil Seal Set",
      "Rear Suspension Bush"
    ],
    illustration: `<path d="M98 46v20l-9 8 18 10-18 10 18 10-9 8v11m44-77v11l-9 8 18 10-18 10 18 10-9 8v20"/><path d="M91 46h14m30 0h14M91 123h14m30 0h14"/>`,
    color: "#9333ea"
  },
  "Cables & Controls": {
    prefix: "CBL",
    basePrice: 100,
    priceStep: 60,
    modelStep: 35,
    brands: ["OEM", "Endurance", "UNO Minda", "Rolon"],
    parts: [
      "Throttle Cable Assembly",
      "Clutch Control Cable",
      "Speedometer Cable",
      "Front Brake Cable",
      "Choke Cable Assembly",
      "Accelerator Grip Pair",
      "Clutch Lever Assembly",
      "Front Brake Lever",
      "Handlebar Grip Pair",
      "Switchgear Control Set"
    ],
    illustration: `<path d="M74 58q46 42 92 0M82 58v-9m76 9v-9M74 58H60m106 0h14"/><path d="M93 70q27 23 54 0v27q-27 23-54 0z"/><circle cx="120" cy="84" r="6"/>`,
    color: "#0891b2"
  }
};

function createCategoryImage(category, color, illustration) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
    <rect x="4" y="4" width="232" height="152" rx="22" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
    <rect x="15" y="15" width="210" height="130" rx="16" fill="#ffffff"/>
    <text x="120" y="32" fill="#64748b" font-family="Arial,sans-serif" font-size="9" font-weight="700" letter-spacing="1.5" text-anchor="middle">MAMA AUTO · SAMPLE</text>
    <g fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${illustration}</g>
    <text x="120" y="132" fill="#0f172a" font-family="Arial,sans-serif" font-size="11" font-weight="700" text-anchor="middle">${category}</text>
    <text x="120" y="143" fill="#64748b" font-family="Arial,sans-serif" font-size="7" text-anchor="middle">ILLUSTRATIVE IMAGE · VERIFY ITEM</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const productCategories = CATEGORIES.filter((category) => category !== "All Categories");

export const SAMPLE_PRODUCTS_PER_CATEGORY = 50;

export const SAMPLE_PRODUCTS = Object.freeze(productCategories.flatMap((category, categoryIndex) => {
  const specification = catalog[category];
  if (!specification) {
    throw new Error(`Missing sample product configuration for category "${category}".`);
  }
  const image = createCategoryImage(category, specification.color, specification.illustration);

  return Array.from({ length: SAMPLE_PRODUCTS_PER_CATEGORY }, (_, index) => {
    const modelIndex = Math.floor(index / specification.parts.length);
    const bikeModel = POPULAR_BIKE_MODELS[modelIndex + 1];
    const partName = specification.parts[index % specification.parts.length];
    const purchasePrice =
      specification.basePrice +
      (index % specification.parts.length) * specification.priceStep +
      modelIndex * specification.modelStep;
    const sellingPrice = Math.round(purchasePrice * (1.2 + ((index + categoryIndex) % 4) * 0.05));
    const sku = String(index + 1).padStart(3, "0");

    return {
      id: `sample-${specification.prefix}-${sku}`,
      name: `${partName} - ${bikeModel.split(" / ")[0]} (Sample)`,
      code: `MP-${specification.prefix}-${sku}`,
      category,
      brand: specification.brands[(index + categoryIndex) % specification.brands.length],
      bikeModel,
      purchasePrice,
      sellingPrice,
      stock: (index * 7 + categoryIndex * 11) % 31,
      minStock: 5,
      rackLocation: `${String.fromCharCode(65 + categoryIndex)}-${modelIndex + 1}-${String(index % 10 + 1).padStart(2, "0")}`,
      warranty: "Sample only - verify",
      description: "Illustrative catalog data only. Verify fitment, supplier, prices, and stock before business use.",
      image,
      imageAlt: `${partName} sample illustration for ${bikeModel}`,
      isSample: true
    };
  });
}));
