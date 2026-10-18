(function () {
  'use strict';

  function validateExam(exam) {
    if (!exam || typeof exam.id !== 'string' || !Array.isArray(exam.questions) || exam.questions.length !== 50) {
      throw new Error('시험 자료의 문항 수가 올바르지 않습니다.');
    }
    exam.questions.forEach(function (q, index) {
      if (q.number !== index + 1 || !Number.isInteger(q.answer) || q.answer < 1 || q.answer > 5 || ![1, 2, 3].includes(q.points)) {
        throw new Error('시험 자료의 정답 또는 배점이 올바르지 않습니다.');
      }
    });
    if (exam.questions.reduce(function (total, q) { return total + q.points; }, 0) !== 100) {
      throw new Error('시험 자료의 총점이 100점이 아닙니다.');
    }
    return exam;
  }

  function normalizeAnswers(values, count) {
    return Array.from({ length: count }, function (_, index) {
      const value = Array.isArray(values) ? values[index] : null;
      return Number.isInteger(value) && value >= 0 && value <= 5 ? value : null;
    });
  }

  function gradeAnswers(exam, values) {
    validateExam(exam);
    const answers = normalizeAnswers(values, exam.questions.length);
    if (answers.some(function (value) { return value === null; })) {
      throw new Error('모든 문항에 답을 선택해 주세요.');
    }
    const rows = exam.questions.map(function (q, index) {
      const correct = answers[index] === q.answer;
      return { number: q.number, chosen: answers[index], answer: q.answer, points: q.points, earned: correct ? q.points : 0, correct: correct };
    });
    const score = rows.reduce(function (sum, row) { return sum + row.earned; }, 0);
    return {
      score: score,
      grade: score >= 80 ? 1 : score >= 70 ? 2 : score >= 60 ? 3 : null,
      correctCount: rows.filter(function (row) { return row.correct; }).length,
      rows: rows
    };
  }

  const logic = { validateExam: validateExam, normalizeAnswers: normalizeAnswers, gradeAnswers: gradeAnswers };
  if (typeof module !== 'undefined' && module.exports) module.exports = logic;
  if (typeof document === 'undefined') return;

  const root = document.getElementById('history-exam');
  if (!root) return;
  const get = function (id) { return document.getElementById(id); };
  const sheet = get('answer-sheet');
  const message = get('exam-message');
  const result = get('exam-result');
  const gradeButton = get('grade-button');
  const resetButton = get('reset-button');
  const symbols = ['모르겠음', '①', '②', '③', '④', '⑤'];
  let exam;
  let answers;
  let storageKey;
  let wrongOnly = false;
  let lastResult = null;

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ examId: exam.id, answers: answers }));
      get('save-status').textContent = '답안 자동 저장됨 · 같은 기기·브라우저에서 이어 풀 수 있습니다.';
    } catch (_) {
      get('save-status').textContent = '이 브라우저에서는 자동 저장을 사용할 수 없습니다. 페이지를 닫기 전에 풀이를 마쳐 주세요.';
    }
  }

  function restore() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (stored && stored.examId === exam.id) return normalizeAnswers(stored.answers, 50);
    } catch (_) {
      get('save-status').textContent = '저장된 답안을 읽지 못했습니다. 현재 페이지에서는 정상적으로 풀 수 있습니다.';
    }
    return normalizeAnswers([], 50);
  }

  function updateProgress() {
    const count = answers.filter(function (value) { return value !== null; }).length;
    get('answered-count').textContent = count + ' / 50문항 선택' + (count === 50 ? ' · 채점 완료' : ' · ' + (50 - count) + '문항 남음');
    get('answer-progress').value = count;
    sheet.querySelectorAll('fieldset').forEach(function (card, index) {
      card.classList.toggle('is-answered', answers[index] !== null);
    });
    return count;
  }

  function drawRows() {
    const body = get('result-rows');
    body.replaceChildren();
    lastResult.rows.filter(function (row) { return !wrongOnly || !row.correct; }).forEach(function (row) {
      const tr = document.createElement('tr');
      tr.className = row.correct ? 'result-correct' : 'result-wrong';
      const questionCell = document.createElement('th');
      questionCell.scope = 'row';
      const link = document.createElement('a');
      link.href = '#question-' + row.number;
      link.textContent = row.number + '번';
      questionCell.append(link);
      tr.append(questionCell);
      [symbols[row.chosen], symbols[row.answer], row.correct ? '정답' : '오답', row.earned + ' / ' + row.points + '점'].forEach(function (value) {
        const td = document.createElement('td');
        td.textContent = value;
        tr.append(td);
      });
      body.append(tr);
    });
    get('wrong-summary').textContent = lastResult.correctCount === 50 ? '모든 문항을 맞혔습니다.' : '틀렸거나 모르겠음으로 표시한 문항: ' + lastResult.rows.filter(function (row) { return !row.correct; }).map(function (row) { return row.number + '번'; }).join(', ');
  }

  function showResult(scroll) {
    lastResult = gradeAnswers(exam, answers);
    get('score-text').textContent = lastResult.score + '점 / 100점';
    get('grade-text').textContent = lastResult.grade === 1 ? '1급 기준 충족! (80점 이상)' : lastResult.grade ? lastResult.grade + '급 기준 · 1급까지 ' + (80 - lastResult.score) + '점 남았습니다.' : '인증 기준 미달 · 1급까지 ' + (80 - lastResult.score) + '점 남았습니다.';
    get('correct-text').textContent = '정답 ' + lastResult.correctCount + ' / 50문항 · 오답 ' + (50 - lastResult.correctCount) + '문항';
    lastResult.rows.forEach(function (row) {
      const card = get('question-' + row.number);
      card.classList.toggle('is-correct', row.correct);
      card.classList.toggle('is-wrong', !row.correct);
      get('feedback-' + row.number).textContent = row.correct ? '정답 · ' + row.points + '점 획득' : '오답 · 정답 ' + symbols[row.answer] + ' · 0 / ' + row.points + '점';
    });
    drawRows();
    result.hidden = false;
    get('result-jump').hidden = false;
    gradeButton.textContent = '채점 결과 보기';
    if (scroll) {
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function requestGrade() {
    const missing = answers.flatMap(function (value, index) { return value === null ? [index + 1] : []; });
    if (missing.length) {
      message.textContent = '아직 ' + missing.length + '문항을 선택하지 않았습니다: ' + missing.map(function (number) { return number + '번'; }).join(', ');
      const first = get('question-' + missing[0]);
      first.querySelector('input').focus({ preventScroll: true });
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    message.textContent = '';
    showResult(true);
  }

  function renderQuestions() {
    const fragment = document.createDocumentFragment();
    exam.questions.forEach(function (q, index) {
      const card = document.createElement('fieldset');
      card.id = 'question-' + q.number;
      card.className = 'answer-card';
      const legend = document.createElement('legend');
      legend.textContent = q.number + '번 · ' + q.points + '점';
      card.append(legend);
      const options = document.createElement('div');
      options.className = 'answer-options';
      [1, 2, 3, 4, 5, 0].forEach(function (value) {
        const label = document.createElement('label');
        label.className = value === 0 ? 'answer-option answer-skip' : 'answer-option';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'question-' + q.number;
        radio.value = value;
        radio.checked = answers[index] === value;
        radio.setAttribute('aria-label', q.number + '번 ' + symbols[value]);
        const text = document.createElement('span');
        text.textContent = symbols[value];
        label.append(radio, text);
        options.append(label);
      });
      const feedback = document.createElement('p');
      feedback.id = 'feedback-' + q.number;
      feedback.className = 'answer-feedback';
      card.append(options, feedback);
      fragment.append(card);
    });
    sheet.replaceChildren(fragment);
    sheet.setAttribute('aria-busy', 'false');
  }

  sheet.addEventListener('change', function (event) {
    if (!event.target.matches('input[type="radio"]')) return;
    const number = Number(event.target.name.slice('question-'.length));
    answers[number - 1] = Number(event.target.value);
    message.textContent = '';
    save();
    if (updateProgress() === 50) showResult(lastResult === null);
  });
  gradeButton.addEventListener('click', requestGrade);
  get('wrong-toggle').addEventListener('click', function () {
    wrongOnly = !wrongOnly;
    this.setAttribute('aria-pressed', String(wrongOnly));
    this.textContent = wrongOnly ? '전체 문항 보기' : '오답만 보기';
    drawRows();
  });
  resetButton.addEventListener('click', function () {
    if (!window.confirm('현재 답안과 채점 결과를 지우고 처음부터 다시 풀까요?')) return;
    answers = normalizeAnswers([], 50);
    lastResult = null;
    wrongOnly = false;
    try { localStorage.removeItem(storageKey); } catch (_) { /* Continue without storage. */ }
    result.hidden = true;
    get('result-jump').hidden = true;
    get('wrong-toggle').textContent = '오답만 보기';
    get('wrong-toggle').setAttribute('aria-pressed', 'false');
    gradeButton.textContent = '답안 확인·채점하기';
    message.textContent = '';
    get('save-status').textContent = '답안이 초기화되었습니다. 다시 시작하세요.';
    renderQuestions();
    updateProgress();
    get('question-1').querySelector('input').focus();
  });

  fetch(root.dataset.examUrl, { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('시험 자료를 불러오지 못했습니다.');
      return response.json();
    })
    .then(function (data) {
      exam = validateExam(data);
      storageKey = 'study-journal:' + exam.id;
      answers = restore();
      renderQuestions();
      gradeButton.disabled = false;
      resetButton.disabled = false;
      if (updateProgress() === 50) showResult(false);
    })
    .catch(function () {
      sheet.setAttribute('aria-busy', 'false');
      get('answered-count').textContent = '답안 준비 실패';
      message.textContent = '시험 자료를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 새로고침해 주세요. 공식 문제지 링크는 계속 이용할 수 있습니다.';
    });
})();
