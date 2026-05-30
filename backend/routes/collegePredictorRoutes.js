const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth'); 

const apDataPath = path.join(__dirname, '..', 'data', 'college predictor', 'ap.json');
const tgDataPath = path.join(__dirname, '..', 'data', 'college predictor', 'tg.json');

let apData = null;
let tgData = null;

const loadData = (state) => {
    if (state === 'ap') {
        if (!apData) {
            const rawData = fs.readFileSync(apDataPath, 'utf8');
            apData = JSON.parse(rawData).data;
        }
        return apData;
    } else if (state === 'tg') {
        if (!tgData) {
            const rawData = fs.readFileSync(tgDataPath, 'utf8');
            tgData = JSON.parse(rawData).data;
        }
        return tgData;
    }
    return [];
};

const DISTRICT_NAMES = {
    // AP Districts
    "ATP": "Anantapur", "CTR": "Chittoor", "EG": "East Godavari", "GTR": "Guntur", "KDP": "Kadapa", "KNL": "Kurnool", "KRI": "Krishna", "NLR": "Nellore", "PKS": "Prakasam", "SKL": "Srikakulam", "VSP": "Visakhapatnam", "VZM": "Vizianagaram", "WG": "West Godavari",
    // TG Districts
    "HNK": "Hanumakonda", "HYD": "Hyderabad", "JTL": "Jagtial", "KGM": "Khammam", "KHM": "Khammam", "KMR": "Karimnagar", "KRM": "Karimnagar", "MBN": "Mahabubnagar", "MDL": "Medchal-Malkajgiri", "MED": "Medchal", "MHB": "Mahabubabad", "NLG": "Nalgonda", "NPT": "Narsapur (Medak)", "NZB": "Nizamabad", "PDL": "Peddapalli", "RR": "Ranga Reddy", "SDP": "Siddipet", "SRC": "Suryapet", "SRD": "Sangareddy", "SRP": "Rajanna Sircilla", "WGL": "Warangal", "WNP": "Wanaparthy", "YBG": "Yadadri Bhuvanagiri"
};

const BRANCH_PRIORITY = [
    "CSE", "CSM", "CSD", "INF", "CSO", "CSBS", "CSB", "CSC", "AI", "AIM", "AID", "CIC", "CSI", "ECE", "EEE", "CIVIL", "MECH", "CHEM", "CIV", "MEC", "CHE"
];

