/* Задания составлены исполнителем по формату краткого ответа открытого банка ФИПИ. */
(function () {
  var BANK = {
    math: [
      ["Периметр квадрата равен 36. Найдите его площадь.", "81", "Сторона квадрата 36 / 4 = 9. Площадь 9 × 9 = 81."],
      ["В равнобедренном треугольнике угол при вершине равен 40°. Найдите угол при основании.", "70", "Два угла при основании равны. (180 − 40) / 2 = 70."],
      ["Товар стоил 2500 рублей. Цену снизили на 20 %. Сколько стоит товар теперь?", "2000", "20 % от 2500 — это 500. 2500 − 500 = 2000."],
      ["Найдите значение выражения 3 в 4-й степени.", "81", "3 × 3 × 3 × 3 = 81."],
      ["Катеты прямоугольного треугольника равны 5 и 12. Найдите гипотенузу.", "13", "По теореме Пифагора: корень из 25 + 144 равен 13."],
      ["Сколько процентов составляет 18 от 72?", "25", "18 / 72 = 0,25, то есть 25 %."],
      ["Найдите среднее арифметическое чисел 7, 9 и 14.", "10", "(7 + 9 + 14) / 3 = 10."],
      ["Решите уравнение 5x − 10 = 25.", "7", "5x = 35, x = 7."]
    ],
    russian: [
      ["Вставьте пропущенную букву и запишите слово: бе...опасность.", "безопасность", "Приставка без- пишется с буквой з перед гласной."],
      ["Вставьте пропущенную букву и запишите слово: пр...дложение.", "предложение", "Приставка пред-."],
      ["Сколько слогов в слове «информатика»?", "5", "ин-фор-ма-ти-ка — пять слогов."],
      ["Укажите номер ударного слога в слове «квартал».", "2", "Нормативное ударение: кварта́л, второй слог."],
      ["Вставьте пропущенную букву и запишите слово: изл...гать.", "излагать", "В корне лаг пишется а."],
      ["Сколько корней в слове «подоконник»?", "1", "Корень один: окон. Под- — приставка, -ник — суффикс."],
      ["Вставьте буквы и запишите слово: стекля...ый.", "стеклянный", "В прилагательном стеклянный пишется нн."],
      ["Сколько звуков в слове «юла»?", "4", "юла произносится как [йула]: четыре звука."]
    ],
    informatics: [
      ["Переведите двоичное число 1101 в десятичную систему.", "13", "8 + 4 + 1 = 13."],
      ["Переведите десятичное число 25 в двоичную систему.", "11001", "25 = 16 + 8 + 1, поэтому 11001."],
      ["Сколько байт в 2 Кбайтах, если 1 Кбайт = 1024 байта?", "2048", "2 × 1024 = 2048."],
      ["Сколько различных значений можно закодировать 7 битами?", "128", "2 в 7-й степени = 128."],
      ["Вычислите побитовое И: 15 AND 7.", "7", "01111 и 00111 дают 00111, то есть 7."],
      ["Сколько единиц в двоичной записи числа 255?", "8", "255 — это восемь единиц: 11111111."],
      ["Сообщение из 4 символов кодируется алфавитом из 8 символов равными кодами. Сколько бит оно занимает?", "12", "Один символ — 3 бита, четыре символа — 12 бит."],
      ["Чему равно 2 в 10-й степени?", "1024", "2^10 = 1024."]
    ]
  };

  var startScreen = document.getElementById("diag-start");
  if (!startScreen) return;

  var run = document.getElementById("diag-run");
  var done = document.getElementById("diag-done");
  var subjectSelect = document.getElementById("diag-subject");
  var startBtn = document.getElementById("diag-start-btn");
  var text = document.getElementById("diag-text");
  var answer = document.getElementById("diag-answer");
  var next = document.getElementById("diag-next");
  var progress = document.getElementById("diag-progress");
  var review = document.getElementById("diag-review");
  var total = document.getElementById("diag-total");
  var copyBtn = document.getElementById("promo-copy");
  var copyNote = document.getElementById("promo-note");

  var subject = "";
  var tasks = [];
  var index = 0;
  var points = 0;
  var report = [];

  function norm(value) {
    return String(value).replace(/\s+/g, "").replace(/ё/g, "е").toLowerCase();
  }

  function same(user, correct) {
    var a = norm(user);
    var b = norm(correct);
    if (/^-?\d+$/.test(a) && /^-?\d+$/.test(b)) return String(parseInt(a, 10)) === String(parseInt(b, 10));
    return a === b;
  }

  function showTask() {
    progress.textContent = "Задание " + (index + 1) + " из 8";
    text.textContent = tasks[index][0];
    answer.value = "";
    answer.focus();
    next.textContent = index === 7 ? "Завершить" : "Дальше";
  }

  startBtn.addEventListener("click", function () {
    subject = subjectSelect.value;
    if (!subject) {
      subjectSelect.classList.add("is-invalid");
      document.getElementById("diag-error").textContent = "Сначала выберите предмет.";
      return;
    }
    document.getElementById("diag-error").textContent = "";
    subjectSelect.classList.remove("is-invalid");
    tasks = BANK[subject];
    index = 0;
    points = 0;
    report = [];
    startScreen.classList.add("hidden");
    done.classList.add("hidden");
    run.classList.remove("hidden");
    if (typeof window.vbTrack === "function") window.vbTrack("diagnostic_start", { subject: subject });
    showTask();
  });

  next.addEventListener("click", function () {
    var task = tasks[index];
    var user = answer.value.trim();
    if (!user) {
      answer.classList.add("is-invalid");
      return;
    }
    answer.classList.remove("is-invalid");
    var correct = same(user, task[1]);
    if (correct) points += 1;
    report.push({ n: index + 1, ok: correct, your: user, right: task[1], why: task[2] });
    if (index < 7) {
      index += 1;
      showTask();
      return;
    }
    run.classList.add("hidden");
    done.classList.remove("hidden");
    total.textContent = points + " из 8";
    review.innerHTML = "";
    report.forEach(function (item) {
      var block = document.createElement("article");
      var heading = document.createElement("h3");
      var verdict = document.createElement("p");
      var why = document.createElement("p");
      block.className = "task";
      heading.textContent = "Задание " + item.n;
      verdict.className = item.ok ? "ok" : "bad";
      verdict.textContent = (item.ok ? "Верно" : "Неверно") + ". Ваш ответ: " + item.your + ". Ответ: " + item.right + ".";
      why.textContent = item.why;
      block.appendChild(heading);
      block.appendChild(verdict);
      block.appendChild(why);
      review.appendChild(block);
    });
    if (typeof window.vbTrack === "function") {
      window.vbTrack("diagnostic_complete", { subject: subject, score: points });
    }
  });

  copyBtn.addEventListener("click", function () {
    var code = "BALL10";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function () {
        copyNote.textContent = "Промокод скопирован.";
      });
    } else {
      copyNote.textContent = "Промокод: BALL10";
    }
    if (typeof window.vbTrack === "function") window.vbTrack("promo_copy", { promo_code: code });
  });
})();
