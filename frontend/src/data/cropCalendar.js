export const cropCalendarData = {
    "January": {
        "North India": ["Wheat", "Mustard", "Barley", "Peas"],
        "South India": ["Rice", "Groundnut", "Sugarcane", "Ragi"],
        "East India": ["Boro Rice", "Maize", "Potato", "Mustard"],
        "West India": ["Wheat", "Gram", "Mustard", "Cumin"]
    },
    "February": {
        "North India": ["Sugarcane (Planting)", "Sunflower", "Vegetables"],
        "South India": ["Rice (Fallow pulses)", "Sesame", "Watermelon"],
        "East India": ["Jute (Sowing)", "Summer Rice", "Vegetables"],
        "West India": ["Summer Groundnut", "Pearl Millet", "Fodder crops"]
    },
    // ... (rest of initial data will be preserved in structure but explicitly written here to be safe)
    "March": {
        "North India": ["Sugarcane", "Cotton (Sowing)", "Fodder Maize"],
        "South India": ["Cotton", "Vegetables", "Pulses"],
        "East India": ["Jute", "Aus Rice", "Sesame"],
        "West India": ["Summer Bajra", "Groundnut", "Green Gram"]
    },
    "April": {
        "North India": ["Cotton", "Zaid Moong", "Cucurbits"],
        "South India": ["Ginger", "Turmeric", "Summer Pulses"],
        "East India": ["Jute", "Aus Rice", "Vegetables"],
        "West India": ["Cotton (Sowing)", "Fodder crops", "Vegetables"]
    },
    "May": {
        "North India": ["Cotton", "Paddy (Nursery)", "Soybean (Land prep)"],
        "South India": ["Kuruvai Rice", "Turmeric", "Cotton"],
        "East India": ["Aman Rice (Nursery)", "Jute (Harvesting)"],
        "West India": ["Cotton", "Groundnut (Land prep)", "Pulses"]
    },
    "June": {
        "North India": ["Paddy (Transplanting)", "Maize", "Bajra", "Soybean"],
        "South India": ["Rice", "Ragi", "Groundnut", "Cotton"],
        "East India": ["Aman Rice", "Maize", "Pulses"],
        "West India": ["Cotton", "Groundnut", "Soybean", "Bajra"]
    },
    "July": {
        "North India": ["Paddy", "Maize", "Sorghum", "Pulses"],
        "South India": ["Rice", "Groundnut", "Ragi", "Sugarcane"],
        "East India": ["Rice", "Maize", "Arhar"],
        "West India": ["Bajra", "Guar", "Moong", "Castor"]
    },
    "August": {
        "North India": ["Late Paddy", "Toria (Land prep)", "Vegetables"],
        "South India": ["Samba Rice (Nursery)", "Cotton", "Chillies"],
        "East India": ["Rice", "Black Gram", "Vegetables"],
        "West India": ["Castor", "Fennel", "Vegetables"]
    },
    "September": {
        "North India": ["Toria", "Potato (Early)", "Vegetables"],
        "South India": ["Samba Rice (Transplanting)", "Maize", "Sorghum"],
        "East India": ["Rice (Harvesting)", "Vegetables", "Mustard (Land prep)"],
        "West India": ["Rabi Sorghum", "Safflower", "Sunflower"]
    },
    "October": {
        "North India": ["Wheat", "Mustard", "Gram", "Peas"],
        "South India": ["Rice (Thaladi)", "Pulses", "Groundnut"],
        "East India": ["Potato", "Mustard", "Wheat", "Lentil"],
        "West India": ["Wheat", "Gram", "Mustard", "Cumin"]
    },
    "November": {
        "North India": ["Wheat", "Barley", "Oats", "Lentil"],
        "South India": ["Rice", "Groundnut", "Pulses", "Sunflower"],
        "East India": ["Wheat", "Potato", "Maize", "Mustard"],
        "West India": ["Wheat", "Cumin", "Isabgol", "Mustard"]
    },
    "December": {
        "North India": ["Late Wheat", "Sunflower", "Winter Vegetables"],
        "South India": ["Rice (Navarai)", "Groundnut", "Sesame"],
        "East India": ["Boro Rice (Nursery)", "Wheat", "Potato"],
        "West India": ["Wheat", "Summer Groundnut", "Onion"]
    }
};

export const regions = ["North India", "South India", "East India", "West India"];

export const southIndiaDistricts = [
    "Thanjavur", "Coimbatore", "Madurai", "Salem", "Erode", "Tiruchirappalli", "Villupuram", "Thoothukudi", "Dindigul", "Tirunelveli"
];

