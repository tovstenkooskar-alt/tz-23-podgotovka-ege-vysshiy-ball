/* Метки UTM сохраняются на всём сайте. Форма заявки отправляет их в приёмник. */
(function () {
  var UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
  var DEFAULTS = {
    utm_source: "direct",
    utm_medium: "none",
    utm_campaign: "not_set",
    utm_content: "not_set"
  };

  function captureUtm() {
    var query = new URLSearchParams(window.location.search);
    UTM.forEach(function (key) {
      var value = (query.get(key) || "").trim();
      if (value) sessionStorage.setItem("vb_" + key, value.slice(0, 100));
    });
  }

  function storedUtm() {
    var out = {};
    UTM.forEach(function (key) {
      out[key] = sessionStorage.getItem("vb_" + key) || DEFAULTS[key];
    });
    return out;
  }

  function showError(field, text) {
    var input = document.getElementById(field);
    var box = document.querySelector('[data-error-for="' + field + '"]');
    if (input) input.classList.add("is-invalid");
    if (box) box.textContent = text;
  }

  function clearErrors(form) {
    form.querySelectorAll(".is-invalid").forEach(function (el) {
      el.classList.remove("is-invalid");
    });
    form.querySelectorAll(".field-error").forEach(function (el) {
      el.textContent = "";
    });
  }

  function trackError(field, type) {
    if (typeof window.vbTrack === "function") {
      window.vbTrack("form_error", { field_name: field, error_type: type });
    }
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function normalizePhone(value) {
    var digits = value.replace(/\D/g, "");
    if (digits.length === 11 && digits.charAt(0) === "8") digits = "7" + digits.slice(1);
    if (digits.length === 11 && digits.charAt(0) === "7") return "+" + digits;
    return "";
  }

  captureUtm();

  var requestBox = document.querySelector("[data-request-id]");
  if (requestBox) {
    var fromQuery = new URLSearchParams(window.location.search).get("request_id");
    requestBox.textContent = fromQuery || sessionStorage.getItem("vb_request_id") || "номер появится после отправки";
  }

  var form = document.querySelector("#lead-form");
  if (!form) return;

  var role = document.getElementById("lead_role");
  var adultWrap = document.getElementById("adult-wrap");

  function toggleAdult() {
    var isStudent = role.value === "student";
    adultWrap.classList.toggle("hidden", !isStudent);
  }

  role.addEventListener("change", toggleAdult);
  toggleAdult();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors(form);

    var name = document.getElementById("name").value.trim();
    var phone = normalizePhone(document.getElementById("phone").value);
    var email = document.getElementById("email").value.trim();
    var leadRole = role.value;
    var subject = document.getElementById("subject").value;
    var grade = document.getElementById("grade").value;
    var consent = document.getElementById("consent").checked;
    var adult = document.getElementById("adult").checked;
    var errorField = "";
    var errorType = "";
    var errorText = "";

    if (name.length < 2 || name.length > 60) {
      errorField = "name";
      errorType = "format";
      errorText = "Имя: от 2 до 60 символов.";
    } else if (!phone) {
      errorField = "phone";
      errorType = "format";
      errorText = "Телефон в формате +7 и ещё 10 цифр.";
    } else if (email && !validEmail(email)) {
      errorField = "email";
      errorType = "format";
      errorText = "Проверьте адрес почты или оставьте поле пустым.";
    } else if (!leadRole) {
      errorField = "lead_role";
      errorType = "required";
      errorText = "Выберите, кто оставляет заявку.";
    } else if (leadRole === "student" && !adult) {
      errorField = "adult";
      errorType = "required";
      errorText = "Если вам нет 18 лет, заявку оставляет родитель.";
    } else if (!subject) {
      errorField = "subject";
      errorType = "required";
      errorText = "Выберите предмет.";
    } else if (!grade) {
      errorField = "grade";
      errorType = "required";
      errorText = "Выберите класс.";
    } else if (!consent) {
      errorField = "consent";
      errorType = "required";
      errorText = "Нужно согласие на обработку персональных данных.";
    }

    if (errorField) {
      showError(errorField, errorText);
      trackError(errorField, errorType);
      return;
    }

    var utm = storedUtm();
    var requestId = "REQ-" + crypto.randomUUID();
    var payload = {
      request_id: requestId,
      name: name,
      phone: phone,
      email: email,
      lead_role: leadRole,
      subject: subject,
      grade: grade,
      consent: true,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content
    };

    UTM.forEach(function (key) {
      document.getElementById(key).value = utm[key];
    });
    document.getElementById("request_id").value = requestId;

    var button = form.querySelector("[type=submit]");
    var endpoint = window.VB_LEAD_ENDPOINT || "";
    button.disabled = true;

    if (!endpoint) {
      showError("form", "Приём заявок ещё не подключён. Адрес Apps Script пустой.");
      trackError("form", "server");
      button.disabled = false;
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (!data || data.ok !== true) {
          var field = (data && data.field) || "form";
          showError(field, (data && data.error) || "Заявку не удалось записать.");
          trackError(field, (data && data.error_type) || "server");
          button.disabled = false;
          return;
        }
        if (typeof window.vbTrack === "function") {
          window.vbTrack("generate_lead", {
            lead_subject: subject,
            lead_role: leadRole,
            lead_source: utm.utm_source
          });
        }
        sessionStorage.setItem("vb_request_id", requestId);
        window.location.href = "thanks.html?request_id=" + encodeURIComponent(requestId);
      })
      .catch(function () {
        showError("form", "Нет ответа от приёмника заявок. Попробуйте ещё раз.");
        trackError("form", "server");
        button.disabled = false;
      });
  });
})();
