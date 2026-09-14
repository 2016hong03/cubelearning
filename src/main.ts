import 'cubing/twisty';
import { beginnerLessons } from './cube.js';

const STORAGE_KEY = 'cube-note-content-v1';
const PROGRESS_KEY = 'cube-note-progress-v1';

const state = {
  view: 'learn',
  selectedLesson: 1,
  lessons: load(STORAGE_KEY, beginnerLessons).map((lesson, index) => ({ ...beginnerLessons[index], ...lesson, cases: lesson.cases ?? beginnerLessons[index].cases })),
  completed: load(PROGRESS_KEY, [])
};

function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lessons));
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.completed));
}

function currentLesson() {
  return state.lessons.find((lesson) => lesson.id === state.selectedLesson) ?? state.lessons[0];
}

function hasContent(lesson) {
  return Boolean(lesson.title || lesson.summary || lesson.body || lesson.algorithm || lesson.image || lesson.tips || lesson.practice);
}

function completedCount() {
  return state.completed.length;
}

function progressPercent() {
  return Math.round((completedCount() / state.lessons.length) * 100);
}

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function render() {
  const lesson = currentLesson();
  document.querySelector('#app').innerHTML = `
    <div class="shell">
      ${renderHeader()}
      <main class="workspace">
        ${renderSidebar()}
        <section class="content-area">
          ${state.view === 'edit' ? renderEditor(lesson) : state.view === 'lesson' ? renderLessonView(lesson) : renderLearning(lesson)}
        </section>
      </main>
      ${renderToast()}
    </div>
  `;
  bindEvents();
}

function renderHeader() {
  return `
    <header class="topbar">
      <a class="brand" href="#" data-action="home" aria-label="큐브노트 홈">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span>큐브노트</span>
      </a>
      <div class="course-label"><span class="eyebrow">현재 코스</span><strong>3x3 초급</strong></div>
      <nav class="top-actions" aria-label="주요 메뉴">
        <button class="nav-button ${state.view === 'learn' ? 'active' : ''}" data-action="learn">학습 보기</button>
        <button class="nav-button ${state.view === 'edit' ? 'active' : ''}" data-action="edit">콘텐츠 편집</button>
      </nav>
    </header>
  `;
}

function renderSidebar() {
  const menu = [
    { label: '3x3 초급', meta: `${completedCount()} / 7 완료`, active: true },
    { label: '3x3 중급', meta: '준비 중' },
    { label: '3x3 고급', meta: '준비 중' },
    { label: '2x2', meta: '준비 중' },
    { label: '4x4 이상', meta: '준비 중' }
  ];
  return `
    <aside class="sidebar">
      <div class="sidebar-heading"><span>학습 메뉴</span><span class="menu-dots">···</span></div>
      <div class="menu-list">
        ${menu.map((item) => `<button class="course-item ${item.active ? 'selected' : 'disabled'}" ${item.active ? 'data-action="home"' : 'disabled'}><span class="course-name"><span class="status-dot ${item.active ? 'on' : ''}"></span>${item.label}</span><span class="course-meta">${item.meta}</span></button>`).join('')}
      </div>
      <div class="sidebar-rule"></div>
      <div class="progress-mini">
        <div class="progress-mini-label"><span>내 진행률</span><strong>${progressPercent()}%</strong></div>
        <div class="progress-track"><span style="width: ${progressPercent()}%"></span></div>
        <p>완료한 단계는 이 브라우저에 저장됩니다.</p>
      </div>
      <div class="sidebar-note"><span class="note-pin">+</span><p>콘텐츠를 직접 채워<br />나만의 큐브 교본을 만들어보세요.</p></div>
    </aside>
  `;
}