// District-wise specific recommendations
export const districtRecommendations = {
    // Thanjavur (Delta Region)
    "Thanjavur": {
        "January": ["Rice (Samba)", "Black Gram", "Green Gram"],
        "February": ["Gingelly", "Groundnut", "Cotton"],
        "March": ["Cotton", "Sugarcane", "Vegetables"],
        "April": ["Sugarcane", "Banana", "Vegetables"],
        "May": ["Kuruvai Rice", "Cotton", "Gingelly"],
        "June": ["Kuruvai Rice", "Sugarcane", "Cotton"],
        "July": ["Samba Rice", "Groundnut", "Red Gram"],
        "August": ["Samba Rice", "Maize", "Sunflower"],
        "September": ["Samba Rice", "Cotton", "Chillies"],
        "October": ["Thaladi Rice", "Black Gram", "Green Gram"],
        "November": ["Groundnut", "Gingelly", "Vegetables"],
        "December": ["Rice (Navarai)", "Sugarcane", "Banana"]
    },
    // Coimbatore (Western Region)
    "Coimbatore": {
        "January": ["Sorghum", "Bengal Gram", "Cotton"],
        "February": ["Maize", "Pulses", "Vegetables"],
        "March": ["Cotton", "Cholam", "Cumbu"],
        "April": ["Groundnut", "Vegetables", "Turmeric"],
        "May": ["Turmeric", "Sugarcane", "Banana"],
        "June": ["Cotton", "Millets", "Pulses"],
        "July": ["Groundnut", "Maize", "Sunflower"],
        "August": ["Cotton", "Sorghum", "Tomato"],
        "September": ["Maize", "Chillies", "Onion"],
        "October": ["Bengal Gram", "Coriander", "North East Monsoon crops"],
        "November": ["Pulses", "Sunflower", "Vegetables"],
        "December": ["Wheat (Hills)", "Potato", "Carrot"]
    },
    // Dindigul (Vegetable City)
    "Dindigul": {
        "January": ["Vegetables (Onion)", "Maize", "Sorghum"],
        "February": ["Tobacco", "Tomato", "Cotton"],
        "March": ["Cholam", "Vegetables (Lablab)", "Pulses"],
        "April": ["Groundnut", "Sunflower", "Vegetables"],
        "May": ["Ragi", "Red Gram", "Vegetables"],
        "June": ["Sorghum", "Red Gram", "Maize"],
        "July": ["Groundnut", "Cotton", "Pulses"],
        "August": ["Maize", "Chillies", "Onion"],
        "September": ["Vegetables", "Maize", "Tobacco"],
        "October": ["Maize", "Beans", "Vegetables"],
        "November": ["Coriander", "Bengal Gram", "Maize"],
        "December": ["Onion", "Tomato", "Chillies"]
    },
    // Madurai (Periyar-Vaigai)
    "Madurai": {
        "January": ["Rice (Late Samba)", "Cotton", "Pulses"],
        "February": ["Gingelly", "Black Gram", "Green Gram"],
        "March": ["Cotton", "Cholam", "Ragi"],
        "April": ["Vegetables", "Cotton", "Cumbu"],
        "May": ["Cotton", "Ragi", "Gingelly"],
        "June": ["Kuruvai Rice", "Red Gram", "Groundnut"],
        "July": ["Groundnut", "Red Gram", "Castor"],
        "August": ["Varagu", "Samai", "Pulses"],
        "September": ["Samba Rice", "Cotton", "Chillies"],
        "October": ["Samba Rice", "Pulses", "Coriander"],
        "November": ["Vegetables", "Groundnut", "Rice"],
        "December": ["Sugarcane", "Banana", "Rice"]
    },
    // Salem (North Western)
    "Salem": {
        "January": ["Sugarcane", "Tapioca", "Groundnut"],
        "February": ["Gingelly", "Cotton", "Sorghum"],
        "March": ["Ragi", "Cholam", "Vegetables"],
        "April": ["Groundnut", "Tapioca", "Turmeric"],
        "May": ["Turmeric", "Cotton", "Sorghum"],
        "June": ["Groundnut", "Castor", "Red Gram"],
        "July": ["Ragi", "Red Gram", "Tapioca"],
        "August": ["Cotton", "Maize", "Tapioca"],
        "September": ["Horse Gram", "Sorghum", "Ragi"],
        "October": ["Coffee (Hills)", "Pepper", "Vegetables"],
        "November": ["Bengal Gram", "Coriander", "Mustard"],
        "December": ["Tapioca", "Cotton", "Pulses"]
    },
    // Erode (Turmeric City)
    "Erode": {
        "January": ["Sugarcane", "Banana", "Groundnut"],
        "February": ["Sesame", "Cotton", "Sorghum"],
        "March": ["Turmeric (Harvesting)", "Vegetables", "Maize"],
        "April": ["Turmeric (Sowing)", "Tapioca", "Sugarcane"],
        "May": ["Turmeric", "Cotton", "Groundnut"],
        "June": ["Maize", "Sorghum", "Red Gram"],
        "July": ["Groundnut", "Paddy", "Sugarcane"],
        "August": ["Cotton", "Maize", "Sunflower"],
        "September": ["Tapioca", "Chillies", "Onion"],
        "October": ["Pulses", "Groundnut", "Ragi"],
        "November": ["Horse Gram", "Vegetables", "Sesame"],
        "December": ["Sugarcane", "Banana", "Turmeric"]
    },
    // Tiruchirappalli (Cauvery Delta)
    "Tiruchirappalli": {
        "January": ["Rice (Samba)", "Black Gram", "Banana"],
        "February": ["Gingelly", "Cotton", "Sugarcane"],
        "March": ["Vegetables", "Cholam", "Cotton"],
        "April": ["Maize", "Banana", "Sugarcane"],
        "May": ["Cotton", "Gingelly", "Vegetables"],
        "June": ["Kuruvai Rice", "Red Gram", "Groundnut"],
        "July": ["Groundnut", "Onion", "Red Gram"],
        "August": ["Samba Rice", "Maize", "Chillies"],
        "September": ["Samba Rice", "Banana", "Vegetables"],
        "October": ["Thaladi Rice", "Black Gram", "Cotton"],
        "November": ["Rice", "Banana", "Vegetables"],
        "December": ["Sugarcane", "Banana", "Betelvine"]
    },
    // Villupuram (North East)
    "Villupuram": {
        "January": ["Paddy", "Sugarcane", "Groundnut"],
        "February": ["Black Gram", "Gingelly", "Watermelon"],
        "March": ["Bajra", "Ragi", "Vegetables"],
        "April": ["Groundnut", "Sesame", "Cumbu"],
        "May": ["Cotton", "Vegetables", "Paddy"],
        "June": ["Sornavari Rice", "Groundnut", "Red Gram"],
        "July": ["Groundnut", "Sugarcane", "Tapioca"],
        "August": ["Samba Rice", "Black Gram", "Maize"],
        "September": ["Samba Rice", "Varagu", "Samai"],
        "October": ["Groundnut", "Black Gram", "Paddy"],
        "November": ["Sugarcane", "Cashew", "Pulses"],
        "December": ["Paddy", "Groundnut", "Watermelon"]
    },
    // Thoothukudi (Southern)
    "Thoothukudi": {
        "January": ["Paddy", "Chillies", "Banana"],
        "February": ["Black Gram", "Green Gram", "Coriander"],
        "March": ["Vegetables", "Cotton", "Fodder"],
        "April": ["Cotton", "Senna", "Vegetables"],
        "May": ["Vegetables", "Fodder crops", "Gingelly"],
        "June": ["Pearl Millet", "Senna", "Chillies"],
        "July": ["Cotton", "Pulses", "Sorghum"],
        "August": ["Maize", "Chillies", "Onion"],
        "September": ["Chillies", "Cotton", "Black Gram"],
        "October": ["Paddy (Pishanam)", "Chillies", "Pulses"],
        "November": ["Paddy", "Banana", "Vegetables"],
        "December": ["Paddy", "Coriander", "Senna"]
    },
    // Tirunelveli (Tambirabarani)
    "Tirunelveli": {
        "January": ["Paddy (Pishanam)", "Banana", "Pulses"],
        "February": ["Gingelly", "Fallow Pulses", "Cotton"],
        "March": ["Vegetables", "Cotton", "Daincha"],
        "April": ["Kar Paddy", "Banana", "Vegetables"],
        "May": ["Kar Paddy", "Gingelly", "Cotton"],
        "June": ["Kar Paddy", "Red Gram", "Black Gram"],
        "July": ["Maize", "Sorghum", "Banana"],
        "August": ["Chillies", "Cotton", "Onion"],
        "September": ["Paddy (Pishanam)", "Vegetables", "Pulses"],
        "October": ["Paddy (Pishanam)", "Black Gram", "Green Gram"],
        "November": ["Paddy", "Banana", "Ginger"],
        "December": ["Vegetables", "Paddy", "Coriander"]
    },
    // Default fallback
    "Generic": {
        "January": ["Rice", "Ragi", "Sugarcane"],
        "February": ["Sesame", "Groundnut", "Pulses"],
        "March": ["Cotton", "Vegetables"],
        "April": ["Ginger", "Turmeric"],
        "May": ["Cotton", "Rice"],
        "June": ["Ragi", "Groundnut"],
        "July": ["Groundnut", "Rice"],
        "August": ["Chillies", "Cotton"],
        "September": ["Maize", "Sorghum"],
        "October": ["Pulses", "Groundnut"],
        "November": ["Sunflower", "Pulses"],
        "December": ["Groundnut", "Sesame"]
    }
};

