/* Условная шкала: итоговый балл = округление 100 × (первичный / максимум) ^ 0.9 */
(function () {
  var MAX = {
    math_profile: 32,
    math_base: 21,
    russian: 50,
    informatics: 29,
    social: 58,
    physics: 45,
    english: 82
  };

  var subject = document.getElementById("score-subject");
  var primary = document.getElementById("primary-score");
  var out = document.getElementById("test-score");
  var hint = document.getElementById("score-hint");
  var button = document.getElementById("score-btn");
  if (!subject || !button) return;

  function updateHint() {
    var max = MAX[subject.value];
    hint.textContent = max ? "Первичный балл от 0 до " + max + "." : "Сначала выберите предмет.";
  }

  subject.addEventListener("change", updateHint);
  updateHint();

  button.addEventListener("click", function () {
    var max = MAX[subject.value];
    var value = Number(primary.value);
    if (primary.value.trim() === "" || !max || !Number.isInteger(value) || value < 0 || value > max) {
      out.textContent = "—";
      hint.textContent = max ? "Введите целое число от 0 до " + max + "." : "Сначала выберите предмет.";
      return;
    }
    var test = Math.round(100 * Math.pow(value / max, 0.9));
    out.textContent = String(test);
    if (typeof window.vbTrack === "function") {
      window.vbTrack("score_calc", {
        subject: subject.value,
        primary_score: value,
        test_score: test
      });
    }
  });
})();
