/**
 * Приёмник заявок центра «Высший балл».
 * Публикация: Развернуть → Веб-приложение, выполнять от имени владельца,
 * доступ «Все». В js/config.js вставляется адрес, который заканчивается на /exec.
 */
var SPREADSHEET_ID = "PASTE_SPREADSHEET_ID";
var SHEET_NAME = "leads";

var SUBJECTS = ["math_profile", "math_base", "russian", "informatics", "social", "physics", "english"];
var ROLES = ["student", "parent"];
var GRADES = ["9", "10", "11", "graduate"];
var HEADERS = [
  "request_id", "created_at", "name", "phone", "email", "lead_role", "subject", "grade",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "status"
];

function doGet() {
  return json_({ ok: true, service: "leads" });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var data = JSON.parse(e.postData.contents);
    var error = validate_(data);
    if (error) return json_(error);
    var sheet = sheet_();
    if (hasRequest_(sheet, data.request_id)) {
      return json_({
        ok: false,
        field: "request_id",
        error_type: "duplicate",
        error: "Заявка с таким номером уже есть."
      });
    }
    var created = Utilities.formatDate(new Date(), "Europe/Moscow", "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([
      data.request_id,
      created,
      safe_(data.name),
      data.phone,
      data.email ? safe_(data.email) : "",
      data.lead_role,
      data.subject,
      String(data.grade),
      data.utm_source || "direct",
      data.utm_medium || "none",
      data.utm_campaign || "not_set",
      data.utm_content || "not_set",
      "new"
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, field: "form", error_type: "server", error: "Приёмник не записал заявку." });
  } finally {
    lock.releaseLock();
  }
}

function validate_(data) {
  if (!data || typeof data !== "object") {
    return { ok: false, field: "form", error_type: "server", error: "Пустой запрос." };
  }
  if (data.consent !== true) {
    return { ok: false, field: "consent", error_type: "required", error: "Нет согласия на обработку данных." };
  }
  if (!/^REQ-[0-9a-fA-F-]{36}$/.test(data.request_id || "")) {
    return { ok: false, field: "request_id", error_type: "format", error: "Некорректный номер заявки." };
  }
  if (!inLength_(data.name, 2, 60)) {
    return { ok: false, field: "name", error_type: "format", error: "Имя: от 2 до 60 символов." };
  }
  if (!/^\+7\d{10}$/.test(data.phone || "")) {
    return { ok: false, field: "phone", error_type: "format", error: "Телефон: +7 и 10 цифр." };
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, field: "email", error_type: "format", error: "Некорректная почта." };
  }
  if (ROLES.indexOf(data.lead_role) === -1) {
    return { ok: false, field: "lead_role", error_type: "choice", error: "Укажите ученика или родителя." };
  }
  if (SUBJECTS.indexOf(data.subject) === -1) {
    return { ok: false, field: "subject", error_type: "choice", error: "Неизвестный предмет." };
  }
  if (GRADES.indexOf(String(data.grade)) === -1) {
    return { ok: false, field: "grade", error_type: "choice", error: "Неизвестный класс." };
  }
  var keys = ["name", "phone", "email", "request_id", "utm_source", "utm_medium", "utm_campaign", "utm_content"];
  for (var i = 0; i < keys.length; i++) {
    if (data[keys[i]] && String(data[keys[i]]).length > 200) {
      return { ok: false, field: keys[i], error_type: "format", error: "Слишком длинное значение." };
    }
  }
  return null;
}

function sheet_() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Нет листа leads");
  return sheet;
}

function hasRequest_(sheet, requestId) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === requestId) return true;
  }
  return false;
}

function inLength_(value, min, max) {
  var text = String(value || "").trim();
  return text.length >= min && text.length <= max;
}

function safe_(value) {
  var text = String(value || "").trim();
  if (/^[=+\-@]/.test(text)) return "'" + text;
  return text;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Запускается один раз из редактора Apps Script: создаёт лист, проверки и подсветку. */
function setupSheet() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  spreadsheet.setSpreadsheetTimeZone("Europe/Moscow");
  var sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
  sheet.setFrozenRows(1);
  var listRule = function (values) {
    return SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  };
  sheet.getRange("F2:F").setDataValidation(listRule(ROLES));
  sheet.getRange("G2:G").setDataValidation(listRule(SUBJECTS));
  sheet.getRange("H2:H").setDataValidation(listRule(GRADES));
  sheet.getRange("M2:M").setDataValidation(listRule(["new", "contacted", "registered", "mock_done", "paid", "lost"]));
  sheet.setConditionalFormatRules([]);
  var rules = [];
  var columns = ["A", "B", "C", "D", "F", "G", "H", "I", "J", "K", "L", "M"];
  for (var i = 0; i < columns.length; i++) {
    var col = columns[i];
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($A2<>"";' + col + '2="")')
      .setBackground("#f4c7c3")
      .setRanges([sheet.getRange(col + "2:" + col)])
      .build());
  }
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(A2<>"";COUNTIF($A$2:$A;A2)>1)')
    .setBackground("#fce8b2")
    .setRanges([sheet.getRange("A2:A")])
    .build());
  sheet.setConditionalFormatRules(rules);
  sheet.autoResizeColumns(1, HEADERS.length);
}