export const cropDetailsDB = {
    // Cereals & Millets
    "Rice": {
        name: "Rice (Paddy)",
        scientificName: "Oryza sativa",
        soil: "Clay or Clay Loams",
        planting: "Transplanting seedlings to puddled field",
        water: "High (submerged conditions preferred)",
        duration: "105-150 days depending on variety",
        harvest: "When grains turn golden yellow",
        description: "The staple food of South India. Requires standing water.",
        fertilizer: "High NPK requirement, Bio-fertilizers like Azospirillum"
    },
    "Rice (Samba)": {
        name: "Samba Rice",
        scientificName: "Oryza sativa (Samba variety)",
        soil: "Deltaic alluvial soils",
        planting: "Direct seeding or transplanting",
        water: "High",
        duration: "135-150 days",
        harvest: "January - February",
        description: "Long duration variety, specific to Thanjavur delta region.",
        fertilizer: "Urea, DAP, Potash in split doses"
    },
    "Thaladi Rice": {
        name: "Thaladi Rice",
        scientificName: "Oryza sativa",
        soil: "Heavy Clay Soil",
        planting: "Transplanting",
        water: "High",
        duration: "130-135 days",
        harvest: "January - February",
        description: "Second crop in double crop wetlands.",
        fertilizer: "High Nitrogen requirement"
    },
    "Kuruvai Rice": {
        name: "Kuruvai Rice",
        scientificName: "Oryza sativa (Short duration)",
        soil: "Alluvial / Clayey",
        planting: "Direct sowing or transplanting in June-July",
        water: "Moderate to High",
        duration: "Short (<120 days)",
        harvest: "September - October",
        description: "Short duration crop primarily grown in Cauvery delta.",
        fertilizer: "Standard NPK schedule"
    },
    "Maize": {
        name: "Maize (Corn)",
        scientificName: "Zea mays",
        soil: "Well-drained Loamy Soil",
        planting: "Ridge and Furrow method",
        water: "Moderate. Sensitive to water stagnation.",
        duration: "90-110 days",
        harvest: "When cob husk turns brown",
        description: "Versatile cereal crop for food and fodder.",
        fertilizer: "Zinc application is often beneficial"
    },
    "Sorghum": {
        name: "Sorghum (Cholam)",
        scientificName: "Sorghum bicolor",
        soil: "Red, Black, or Loamy soil",
        planting: "Broadcasting or Drilling",
        water: "Low (Drought tolerant)",
        duration: "100-110 days",
        harvest: "Earhead turns yellow/brown",
        description: "Major millet crop, good for fodder and food.",
        fertilizer: "Moderate NPK"
    },
    "Ragi": {
        name: "Ragi (Finger Millet)",
        scientificName: "Eleusine coracana",
        soil: "Red or Lateritic Soil",
        planting: "Transplanting or Broadcasting",
        water: "Moderate",
        duration: "90-120 days",
        harvest: "Earheads turn brown",
        description: "Nutritious Calcium-rich millet.",
        fertilizer: "Farm Yard Manure + NPK"
    },
    "Wheat": {
        name: "Wheat",
        scientificName: "Triticum aestivum",
        soil: "Loamy soil",
        planting: "Drilling or Broadcasting",
        water: "Moderate (Winter crop)",
        duration: "120-140 days",
        harvest: "When grains become hard and straw dry",
        description: "Major Rabi crop. Requires cool climate.",
        fertilizer: "DAP, Potash, Urea"
    },

    // Pulses
    "Black Gram": {
        name: "Black Gram (Urad Dal)",
        scientificName: "Vigna mungo",
        soil: "Loams / Clay loams",
        planting: "Broadcasting or Line Sowing",
        water: "Low",
        duration: "70-80 days",
        harvest: "When pods turn black",
        description: "Leguminous pulse crop, improves soil fertility.",
        fertilizer: "DAP (Diammonium Phosphate)"
    },
    "Green Gram": {
        name: "Green Gram (Moong Dal)",
        scientificName: "Vigna radiata",
        soil: "Well drained loamy soil",
        planting: "Broadcasting",
        water: "Low",
        duration: "65-75 days",
        harvest: "Pods turn brown/black",
        description: "Short duration protein-rich pulse.",
        fertilizer: "Rhizobium treatment recommended"
    },
    "Red Gram": {
        name: "Red Gram (Tur Dal)",
        scientificName: "Cajanus cajan",
        soil: "Red sandy loam to black cotton soil",
        planting: "Row planting",
        water: "Low (Deep rooted)",
        duration: "150-180 days",
        harvest: "Pods turn brown",
        description: "Major source of protein, often intercropped.",
        fertilizer: "Phosphorus requirement is high"
    },
    "Bengal Gram": {
        name: "Bengal Gram (Chickpea)",
        scientificName: "Cicer arietinum",
        soil: "Clay loam",
        planting: "Line sowing",
        water: "Low",
        duration: "90-110 days",
        harvest: "Leaves turn yellow",
        description: "Major Rabi pulse crop.",
        fertilizer: "Sulphur application beneficial"
    },

    // Oilseeds
    "Groundnut": {
        name: "Groundnut (Peanut)",
        scientificName: "Arachis hypogaea",
        soil: "Sandy Loams, Red Loams",
        planting: "Seed sowing (Kernels)",
        water: "Moderate. Avoid waterlogging.",
        duration: "100-120 days",
        harvest: "When plant turns yellow and inner shell turns black",
        description: "Important oilseed crop.",
        fertilizer: "Gypsum application is critical for pod filling"
    },
    "Gingelly": {
        name: "Gingelly (Sesame)",
        scientificName: "Sesamum indicum",
        soil: "Well-drained sandy loam",
        planting: "Broadcasting",
        water: "Low",
        duration: "80-90 days",
        harvest: "Leaves turn yellow and drop",
        description: "Queen of oilseeds. Very sensitive to waterlogging.",
        fertilizer: "NPK + Manganese"
    },
    "Sunflower": {
        name: "Sunflower",
        scientificName: "Helianthus annuus",
        soil: "Deep loamy soils",
        planting: "Dibbling seeds",
        water: "Moderate",
        duration: "85-95 days",
        harvest: "Head turns yellow at back",
        description: "Photo-insensitive oilseed crop.",
        fertilizer: "Sulphur is essential"
    },
    "Castor": {
        name: "Castor",
        scientificName: "Ricinus communis",
        soil: "Red sandy loams",
        planting: "Check row planting",
        water: "Low (Drought hardy)",
        duration: "150-180 days",
        harvest: "Capsules turn brown",
        description: "Industrial oilseed crop.",
        fertilizer: "Top dressing with Nitrogen"
    },

    // Cash Crops
    "Cotton": {
        name: "Cotton",
        scientificName: "Gossypium spp.",
        soil: "Black Cotton Soil (Regur) or Red Soil",
        planting: "Row planting with spacing (60-90cm)",
        water: "Moderate. Critical stages: Flowering & Boll formation",
        duration: "150-180 days",
        harvest: "Pick fully burst bolls in morning hours",
        description: "Key cash crop. Requires warm climate.",
        fertilizer: "Farm Yard Manure + NPK"
    },
    "Sugarcane": {
        name: "Sugarcane",
        scientificName: "Saccharum officinarum",
        soil: "Loamy soil with good drainage",
        planting: "Sett planting (Stem cuttings)",
        water: "Very High (Requires regular irrigation)",
        duration: "10-12 months",
        harvest: "Cut stalks at ground level when maturity signs appear",
        description: "Long duration commercial crop.",
        fertilizer: "Heavy feeder, requires integrated nutrient management"
    },
    "Turmeric": {
        name: "Turmeric",
        scientificName: "Curcuma longa",
        soil: "Red Loamy soil",
        planting: "Rhizome planting on ridges",
        water: "High",
        duration: "8-9 months",
        harvest: "When leaves turn yellow and dry up",
        description: "Spice crop with high economic value.",
        fertilizer: "Heavy organic manure requirement"
    },
    "Chillies": {
        name: "Chillies",
        scientificName: "Capsicum annuum",
        soil: "Well drained loamy soil",
        planting: "Transplanting",
        water: "Moderate",
        duration: "120-150 days",
        harvest: "Pick fully red ripe fruits",
        description: "Important spice and vegetable crop.",
        fertilizer: "Standard vegetable fertilizer schedule"
    },
    "Tapioca": {
        name: "Tapioca (Cassava)",
        scientificName: "Manihot esculenta",
        soil: "Red lateritic loamy soil",
        planting: "Sett planting",
        water: "Moderate",
        duration: "8-10 months",
        harvest: "Tubers reach maturity (soil cracking)",
        description: "Starch rich tuber crop.",
        fertilizer: "Potash is dominant nutrient"
    },
    "Banana": {
        name: "Banana",
        scientificName: "Musa sp.",
        soil: "Clay loam with good drainage",
        planting: "Sucker planting",
        water: "High",
        duration: "11-13 months",
        harvest: "Bunch maturity",
        description: "Major fruit crop in Cauvery belt.",
        fertilizer: "Heavy feeder of Potash and Nitrogen"
    },
    "Coriander": {
        name: "Coriander",
        scientificName: "Coriandrum sativum",
        soil: "Well drained black cotton or red loamy soil",
        planting: "Sowing seeds in lines",
        water: "Light irrigations",
        duration: "35-40 days for leaf, 90-110 days for grain",
        harvest: "Leaves: 30-35 days; Grain: Yellowing of grains",
        description: "Dual purpose spice crop (leaves/grain).",
        fertilizer: "Farm Yard Manure + NPK"
    },
    "Vegetables": {
        name: "Vegetables (General)",
        scientificName: "Various",
        soil: "Rich Loamy Soil",
        planting: "Varies by crop",
        water: "Regular irrigation required",
        duration: "60-120 days",
        harvest: "Based on market size",
        description: "Includes Tomato, Brinjal, Bhendi etc.",
        fertilizer: "High organic matter required"
    },
    "Horse Gram": {
        name: "Horse Gram",
        scientificName: "Macrotyloma uniflorum",
        soil: "Poor soils / Red loams",
        planting: "Broadcasting",
        water: "Rainfed (Drought Hardy)",
        duration: "90-110 days",
        harvest: "Pods turn brown",
        description: "Climate resilient pulse crop.",
        fertilizer: "Minimal requirement"
    },
    "Pearl Millet": {
        name: "Pearl Millet (Cumbu)",
        scientificName: "Pennisetum glaucum",
        soil: "Sandy loam",
        planting: "Drilling or transplanting",
        water: "Low (Drought tolerant)",
        duration: "85-90 days",
        harvest: "Earheads dry",
        description: "Important millet for food and fodder.",
        fertilizer: "N and P required"
    },
    "Cumbu": {
        name: "Pearl Millet (Cumbu)",
        scientificName: "Pennisetum glaucum",
        soil: "Sandy loam",
        planting: "Drilling or transplanting",
        water: "Low (Drought tolerant)",
        duration: "85-90 days",
        harvest: "Earheads dry",
        description: "Important millet for food and fodder.",
        fertilizer: "N and P required"
    },
    "Potato": {
        name: "Potato",
        scientificName: "Solanum tuberosum",
        soil: "Sandy loam rich in organic matter",
        planting: "Tuber planting",
        water: "Moderate. Sensitive to drought & flood",
        duration: "90-110 days",
        harvest: "Yellowing of haulm",
        description: "Important tuber crop (Hills/Winter).",
        fertilizer: "High Potash requirement"
    },
    "Tobacco": {
        name: "Tobacco (Chewing)",
        scientificName: "Nicotiana tabacum",
        soil: "Red sandy loam",
        planting: "Transplanting",
        water: "Moderate. Avoid Chloride water.",
        duration: "110-120 days",
        harvest: "Leaf maturity (gummy feel)",
        description: "Important commercial cash crop.",
        fertilizer: "Apply Cake Manure"
    },
    "Beans": {
        name: "French Beans",
        scientificName: "Phaseolus vulgaris",
        soil: "Well drained loamy soil",
        planting: "Line sowing",
        water: "Light & frequent",
        duration: "70-90 days",
        harvest: "Tender fleshy pods",
        description: "Protein rich vegetable.",
        fertilizer: "NPK + Rhizobium"
    },
    "Lablab": {
        name: "Lablab (Mochai)",
        scientificName: "Lablab purpureus",
        soil: "Red sandy loam to clay",
        planting: "Dibbling seeds",
        water: "Rainfed / Protective Irrigation",
        duration: "100-110 days",
        harvest: "Pods dry up",
        description: "Field bean pulse crop.",
        fertilizer: "DAP basal application"
    },
    "Cashew": {
        name: "Cashew",
        scientificName: "Anacardium occidentale",
        soil: "Red sandy loam / Coastal sands",
        planting: "Grafts planting",
        water: "Drought hardy, water during establishment",
        duration: "Perennial (Harvest Feb-May)",
        harvest: "Nuts turn greyish",
        description: "Commercial nut crop of East Coast.",
        fertilizer: "Regular manuring for yield"
    },
    "Betelvine": {
        name: "Betelvine",
        scientificName: "Piper betle",
        soil: "Clay loam rich in humus",
        planting: "Vine cuttings",
        water: "Frequent light irrigation & Humidity",
        duration: "Perennial (2-3 years economic life)",
        harvest: "Pick mature leaves",
        description: "Traditional stimulant leaf crop.",
        fertilizer: "Organic cakes and Slurry"
    },
    "Senna": {
        name: "Senna (Cassia)",
        scientificName: "Cassia angustifolia",
        soil: "Red loam / Alluvial",
        planting: "Seed sowing",
        water: "Light irrigation",
        duration: "90-100 days",
        harvest: "Leaves: 90 days, Pods: 150 days",
        description: "Medicinal crop (Laxative properties).",
        fertilizer: "Minimal NPK"
    },
    "Coffee": {
        name: "Coffee (Arabica/Robusta)",
        scientificName: "Coffea spp.",
        soil: "Deep friable loamy soil (Hill slopes)",
        planting: "Seedlings in pits",
        water: "Blossom showers crucial",
        duration: "Perennial",
        harvest: "Berries turn red (ripe)",
        description: "Plantation crop of Western Ghats.",
        fertilizer: "N-P-K in split doses"
    },
    "Ginger": {
        name: "Ginger",
        scientificName: "Zingiber officinale",
        soil: "Sandy loam / Clay loam",
        planting: "Rhizomes",
        water: "Moderate, sensitive to water logging",
        duration: "8-9 months",
        harvest: "Leaves dry up",
        description: "Spice crop, requires partial shade.",
        fertilizer: "Heavy organic manure"
    },
    "Watermelon": {
        name: "Watermelon",
        scientificName: "Citrullus lanatus",
        soil: "Sandy loam / River beds",
        planting: "Pit sowing",
        water: "Regular irrigation",
        duration: "75-90 days",
        harvest: "Tendril drying, metallic sound on tap",
        description: "Summer fruit crop.",
        fertilizer: "Balanced NPK"
    },
    "Pepper": {
        name: "Black Pepper",
        scientificName: "Piper nigrum",
        soil: "Friable loam rich in humus",
        planting: "Cuttings on standards",
        water: "High humidity required",
        duration: "Perennial",
        harvest: "Berries turn orange/red",
        description: "King of Spices.",
        fertilizer: "Compost + NPK"
    },
    "Jute": {
        name: "Jute (Mesta)",
        scientificName: "Corchorus olitorius",
        soil: "Alluvial soil (Flood plains)",
        planting: "Broadcasting",
        water: "High (requires flooding)",
        duration: "100-120 days",
        harvest: "Small pod stage (50% flowering)",
        description: "Golden fibre crop.",
        fertilizer: "Urea top dressing"
    },
    "Soybean": {
        name: "Soybean",
        scientificName: "Glycine max",
        soil: "Fertile Loamy Soil",
        planting: "Lines",
        water: "Critical at pod filling",
        duration: "90-110 days",
        harvest: "Leaves drop, pods brown",
        description: "Protein & Oil rich pulse.",
        fertilizer: "Rhizobium inoculation"
    },
    "Fodder crops": {
        name: "Fodder Sorghum / Maize",
        scientificName: "Sorghum bicolor / Zea mays",
        soil: "Any Cultivable Soil",
        planting: "High density sowing",
        water: "Moderate",
        duration: "45-60 days (Single cut)",
        harvest: "50% Flowering stage",
        description: "Green fodder for cattle.",
        fertilizer: "High Nitrogen (Urea)"
    },
    "Fodder": {
        name: "Fodder Sorghum / Maize",
        scientificName: "Sorghum bicolor / Zea mays",
        soil: "Any Cultivable Soil",
        planting: "High density sowing",
        water: "Moderate",
        duration: "45-60 days (Single cut)",
        harvest: "50% Flowering stage",
        description: "Green fodder for cattle.",
        fertilizer: "High Nitrogen (Urea)"
    },
    "Onion": {
        name: "Onion",
        scientificName: "Allium cepa",
        soil: "Red loam to clay loam",
        planting: "Bulb or Seedling transplanting",
        water: "Frequent light irrigation",
        duration: "90-100 days",
        harvest: "Tops fall over",
        description: "High value vegetable crop.",
        fertilizer: "Sulphur improves pungency"
    },
    "Tomato": {
        name: "Tomato",
        scientificName: "Solanum lycopersicum",
        soil: "Well-drained sandy loam or clay loam, rich in organic matter",
        planting: "Transplanting (seedlings raised in nursery for 25-30 days)",
        water: "Moderate. Drip irrigation preferred. Critical at flowering & fruit set.",
        duration: "90-120 days",
        harvest: "Fruits turn red/pink. Pick at mature green for long transport.",
        description: "High value vegetable crop. Dindigul district is a major tomato growing area in Tamil Nadu. Can be grown twice a year.",
        fertilizer: "NPK 17:17:17 + Organic Manure. Calcium spray prevents Blossom End Rot."
    },
    "Cholam": {
        name: "Sorghum (Cholam)",
        scientificName: "Sorghum bicolor",
        soil: "Red loam or Black cotton soil",
        planting: "Broadcasting or Drilling in rows",
        water: "Low (Drought tolerant crop)",
        duration: "100-110 days",
        harvest: "When earhead turns yellow-brown",
        description: "Dual-purpose millet crop used for food and fodder in South India.",
        fertilizer: "Moderate NPK with Zinc supplementation"
    },
    "Sesame": {
        name: "Sesame (Gingelly)",
        scientificName: "Sesamum indicum",
        soil: "Well-drained sandy loam",
        planting: "Broadcasting (light seed covering)",
        water: "Low. Very sensitive to waterlogging.",
        duration: "80-90 days",
        harvest: "Leaves turn yellow and start shedding",
        description: "Queen of oilseeds. Important in South India for oil and culinary use.",
        fertilizer: "NPK + Manganese micronutrient"
    },
    "Varagu": {
        name: "Kodo Millet (Varagu)",
        scientificName: "Paspalum scrobiculatum",
        soil: "Shallow or poor red soils",
        planting: "Broadcasting or line sowing",
        water: "Low (Rainfed)",
        duration: "90-110 days",
        harvest: "Panicles turn brownish",
        description: "Drought-hardy minor millet. Nutritious and suited for dry regions of South India.",
        fertilizer: "Minimal. FYM at sowing."
    },
    "Samai": {
        name: "Little Millet (Samai)",
        scientificName: "Panicum sumatrense",
        soil: "Sandy loam to red loam",
        planting: "Broadcasting",
        water: "Low (Rainfed, very drought tolerant)",
        duration: "75-90 days",
        harvest: "Panicles dry and turn golden",
        description: "Highly nutritious minor millet rich in iron and fibre. Ideal for dryland farming.",
        fertilizer: "Low requirement. Biofertilizer treatment helps."
    },

    // ─── Compound-name aliases used in district data ───
    "Vegetables (Onion)": {
        name: "Onion (Vegetable crop)",
        scientificName: "Allium cepa",
        soil: "Red loam to clay loam",
        planting: "Bulb or Seedling transplanting",
        water: "Frequent light irrigation",
        duration: "90-100 days",
        harvest: "Tops fall over naturally",
        description: "High value vegetable. Dindigul & Salem are major onion growing areas.",
        fertilizer: "Sulphur enhances pungency and yield"
    },
    "Vegetables (Lablab)": {
        name: "Lablab (Mochai / Field Bean)",
        scientificName: "Lablab purpureus",
        soil: "Red sandy loam to clay",
        planting: "Dibbling seeds in rows",
        water: "Rainfed / Protective Irrigation",
        duration: "100-110 days",
        harvest: "Pods dry and turn brown",
        description: "Protein-rich field bean widely grown in South India as pulse and vegetable.",
        fertilizer: "DAP basal, Rhizobium inoculation recommended"
    },

    // ─── Other missing crops from district data ───
    "Bajra": {
        name: "Pearl Millet (Bajra)",
        scientificName: "Pennisetum glaucum",
        soil: "Sandy loam",
        planting: "Drilling or transplanting",
        water: "Low (Drought tolerant)",
        duration: "85-90 days",
        harvest: "Earheads dry and turn greyish",
        description: "Important millet for dryland areas of North & West India.",
        fertilizer: "Nitrogen and Phosphorus required"
    },
    "Pulses": {
        name: "Pulses (General)",
        scientificName: "Various legume species",
        soil: "Well drained loamy soil",
        planting: "Line sowing or broadcasting",
        water: "Low to Moderate",
        duration: "65-110 days depending on species",
        harvest: "Pods turn brown/black",
        description: "Includes Red Gram, Green Gram, Black Gram, Bengal Gram. Improve soil nitrogen.",
        fertilizer: "Rhizobium inoculation + phosphorus"
    },
    "Daincha": {
        name: "Daincha (Green Manure)",
        scientificName: "Sesbania bispinosa",
        soil: "Any type including waterlogged",
        planting: "Broadcasting",
        water: "Moderate, tolerates water stagnation",
        duration: "45-60 days (before incorporation)",
        harvest: "Plough green at flowering stage",
        description: "Green manure crop used to improve soil nitrogen and organic matter.",
        fertilizer: "No chemical fertilizer needed"
    },
    "Kar Paddy": {
        name: "Kar Paddy (Early Season Rice)",
        scientificName: "Oryza sativa",
        soil: "Clay loam or sandy loam",
        planting: "Transplanting in April-May",
        water: "High (submerged conditions)",
        duration: "90-105 days",
        harvest: "When grains turn golden yellow",
        description: "Early variety of paddy specific to Southern Tamil Nadu (Tirunelveli / Thoothukudi).",
        fertilizer: "Split doses of Urea + DAP"
    },
    "Fallow Pulses": {
        name: "Fallow Season Pulses",
        scientificName: "Vigna spp.",
        soil: "Residual moisture soils",
        planting: "After rice harvest (Broadcasting)",
        water: "Residual moisture only",
        duration: "65-75 days",
        harvest: "Pods turn brown",
        description: "Short duration pulses grown in the fallow period after paddy. Improve soil health.",
        fertilizer: "Phosphorus basal, Rhizobium"
    }
};