const BRANCH_NAMES = {
    "CSE": "COMPUTER SCIENCE AND ENGINEERING",
    "ECE": "ELECTRONICS AND COMMUNICATION ENGINEERING",
    "CIV": "CIVIL ENGINEERING",
    "MEC": "MECHANICAL ENGINEERING",
    "CHE": "CHEMICAL ENGINEERING",
    "CSM": "CSE (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)",
    "CSD": "CSE (DATA SCIENCE)",
    "INF": "INFORMATION TECHNOLOGY",
    "CSO": "CSE (IOT)",
    "CSBS": "COMPUTER SCIENCE AND BUSINESS SYSTEMS",
    "CSB": "CSE (BS)",
    "CSC": "CSE (CYBER SECURITY)",
    "AI": "ARTIFICIAL INTELLIGENCE",
    "AIM": "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING",
    "AID": "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
    "CIC": "CSE (IOT AND CYBER SECURITY)",
    "CSI": "COMPUTER ENGINEERING (SOFTWARE ENGINEERING)",
    "EEE": "ELECTRICAL AND ELECTRONICS ENGINEERING",
    "CIVIL": "CIVIL ENGINEERING",
    "MECH": "MECHANICAL ENGINEERING",
    "CHEM": "CHEMICAL ENGINEERING",
    "EIE": "ELECTRONICS AND INSTRUMENTATION ENGINEERING",
    "CAD": "CIVIL - COMPUTER AIDED DESIGN",
    "AGR": "AGRICULTURAL ENGINEERING",
    "CAI": "CSE (ARTIFICIAL INTELLIGENCE)",
    "DS": "DATA SCIENCE",
    "FDE": "FOOD ENGINEERING",
    "PEE": "PETROLEUM ENGINEERING",
    "CS": "COMPUTER SCIENCE",
    "CIT": "COMPUTER INFORMATION TECHNOLOGY",
    "AUT": "AUTOMOBILE ENGINEERING",
    "CSG": "CSE (GAME DESIGN)",
    "EVT": "ELECTRIC VEHICLE TECHNOLOGY",
    "IOT": "INTERNET OF THINGS",
    "CBA": "CSE (BIG DATA ANALYTICS)",
    "ECA": "ELECTRONICS AND COMMUNICATION (ADVANCED)",
    "EII": "ELECTRONICS AND INSTRUMENTATION",
    "ASE": "AEROSPACE ENGINEERING",
    "CSER": "CSE (ROBOTICS)",
    "MIN": "MINING ENGINEERING",
    "BIO": "BIOTECHNOLOGY",
    "GIN": "GEOINFORMATICS",
    "IST": "INFORMATION SCIENCE AND TECHNOLOGY",
    "MET": "METALLURGICAL ENGINEERING",
    "NAM": "NAVAL ARCHITECTURE AND MARINE ENGINEERING",
    "MRB": "MARINE ENGINEERING (BS)",
    "ECM": "ELECTRONICS AND COMPUTER ENGINEERING",
    "CSS": "CSE (SOFTWARE)",
    "CST": "COMPUTER SCIENCE AND TECHNOLOGY",
    "ECT": "ELECTRONICS AND COMMUNICATION TECHNOLOGY",
    "CSEB": "CSE (BUSINESS)",
    "RBT": "ROBOTICS",
    "FDT": "FOOD TECHNOLOGY",
    "CCC": "CLOUD COMPUTING AND CYBER SECURITY",
    "CIA": "CYBER SECURITY AND INFORMATION ASSURANCE",
    "MMT": "MULTIMEDIA TECHNOLOGY",
    "BDT": "BIG DATA TECHNOLOGY",
    "PET": "PETROCHEMICAL ENGINEERING",
    "CBC": "COMPUTER AND BUSINESS COMMUNICATION",
    "CDA": "CLINICAL DATA ANALYTICS",
    "CSW": "CSE (WEB DEVELOPMENT)",
    "ECES": "ELECTRONICS AND COMMUNICATION (SYSTEMS)",
    "ECV": "ELECTRONICS AND COMMUNICATION (VLSI)",
    "MAD": "MOBILE APPLICATION DEVELOPMENT",
    "SWE": "SOFTWARE ENGINEERING",
    "GDT": "GAME DESIGN AND TECHNOLOGY",
    "CN": "COMPUTER NETWORKS",
    "EBM": "ELECTRONICS AND BIOMEDICAL ENGINEERING",
    "MAU": "MECHATRONICS AND AUTOMATION",
    "MII": "MINING (INDUSTRIES)",
    "MMM": "METALLURGICAL AND MATERIALS ENGINEERING"
};

