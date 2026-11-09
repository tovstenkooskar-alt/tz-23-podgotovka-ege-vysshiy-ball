(function () {
  var ROWS = [
    { subject: "math_profile", year: "2026", label: "Математика, профиль", score: 74 },
    { subject: "russian", year: "2026", label: "Русский язык", score: 81 },
    { subject: "informatics", year: "2026", label: "Информатика", score: 77 },
    { subject: "social", year: "2026", label: "Обществознание", score: 69 }
  ];

  var subject = document.getElementById("filter-subject");
  var year = document.getElementById("filter-year");
  var body = document.getElementById("results-body");
  var chart = document.getElementById("results-chart");
  var empty = document.getElementById("results-empty");
  if (!subject || !body) return;

  function draw() {
    var picked = ROWS.filter(function (row) {
      var subjectOk = subject.value === "all" || row.subject === subject.value;
      var yearOk = year.value === "all" || row.year === year.value;
      return subjectOk && yearOk;
    });
    body.innerHTML = "";
    chart.innerHTML = "";
    empty.hidden = picked.length > 0;
    picked.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML = "<td>" + row.label + "</td><td>" + row.year + "</td><td>" + row.score + "</td>";
      body.appendChild(tr);
      var item = document.createElement("div");
      item.className = "bar-row";
      item.innerHTML = "<span>" + row.label + " — " + row.score + "</span><div class=\"bar\"><span style=\"width:" + row.score + "%\"></span></div>";
      chart.appendChild(item);
    });
    if (typeof window.vbTrack === "function") {
      window.vbTrack("results_filter", {
        subject: subject.value,
        exam_year: year.value
      });
    }
  }

  subject.addEventListener("change", draw);
  year.addEventListener("change", draw);
  empty.hidden = true;
  body.innerHTML = "";
  ROWS.forEach(function (row) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td>" + row.label + "</td><td>" + row.year + "</td><td>" + row.score + "</td>";
    body.appendChild(tr);
    var item = document.createElement("div");
    item.className = "bar-row";
    item.innerHTML = "<span>" + row.label + " — " + row.score + "</span><div class=\"bar\"><span style=\"width:" + row.score + "%\"></span></div>";
    chart.appendChild(item);
  });
})();