function renderLearning(lesson) {
  const populated = hasContent(lesson);
  return `
    <div class="page-heading">
      <div><span class="eyebrow">BEGINNER / 3X3</span><h1>나의 큐브 학습</h1><p>직접 만든 콘텐츠로 차근차근 기록하고 연습해보세요.</p></div>
      <button class="outline-button" data-action="edit">콘텐츠 편집 <span aria-hidden="true">↗</span></button>
    </div>
    <div class="hero-strip">
      <div class="hero-copy"><span class="section-kicker">3x3 초급</span><h2>내 속도로 배우는<br /><em>큐브 노트</em></h2><p>아직 비어 있는 단계에 나만의 설명과 공식을 기록하세요.</p></div>
      <div class="cube-graphic" aria-hidden="true">${renderCube()}</div>
      <div class="hero-stat"><span>학습 진행률</span><strong>${progressPercent()}<small>%</small></strong><div class="hero-progress"><span style="width: ${progressPercent()}%"></span></div><small>${completedCount()} / 7 단계 완료</small></div>
    </div>
    <div class="section-heading"><div><span class="eyebrow">YOUR CURRICULUM</span><h2>7단계 학습 목록</h2></div><span class="content-status ${populated ? 'ready' : ''}">${populated ? '콘텐츠 작성 중' : '콘텐츠를 입력해주세요'}</span></div>
    <div class="lesson-grid">${state.lessons.map((item) => renderLessonCard(item)).join('')}</div>
    <div class="tool-banner"><span class="tool-icon">✎</span><div><strong>이 사이트는 학습 도구입니다</strong><p>큐브를 가르치는 내용은 직접 작성하세요. 각 단계의 편집 버튼에서 내용을 채울 수 있습니다.</p></div><button class="text-button" data-action="edit">편집 열기 <span>→</span></button></div>
  `;
}

function renderLessonView(lesson) {
  const isComplete = state.completed.includes(lesson.id);
  const previous = state.lessons.find((item) => item.id === lesson.id - 1);
  const next = state.lessons.find((item) => item.id === lesson.id + 1);
  const blocks = [
    lesson.body ? `<section class="lesson-content-block"><span class="eyebrow">LESSON NOTE</span><h2>학습 내용</h2><p class="long-copy">${escapeHtml(lesson.body)}</p></section>` : '',
    lesson.algorithm ? `<section class="lesson-content-block algorithm-section"><span class="eyebrow">MOVE / FORMULA</span><h2>공식 / 기호</h2><div class="large-algorithm"><code>${escapeHtml(lesson.algorithm)}</code><button class="copy-button" data-action="copy" data-copy="${escapeHtml(lesson.algorithm)}">복사</button></div></section>` : '',
    lesson.cases?.length ? `<section class="lesson-content-block cases-section"><span class="eyebrow">CASES</span><h2>케이스별 움직임</h2>${lesson.cases.map((item) => `<div class="case-block"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p><twisty-player experimental-setup-alg="${escapeHtml(item.setup)}" alg="${escapeHtml(lesson.algorithm)}"></twisty-player></div>`).join('')}</section>` : '',
    lesson.tips ? `<section class="lesson-content-block"><span class="eyebrow">REMEMBER</span><h2>주의할 점</h2><p class="long-copy">${escapeHtml(lesson.tips)}</p></section>` : '',
    lesson.practice ? `<section class="lesson-content-block practice-section"><span class="eyebrow">PRACTICE</span><h2>연습 체크</h2><p class="long-copy">${escapeHtml(lesson.practice)}</p></section>` : ''
  ].filter(Boolean).join('');
  return `
    <div class="lesson-detail-head"><button class="back-link" data-action="home">← 전체 단계</button><span class="eyebrow">STEP 0${lesson.id} / 3X3 BEGINNER</span><h1>${escapeHtml(lesson.title || '제목을 입력해주세요')}</h1><p>${escapeHtml(lesson.summary || '이 단계의 설명을 콘텐츠 편집에서 작성해주세요.')}</p></div>
    <div class="lesson-detail-grid">
      <article class="lesson-reading">
        ${lesson.image ? `<img class="lesson-hero-image" src="${escapeHtml(lesson.image)}" alt="${escapeHtml(lesson.title || '단계 이미지')}" />` : `<div class="detail-empty-visual"><div class="empty-cube">＋</div><p>이 단계에 이미지를 추가할 수 있습니다.</p></div>`}
        ${blocks || '<div class="empty-content"><span>✎</span><h2>아직 작성된 내용이 없습니다.</h2><p>콘텐츠 편집에서 이 단계의 설명과 공식을 입력하면 여기에 표시됩니다.</p><button class="outline-button" data-action="edit-lesson" data-id="'+lesson.id+'">이 단계 편집</button></div>'}
      </article>
      <aside class="lesson-aside"><div class="aside-label">STEP STATUS</div><div class="aside-step">0${lesson.id}<span>/ 07</span></div><button class="complete-button ${isComplete ? 'done' : ''}" data-action="toggle-complete" data-id="${lesson.id}">${isComplete ? '완료한 단계 ✓' : '이 단계 완료하기'}</button><div class="aside-rule"></div><div class="aside-label">QUICK ACTION</div><button class="aside-action" data-action="edit-lesson" data-id="${lesson.id}">내용 편집 <span>↗</span></button></aside>
    </div>
    <div class="lesson-navigation"><button class="nav-lesson" ${previous ? `data-action="open-lesson" data-id="${previous.id}"` : 'disabled'}><span>←</span><small>이전 단계</small>${previous ? escapeHtml(previous.title || `0${previous.id}단계`) : '첫 단계입니다'}</button><button class="nav-lesson next" ${next ? `data-action="open-lesson" data-id="${next.id}"` : 'disabled'}><small>다음 단계</small>${next ? escapeHtml(next.title || `0${next.id}단계`) : '마지막 단계입니다'}<span>→</span></button></div>
  `;
}

