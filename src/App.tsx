import React, { useState, createContext, useContext, useReducer } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Home,
  Package,
  Upload,
  Info,
  BookOpen,
  Users,
} from "lucide-react";
import logo from "./assets/logo.jpg";

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  dosage?: string;
  ingredients: string[];
  precautions: string[];
  sideEffects: string[];
  availability: "In Stock" | "Out of Stock" | "Limited";
  requiresPrescription: boolean;
  rating: number;
  reviews: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface AppState {
  cart: CartItem[];
  searchQuery: string;
  selectedCategory: string;
  currentPage: string;
  isChatOpen: boolean;
  chatMessages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// Mock Data
const mockProducts: Product[] = [
  // Antibiotics (6 products)
  {
    id: "1",
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    price: 2850,
    originalPrice: 3200,
    image: "/api/placeholder/300/300",
    description: "Broad-spectrum antibiotic for bacterial infections.",
    dosage: "Adults: 500mg every 8 hours for 7-10 days or as prescribed.",
    ingredients: ["Amoxicillin trihydrate 500mg"],
    precautions: [
      "Complete full course as prescribed",
      "May cause allergic reactions",
      "Take with food to reduce stomach upset"
    ],
    sideEffects: ["Common: nausea, diarrhea", "Rare: allergic reactions"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.3,
    reviews: 145,
  },
  {
    id: "2",
    name: "Azithromycin 250mg",
    category: "Antibiotics",
    price: 3200,
    image: "/api/placeholder/300/300",
    description: "Macrolide antibiotic for respiratory tract infections.",
    dosage: "Adults: 500mg once daily for 3 days or as prescribed.",
    ingredients: ["Azithromycin dihydrate 250mg"],
    precautions: [
      "Take on empty stomach",
      "Complete full course",
      "May interact with other medications"
    ],
    sideEffects: ["Common: stomach upset", "Rare: heart rhythm changes"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.5,
    reviews: 98,
  },
  {
    id: "3",
    name: "Ciprofloxacin 500mg",
    category: "Antibiotics",
    price: 3800,
    image: "/api/placeholder/300/300",
    description: "Fluoroquinolone antibiotic for severe bacterial infections.",
    dosage: "Adults: 500mg twice daily for 7-14 days or as prescribed.",
    ingredients: ["Ciprofloxacin hydrochloride 500mg"],
    precautions: [
      "Avoid dairy products 2 hours before/after",
      "Stay hydrated",
      "Avoid prolonged sun exposure"
    ],
    sideEffects: ["Common: nausea, dizziness", "Rare: tendon damage"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.2,
    reviews: 76,
  },
  {
    id: "4",
    name: "Cephalexin 500mg",
    category: "Antibiotics",
    price: 2600,
    image: "/api/placeholder/300/300",
    description: "Cephalosporin antibiotic for skin and soft tissue infections.",
    dosage: "Adults: 500mg every 6 hours for 7-10 days.",
    ingredients: ["Cephalexin monohydrate 500mg"],
    precautions: [
      "Take with food",
      "Complete full course",
      "Report any allergic reactions"
    ],
    sideEffects: ["Common: diarrhea, nausea", "Rare: severe allergic reactions"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.4,
    reviews: 112,
  },
  {
    id: "5",
    name: "Metronidazole 400mg",
    category: "Antibiotics",
    price: 1800,
    image: "/api/placeholder/300/300",
    description: "Antibiotic for anaerobic bacterial and protozoal infections.",
    dosage: "Adults: 400mg three times daily for 5-10 days.",
    ingredients: ["Metronidazole 400mg"],
    precautions: [
      "Avoid alcohol during treatment",
      "Take with food",
      "Complete full course"
    ],
    sideEffects: ["Common: metallic taste, nausea", "Rare: peripheral neuropathy"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.1,
    reviews: 89,
  },
  {
    id: "6",
    name: "Doxycycline 100mg",
    category: "Antibiotics",
    price: 2200,
    image: "/api/placeholder/300/300",
    description: "Tetracycline antibiotic for respiratory and skin infections.",
    dosage: "Adults: 100mg twice daily with food.",
    ingredients: ["Doxycycline hyclate 100mg"],
    precautions: [
      "Take with plenty of water",
      "Avoid lying down for 30 minutes after taking",
      "Use sunscreen as may increase sun sensitivity"
    ],
    sideEffects: ["Common: nausea, photosensitivity", "Rare: esophageal irritation"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.3,
    reviews: 134,
  },

  // Antacids (5 products)
  {
    id: "7",
    name: "Gaviscon Double Strength",
    category: "Antacids",
    price: 1500,
    originalPrice: 1800,
    image: "/api/placeholder/300/300",
    description: "Fast relief from heartburn and acid indigestion.",
    dosage: "Adults: 10-20ml after meals and at bedtime.",
    ingredients: ["Sodium alginate", "Sodium bicarbonate", "Calcium carbonate"],
    precautions: [
      "Shake well before use",
      "Consult doctor if symptoms persist",
      "May affect absorption of other medicines"
    ],
    sideEffects: ["Rare: constipation", "Very rare: allergic reactions"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.6,
    reviews: 203,
  },
  {
    id: "8",
    name: "Mylanta Liquid",
    category: "Antacids",
    price: 1200,
    image: "/api/placeholder/300/300",
    description: "Triple action antacid for acid indigestion relief.",
    dosage: "Adults: 5-10ml between meals and at bedtime.",
    ingredients: ["Aluminum hydroxide", "Magnesium hydroxide", "Simethicone"],
    precautions: [
      "Do not exceed 12 doses per day",
      "Consult pharmacist about drug interactions"
    ],
    sideEffects: ["Common: mild diarrhea or constipation"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.4,
    reviews: 156,
  },
  {
    id: "9",
    name: "Tums Extra Strength",
    category: "Antacids",
    price: 800,
    image: "/api/placeholder/300/300",
    description: "Calcium carbonate antacid tablets for quick relief.",
    dosage: "Adults: Chew 2-4 tablets as needed.",
    ingredients: ["Calcium carbonate 750mg"],
    precautions: [
      "Maximum 10 tablets per day",
      "Take 2 hours apart from other medications"
    ],
    sideEffects: ["Rare: constipation", "Very rare: kidney stones"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.5,
    reviews: 287,
  },
  {
    id: "10",
    name: "Eno Fruit Salt",
    category: "Antacids",
    price: 600,
    image: "/api/placeholder/300/300",
    description: "Effervescent antacid for quick acid relief.",
    dosage: "Adults: One sachet in water as needed.",
    ingredients: ["Sodium bicarbonate", "Citric acid", "Sodium carbonate"],
    precautions: [
      "Dissolve completely in water before drinking",
      "Not suitable for children under 12"
    ],
    sideEffects: ["Rare: stomach upset", "Very rare: electrolyte imbalance"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.7,
    reviews: 312,
  },
  {
    id: "11",
    name: "Omeprazole 20mg",
    category: "Antacids",
    price: 2800,
    image: "/api/placeholder/300/300",
    description: "Proton pump inhibitor for severe acid reflux.",
    dosage: "Adults: One capsule daily before breakfast.",
    ingredients: ["Omeprazole 20mg"],
    precautions: [
      "Take on empty stomach",
      "Consult doctor for long-term use",
      "May affect absorption of certain nutrients"
    ],
    sideEffects: ["Common: headache, nausea", "Rare: bone fractures with long-term use"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.8,
    reviews: 445,
  },

  // Glucometers (5 products)
  {
    id: "12",
    name: "Accu-Chek Active Kit",
    category: "Glucometers",
    price: 4500,
    originalPrice: 5200,
    image: "/api/placeholder/300/300",
    description: "Complete blood glucose monitoring system with strips.",
    dosage: "Use as directed by healthcare provider for blood sugar monitoring.",
    ingredients: ["Digital glucometer", "Test strips", "Lancets", "Control solution"],
    precautions: [
      "Use only with Accu-Chek Active test strips",
      "Store in cool, dry place",
      "Calibrate regularly"
    ],
    sideEffects: ["None - medical device"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.6,
    reviews: 189,
  },
  {
    id: "13",
    name: "OneTouch Ultra Easy",
    category: "Glucometers",
    price: 3800,
    image: "/api/placeholder/300/300",
    description: "Simple, accurate blood glucose meter.",
    dosage: "Test as recommended by your doctor.",
    ingredients: ["Glucometer device", "OneTouch Ultra test strips"],
    precautions: [
      "Use only OneTouch Ultra strips",
      "Keep meter and strips at room temperature",
      "Replace lancets after each use"
    ],
    sideEffects: ["None - medical device"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.5,
    reviews: 167,
  },
  {
    id: "14",
    name: "FreeStyle Optium Neo",
    category: "Glucometers",
    price: 5200,
    image: "/api/placeholder/300/300",
    description: "Advanced glucose and ketone monitoring system.",
    dosage: "Use according to testing schedule prescribed by doctor.",
    ingredients: ["Meter", "Glucose strips", "Ketone strips", "Lancets"],
    precautions: [
      "Use appropriate strips for each test type",
      "Store strips in original container",
      "Check expiration dates"
    ],
    sideEffects: ["None - medical device"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.7,
    reviews: 134,
  },
  {
    id: "15",
    name: "Contour Next USB",
    category: "Glucometers",
    price: 6800,
    image: "/api/placeholder/300/300",
    description: "USB-enabled glucose meter with data management.",
    dosage: "Test blood glucose as directed by healthcare provider.",
    ingredients: ["USB glucometer", "Contour Next test strips", "Software"],
    precautions: [
      "Charge device regularly",
      "Use only Contour Next strips",
      "Update software periodically"
    ],
    sideEffects: ["None - medical device"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.4,
    reviews: 98,
  },
  {
    id: "16",
    name: "CareSens N Glucometer",
    category: "Glucometers",
    price: 2800,
    image: "/api/placeholder/300/300",
    description: "Affordable, reliable blood glucose monitoring system.",
    dosage: "Monitor blood sugar as prescribed by your doctor.",
    ingredients: ["Glucometer", "CareSens N test strips", "Lancets"],
    precautions: [
      "Use matched test strips only",
      "Clean meter regularly",
      "Store properly to maintain accuracy"
    ],
    sideEffects: ["None - medical device"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.3,
    reviews: 156,
  },

  // Antihypertensives (6 products)
  {
    id: "17",
    name: "Amlodipine 5mg",
    category: "Antihypertensives",
    price: 1800,
    originalPrice: 2200,
    image: "/api/placeholder/300/300",
    description: "Calcium channel blocker for high blood pressure.",
    dosage: "Adults: 5mg once daily, may increase to 10mg if needed.",
    ingredients: ["Amlodipine besylate 5mg"],
    precautions: [
      "Take at the same time daily",
      "Monitor blood pressure regularly",
      "May cause dizziness initially"
    ],
    sideEffects: ["Common: ankle swelling, dizziness", "Rare: gum hyperplasia"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.5,
    reviews: 234,
  },
  {
    id: "18",
    name: "Lisinopril 10mg",
    category: "Antihypertensives",
    price: 2200,
    image: "/api/placeholder/300/300",
    description: "ACE inhibitor for hypertension and heart failure.",
    dosage: "Adults: 10mg once daily, may adjust based on response.",
    ingredients: ["Lisinopril 10mg"],
    precautions: [
      "Monitor kidney function",
      "Check potassium levels regularly",
      "May cause dry cough"
    ],
    sideEffects: ["Common: dry cough, dizziness", "Rare: angioedema"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.3,
    reviews: 187,
  },
  {
    id: "19",
    name: "Losartan 50mg",
    category: "Antihypertensives",
    price: 2800,
    image: "/api/placeholder/300/300",
    description: "Angiotensin receptor blocker for hypertension.",
    dosage: "Adults: 50mg once daily, may increase to 100mg if needed.",
    ingredients: ["Losartan potassium 50mg"],
    precautions: [
      "Monitor blood pressure and kidney function",
      "May increase potassium levels",
      "Avoid if pregnant"
    ],
    sideEffects: ["Common: dizziness, fatigue", "Rare: hyperkalemia"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.6,
    reviews: 298,
  },
  {
    id: "20",
    name: "Atenolol 50mg",
    category: "Antihypertensives",
    price: 1600,
    image: "/api/placeholder/300/300",
    description: "Beta-blocker for high blood pressure and angina.",
    dosage: "Adults: 50mg once daily, may increase if necessary.",
    ingredients: ["Atenolol 50mg"],
    precautions: [
      "Do not stop suddenly",
      "Monitor heart rate",
      "May mask diabetes symptoms"
    ],
    sideEffects: ["Common: fatigue, cold hands/feet", "Rare: bronchospasm"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.2,
    reviews: 167,
  },
  {
    id: "21",
    name: "Hydrochlorothiazide 25mg",
    category: "Antihypertensives",
    price: 1200,
    image: "/api/placeholder/300/300",
    description: "Thiazide diuretic for hypertension and edema.",
    dosage: "Adults: 25mg once daily in the morning.",
    ingredients: ["Hydrochlorothiazide 25mg"],
    precautions: [
      "Take in morning to avoid nighttime urination",
      "Monitor electrolyte levels",
      "Stay hydrated"
    ],
    sideEffects: ["Common: increased urination, dizziness", "Rare: kidney stones"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.4,
    reviews: 143,
  },
  {
    id: "22",
    name: "Nifedipine XL 30mg",
    category: "Antihypertensives",
    price: 3200,
    image: "/api/placeholder/300/300",
    description: "Extended-release calcium channel blocker.",
    dosage: "Adults: 30mg once daily, swallow whole.",
    ingredients: ["Nifedipine 30mg extended-release"],
    precautions: [
      "Do not crush or chew tablets",
      "Monitor blood pressure",
      "May cause peripheral edema"
    ],
    sideEffects: ["Common: headache, flushing", "Rare: gingival hyperplasia"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.1,
    reviews: 112,
  },

  // Multivitamins (6 products)
  {
    id: "23",
    name: "Centrum Multivitamin",
    category: "Multivitamins",
    price: 3500,
    originalPrice: 4000,
    image: "/api/placeholder/300/300",
    description: "Complete daily multivitamin with essential nutrients.",
    dosage: "Adults: One tablet daily with food.",
    ingredients: ["Vitamins A, C, D, E, B-complex", "Minerals", "Antioxidants"],
    precautions: [
      "Take with food to reduce stomach upset",
      "Store in cool, dry place",
      "Keep out of reach of children"
    ],
    sideEffects: ["Rare: stomach upset", "Very rare: allergic reactions"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.5,
    reviews: 456,
  },
  {
    id: "24",
    name: "Nature Made Multi Complete",
    category: "Multivitamins",
    price: 2800,
    image: "/api/placeholder/300/300",
    description: "Daily multivitamin with 23 essential nutrients.",
    dosage: "Adults: One tablet daily with water.",
    ingredients: ["23 vitamins and minerals", "Iron", "Calcium"],
    precautions: [
      "Contains iron - may cause constipation",
      "Take 2 hours apart from coffee/tea"
    ],
    sideEffects: ["Common: stomach upset if taken on empty stomach"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.3,
    reviews: 278,
  },
  {
    id: "25",
    name: "One A Day Men's Health",
    category: "Multivitamins",
    price: 3200,
    image: "/api/placeholder/300/300",
    description: "Multivitamin formulated specifically for men's health needs.",
    dosage: "Men: One tablet daily with food.",
    ingredients: ["Lycopene", "Vitamin D", "B-vitamins", "Zinc"],
    precautions: [
      "For adult men only",
      "Do not exceed recommended dose"
    ],
    sideEffects: ["Rare: nausea", "Very rare: allergic reactions"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.6,
    reviews: 189,
  },
  {
    id: "26",
    name: "One A Day Women's Health",
    category: "Multivitamins",
    price: 3200,
    image: "/api/placeholder/300/300",
    description: "Multivitamin with iron and folate for women's health.",
    dosage: "Women: One tablet daily with food.",
    ingredients: ["Iron", "Folate", "Calcium", "Vitamin D", "B-vitamins"],
    precautions: [
      "Contains iron",
      "Suitable for women of childbearing age"
    ],
    sideEffects: ["Common: mild stomach upset", "Rare: constipation"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.7,
    reviews: 334,
  },
  {
    id: "27",
    name: "Senior Formula 50+",
    category: "Multivitamins",
    price: 3800,
    image: "/api/placeholder/300/300",
    description: "Specialized multivitamin for adults over 50.",
    dosage: "Adults 50+: One tablet daily with breakfast.",
    ingredients: ["High B12", "Lutein", "Lycopene", "Vitamin D3"],
    precautions: [
      "Designed for adults over 50",
      "May interact with blood thinners"
    ],
    sideEffects: ["Rare: stomach upset"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.4,
    reviews: 198,
  },
  {
    id: "28",
    name: "Prenatal Complete",
    category: "Multivitamins",
    price: 4200,
    image: "/api/placeholder/300/300",
    description: "Comprehensive prenatal vitamin for expecting mothers.",
    dosage: "Pregnant/nursing women: One tablet daily with food.",
    ingredients: ["Folic acid", "Iron", "DHA", "Calcium", "Vitamin D"],
    precautions: [
      "For pregnant and nursing women only",
      "Take with food to reduce nausea"
    ],
    sideEffects: ["Common: constipation", "Rare: nausea"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.8,
    reviews: 267,
  },

  // Hematinics (Blood Tonics) (5 products)
  {
    id: "29",
    name: "Feroglobin B12 Syrup",
    category: "Hematinics",
    price: 2200,
    originalPrice: 2600,
    image: "/api/placeholder/300/300",
    description: "Iron and vitamin B12 syrup for anemia treatment.",
    dosage: "Adults: 15ml twice daily after meals.",
    ingredients: ["Ferrous gluconate", "Vitamin B12", "Folic acid", "Vitamin C"],
    precautions: [
      "Take after meals to reduce stomach upset",
      "May cause dark stools",
      "Keep refrigerated after opening"
    ],
    sideEffects: ["Common: dark stools, mild nausea", "Rare: constipation"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.3,
    reviews: 234,
  },
  {
    id: "30",
    name: "Sangobion Capsules",
    category: "Hematinics",
    price: 1800,
    image: "/api/placeholder/300/300",
    description: "Iron supplement with essential vitamins for blood building.",
    dosage: "Adults: One capsule twice daily with meals.",
    ingredients: ["Ferrous gluconate", "Manganese", "Copper", "Vitamin C"],
    precautions: [
      "Take with vitamin C for better absorption",
      "May cause stomach upset on empty stomach"
    ],
    sideEffects: ["Common: dark stools", "Rare: stomach irritation"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.5,
    reviews: 187,
  },
  {
    id: "31",
    name: "Chemiron Forte",
    category: "Hematinics",
    price: 2800,
    image: "/api/placeholder/300/300",
    description: "High-potency iron supplement with folic acid.",
    dosage: "Adults: One tablet daily with food.",
    ingredients: ["Iron polymaltose", "Folic acid", "Vitamin B12"],
    precautions: [
      "High iron content",
      "Monitor hemoglobin levels regularly",
      "May interact with some medications"
    ],
    sideEffects: ["Common: nausea, dark stools", "Rare: allergic reactions"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.2,
    reviews: 145,
  },
  {
    id: "32",
    name: "Folic Acid 5mg",
    category: "Hematinics",
    price: 800,
    image: "/api/placeholder/300/300",
    description: "Essential B-vitamin for red blood cell formation.",
    dosage: "Adults: 5mg daily or as prescribed by doctor.",
    ingredients: ["Folic acid 5mg"],
    precautions: [
      "Important during pregnancy",
      "May mask B12 deficiency",
      "Store away from light"
    ],
    sideEffects: ["Very rare: allergic reactions"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.6,
    reviews: 298,
  },
  {
    id: "33",
    name: "Vitamin B-Complex Injectable",
    category: "Hematinics",
    price: 1500,
    image: "/api/placeholder/300/300",
    description: "Injectable B-complex for severe deficiency cases.",
    dosage: "As directed by healthcare provider - intramuscular injection.",
    ingredients: ["B1, B2, B6, B12", "Nicotinamide", "Panthenol"],
    precautions: [
      "For intramuscular use only",
      "Must be administered by healthcare professional",
      "Store in refrigerator"
    ],
    sideEffects: ["Common: injection site pain", "Rare: allergic reactions"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.4,
    reviews: 89,
  },

  // Antifungal Creams (5 products)
  {
    id: "34",
    name: "Clotrimazole 1% Cream",
    category: "Antifungal Creams",
    price: 1200,
    originalPrice: 1500,
    image: "/api/placeholder/300/300",
    description: "Broad-spectrum antifungal cream for skin infections.",
    dosage: "Apply thin layer to affected area twice daily for 2-4 weeks.",
    ingredients: ["Clotrimazole 1%", "Cetyl alcohol", "Benzyl alcohol"],
    precautions: [
      "For external use only",
      "Avoid contact with eyes",
      "Continue treatment for 2 weeks after symptoms clear"
    ],
    sideEffects: ["Common: mild skin irritation", "Rare: allergic contact dermatitis"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.5,
    reviews: 156,
  },
  {
    id: "35",
    name: "Terbinafine 1% Cream",
    category: "Antifungal Creams",
    price: 1800,
    image: "/api/placeholder/300/300",
    description: "Effective antifungal for athlete's foot an occasional constipation.",
    dosage: "Adults: 1-3 tablets daily with plenty of water.",
    ingredients: ["Sennosides 8.6mg"],
    precautions: ["Increase fluid intake", "Do not use for more than 7 days"],
    sideEffects: ["Common: mild cramping", "Overuse: dependency"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.1,
    reviews: 134,
  },
  {
    id: "36",
    name: "Anti-Diarrheal Tablets",
    category: "Digestive Health",
    price: 8.50,
    image: "/api/placeholder/300/300",
    description: "Controls symptoms of diarrhea and travelers' diarrhea.",
    dosage: "Adults: 2 tablets initially, then 1 after each loose stool.",
    ingredients: ["Loperamide HCl 2mg"],
    precautions: ["Do not exceed 8 tablets in 24 hours", "Consult doctor if fever present"],
    sideEffects: ["Common: constipation", "Rare: abdominal pain"],
    availability: "In Stock",
    requiresPrescription: false,
    rating: 4.4,
    reviews: 89,
  },
  
 {
    id: "37",
    name: "Anti-Malaria Tablets",
    category: "Travel Health",
    price: 24.99,
    image: "/api/placeholder/300/300",
    description: "Prophylactic treatment for malaria prevention in endemic areas.",
    dosage: "Adults: 1 tablet daily, start 1-2 days before travel, continue during stay and 7 days after return.",
    ingredients: ["Doxycycline 100mg"],
    precautions: ["Take with food to reduce stomach upset", "Use sunscreen - increases sun sensitivity", "Complete full course even after leaving malaria area"],
    sideEffects: ["Common: nausea, photosensitivity", "Rare: esophageal irritation"],
    availability: "In Stock",
    requiresPrescription: true,
    rating: 4.6,
    reviews: 156,
}
];  
  
const blogPosts = [
  {
    id: "1",
    title: "Understanding Antibiotic Resistance",
    excerpt:
      "Learn about the importance of completing antibiotic courses and preventing resistance.",
    date: "2024-08-10",
    category: "Health Education",
  },
  {
    id: "2",
    title: "Vitamin D Deficiency: Signs and Solutions",
    excerpt:
      "Discover the symptoms of vitamin D deficiency and how to maintain healthy levels.",
    date: "2024-08-08",
    category: "Nutrition",
  },
];

// Context and Reducer
type AppAction =
  | { type: "ADD_TO_CART"; product: Product }
  | { type: "REMOVE_FROM_CART"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "SET_CATEGORY"; category: string }
  | { type: "SET_PAGE"; page: string }
  | { type: "TOGGLE_CHAT" }
  | { type: "ADD_CHAT_MESSAGE"; message: ChatMessage };

const initialState: AppState = {
  cart: [],
  searchQuery: "",
  selectedCategory: "All",
  currentPage: "home",
  isChatOpen: false,
  chatMessages: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.cart.find(
        (item) => item.product.id === action.product.id
      );
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.product, quantity: 1 }],
      };
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.product.id !== action.productId),
      };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.product.id === action.productId
              ? { ...item, quantity: Math.max(0, action.quantity) }
              : item
          )
          .filter((item) => item.quantity > 0),
      };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query };
    case "SET_CATEGORY":
      return { ...state, selectedCategory: action.category };
    case "SET_PAGE":
      return { ...state, currentPage: action.page };
    case "TOGGLE_CHAT":
      return { ...state, isChatOpen: !state.isChatOpen };
    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.message],
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: initialState, dispatch: () => {} });

// Components
const Header: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "products", label: "Products", icon: Package },
    { id: "prescription", label: "Upload Prescription", icon: Upload },
    { id: "about", label: "About Us", icon: Info },
    { id: "blog", label: "Health Blog", icon: BookOpen },
    { id: "contact", label: "Contact", icon: Users },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <img
                src={logo}
                alt="De Luxuriant Logo"
                className="h-10 w-10"
              />
              <h1 className="text-2xl font-bold" style={{ color: "#004AAD" }}>
                De Luxuriant
              </h1>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search medicines, supplements..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={state.searchQuery}
                onChange={(e) =>
                  dispatch({ type: "SET_SEARCH_QUERY", query: e.target.value })
                }
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => dispatch({ type: "SET_PAGE", page: item.id })}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  state.currentPage === item.id
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Cart and Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => dispatch({ type: "SET_PAGE", page: "cart" })}
              className="relative p-2 text-gray-600 hover:text-blue-600"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  value={state.searchQuery}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SEARCH_QUERY",
                      query: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    dispatch({ type: "SET_PAGE", page: item.id });
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md ${
                    state.currentPage === item.id
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const HomePage: React.FC = () => {
  const { dispatch } = useContext(AppContext);
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredProducts = mockProducts.slice(0, 4);
 const categories = [
    { name: "Antibiotics", icon: "🦠", count: 6 },
    { name: "Antacids", icon: "💊", count: 5 },
    { name: "Glucometers", icon: "🩸", count: 5 },
    { name: "Antihypertensives", icon: "❤️", count: 6 },
    { name: "Multivitamins", icon: "🌟", count: 6 },
    { name: "Hematinics", icon: "🩺", count: 5 },
    { name: "Antifungal Creams", icon: "🧴", count: 5 },
    { name: "Antimaleria", icon: "🍃", count: 3 },
  ];

  // Define your custom images here - just replace these paths with your desired images
  const pharmacyImages = [
    {
      id: 1,
      image: "/assets/pharm.jpg", // Replace with your first image path
      title: "Welcome to De Luxuriant",
      description:
        "Your trusted online pharmacy for quality medicines and healthcare",
    },
    {
      id: 2,
      image: "/assets/medicine.jpg", // Replace with your second image path
      title: "Fast Prescription Service",
      description: "Upload your prescription and get fast, reliable delivery",
    },
    {
      id: 3,
      image: "/assets/drugss.jpg", // Replace with your third image path
      title: "Expert Healthcare",
      description: "Licensed pharmacists and quality products you can trust",
    },
    {
      id: 4,
      image: "/assets/pharmaci.jpg", // Replace with your fourth image path
      title: "24/7 Support",
      description: "Always here when you need us most",
    },
  ];
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % pharmacyImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + pharmacyImages.length) % pharmacyImages.length
    );
  };

  // Auto-slide functionality
  React.useEffect(() => {
    const timer = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero Section - Image Slider */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        {/* Images */}
        <div className="relative h-full">
          {pharmacyImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Colored background for each slide */}
              <div
                className="absolute inset-0"
                // style={{ backgroundColor: slide.bgColor || '#2563eb' }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content overlay */}
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-4xl">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-4 opacity-90">
                    {slide.description}
                  </p>
                  {/* Debug info - remove this later */}
                  {/* <div className="text-sm bg-black bg-opacity-50 p-2 rounded mb-4">
                    Slide {currentSlide + 1}/{pharmacyImages.length} | Image: {slide.image.substring(0, 50)}...
                  </div> */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() =>
                        dispatch({ type: "SET_PAGE", page: "products" })
                      }
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Shop Now
                    </button>
                    <button
                      onClick={() =>
                        dispatch({ type: "SET_PAGE", page: "prescription" })
                      }
                      className="border-2 border-white bg-transparent text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                    >
                      Upload Prescription
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-black p-3 rounded-full transition-all"
          aria-label="Previous slide"
        >
          <ChevronDown className="h-6 w-6 transform rotate-90" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-black p-3 rounded-full transition-all"
          aria-label="Next slide"
        >
          <ChevronDown className="h-6 w-6 transform -rotate-90" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {pharmacyImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  dispatch({ type: "SET_CATEGORY", category: category.name });
                  dispatch({ type: "SET_PAGE", page: "products" });
                }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border hover:border-blue-300"
              >
                <div className="text-4xl mb-4 text-center">{category.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-gray-600">{category.count} products</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Products
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Health Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Latest Health Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="text-sm text-blue-600 mb-2">
                    {post.category}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{post.date}</span>
                    <button
                      onClick={() =>
                        dispatch({ type: "SET_PAGE", page: "blog" })
                      }
                      className="text-blue-600 hover:underline"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { dispatch } = useContext(AppContext);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="w-full h-48 relative overflow-hidden" style={{ backgroundColor: '#004AAD' }}>
        {/* Glassmorphism background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-6 left-6 w-16 h-16 bg-white/15 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full backdrop-blur-sm bg-white/5"></div>
        
        {/* Product name overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-white/90 text-lg font-semibold mb-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              {product.name.split(' ')[0]}
            </div>
            <div className="text-white/70 text-sm">
              {product.category}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{product.category}</span>
          {product.requiresPrescription && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
              Rx Required
            </span>
          )}
        </div>
        <h3 className="font-semibold mb-2">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 text-sm">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < product.rating ? "fill-current" : ""
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            ({product.reviews})
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">₦{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <span
            className={`text-sm px-2 py-1 rounded ${
              product.availability === "In Stock"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {product.availability}
          </span>
        </div>
        <button
          onClick={() => dispatch({ type: "ADD_TO_CART", product })}
          disabled={product.availability !== "In Stock"}
          className="w-full  text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Add to Pickup Cart
        </button>
      </div>
    </div>
  );
};
const ProductsPage: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = [
    "All",
    ...Array.from(new Set(mockProducts.map((p) => p.category))),
  ];

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory =
      state.selectedCategory === "All" ||
      product.category === state.selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (selectedProduct) {
    return (
      <ProductDetailPage
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => dispatch({ type: "SET_CATEGORY", category })}
              className={`px-4 py-2 rounded-lg transition-colors ${
                state.selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="cursor-pointer"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No products found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

const ProductDetailPage: React.FC<{ product: Product; onBack: () => void }> = ({
  product,
  onBack,
}) => {
  const { dispatch } = useContext(AppContext);
  const [expandedSection, setExpandedSection] = useState<string>("description");

  const sections = [
    { id: "description", title: "Description", content: product.description },
    { id: "dosage", title: "Dosage", content: product.dosage },
    {
      id: "ingredients",
      title: "Ingredients",
      content: product.ingredients.join(", "),
    },
    {
      id: "precautions",
      title: "Precautions",
      content: product.precautions.join("; "),
    },
    {
      id: "sideEffects",
      title: "Side Effects",
      content: product.sideEffects.join("; "),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:underline flex items-center"
      >
        ← Back to Products
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="text-blue-600">{product.category}</span>
            {product.requiresPrescription && (
              <span className="ml-3 bg-red-100 text-red-600 px-3 py-1 rounded text-sm">
                Prescription Required
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < product.rating ? "fill-current" : ""
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              ({product.reviews} reviews)
            </span>
          </div>

          <div className="flex items-center mb-6">
            <span className="text-3xl font-bold">${product.price}</span>
            {product.originalPrice && (
              <span className="ml-3 text-xl text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <div className="mb-6">
            <span
              className={`px-4 py-2 rounded-lg ${
                product.availability === "In Stock"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {product.availability}
            </span>
          </div>

          <button
            onClick={() => dispatch({ type: "ADD_TO_CART", product })}
            disabled={product.availability !== "In Stock"}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
          >
            Add to Pickup Cart
          </button>

          {product.requiresPrescription && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Prescription Required:</strong> You'll need to upload a
                valid prescription before checkout.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Sections */}
      <div className="mt-12">
        <div className="border rounded-lg">
          {sections.map((section) => (
            <div key={section.id} className="border-b last:border-b-0">
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.id ? "" : section.id
                  )
                }
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-semibold">{section.title}</span>
                {expandedSection === section.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSection === section.id && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700">{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Important:</strong> This information is for educational
          purposes only and is not a substitute for professional medical advice.
          Always consult your healthcare provider before starting any new
          medication.
        </p>
      </div>
    </div>
  );
};

const PrescriptionUploadPage: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    email: "",
    prescriptionFile: null as File | null,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle prescription upload logic
    alert(
      "Prescription uploaded successfully! We will contact you within 24 hours."
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Upload Prescription</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="font-semibold mb-4">How to Upload Your Prescription</h2>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Take a clear photo or scan of your prescription</li>
          <li>
            • Ensure all text is readable and the doctor's signature is visible
          </li>
          <li>• Supported formats: JPG, PNG, PDF (max 5MB)</li>
          <li>
            • Our pharmacist will verify your prescription within 24 hours
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient Name *
          </label>
          <input
            type="text"
            required
            value={formData.patientName}
            onChange={(e) =>
              setFormData({ ...formData, patientName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter patient's full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your contact number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Prescription *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">JPG, PNG or PDF (max 5MB)</p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  prescriptionFile: e.target.files?.[0] || null,
                })
              }
              className="mt-4"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special instructions or questions..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Upload Prescription
        </button>
      </form>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">What happens next?</h3>
        <ol className="text-sm text-gray-700 space-y-1">
          <li>1. Our licensed pharmacist will review your prescription</li>
          <li>
            2. We'll contact you within 24 hours with availability and pricing
          </li>
          <li>3. Once confirmed, we'll prepare your medication for delivery</li>
          <li>4. Your medication will be delivered safely to your address</li>
        </ol>
      </div>
    </div>
  );
};

const CartPage: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [couponCode, setCouponCode] = useState("");

  const subtotal = state.cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_FROM_CART", productId });
    } else {
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
    }
  };

  if (state.cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8">Add some products to get started</p>
        <button
          onClick={() => dispatch({ type: "SET_PAGE", page: "products" })}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {state.cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-gray-600">{item.product.category}</p>
                    <p className="text-lg font-bold">${item.product.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.product.id, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.product.id, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "REMOVE_FROM_CART",
                        productId: item.product.id,
                      })
                    }
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>
                  {shipping === 0 ? "Free" : `${shipping.toFixed(2)}`}
                </span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
                Apply Coupon
              </button>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Proceed to Checkout
            </button>
          </div>

          {subtotal < 50 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                Add ${(50 - subtotal).toFixed(2)} more for free shipping!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AboutUsPage: React.FC = () => {
  const pharmacists = [
    {
      name: "Dr. Sarah Johnson",
      title: "Chief Pharmacist",
      experience: "15 years",
      specialization: "Clinical Pharmacy",
      image: "/api/placeholder/200/200",
    },
    {
      name: "Dr. Michael Chen",
      title: "Senior Pharmacist",
      experience: "12 years",
      specialization: "Oncology Pharmacy",
      image: "/api/placeholder/200/200",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">About De Luxuriant</h1>

      {/* Mission Section */}
      <section className="mb-12">
        <div className="bg-blue-50 p-8 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4 text-center">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At De Luxuriant, we are committed to providing safe, effective, and
            affordable healthcare solutions to our community. With over 20 years
            of experience in pharmaceutical care, we combine traditional
            pharmacy expertise with modern technology to deliver exceptional
            service to every customer.
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">
          Licenses & Certifications
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Certificate of Incorporation</h3>
            <p className="text-gray-600">Corporate Affairs Commission</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">NABP Accredited</h3>
            <p className="text-gray-600">Verified Internet Pharmacy</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Healthcare Quality</h3>
            <p className="text-gray-600">ISO 9001:2015 Certified</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Our Pharmacist Team</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {pharmacists.map((pharmacist) => (
            <div
              key={pharmacist.name}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={pharmacist.image}
                  alt={pharmacist.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold">{pharmacist.name}</h3>
                  <p className="text-blue-600">{pharmacist.title}</p>
                  <p className="text-gray-600">
                    {pharmacist.experience} experience
                  </p>
                  <p className="text-gray-600">
                    Specializes in {pharmacist.specialization}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Safety First</h3>
            <p className="text-gray-600">
              Every medication is thoroughly checked by our licensed pharmacists
            </p>
          </div>
          <div className="text-center">
            <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Customer Care</h3>
            <p className="text-gray-600">
              We provide personalized attention and support for every customer
            </p>
          </div>
          <div className="text-center">
            <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Excellence</h3>
            <p className="text-gray-600">
              Continuously improving our services and maintaining high standards
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      "Thank you for your message. We will get back to you within 24 hours."
    );
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Phone Number</h3>
                <p className="text-gray-600">General: (+234)708-968-2863</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">info@deluxuriantltd</p>

              </div>
            </div>

            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-gray-600">
                  9A NORTH AVENUE
                  <br />
                  APAPA LAGOS
                  <br />
                  NIGERIA
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Clock className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Business Hours</h3>
                <p className="text-gray-600">
                  Monday - Friday: 8:00 AM - 8:00 PM
                </p>
                <p className="text-gray-600">Saturday: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-600">Sunday: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>

          {/* Emergency Notice */}
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">
              Medical Emergency
            </h3>
            <p className="text-red-700 text-sm">
              If you are experiencing a medical emergency, please go to the hospital
              immediately. Do not use this form for urgent medical situations.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a subject</option>
                <option value="prescription">Prescription Question</option>
                <option value="order">Order Status</option>
                <option value="product">Product Information</option>
                <option value="complaint">Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe your question or concern..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const BlogPage: React.FC = () => {
  const articles = [
    {
      id: "1",
      title: "Understanding Antibiotic Resistance",
      excerpt:
        "Learn about the importance of completing antibiotic courses and preventing resistance.",
      content: `Antibiotic resistance occurs when bacteria develop the ability to survive exposure to antibiotics that once killed them. This is a serious global health concern that affects millions of people worldwide.

Key points to understand:
- Always complete your full antibiotic course, even if you feel better
- Never share antibiotics with others
- Don't save leftover antibiotics for future use
- Only use antibiotics when prescribed by a healthcare professional

By following these guidelines, we can help preserve the effectiveness of antibiotics for future generations.`,
      date: "2024-08-10",
      category: "Health Education",
      author: "Dr. Sarah Johnson",
    },
    {
      id: "2",
      title: "Vitamin D Deficiency: Signs and Solutions",
      excerpt:
        "Discover the symptoms of vitamin D deficiency and how to maintain healthy levels.",
      content: `Vitamin D deficiency is surprisingly common, affecting people of all ages. This essential nutrient plays crucial roles in bone health, immune function, and overall wellbeing.

Common signs of deficiency include:
- Fatigue and tiredness
- Bone and joint pain
- Frequent infections
- Slow wound healing
- Depression or mood changes

Solutions:
- Spend time in sunlight (safely)
- Include vitamin D-rich foods in your diet
- Consider supplements after consulting with your healthcare provider
- Regular blood tests to monitor levels

If you suspect you have vitamin D deficiency, consult with our pharmacists for personalized advice.`,
      date: "2024-08-08",
      category: "Nutrition",
      author: "Dr. Michael Chen",
    },
  ];

  const [selectedArticle, setSelectedArticle] = useState<
    (typeof articles)[0] | null
  >(null);

  if (selectedArticle) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => setSelectedArticle(null)}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back to Blog
        </button>

        <article>
          <div className="mb-6">
            <span className="text-blue-600 text-sm">
              {selectedArticle.category}
            </span>
            <h1 className="text-4xl font-bold mt-2 mb-4">
              {selectedArticle.title}
            </h1>
            <div className="flex items-center text-gray-600 text-sm">
              <span>By {selectedArticle.author}</span>
              <span className="mx-2">•</span>
              <span>{selectedArticle.date}</span>
            </div>
          </div>

          <div className="prose max-w-none">
            {selectedArticle.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Disclaimer:</strong> This article is for educational
              purposes only and should not replace professional medical advice,
              diagnosis, or treatment. Always seek the advice of your physician
              or other qualified health provider with any questions you may have
              regarding a medical condition. Never disregard professional
              medical advice or delay in seeking it because of something you
              have read on this website. De Luxuriant is a licensed pharmacy
              operating under all applicable federal and state regulations.
            </p>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Health Blog</h1>

      <p className="text-gray-600 mb-8 text-lg">
        Stay informed with the latest health tips, medication guides, and
        wellness advice from our expert pharmacists.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-blue-600 font-medium">
                  {article.category}
                </span>
                <span className="text-sm text-gray-500">{article.date}</span>
              </div>

              <h2 className="text-xl font-semibold mb-3">{article.title}</h2>
              <p className="text-gray-600 mb-4">{article.excerpt}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  By {article.author}
                </span>
                <button
                  onClick={() => setSelectedArticle(article)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Read More →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Health Tips Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Quick Health Tips</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              Medication Storage
            </h3>
            <p className="text-green-700 text-sm">
              Store medications in a cool, dry place away from direct sunlight
              and moisture.
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              Take as Directed
            </h3>
            <p className="text-blue-700 text-sm">
              Always follow the dosage instructions on your medication label or
              as directed by your pharmacist.
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">
              Check Expiration Dates
            </h3>
            <p className="text-purple-700 text-sm">
              Regularly check expiration dates and safely dispose of expired
              medications.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const Chatbot: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [currentMessage, setCurrentMessage] = useState("");

  const predefinedResponses = {
    hello:
      "Hello! I'm here to help you with any questions about our pharmacy services.",
    hours:
      "Our pharmacy is open Monday-Friday 8AM-8PM, Saturday 9AM-6PM, and Sunday 10AM-4PM.",
    location:
      "We're located at 123 Health Street, Medical District, New York, NY 10001.",
    prescription:
      "You can upload your prescription using our secure upload form. Our pharmacists will review it within 24 hours.",
    delivery:
      "We offer free delivery on orders over $50. Standard delivery takes 2-3 business days.",
    emergency:
      "For medical emergencies, please call 911 immediately. For urgent pharmacy questions, call our general line at (+234)708-968-2863.",
    contact:
      "You can reach us at (+234)708-968-2863 or email info@deluxuriantltd.com for any questions.",
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: "user",
      timestamp: new Date(),
    };

    dispatch({ type: "ADD_CHAT_MESSAGE", message: userMessage });

    // Simple keyword-based response
    const lowerMessage = currentMessage.toLowerCase();
    let botResponse =
      "I'm here to help! You can ask me about our store hours, prescriptions, or any other questions.";

    for (const [keyword, response] of Object.entries(predefinedResponses)) {
      if (lowerMessage.includes(keyword)) {
        botResponse = response;
        break;
      }
    }

    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      dispatch({ type: "ADD_CHAT_MESSAGE", message: botMessage });
    }, 1000);

    setCurrentMessage("");
  };

  if (!state.isChatOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">De Luxuriant Assistant</h3>
        <button
          onClick={() => dispatch({ type: "TOGGLE_CHAT" })}
          className="text-white hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {state.chatMessages.length === 0 && (
          <div className="text-gray-500 text-sm">
            Hi! I'm your pharmacy assistant. Ask me about store hours,
            prescriptions, or any other questions!
          </div>
        )}

        {state.chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs p-2 rounded-lg text-sm ${
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">De Luxuriant</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Your trusted online pharmacy providing quality medicines and
              expert healthcare advice.
            </p>
            <div className="flex space-x-4">
              <span className="text-2xl">📱</span>
              <span className="text-2xl">💻</span>
              <span className="text-2xl">🌐</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Products
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Upload Prescription
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white">
                  Pain Relief
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Vitamins
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Skincare
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Antibiotics
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Medical Devices
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>(+234)708-968-2863</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@deluxuriantltd.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>9A North Avenue Apapa Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-700" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>&copy; 2024 De Luxuriant. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white">
              Refund Policy
            </a>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            <strong>Important Legal Disclaimer:</strong> The information
            provided on this website is for educational purposes only and is not
            intended as a substitute for professional medical advice, diagnosis,
            or treatment. Always seek the advice of your physician or other
            qualified health provider with any questions you may have regarding
            a medical condition. Never disregard professional medical advice or
            delay in seeking it because of something you have read on this
            website. De Luxuriant is a licensed pharmacy operating under all
            applicable federal and state regulations.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const PharmaCareApp: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const renderPage = () => {
    switch (state.currentPage) {
      case "home":
        return <HomePage />;
      case "products":
        return <ProductsPage />;
      case "prescription":
        return <PrescriptionUploadPage />;
      case "cart":
        return <CartPage />;
      case "about":
        return <AboutUsPage />;
      case "contact":
        return <ContactPage />;
      case "blog":
        return <BlogPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>{renderPage()}</main>
        <Footer />

        {/* Floating Chat Button */}
        {!state.isChatOpen && (
          <button
            onClick={() => dispatch({ type: "TOGGLE_CHAT" })}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        )}

        <Chatbot />
      </div>
    </AppContext.Provider>
  );
};

export default PharmaCareApp;
   