router.get('/:state/options', auth, async (req, res) => {
    try {
        const { state } = req.params;
        if (!['ap', 'tg'].includes(state)) {
            return res.status(400).json({ msg: 'Invalid state' });
        }
        
        const data = loadData(state);
        
        const districtsSet = new Set();
        const branchesMap = new Map();

        data.forEach(college => {
            const isPharmacy = (college.institute_name && college.institute_name.toLowerCase().includes('pharmacy')) || college.branch_code === 'PHD' || college.branch_code === 'PHM';
            if (isPharmacy) return; // Exclude pharmacy from options

            const distField = state === 'ap' ? college.dist : college.dist_code;
            if (distField) districtsSet.add(distField);
            
            if (college.branch_code) {
                let name = college.branch_name || BRANCH_NAMES[college.branch_code.toUpperCase()] || college.branch_code;
                branchesMap.set(college.branch_code, name);
            }
        });

        const districts = Array.from(districtsSet).map(code => {
            const fullName = DISTRICT_NAMES[code] ? `${code} (${DISTRICT_NAMES[code]})` : code;
            return { code, name: fullName };
        }).sort((a, b) => a.name.localeCompare(b.name));

        const branches = Array.from(branchesMap.entries()).map(([code, name]) => ({ code, name })).sort((a, b) => {
            const idxA = BRANCH_PRIORITY.indexOf(a.code.toUpperCase());
            const idxB = BRANCH_PRIORITY.indexOf(b.code.toUpperCase());
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.code.localeCompare(b.code);
        });

        res.json({ districts, branches });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.get('/:state/search', auth, async (req, res) => {
    try {
        const { state } = req.params;
        const { q } = req.query;
        if (!['ap', 'tg'].includes(state)) {
            return res.status(400).json({ msg: 'Invalid state' });
        }
        if (!q || q.length < 1) {
            return res.json([]);
        }
        
        const data = loadData(state);
        const query = q.toLowerCase();
        
        const colleges = [];
        const seenCodes = new Set();
        
        data.forEach(item => {
            const code = item.inst_code || item.institute_code;
            if (!code) return;
            const name = item.institute_name || "";
            
            if (seenCodes.has(code)) return;
            
            if (name.toLowerCase().includes(query) || code.toLowerCase().includes(query)) {
                colleges.push({
                    code,
                    name,
                    place: item.place,
                    dist: item.dist || item.dist_code,
                    type: item.type || item.institute_type
                });
                seenCodes.add(code);
            }
        });
        
        res.json(colleges.slice(0, 15));
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.get('/:state/college/:code', auth, async (req, res) => {
    try {
        const { state, code } = req.params;
        if (!['ap', 'tg'].includes(state)) {
            return res.status(400).json({ msg: 'Invalid state' });
        }
        
        const data = loadData(state);
        const details = data.filter(item => (item.inst_code || item.institute_code) === code);
        
        if (details.length === 0) {
            return res.status(404).json({ msg: 'College not found' });
        }
        
        // Enrich branch names
        const enriched = details.map(d => ({
            ...d,
            branch_name: BRANCH_NAMES[d.branch_code.toUpperCase()] || d.branch_name || d.branch_code
        }));

        res.json(enriched);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.post('/:state', auth, async (req, res) => {
    try {
        const { state } = req.params;
        const { rank, category, gender, branches, districts } = req.body;

        if (!['ap', 'tg'].includes(state)) {
            return res.status(400).json({ msg: 'Invalid state' });
        }

        const data = loadData(state);
        
        const userRank = parseInt(rank, 10);
        if (isNaN(userRank)) {
            return res.status(400).json({ msg: 'Invalid rank' });
        }

        // Show colleges from 2k before user rank to 10k after user rank
        const lowerBound = Math.max(1, userRank - 2000);
        const upperBound = userRank + 10000;

        const formattedCategory = category.toLowerCase().replace('_', '');
        let catKey = `${formattedCategory}_${gender.toLowerCase()}`;
        
        if (category.toLowerCase() === 'ews') {
            if (state === 'ap') {
                catKey = `oc_ews_${gender.toLowerCase()}`;
            } else if (state === 'tg') {
                catKey = gender.toLowerCase() === 'boys' ? 'ews_gen_ou' : 'ews_girls_ou';
            }
        }

        const filtered = data.filter(college => {
            // Filter out Pharmacy
            const isPharmacy = (college.institute_name && college.institute_name.toLowerCase().includes('pharmacy')) || college.branch_code === 'PHD' || college.branch_code === 'PHM';
            if (isPharmacy) return false;

            if (districts && districts.length > 0) {
                const distField = state === 'ap' ? college.dist : college.dist_code;
                if (!districts.includes(distField)) return false;
            }

            if (branches && branches.length > 0) {
                if (!branches.includes(college.branch_code)) return false;
            }

            let lastRank = college.last_ranks[catKey];
            if (!lastRank) return false;

            lastRank = parseInt(lastRank, 10);
            if (isNaN(lastRank)) return false;

            if (lastRank >= lowerBound && lastRank <= upperBound) {
                return true;
            }

            return false;
        });

        // Add the specific last_rank to the output to make it easy for the frontend
        let enrichedFiltered = filtered.map(college => ({
            ...college,
            target_last_rank: parseInt(college.last_ranks[catKey], 10)
        }));

        // Sort ascending by cutoff rank
        enrichedFiltered.sort((a, b) => a.target_last_rank - b.target_last_rank);

        res.json({ results: enrichedFiltered });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