function renderLessonCard(lesson) {
  const isSelected = lesson.id === state.selectedLesson;
  const isComplete = state.completed.includes(lesson.id);
  const title = lesson.title || '제목을 입력해주세요';
  const summary = lesson.summary || '아직 작성된 학습 내용이 없습니다.';
  return `<article class="lesson-card ${isSelected ? 'current' : ''} ${isComplete ? 'complete' : ''}" data-lesson="${lesson.id}">
    <div class="card-top"><span class="step-number">0${lesson.id}</span><span class="card-state">${isComplete ? '완료' : isSelected ? '현재 단계' : '대기 중'}</span></div>
    <h3>${escapeHtml(title)}</h3><p>${escapeHtml(summary)}</p>
    <div class="card-bottom"><button class="small-button" data-action="open-lesson" data-id="${lesson.id}">학습 열기 <span>→</span></button><button class="icon-button" data-action="edit-lesson" data-id="${lesson.id}" aria-label="${lesson.id}단계 편집">✎</button></div>
  </article>`;
}

function renderLearningDetail(lesson) {
  return '';
}

function renderEditor(lesson) {
  return `
    <div class="page-heading editor-heading"><div><span class="eyebrow">CONTENT STUDIO / 3X3 BEGINNER</span><h1>콘텐츠 편집</h1><p>큐브를 가르치는 내용을 직접 입력하고 학습 화면에서 확인하세요.</p></div><button class="solid-button" data-action="save">저장하기 <span>✓</span></button></div>
    <div class="editor-layout">
      <section class="editor-panel">
        <div class="editor-panel-head"><div><span class="section-kicker">STEP 0${lesson.id}</span><h2>단계 정보 작성</h2></div><span class="autosave">브라우저에 자동 저장</span></div>
        <div class="step-picker">${state.lessons.map((item) => `<button class="step-pill ${item.id === lesson.id ? 'active' : ''} ${hasContent(item) ? 'filled' : ''}" data-action="select-lesson" data-id="${item.id}"><span>0${item.id}</span>${item.title ? escapeHtml(item.title.slice(0, 11)) : '빈 단계'}</button>`).join('')}</div>
        <form id="lesson-form" class="lesson-form">
          ${field('title', '단계 제목', lesson.title, '예: 이 단계에서 배울 내용을 적어주세요')}
          ${field('summary', '짧은 설명', lesson.summary, '목록 카드에 표시될 한 줄 설명')}
          ${field('body', '학습 내용', lesson.body, '설명, 순서, 참고할 내용을 자유롭게 적어주세요.', true)}
          <div class="form-row"><div>${field('algorithm', '공식 / 기호', lesson.algorithm, '공식이나 기호를 적어주세요')}</div><div>${field('image', '이미지 주소', lesson.image, '이미지 URL을 붙여넣으세요')}</div></div>
          <div class="form-row"><div>${field('tips', '주의할 점', lesson.tips, '실수하기 쉬운 점이나 기억할 내용을 적어주세요.', true)}</div><div>${field('practice', '연습 체크', lesson.practice, '연습 목표나 체크 항목을 적어주세요.', true)}</div></div>
        </form>
        <div class="editor-actions"><button class="ghost-button" data-action="clear-lesson">이 단계 비우기</button><button class="solid-button" data-action="save">변경사항 저장 <span>✓</span></button></div>
      </section>
      <aside class="preview-panel"><div class="preview-label"><span>LIVE PREVIEW</span><span class="live-dot">● LIVE</span></div><div class="preview-card"><span class="step-number">0${lesson.id}</span><h2>${escapeHtml(lesson.title || '단계 제목')}</h2><p class="preview-summary">${escapeHtml(lesson.summary || '짧은 설명이 여기에 표시됩니다.')}</p>${lesson.image ? `<img class="preview-image" src="${escapeHtml(lesson.image)}" alt="단계 이미지 미리보기" />` : '<div class="image-placeholder"><span>＋</span><p>이미지를 추가하면<br />여기에 표시됩니다.</p></div>'}<div class="preview-block"><span>학습 내용</span><p>${escapeHtml(lesson.body || '작성한 학습 내용이 표시됩니다.')}</p></div>${lesson.algorithm ? `<div class="algorithm-box"><span>공식 / 기호</span><code>${escapeHtml(lesson.algorithm)}</code></div>` : ''}</div></aside>
    </div>
  `;
}

