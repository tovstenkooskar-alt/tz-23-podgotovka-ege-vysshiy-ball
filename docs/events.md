# События

Единственный вызов `gtag('event', …)` — `js/analytics.js`, строка 35, функция `track`. Клики с атрибутом `data-event` доходят туда со строки 50. События калькулятора, фильтра, диагностики, промокода, ошибки формы и `generate_lead` вызывают `window.vbTrack`, а тот вызывает `track`.

Идентификатор `G-XXXXXXXXXX` стоит в каждой странице, строки 20–24. Его нужно заменить на идентификатор ресурса GA4. Пока ресурс не создан, DebugView снять нельзя.

| Событие | Где | Параметры и пример |
| --- | --- | --- |
| page_view | автоматически, расширенная статистика | page_location = адрес страницы, page_title = title |
| scroll | автоматически | percent_scrolled = 90 |
| click | автоматически, внешняя ссылка | link_url = https://t.me/vysshiy_ball_nabor, outbound = true |
| file_download | автоматически, ссылка `subjects.html` на `files/programma.pdf` | file_name = programma.pdf, file_extension = pdf |
| form_start | автоматически, первое поле формы `#lead-form` | form_id = lead-form |
| form_submit | автоматически, отправка `#lead-form` | form_id = lead-form |
| generate_lead | `js/form.js`, строка 186, только после ответа `{ok: true}` | lead_subject = russian, lead_role = parent, lead_source = instagram |
| cta_click | `index.html` 50–51, `subjects.html` 60, `diagnostic.html` 72 | button_name = hero_trial, page_section = hero |
| subject_select | `index.html` 65–70, `subjects.html` 48–53 | subject = informatics |
| results_filter | `js/results.js`, строка 35 | subject = russian, exam_year = 2026 |
| score_calc | `js/score.js`, строка 39 | subject = math_profile, primary_score = 16, test_score = 55 |
| diagnostic_start | `js/diagnostic.js`, строка 93 | subject = math |
| diagnostic_complete | `js/diagnostic.js`, строка 133 | subject = math, score = 8 |
| select_tariff | `prices.html` 52, 58, 64 | tariff_name = group, tariff_price = 6400 |
| contact_click | шапка и подвал каждой страницы | contact_type = phone или email |
| messenger_click | `contacts.html` 118–119 | messenger = telegram или whatsapp |
| social_click | подвал каждой страницы и блок на `thanks.html` | network = vk, page_section = footer или thanks |
| form_error | `js/form.js`, строка 45 | field_name = phone, error_type = format; при сбое приёмника error_type = server |
| teacher_view | `teachers.html`, карточки преподавателей | teacher_id = orlova, subject = informatics |
| promo_copy | `js/diagnostic.js`, строка 146 | promo_code = BALL10 |

Пользовательские параметры для регистрации в GA4: `button_name`, `page_section`, `subject`, `score`, `lead_role`, `lead_subject`, `messenger`.

Ключевые события, которые нужно отметить в ресурсе и никакие другие: `generate_lead`, `contact_click`, `messenger_click`.
