// Main application functionality

async function checkResult() {
  const cls = document.getElementById("classSelect").value;
  const term = document.getElementById("termSelect").value;
  const roll = document.getElementById("rollInput").value;
  const resultDiv = document.getElementById("result");
  const printBtn = document.getElementById("printBtn");

  // Clear previous results and hide print button
  resultDiv.innerHTML = '';
  printBtn.style.display = 'none';

  // Validation
  if (!cls || !term || !roll) {
    resultDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show">
      <i class="fas fa-exclamation-circle"></i> <strong>Error!</strong> Please fill all the required fields.
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
    return;
  }

  if (roll <= 0) {
    resultDiv.innerHTML = `<div class="alert alert-warning">
      <i class="fas fa-exclamation-triangle"></i> Please enter a valid roll number.
    </div>`;
    return;
  }

  // Show loading
  resultDiv.innerHTML = `<div class="text-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="text-light mt-3">Fetching result data...</p>
  </div>`;

  try {
    // Fetch data from Google Sheets
    const res = await fetch(sheetLinks[cls]);
    if (!res.ok) throw new Error('Failed to fetch data');
    
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);

    let studentSubjects = [];
    let studentInfo = null;
    let subjectHighest = {};
    let studentTotals = {};
    let studentNames = {};

    // Process each row
    rows.forEach(r => {
      const c = r.split(",");
      if (c.length < 8) return; // Skip invalid rows
      
      const rRoll = c[0].trim();
      const rName = c[1]?.trim() || "N/A";
      const rTerm = c[5].trim();
      const subject = c[6].trim();
      const marks = Number(c[7].trim());

      if (rTerm !== term) return;

      // Store student name
      studentNames[rRoll] = rName;

      // Highest marks calculation
      subjectHighest[subject] = Math.max(subjectHighest[subject] || 0, marks);

      // Total marks calculation
      studentTotals[rRoll] = (studentTotals[rRoll] || 0) + marks;

      // Current student
      if (rRoll == roll) {
        studentInfo = c;
        studentSubjects.push({ subject, marks });
      }
    });

    if (!studentInfo || studentSubjects.length === 0) {
      resultDiv.innerHTML = `<div class="alert alert-warning">
        <i class="fas fa-search"></i> <strong>Not Found!</strong> No result found for Roll ${roll} in ${term} Term.
      </div>`;
      return;
    }

    // Calculate GPA and grades
    let totalPoint = 0;
    let totalMarks = 0;
    let finalGrade = "F";
    let failStatus = false;

    // Calculate for each subject
    studentSubjects.forEach(sub => {
      const mark = parseFloat(sub.marks);
      const result = getGradeAndPoint(mark);
      
      totalMarks += mark;
      totalPoint += result.point;
      
      if (mark < 33) failStatus = true;
      
      // Store grade and point for each subject
      sub.grade = result.grade;
      sub.point = result.point;
    });

    // Calculate final GPA and grade
    let gpaValue = 0;
    let gpaDisplay = "0.00";
    
    if (!failStatus && studentSubjects.length > 0) {
      gpaValue = totalPoint / studentSubjects.length;
      gpaDisplay = gpaValue.toFixed(2);
      
      // Determine final grade based on GPA
      if (gpaValue >= 5.00) finalGrade = "A+";
      else if (gpaValue >= 4.00) finalGrade = "A";
      else if (gpaValue >= 3.50) finalGrade = "A-";
      else if (gpaValue >= 3.00) finalGrade = "B";
      else if (gpaValue >= 2.00) finalGrade = "C";
      else if (gpaValue >= 1.00) finalGrade = "D";
      else finalGrade = "F";
    }

    const gpa = failStatus ? "0.00 (Fail)" : gpaDisplay;
    const status = failStatus ? "Fail" : "Pass";

    // Position calculation
    const sortedTotals = Object.entries(studentTotals)
      .sort((a, b) => b[1] - a[1])
      .map(x => x[0]);

    const position = failStatus ? "--" : sortedTotals.indexOf(roll) + 1;
    const totalSubjects = studentSubjects.length;
    const percentage = ((totalMarks / (totalSubjects * 100)) * 100).toFixed(2);
    const highestTotal = Math.max(...Object.values(studentTotals));

    // Find topper
    let topperRoll = null;
    let topperName = "N/A";

    for (const [rRoll, total] of Object.entries(studentTotals)) {
      if (total === highestTotal) {
        topperRoll = rRoll;
        topperName = studentNames[rRoll] || "N/A";
        break;
      }
    }

    // Build table rows with grades
    let tableRows = "";
    studentSubjects.forEach(s => {
      const isFail = s.marks < 33;
      const gradeInfo = getGradeAndPoint(s.marks);
      
      tableRows += `
        <tr>
          <td>${s.subject}</td>
          <td>100</td>
          <td>${subjectHighest[s.subject] || 0}</td>
          <td class="${isFail ? 'text-danger fw-bold' : ''}">${s.marks}</td>
          <td>${gradeInfo.grade}</td>
          <td>${gradeInfo.point.toFixed(2)}</td>
        </tr>`;
    });

    // Display result
    resultDiv.innerHTML = `
    <div class="marksheet">
      <h4> Akota Kinder Garten Pre-Cadet School</h4>
      <h5>Academic Marksheet - 2026</h5>

      <div class="student-info">
        <p><b><i class="fas fa-user"></i> Name:</b> ${studentInfo[1] || 'N/A'}</p>
        <p><b>Father's Name:</b> ${studentInfo[2] || 'N/A'}</p>
        <p><b>Mother's Name:</b> ${studentInfo[3] || 'N/A'}</p>
      </div>

      <div class="info-row">
        <span><b><i class="fas fa-graduation-cap"></i> Class:</b> ${cls}</span>
        <span><b><i class="fas fa-hashtag"></i> Roll:</b> ${roll}</span>
        <span><b><i class="fas fa-calendar"></i> Term:</b> ${term}</span>
        <span class="badge-status ${failStatus ? 'badge-fail' : 'badge-pass'}">
          <i class="fas fa-${failStatus ? 'times' : 'check'}"></i> ${status}
        </span>
      </div>
      <span class="badge badge-position">
          <i class="fas fa-trophy"></i> Position: ${position}
        </span>
      <div class="info-row">
        
        <span class="text-success fw-bold">
          <i class="fas fa-crown"></i> Topper: ${topperName} (Roll ${topperRoll})
        </span>
      </div>

      <table class="table table-bordered">
        <thead>
          <tr>
            <th><i class="fas fa-book"></i> Subject</th>
            <th><i class="fas fa-chart-pie"></i> Total</th>
            <th><i class="fas fa-chart-line"></i> Highest</th>
            <th><i class="fas fa-star"></i> Marks</th>
            <th><i class="fas fa-graduation-cap"></i> Grade</th>
            <th><i class="fas fa-star-half-alt"></i> Point</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr>
            <th><i class="fas fa-calculator"></i> Total</th>
            <th>${totalSubjects * 100}</th>
            <th>${highestTotal}</th>
            <th>${totalMarks}</th>
            <th>${finalGrade}</th>
            <th>${gpa}</th>
          </tr>
        </tfoot>
      </table>

      <div class="gpa-row">
        <span><b>Total Marks:</b> ${totalMarks}</span>
        <span class="${failStatus ? 'gpa-fail' : 'gpa-pass'}">
          <i class="fas fa-chart-bar"></i> <b>GPA:</b> ${gpa}
        </span>
        <span><b>Grade:</b> ${finalGrade}</span>
        <span class="text-primary">
          <i class="fas fa-percentage"></i> <b>Percentage:</b> ${percentage}%
        </span>
      </div>

      <div class="footer-row">
        <span><i class="fas fa-calendar-day"></i> <b>Date:</b> ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span><i class="fas fa-check-circle text-success"></i> Verified Result</span>
      </div>
    </div>`;

    // Show print button
    printBtn.style.display = 'block';

  } catch (error) {
    console.error('Error:', error);
    resultDiv.innerHTML = `<div class="alert alert-danger">
      <i class="fas fa-exclamation-triangle"></i> <strong>Error!</strong> Failed to load results. Please check your connection or contact support.
      <br><small class="opacity-75">${error.message}</small>
    </div>`;
  }
}

