/* Все вызовы gtag("event", ...) собраны в этом файле. */
(function () {
  var PARAMS = [
    "button_name",
    "page_section",
    "subject",
    "exam_year",
    "primary_score",
    "test_score",
    "tariff_name",
    "tariff_price",
    "contact_type",
    "messenger",
    "network",
    "teacher_id",
    "promo_code",
    "field_name",
    "error_type",
    "lead_subject",
    "lead_role",
    "lead_source",
    "score"
  ];

  function track(name, params) {
    var clean = {};
    var source = params || {};
    var i;
    for (i = 0; i < PARAMS.length; i += 1) {
      var key = PARAMS[i];
      if (source[key] === undefined || source[key] === null || source[key] === "") continue;
      clean[key] = String(source[key]).slice(0, 100);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", name, clean);
    }
  }

  function paramsFrom(el) {
    var out = {};
    var i;
    for (i = 0; i < PARAMS.length; i += 1) {
      var key = PARAMS[i];
      var value = el.getAttribute("data-" + key.split("_").join("-"));
      if (value) out[key] = value;
    }
    return out;
  }

  document.addEventListener("click", function (event) {
    var el = event.target.closest("[data-event]");
    if (!el || el.getAttribute("data-track") === "manual") return;
    track(el.getAttribute("data-event"), paramsFrom(el));
  });

  window.vbTrack = track;
})();
