// Google Sheets configuration
const sheetLinks = {
  Play: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgL6Kd1s1xbGJN5erJ-vdOsGqu4C73p2EDiqpGKd0HAJm-i-CpwlwBJ3X9H27w2GkjR95nMaum9-kO/pub?gid=1830486934&single=true&output=csv",
  KG: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgL6Kd1s1xbGJN5erJ-vdOsGqu4C73p2EDiqpGKd0HAJm-i-CpwlwBJ3X9H27w2GkjR95nMaum9-kO/pub?gid=2118864747&single=true&output=csv",
  1: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgL6Kd1s1xbGJN5erJ-vdOsGqu4C73p2EDiqpGKd0HAJm-i-CpwlwBJ3X9H27w2GkjR95nMaum9-kO/pub?gid=0&single=true&output=csv",
  2: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgL6Kd1s1xbGJN5erJ-vdOsGqu4C73p2EDiqpGKd0HAJm-i-CpwlwBJ3X9H27w2GkjR95nMaum9-kO/pub?gid=2042428448&single=true&output=csv",
  3: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgL6Kd1s1xbGJN5erJ-vdOsGqu4C73p2EDiqpGKd0HAJm-i-CpwlwBJ3X9H27w2GkjR95nMaum9-kO/pub?gid=523624438&single=true&output=csv",
  4: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgL6Kd1s1xbGJN5erJ-vdOsGqu4C73p2EDiqpGKd0HAJm-i-CpwlwBJ3X9H27w2GkjR95nMaum9-kO/pub?gid=836498676&single=true&output=csv",
  5: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgL6Kd1s1xbGJN5erJ-vdOsGqu4C73p2EDiqpGKd0HAJm-i-CpwlwBJ3X9H27w2GkjR95nMaum9-kO/pub?gid=348094993&single=true&output=csv"
};

// Grade calculation function for Bangladesh system
function getGradeAndPoint(mark) {
  if (mark >= 80) return { grade: "A+", point: 5.00 };
  if (mark >= 70) return { grade: "A",  point: 4.00 };
  if (mark >= 60) return { grade: "A-", point: 3.50 };
  if (mark >= 50) return { grade: "B",  point: 3.00 };
  if (mark >= 40) return { grade: "C",  point: 2.00 };
  if (mark >= 33) return { grade: "D",  point: 1.00 };
  return { grade: "F", point: 0.00 };
}

// Export configuration (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sheetLinks, getGradeAndPoint };
}