async function compareStudents() {
  const cls = document.getElementById("classSelect").value;
  const term = document.getElementById("termSelect").value;
  const roll1 = document.getElementById("rollCompare1").value;
  const roll2 = document.getElementById("rollCompare2").value;
  const compareDiv = document.getElementById("compareResult");

  // Validation
  if (!cls || !term || !roll1 || !roll2) {
    compareDiv.innerHTML = `<div class="alert alert-danger">
      <i class="fas fa-exclamation-circle"></i> Please fill all fields for comparison. [Select Class and Exam Term]
    </div>`;
    return;
  }

  if (roll1 === roll2) {
    compareDiv.innerHTML = `<div class="alert alert-warning">
      <i class="fas fa-info-circle"></i> Please enter two different roll numbers
    </div>`;
    return;
  }

  compareDiv.innerHTML = `<div class="text-center">
    <div class="spinner-border text-success" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="text-light mt-2">Comparing students...</p>
  </div>`;

  try {
    const res = await fetch(sheetLinks[cls]);
    if (!res.ok) throw new Error('Failed to fetch data');
    
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);

    let student1 = { info: {}, marks: {}, grades: {}, points: {} };
    let student2 = { info: {}, marks: {}, grades: {}, points: {} };
    let subjectsSet = new Set();
    let studentTotals = {};

    rows.forEach(r => {
      const c = r.split(",");
      if (c.length < 8 || c[5].trim() !== term) return;
      
      const roll = c[0].trim();
      const subject = c[6].trim();
      const marks = Number(c[7].trim());
      const gradeInfo = getGradeAndPoint(marks);
      
      subjectsSet.add(subject);

      // Calculate totals for position
      studentTotals[roll] = (studentTotals[roll] || 0) + marks;

      if (roll == roll1) {
        student1.info = c;
        student1.marks[subject] = marks;
        student1.grades[subject] = gradeInfo.grade;
        student1.points[subject] = gradeInfo.point;
      }
      if (roll == roll2) {
        student2.info = c;
        student2.marks[subject] = marks;
        student2.grades[subject] = gradeInfo.grade;
        student2.points[subject] = gradeInfo.point;
      }
    });

    if (!Object.keys(student1.marks).length || !Object.keys(student2.marks).length) {
      compareDiv.innerHTML = `<div class="alert alert-warning">
        <i class="fas fa-search"></i> One or both students not found
      </div>`;
      return;
    }

    // Calculate positions
    const sortedTotals = Object.entries(studentTotals)
      .sort((a, b) => b[1] - a[1])
      .map(x => x[0]);

    const position1 = sortedTotals.indexOf(roll1) + 1;
    const position2 = sortedTotals.indexOf(roll2) + 1;

    // Calculate GPA for each student
    const calculateGPA = (student) => {
      const subjects = Object.keys(student.marks);
      if (subjects.length === 0) return 0;
      
      const totalPoints = subjects.reduce((sum, sub) => sum + (student.points[sub] || 0), 0);
      return totalPoints / subjects.length;
    };

    const gpa1 = calculateGPA(student1).toFixed(2);
    const gpa2 = calculateGPA(student2).toFixed(2);

    // Build comparison table
    let tableRows = "";
    let total1 = 0;
    let total2 = 0;

    subjectsSet.forEach(sub => {
      const m1 = student1.marks[sub] || 0;
      const m2 = student2.marks[sub] || 0;
      const g1 = student1.grades[sub] || "-";
      const g2 = student2.grades[sub] || "-";
      const p1 = (student1.points[sub] || 0).toFixed(2);
      const p2 = (student2.points[sub] || 0).toFixed(2);
      
      total1 += m1;
      total2 += m2;

      let s1Class = m1 > m2 ? "table-success" : m1 < m2 ? "table-danger" : "";
      let s2Class = m2 > m1 ? "table-success" : m2 < m1 ? "table-danger" : "";

      tableRows += `
        <tr>
          <td>${sub}</td>
          <td class="${s1Class}">${m1}</td>
          <td>${g1}</td>
          <td>${p1}</td>
          <td class="${s2Class}">${m2}</td>
          <td>${g2}</td>
          <td>${p2}</td>
        </tr>`;
    });

    // Determine winner
    let winnerText = "";
    let winnerClass = "";
    
    if (total1 > total2) {
      winnerText = `<span class="badge bg-success p-2"><i class="fas fa-trophy"></i> Roll ${roll1} Wins!</span>`;
      winnerClass = "text-success";
    } else if (total2 > total1) {
      winnerText = `<span class="badge bg-success p-2"><i class="fas fa-trophy"></i> Roll ${roll2} Wins!</span>`;
      winnerClass = "text-success";
    } else {
      winnerText = `<span class="badge bg-info p-2"><i class="fas fa-handshake"></i> It's a Tie!</span>`;
      winnerClass = "text-info";
    }

    compareDiv.innerHTML = `
    <div class="compare-card">
      <h6 class="text-center mb-3"><i class="fas fa-balance-scale-left"></i> Student Comparison Result</h6>
      
      <div class="text-center mb-4 ${winnerClass}">
        ${winnerText}
      </div>
      
      <div class="row mb-4">
        <div class="col text-center">
          <div class="p-3 bg-light rounded">
            <strong class="d-block">Roll ${roll1}:</strong>
            <span class="text-primary fw-bold">${student1.info[1] || 'N/A'}</span><br>
            <span class="text-dark"><i class="fas fa-chart-line"></i> Total: ${total1}</span><br>
            <span class="text-dark"><i class="fas fa-star"></i> GPA: ${gpa1}</span><br>
            <span class="text-warning"><i class="fas fa-medal"></i> Position: ${position1}</span>
          </div>
        </div>
        
        <div class="col text-center">
          <div class="p-3 bg-light rounded">
            <strong class="d-block">Roll ${roll2}:</strong>
            <span class="text-primary fw-bold">${student2.info[1] || 'N/A'}</span><br>
            <span class="text-dark"><i class="fas fa-chart-line"></i> Total: ${total2}</span><br>
            <span class="text-dark"><i class="fas fa-star"></i> GPA: ${gpa2}</span><br>
            <span class="text-warning"><i class="fas fa-medal"></i> Position: ${position2}</span>
          </div>
        </div>
      </div>

      <table class="table table-bordered compare-table">
        <thead>
          <tr>
            <th rowspan="2"><i class="fas fa-book"></i> Subject</th>
            <th colspan="3" class="text-center">Roll ${roll1}</th>
            <th colspan="3" class="text-center">Roll ${roll2}</th>
          </tr>
          <tr>
            <th>Marks</th>
            <th>Grade</th>
            <th>Point</th>
            <th>Marks</th>
            <th>Grade</th>
            <th>Point</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="table-active fw-bold">
            <th><i class="fas fa-calculator"></i> Total</th>
            <th class="${total1 > total2 ? 'text-success' : total1 < total2 ? 'text-danger' : ''}">${total1}</th>
            <th colspan="2">GPA: ${gpa1}</th>
            <th class="${total2 > total1 ? 'text-success' : total2 < total1 ? 'text-danger' : ''}">${total2}</th>
            <th colspan="2">GPA: ${gpa2}</th>
          </tr>
        </tbody>
      </table>
      
      <div class="text-center mt-3">
        <small class="text-muted">
          <i class="fas fa-info-circle"></i> Green cells indicate higher marks in that subject
        </small>
      </div>
    </div>`;

  } catch (error) {
    console.error('Error:', error);
    compareDiv.innerHTML = `<div class="alert alert-danger">
      <i class="fas fa-exclamation-triangle"></i> Error loading comparison data. Please try again.
    </div>`;
  }
}

