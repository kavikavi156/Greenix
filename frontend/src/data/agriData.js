export const agriData = {
    // CEREALS & GRAINS
    "paddy": {
        aliases: ["rice", "arisi", "nel", "நெல்", "அரிசி", "சோறு"],
        type: "Cereal",
        stages: {
            "basal": {
                label: "Basal / Planting Stage",
                fertilizer: "DAP (50kg) + Potash (25kg) + Zinc Sulfate (10kg) per acre",
                explanation: "Provides essential Phosphorus for root development and Zinc for preventing deficiency.",
                benefits: ["Strong root establishment", "Prevents Khaira disease (Zinc deficiency)", "Uniform crop stand"]
            },
            "vegetative": {
                label: "Vegetative / Tillering Stage (15-30 DAT)",
                fertilizer: "Urea (30kg) + Neem Cake (5kg) + Bio-fertilizers",
                explanation: "Nitrogen boosts rapid leaf growth and tillering. Neem coated urea increases efficiency.",
                benefits: ["Increased number of tillers", "Lush green growth", "Better photosynthetic rate"]
            },
            "reproductive": {
                label: "Panicle Initiation / Flowering Stage",
                fertilizer: "Potash (25kg) + Urea (15kg) + 13:0:45 (Foliar Spray)",
                explanation: "Potassium ensures grain filling and reduces chaffy grains. 13:0:45 boosts grain weight.",
                benefits: ["Maximized grain filling", "Reduced chaffiness", "Stronger stalks"]
            },
            "maturity": {
                label: "Maturity / Grain Filling Stage",
                fertilizer: "0:0:50 (SOP) spray or 19:19:19 foliar spray",
                explanation: "Focus on grain weight and quality. No heavy soil application needed now.",
                benefits: ["Golden grain luster", "Higher test weight", "Uniform ripening"]
            }
        },
        info: "🌾 **Paddy (Rice)**: The staple crop of Tamil Nadu.",
        problems: [
            {
                keywords: ["blast", "spots", "fungus", "குலை நோய்"],
                name: "Rice Blast (குலை நோய்)",
                symptoms: "Diamond-shaped lesions on leaves with gray centers.",
                solution: "Use **Tricyclazole 75% WP** (0.6g/L) or **Carbendazim**."
            },
            {
                keywords: ["yellow", "discoloration", "mangal"],
                name: "Zinc Deficiency",
                symptoms: "Dusty brown spots on upper leaves, stunted growth.",
                solution: "Apply **Zinc Sulfate** (25kg/ha) mixed with sand."
            },
            {
                keywords: ["borer", "stem", "dead heart"],
                name: "Stem Borer",
                symptoms: "Dead hearts in vegetative stage, white heads in reproductive stage.",
                solution: "Apply **Cartap Hydrochloride** 4G or spray **Chlorantraniliprole**."
            }
        ]
    },
    "maize": {
        aliases: ["corn", "makkacholam", "மக்காச்சோளம்"],
        type: "Cereal",
        stages: {
            "basal": {
                label: "Basal / Sowing Stage",
                fertilizer: "DAP (50kg) + Potash (25kg) + Zinc Sulfate (10kg) per acre",
                explanation: "Maize is a heavy feeder. Phosphorus establishes a strong root system.",
                benefits: ["Excellent germination", "Vigorous seedling growth", "Disease resistance"]
            },
            "vegetative": {
                label: "Knee High Stage (25-30 DAS)",
                fertilizer: "Urea (35kg) + Magnesium Sulfate (10kg)",
                explanation: "High Nitrogen demand for stem elongation. Magnesium aids chlorophyll.",
                benefits: ["Thick stem girth", "Dark green leaves", "Rapid biomass accumulation"]
            },
            "flowering": {
                label: "Tasseling / Silking Stage",
                fertilizer: "Urea (30kg) + Potash (20kg)",
                explanation: "Critical stage for yield. Nitrogen supports silk emergence; Potash aids grain setting.",
                benefits: ["Complete cob filling", "Reduced barrenness", "Heavier grains"]
            }
        },
        info: "🌽 **Maize**: Queen of Cereals.",
        problems: [
            { keywords: ["worm", "fall army"], name: "Fall Armyworm", symptoms: "Ragged leaves, sawdust-like frass.", solution: "Spray **Emamectin Benzoate** or **Spinetoram**." }
        ]
    },
    "millets": {
        aliases: ["ragi", "bajra", "sorghum", "thinai", "kambu", "cholam", "சிறுதானியம்"],
        type: "Cereal",
        stages: {
            "basal": {
                label: "Basal / Sowing",
                fertilizer: "DAP (40kg) + Potash (15kg)",
                explanation: "Provides foundation nutrients for hardy growth.",
                benefits: ["Good root system", "Drought tolerance"]
            },
            "vegetative": {
                label: "Vegetative / Tillering",
                fertilizer: "Urea (20kg) top dressing",
                explanation: "Boosts biomass and tillering.",
                benefits: ["More tillers", "Faster growth"]
            }
        },
        info: "🥣 **Millets**: Nutri-cereals, drought resistant.",
        problems: []
    },

    // VEGETABLES
    "tomato": {
        aliases: ["thakkali", "தக்காளி"],
        type: "Vegetable",
        stages: {
            "basal": {
                label: "Transplanting / Basal",
                fertilizer: "DAP (50kg) + 10:26:26 (50kg) + Neem Cake (100kg) per acre",
                explanation: "Balanced NPK and organic matter for transplant shock recovery.",
                benefits: ["Quick root establishment", "Reduced transplant shock"]
            },
            "vegetative": {
                label: "Vegetative Stage (20-30 DAT)",
                fertilizer: "Urea (30kg) + Micronutrient Mixture (5kg)",
                explanation: "Supports branching and canopy development.",
                benefits: ["Bushy plants", "More fruiting branches"]
            },
            "flowering": {
                label: "Flowering & Fruit Setting",
                fertilizer: "Calcium Nitrate (10kg) + Boron (foliar spray)",
                explanation: "Calcium prevents Blossom End Rot; Boron ensures fruit set.",
                benefits: ["Prevents flower drop", "No rotting fruits", "Uniform shape"]
            },
            "fruiting": {
                label: "Fruit Development / Picking",
                fertilizer: "13:0:45 (Potassium Nitrate) or 0:0:50 (SOP)",
                explanation: "High Potassium improves fruit size, color, and taste.",
                benefits: ["Shiny red fruits", "Longer shelf life", "Higher market value"]
            }
        },
        info: "🍅 **Tomato**: Needs Calcium to prevent rot.",
        problems: [
            { keywords: ["blight"], name: "Early/Late Blight", symptoms: "Dark spots, rotting.", solution: "Spray **Mancozeb** or **Ridomil Gold**." },
            { keywords: ["borer"], name: "Fruit Borer", symptoms: "Holes in fruits.", solution: "Spray **Emamectin Benzoate**." }
        ]
    },
    "brinjal": {
        aliases: ["eggplant", "kathirikai", "கத்திரிக்காய்"],
        type: "Vegetable",
        stages: {
            "basal": { label: "Basal", fertilizer: "DAP + Neem Cake", explanation: "Base nutrition.", benefits: ["Healthy start"] },
            "vegetative": { label: "Vegetative", fertilizer: "Urea + 20:20:0:13", explanation: "Growth boost.", benefits: ["More branches"] },
            "flowering": { label: "Flowering/Fruiting", fertilizer: "10:26:26 + Potash", explanation: "Fruit setting.", benefits: ["Shiny fruits", "Continuous picking"] }
        },
        info: "🍆 **Brinjal**: Long duration crop.",
        problems: [
            { keywords: ["borer"], name: "Shoot & Fruit Borer", symptoms: "Drooping shoots.", solution: "Use **Emamectin Benzoate**." }
        ]
    },
    "chilli": {
        aliases: ["pepper", "milagai", "மிளகாய்"],
        type: "Spice",
        stages: {
            "basal": { label: "Basal", fertilizer: "DAP + Potash + Humic Granules", explanation: "Root growth.", benefits: ["Strong establishment"] },
            "vegetative": { label: "Vegetative", fertilizer: "20:20:0:13 + Urea", explanation: "Branching.", benefits: ["Bushy growth"] },
            "flowering": { label: "Flowering", fertilizer: "Calcium Nitrate + Boron", explanation: "Prevents flower drop.", benefits: ["High fruit set"] },
            "fruiting": { label: "Fruiting", fertilizer: "13:0:45 (Potassium Nitrate)", explanation: "Pungency and color.", benefits: ["Dark red color", "Heavy fruits"] }
        },
        info: "🌶️ **Chilli**: Avoid water stagnation.",
        problems: [
            { keywords: ["curl"], name: "Leaf Curl", symptoms: "Upward curling.", solution: "Spray **Fipronil** or **Acetamiprid**." }
        ]
    },
    "onion": {
        aliases: ["vengayam", "வெங்காயம்"],
        type: "Vegetable",
        stages: {
            "basal": { label: "Basal", fertilizer: "DAP + Sulfur", explanation: "Sulfur key for pungency.", benefits: ["Strong roots"] },
            "vegetative": { label: "Vegetative", fertilizer: "Urea + Ammonium Sulfate", explanation: "Leaf growth.", benefits: ["Thick stems"] },
            "bulbing": { label: "Bulb Formation", fertilizer: "0:0:50 (SOP) + Boron", explanation: "Bulb size.", benefits: ["Big bulbs", "Good skin color"] }
        },
        info: "🧅 **Onion**: Needs Sulfur for pungency.",
        problems: [{ keywords: ["blight"], name: "Purple Blotch", symptoms: "Purple spots.", solution: "Spray **Mancozeb**." }]
    },
    "ladys finger": {
        aliases: ["okra", "vendakkai", "வெண்டைக்காய்"],
        type: "Vegetable",
        stages: {
            "basal": { label: "Basal", fertilizer: "DAP + Potash", explanation: "Start up.", benefits: ["Quick growth"] },
            "flowering": { label: "Flowering/Fruiting", fertilizer: "17:17:17 + Micronutrients", explanation: "Continuous picking.", benefits: ["Tender pods", "Green color"] }
        },
        info: "🥬 **Lady's Finger**: Weekly harvest needed.",
        problems: [{ keywords: ["yellow", "vein"], name: "Yellow Vein Mosaic", symptoms: "Yellow veins.", solution: "Control Whitefly with **Acetamiprid**." }]
    },
    "pumpkin": {
        aliases: ["poosanikai", "பூசணிக்காய்"],
        type: "Creeper",
        stages: {
            "basal": { label: "Basal", fertilizer: "DAP + FYM", explanation: "Vine growth.", benefits: ["Fast vine run"] },
            "fruiting": { label: "Fruiting", fertilizer: "10:26:26", explanation: "Fruit weight.", benefits: ["Large fruits"] }
        },
        info: "🎃 **Pumpkin**: Space out widely.",
        problems: [{ keywords: ["beetle"], name: "Pumpkin Beetle", symptoms: "Leaf damage.", solution: "Spray **Chlorpyrifos**." }]
    },
    "beetroot": {
        aliases: ["beet", "பீட்ரூட்"],
        type: "Tuber",
        stages: {
            "basal": { label: "Basal", fertilizer: "DAP + Potash", explanation: "Root development.", benefits: ["Good form"] },
            "bulbing": { label: "Root Enlargement", fertilizer: "SOP (Potassium Sulphate) + Boron", explanation: "Prevents cracking.", benefits: ["Sweetness", "Solid color"] }
        },
        info: "🟣 **Beetroot**: Cool season crop.",
        problems: []
    },
    "cauliflower": {
        aliases: ["kalis"],
        type: "Vegetable",
        stages: {
            "vegetative": { label: "Vegetative", fertilizer: "Urea high dose", explanation: "Leafy growth.", benefits: ["Large leaves to cover curd"] },
            "curding": { label: "Curd Formation", fertilizer: "Calcium Nitrate + Boron", explanation: "Critical for white curds.", benefits: ["White compact curds"] }
        },
        info: "🥦 **Cauliflower**: Sensitive to temperature.",
        problems: []
    },

    // FRUITS
    "watermelon": {
        aliases: ["tharbushi", "தர்பூசணி"],
        type: "Fruit",
        stages: {
            "basal": { label: "Basal", fertilizer: "DAP + Potash", explanation: "Vine start.", benefits: ["Vigorous vines"] },
            "flowering": { label: "Flowering", fertilizer: "Micronutrients + Calcium", explanation: "Fruit set.", benefits: ["More fruits"] },
            "fruiting": { label: "Fruit Sizing", fertilizer: "0:0:50 (SOP)", explanation: "Sweetness and color.", benefits: ["Sugar content", "Red flesh"] }
        },
        info: "🍉 **Watermelon**: Summer crop.",
        problems: []
    },
    "banana": {
        aliases: ["plantain", "vazhai", "வாழை"],
        type: "Fruit",
        stages: {
            "planting": { label: "Planting / Early", fertilizer: "DAP + Neem Cake", explanation: "Rooting.", benefits: ["Establishment"] },
            "vegetative": { label: "Vegetative (3-5 months)", fertilizer: "Urea + Potash (High)", explanation: "Pseudo-stem growth.", benefits: ["Thick stem"] },
            "shooting": { label: "Shooting / Bunch Emergence", fertilizer: "SOP + Ammonium Sulfate", explanation: "Bunch weight.", benefits: ["Heavy bunches", "Long fingers"] }
        },
        info: "🍌 **Banana**: Heavy Potassium feeder.",
        problems: [{ keywords: ["sigatoka"], name: "Sigatoka Leaf Spot", symptoms: "Yellow streaks.", solution: "Spray **Propiconazole**." }]
    },
    "mango": {
        aliases: ["mambalam", "மாம்பழம்"],
        type: "Fruit",
        stages: {
            "post_harvest": { label: "Post Harvest (June-July)", fertilizer: "NPK 1kg:0.5kg:1kg per tree", explanation: "Recovery.", benefits: ["New flushes"] },
            "flowering": { label: "Flowering (Dec-Jan)", fertilizer: "0:0:50 + Sulfur spray", explanation: "Induction.", benefits: ["Profuse flowering"] },
            "fruiting": { label: "Fruiting (Mar-Apr)", fertilizer: "13:0:45 spray", explanation: "Fruit retention.", benefits: ["Reduced drop", "Sweet fruits"] }
        },
        info: "🥭 **Mango**: Alternate bearer.",
        problems: [{ keywords: ["hopper"], name: "Mango Hopper", symptoms: "Sooty mold.", solution: "Spray **Imidacloprid**." }]
    },
    "coconut": {
        aliases: ["thennai", "தென்னை"],
        type: "Tree",
        stages: {
            "seedling": { label: "Seedling (1-3 years)", fertilizer: "Urea + DAP (Small doses)", explanation: "Growth.", benefits: ["Fast establishment"] },
            "bearing": { label: "Adult Bearing Tree", fertilizer: "Urea (1.3kg) + Super Phosphate (2kg) + Potash (3.5kg) per year/tree", explanation: "High Potash needed for nuts.", benefits: ["More nuts", "Thick kernel"] }
        },
        info: "🥥 **Coconut**: Regular fertilization is key.",
        problems: [{ keywords: ["beetle"], name: "Rhinoceros Beetle", symptoms: "V-cuts.", solution: "Use traps." }]
    },

    // CASH CROPS
    "cotton": {
        aliases: ["paruthi", "kapas", "பருத்தி"],
        type: "Cash Crop",
        stages: {
            "basal": { label: "Basal", fertilizer: "DAP + Potash + Zinc", explanation: "Base.", benefits: ["Good start"] },
            "vegetative": { label: "Vegetative", fertilizer: "Urea + Magnesium Sulfate", explanation: "Reddening prevention.", benefits: ["Green leaves"] },
            "flowering": { label: "Square/Boll Formation", fertilizer: "Potash + Boron", explanation: "Boll retention.", benefits: ["Big bolls", "Reduced shedding"] }
        },
        info: "☁️ **Cotton**: Needs dry weather for harvest.",
        problems: [{ keywords: ["bollworm"], name: "Bollworm", symptoms: "Holes.", solution: "Spray **Profenofos**." }]
    },
    "sugarcane": {
        aliases: ["karumbu", "கரும்பு"],
        type: "Cash Crop",
        stages: {
            "basal": { label: "Basal / Planting", fertilizer: "DAP + Zinc", explanation: "Germination.", benefits: ["Good sett germination"] },
            "tillering": { label: "Tillering (45-90 days)", fertilizer: "Urea (Heavy) + Ferrous Sulfate", explanation: "Cane population.", benefits: ["More millable canes"] },
            "growth": { label: "Grand Growth", fertilizer: "Urea + Potash", explanation: "Cane weight.", benefits: ["Heavy canes", "High sugar"] }
        },
        info: "🎋 **Sugarcane**: Water intensive.",
        problems: [{ keywords: ["red rot"], name: "Red Rot", symptoms: "Alcohol smell.", solution: "Use healthy setts." }]
    },
    "turmeric": {
        aliases: ["manjal", "மஞ்சள்"],
        type: "Spice",
        stages: {
            "basal": { label: "Basal", fertilizer: "DAP + Potash + FYM", explanation: "Rhizome start.", benefits: ["Good sprouting"] },
            "vegetative": { label: "Vegetative", fertilizer: "Urea + Micronutrients", explanation: "Leaf area.", benefits: ["Broad leaves"] },
            "rhizome": { label: "Rhizome Bulking", fertilizer: "Potash (High)", explanation: "Weight.", benefits: ["Thick rhizomes", "High curcumin"] }
        },
        info: "💛 **Turmeric**: 9 month crop.",
        problems: [{ keywords: ["rot"], name: "Rhizome Rot", symptoms: "Rotting.", solution: "Drench **Ridomil**." }]
    }
};

export const generalPesticides = [
    "**Neem Oil**: Organic repellent for sucking pests.",
    "**Chlorpyrifos**: Broad-spectrum insecticide (use with caution).",
    "**Mancozeb**: Broad-spectrum contact fungicide.",
    "**Imidacloprid**: Systemic insecticide for aphids/jassids."
];

export const growthPromoters = [
    "**Panchagavya**: Traditional organic growth promoter.",
    "**Humic Acid**: Improves soil health and root growth.",
    "**Gibberellic Acid**: For cell elongation and fruit setting.",
    "**Seaweed Extract**: For stress tolerance and micronutrients."
];
