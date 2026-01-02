const sheetLinks = {
  1: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRzQfWwhLQUAANvI90FSIrTYe9UWVdamvanJHWhJ0NqFnNsvIhD1mTDBhDT6kaoCHOpJL_Iqlfoe-Ra/pub?gid=0&single=true&output=csv",
  2: "PASTE_CLASS2_CSV_LINK",
  3: "PASTE_CLASS3_CSV_LINK",
  4: "PASTE_CLASS4_CSV_LINK",
  5: "PASTE_CLASS5_CSV_LINK"
};


async function checkResult() {

  const cls = document.getElementById("classSelect").value;
  const term = document.getElementById("termSelect").value;
  const roll = document.getElementById("rollInput").value;
  const resultDiv = document.getElementById("result");

  if (!cls || !term || !roll) {
    resultDiv.innerHTML = `<div class="alert alert-danger">All fields required</div>`;
    return;
  }

  const res = await fetch(sheetLinks[cls]);
  const text = await res.text();
  const rows = text.trim().split("\n").slice(1);

  let studentSubjects = [];
  let studentInfo = null;
  let fail = false;

  let subjectHighest = {};
  let studentTotals = {};

  rows.forEach(r => {
    const c = r.split(",");
    const rRoll = c[0];
    const rTerm = c[5];
    const subject = c[6];
    const marks = Number(c[7]);

    if (rTerm !== term) return;

    // Highest marks calculation
    subjectHighest[subject] = Math.max(subjectHighest[subject] || 0, marks);

    // Total marks calculation
    studentTotals[rRoll] = (studentTotals[rRoll] || 0) + marks;

    // Current student
    if (rRoll == roll) {
      studentInfo = c;
      studentSubjects.push({ subject, marks });
      if (marks < 33) fail = true;
    }
  });

  if (!studentInfo) {
    resultDiv.innerHTML = `<div class="alert alert-warning">Result Not Found</div>`;
    return;
  }

  // Position calculation
  const sortedTotals = Object.entries(studentTotals)
    .sort((a, b) => b[1] - a[1])
    .map(x => x[0]);

  const position = fail ? "--" : sortedTotals.indexOf(roll) + 1;

  let totalMarks = studentSubjects.reduce((s, x) => s + x.marks, 0);
  let gpa = fail ? "Fail" : (totalMarks / studentSubjects.length / 20).toFixed(2);
  let status = fail ? "Fail" : "Pass";

  // Table rows
  let tableRows = "";
  studentSubjects.forEach(s => {
    tableRows += `
      <tr>
        <td>${s.subject}</td>
        <td>100</td>
        <td>${subjectHighest[s.subject]}</td>
        <td>${s.marks}</td>
      </tr>`;
  });
const highestTotal = Math.max(...Object.values(studentTotals));

  resultDiv.innerHTML = `
  <div class="marksheet">
    <h4 class="text-center">Akota Kinder Garten Pre-Cadet School</h4>
    <h5 class="text-center">Academic Marksheet-2026</h5>

    <p><b>Name:</b> ${studentInfo[1]}</p>
    <p><b>Father's Name:</b> ${studentInfo[2]}</p>
    <p><b>Mother's Name:</b> ${studentInfo[3]}</p>
    <div class="info-row">
  <span><b>Class:</b> ${cls}</span>
  <span><b>Roll:</b> ${roll}</span> <br>
  <span><b>Term:</b> ${term}</span>
  <span><b>Status:</b> <span class="${status.toLowerCase()} "><span style="color: ${status === 'Fail' ? 'red' : 'green'}">${status}</span></span></span>
  <span style="color: ${status === 'Fail' ? 'red' : 'green'}"><b>Position:</b> ${position}</span>
</div>

    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Total</th>
          <th>Highest</th>
          <th>Obtained</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr>
          <th>Total</th>
          <th>${studentSubjects.length * 100}</th>
          <th>${highestTotal}</th>
          <th>${totalMarks}</th>
        </tr>
      </tbody>
    </table>

    <div class="gpa-row">
  <span style="color: ${status === 'Fail' ? 'red' : 'green'}"><b>GPA:</b> ${gpa}</span>
  <span style="color: blue"><b>
  Percentage :
  ${Number(((totalMarks / (studentSubjects.length * 100)) * 100).toFixed(2))}%
</span>

</div>
<br>
    <div class="footer-row">

<span><b>Date:</b> ${new Date().toLocaleDateString()}</span>
<span><b>Verified By:</b> Principal</span>
  </div>`;
}


async function compareStudents() {
  const cls = document.getElementById("classSelect").value;
  const term = document.getElementById("termSelect").value;
  const roll1 = document.getElementById("rollCompare1").value;
  const roll2 = document.getElementById("rollCompare2").value;
  const compareDiv = document.getElementById("compareResult");

  if (!cls || !term || !roll1 || !roll2) {
    compareDiv.innerHTML = `<div class="alert alert-danger">All fields required for comparison</div>`;
    return;
  }

  const res = await fetch(sheetLinks[cls]);
  const text = await res.text();
  const rows = text.trim().split("\n").slice(1);

  let student1 = {};
  let student2 = {};
  let subjectsSet = new Set();

  rows.forEach(r => {
    const c = r.split(",");
    if (c[5] !== term) return; // skip other terms
    const subject = c[6];
    subjectsSet.add(subject);

    if (c[0] == roll1) student1[subject] = Number(c[7]);
    if (c[0] == roll2) student2[subject] = Number(c[7]);
  });

  if (!Object.keys(student1).length || !Object.keys(student2).length) {
    compareDiv.innerHTML = `<div class="alert alert-warning">One or both students not found</div>`;
    return;
  }

  // Build table
  let tableRows = "";
  subjectsSet.forEach(sub => {
    const m1 = student1[sub] ?? 0;
    const m2 = student2[sub] ?? 0;

    let s1Class = m1 > m2 ? "bg-success text-white" : m1 < m2 ? "bg-danger text-white" : "";
    let s2Class = m2 > m1 ? "bg-success text-white" : m2 < m1 ? "bg-danger text-white" : "";

    tableRows += `
      <tr>
        <td>${sub}</td>
        <td class="${s1Class}">${m1}</td>
        <td class="${s2Class}">${m2}</td>
      </tr>`;
  });

  // Total marks
  const total1 = Object.values(student1).reduce((a,b)=>a+b,0);
  const total2 = Object.values(student2).reduce((a,b)=>a+b,0);

  let total1Class = total1 > total2 ? "bg-success text-white" : total1 < total2 ? "bg-danger text-white" : "";
  let total2Class = total2 > total1 ? "bg-success text-white" : total2 < total1 ? "bg-danger text-white" : "";

  tableRows += `
    <tr>
      <th>Total</th>
      <th class="${total1Class}">${total1}</th>
      <th class="${total2Class}">${total2}</th>
    </tr>`;

  compareDiv.innerHTML = `
  <div class="marksheet">
    <h5 class="text-center">Student Comparison</h5>
    <table class="table table-bordered text-center">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Roll ${roll1}</th>
          <th>Roll ${roll2}</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>`;
}


// Show/Hide Compare Section
document.getElementById("showCompareBtn").addEventListener("click", function() {
    const section = document.getElementById("compareSection");
    if (section.style.display === "none") {
        section.style.display = "block";
        this.innerText = "Hide Compare Section";
        this.classList.remove("btn-warning");
        this.classList.add("btn-danger");
    } else {
        section.style.display = "none";
        this.innerText = "Compare Students";
        this.classList.remove("btn-danger");
        this.classList.add("btn-warning");
    }
});