// Event Listeners
function setupEventListeners() {
  // Show/Hide Compare Section
  document.getElementById("showCompareBtn").addEventListener("click", function() {
    const section = document.getElementById("compareSection");
    const compareResult = document.getElementById("compareResult");
    
    if (section.style.display === "none") {
      section.style.display = "block";
      this.innerHTML = '<i class="fas fa-times"></i> Hide Compare Section';
      this.classList.remove("btn-warning");
      this.classList.add("btn-danger");
      
      // Scroll to compare section
      section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      section.style.display = "none";
      this.innerHTML = '<i class="fas fa-balance-scale"></i> Compare Students';
      this.classList.remove("btn-danger");
      this.classList.add("btn-warning");
      compareResult.innerHTML = "";
    }
  });

  // Add enter key support
  document.getElementById("rollInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") checkResult();
  });

  document.getElementById("rollCompare2").addEventListener("keypress", function(e) {
    if (e.key === "Enter") compareStudents();
  });

  // Form validation styling
  const inputs = document.querySelectorAll('.form-control');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.style.borderColor = 'rgba(239, 68, 68, 0.5)';
      } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }
    });
    
    input.addEventListener('focus', function() {
      this.style.borderColor = 'var(--primary)';
    });
  });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
});

// Export functions (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkResult, compareStudents, setupEventListeners };
}