function field(name, label, value, placeholder, textarea = false) {
  return `<label class="field"><span>${label}</span>${textarea ? `<textarea name="${name}" placeholder="${placeholder}">${escapeHtml(value)}</textarea>` : `<input name="${name}" value="${escapeHtml(value)}" placeholder="${placeholder}" />`}</label>`;
}

function renderCube() {
  const colors = ['yellow', 'blue', 'red', 'green', 'orange', 'white', 'yellow', 'blue', 'red'];
  return `<div class="cube-face">${colors.map((color) => `<span class="sticker ${color}"></span>`).join('')}</div><div class="cube-side"></div>`;
}

function renderToast() { return `<div id="toast" class="toast" role="status" aria-live="polite"></div>`; }

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function updateLessonFromForm() {
  const form = document.querySelector('#lesson-form');
  if (!form) return;
  const lesson = currentLesson();
  const values = new FormData(form);
  ['title', 'summary', 'body', 'algorithm', 'image', 'tips', 'practice'].forEach((key) => { lesson[key] = values.get(key)?.toString() ?? ''; });
}

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', () => {
      const action = element.dataset.action;
      if (action === 'home' || action === 'learn') { updateLessonFromForm(); state.view = 'learn'; render(); }
      if (action === 'edit') { state.view = 'edit'; render(); }
      if (action === 'open-lesson') { state.selectedLesson = Number(element.dataset.id); state.view = 'lesson'; render(); }
      if (action === 'edit-lesson' || action === 'select-lesson') { updateLessonFromForm(); state.selectedLesson = Number(element.dataset.id); state.view = 'edit'; render(); }
      if (action === 'save') { updateLessonFromForm(); save(); render(); showToast('변경사항을 저장했습니다.'); }
      if (action === 'toggle-complete') { const id = Number(element.dataset.id); state.completed = state.completed.includes(id) ? state.completed.filter((item) => item !== id) : [...state.completed, id]; save(); render(); showToast(state.completed.includes(id) ? '완료 상태를 저장했습니다.' : '완료 상태를 해제했습니다.'); }
      if (action === 'copy') { navigator.clipboard?.writeText(element.dataset.copy ?? ''); showToast('공식을 복사했습니다.'); }
      if (action === 'clear-lesson') { if (confirm('이 단계의 입력 내용을 모두 비울까요?')) { Object.assign(currentLesson(), { title: '', summary: '', body: '', algorithm: '', image: '', tips: '', practice: '' }); save(); render(); showToast('단계 내용을 비웠습니다.'); } }
    });
  });
  document.querySelectorAll('.lesson-card').forEach((card) => card.addEventListener('click', (event) => { if (!event.target.closest('button')) { state.selectedLesson = Number(card.dataset.lesson); render(); } }));
  document.querySelectorAll('#lesson-form input, #lesson-form textarea').forEach((fieldElement) => fieldElement.addEventListener('input', () => { updateLessonFromForm(); const preview = document.querySelector('.preview-card'); if (preview) { const snapshot = currentLesson(); preview.querySelector('h2').textContent = snapshot.title || '단계 제목'; preview.querySelector('.preview-summary').textContent = snapshot.summary || '짧은 설명이 여기에 표시됩니다.'; } }));
}

render();
