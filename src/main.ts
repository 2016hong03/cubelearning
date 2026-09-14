import 'cubing/twisty';
import { beginnerLessons, twistLessons, twistyPlayerDefaults } from './cube.js';

const PROGRESS_KEY = 'cube-note-progress-v1';

const state = {
  view: 'learn',
  selectedLesson: 1,
  lessons: beginnerLessons,
  completed: load(PROGRESS_KEY, [])
};

function navigate(view: string, lessonId = state.selectedLesson, replace = false) {
  state.view = view;
  state.selectedLesson = lessonId;
  const historyState = { view, lesson: lessonId };
  if (replace) history.replaceState(historyState, '', window.location.pathname);
  else history.pushState(historyState, '', window.location.pathname);
  render();
}

function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function save() {
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
          ${state.view === 'lesson' ? renderLessonView(lesson) : renderLearning(lesson)}
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
      <div><span class="eyebrow">BEGINNER / 3X3</span><h1>나의 큐브 학습</h1><p>기본 동작을 익힌 뒤 7단계 해법을 시작해보세요.</p></div>
    </div>
    <div class="hero-strip">
      <div class="hero-copy"><span class="section-kicker">3x3 초급</span><h2>내 속도로 배우는<br /><em>큐브 노트</em></h2><p>아직 비어 있는 단계에 나만의 설명과 공식을 기록하세요.</p></div>
      <div class="cube-graphic" aria-hidden="true">${renderCube()}</div>
      <div class="hero-stat"><span>학습 진행률</span><strong>${progressPercent()}<small>%</small></strong><div class="hero-progress"><span style="width: ${progressPercent()}%"></span></div><small>${completedCount()} / 7 단계 완료</small></div>
    </div>
    <section class="twist-basics"><div class="section-heading"><div><span class="eyebrow">BEFORE YOU START</span><h2>트위스트 먼저 익히기</h2></div><span class="content-status ready">기초 공식 4개</span></div><p class="section-intro">7단계 학습에 앞서 자주 사용하는 네 가지 기본 동작을 확인해보세요.</p><div class="twist-grid">${twistLessons.map((twist) => renderTwistCard(twist)).join('')}</div></section>
    <div class="section-heading"><div><span class="eyebrow">YOUR CURRICULUM</span><h2>7단계 학습 목록</h2></div><span class="content-status ${populated ? 'ready' : ''}">${populated ? '콘텐츠 작성 중' : '콘텐츠를 입력해주세요'}</span></div>
    <div class="lesson-grid">${state.lessons.map((item) => renderLessonCard(item)).join('')}</div>
    <div class="tool-banner"><span class="tool-icon">✓</span><div><strong>오늘의 학습을 시작해보세요</strong><p>단계를 선택하면 준비된 학습 내용과 큐브 시뮬레이터를 확인할 수 있습니다.</p></div></div>
  `;
}

function renderTwistCard(twist) {
  const moveImage = twist.image ? `<img class="move-photo" src="${escapeHtml(twist.image)}" alt="${escapeHtml(twist.title)} 회전기호" />` : '';
  return `<article class="twist-card"><div class="twist-card-copy"><span class="twist-label">BASIC MOVE</span><h3>${escapeHtml(twist.title)}</h3><p>${escapeHtml(twist.description)}</p>${moveImage}<code>${escapeHtml(twist.algorithm)}</code></div><twisty-player alg="${escapeHtml(twist.algorithm)}" control-panel="${escapeHtml(twistyPlayerDefaults.controlPanel)}"></twisty-player></article>`;
}

function renderLessonView(lesson) {
  const isComplete = state.completed.includes(lesson.id);
  const previous = state.lessons.find((item) => item.id === lesson.id - 1);
  const next = state.lessons.find((item) => item.id === lesson.id + 1);
  const blocks = [
    lesson.body ? `<section class="lesson-content-block"><span class="eyebrow">LESSON NOTE</span><h2>학습 내용</h2><p class="long-copy">${escapeHtml(lesson.body)}</p></section>` : '',
    lesson.algorithm ? `<section class="lesson-content-block algorithm-section"><span class="eyebrow">MOVE / FORMULA</span><h2>공식 / 기호</h2><div class="large-algorithm"><code>${escapeHtml(lesson.algorithm)}</code><button class="copy-button" data-action="copy" data-copy="${escapeHtml(lesson.algorithm)}">복사</button></div></section>` : '',
    lesson.cases?.length ? `<section class="lesson-content-block cases-section"><span class="eyebrow">CASES</span><h2>케이스별 움직임</h2>${lesson.cases.map((item) => `<div class="case-block"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p><twisty-player experimental-setup-alg="${escapeHtml(item.setup)}" alg="${escapeHtml(lesson.algorithm)}" control-panel="${escapeHtml(twistyPlayerDefaults.controlPanel)}"></twisty-player></div>`).join('')}</section>` : '',
    lesson.tips ? `<section class="lesson-content-block"><span class="eyebrow">REMEMBER</span><h2>주의할 점</h2><p class="long-copy">${escapeHtml(lesson.tips)}</p></section>` : '',
    lesson.practice ? `<section class="lesson-content-block practice-section"><span class="eyebrow">PRACTICE</span><h2>연습 체크</h2><p class="long-copy">${escapeHtml(lesson.practice)}</p></section>` : ''
  ].filter(Boolean).join('');
  return `
    <div class="lesson-detail-head"><button class="back-link" data-action="home">← 전체 단계</button><span class="eyebrow">STEP 0${lesson.id} / 3X3 BEGINNER</span><h1>${escapeHtml(lesson.title || '학습 준비 중')}</h1><p>${escapeHtml(lesson.summary || '이 단계의 학습 내용은 준비 중입니다.')}</p></div>
    <div class="lesson-detail-grid">
      <article class="lesson-reading">
        ${lesson.image ? `<img class="lesson-hero-image" src="${escapeHtml(lesson.image)}" alt="${escapeHtml(lesson.title || '단계 이미지')}" />` : ''}
        ${blocks || '<div class="empty-content"><span>✓</span><h2>학습 내용 준비 중입니다.</h2><p>이 단계의 콘텐츠가 준비되면 이곳에서 확인할 수 있습니다.</p></div>'}
      </article>
      <aside class="lesson-aside"><div class="aside-label">STEP STATUS</div><div class="aside-step">0${lesson.id}<span>/ 07</span></div><button class="complete-button ${isComplete ? 'done' : ''}" data-action="toggle-complete" data-id="${lesson.id}">${isComplete ? '완료한 단계 ✓' : '이 단계 완료하기'}</button></aside>
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
    <div class="card-bottom"><button class="small-button" data-action="open-lesson" data-id="${lesson.id}">학습 열기 <span>→</span></button></div>
  </article>`;
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

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      const action = element.dataset.action;
      if (action === 'home' || action === 'learn') navigate('learn');
      if (action === 'open-lesson') navigate('lesson', Number(element.dataset.id));
      if (action === 'toggle-complete') { const id = Number(element.dataset.id); state.completed = state.completed.includes(id) ? state.completed.filter((item) => item !== id) : [...state.completed, id]; save(); render(); showToast(state.completed.includes(id) ? '완료 상태를 저장했습니다.' : '완료 상태를 해제했습니다.'); }
      if (action === 'copy') { navigator.clipboard?.writeText(element.dataset.copy ?? ''); showToast('공식을 복사했습니다.'); }
    });
  });
  document.querySelectorAll('.lesson-card').forEach((card) => card.addEventListener('click', (event) => { if (!event.target.closest('button')) { navigate('lesson', Number(card.dataset.lesson)); } }));
}

render();
history.replaceState({ view: state.view, lesson: state.selectedLesson }, '', window.location.pathname);
window.addEventListener('popstate', (event) => {
  state.view = event.state?.view ?? 'learn';
  state.selectedLesson = event.state?.lesson ?? 1;
  render();
});
