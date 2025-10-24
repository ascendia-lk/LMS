// -------- Auth (mock) --------
const TOKEN_KEY = 'asc_lms_token';
function isAuthed(){ return !!localStorage.getItem(TOKEN_KEY); }
function login(email, password){
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (password?.length >= 4);
  if(valid){ localStorage.setItem(TOKEN_KEY, 'mock-token'); }
  return valid;
}
function logout(){ localStorage.removeItem(TOKEN_KEY); location.href='index.html'; }
function guard(){ if(!isAuthed()) location.href='index.html'; }

// ---- Sidebar behavior ----
function toggleSidebar(){
  const sb = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  if(!sb) return;
  sb.classList.toggle('open');
  if(scrim) scrim.classList.toggle('show');
}
function setActive(key){
  document.querySelectorAll('.nav-link[data-active]').forEach(a=>{
    if(a.getAttribute('data-active')===key){ a.classList.add('active'); }
    else { a.classList.remove('active'); }
  });
}

// ---- Login page glue ----
function initLogin(){
  if(isAuthed()){ location.href='dashboard.html'; return; }
  const form = document.getElementById('loginForm');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const error = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!email.checkValidity()){ email.classList.add('is-invalid'); return; }
    if(!password.checkValidity()){ password.classList.add('is-invalid'); return; }
    email.classList.remove('is-invalid'); password.classList.remove('is-invalid');
    error.classList.add('d-none'); btn.disabled = true;

    setTimeout(()=>{
      const ok = login(email.value.trim(), password.value.trim());
      if(ok) location.href='dashboard.html';
      else { error.textContent='Invalid email or password'; error.classList.remove('d-none'); btn.disabled=false; }
    }, 450);
  });
}

// ---- Courses mock ----
const MOCK_COURSES = [
  {id:1, title:'Angular Fundamentals', summary:'Components, routing, forms.'},
  {id:2, title:'QA for Web Apps', summary:'Test design, automation basics.'},
  {id:3, title:'SQL & Data Modeling', summary:'Queries, indexes, ERD.'},
];
function renderCourses(){
  const grid = document.getElementById('courseGrid');
  if(!grid) return;
  grid.innerHTML = MOCK_COURSES.map(c => `
    <div class="col-xl-3 col-md-4">
      <div class="card h-100">
        <img src="assets/course-thumb.jpg" class="card-img-top" alt="">
        <div class="card-body">
          <h5 class="card-title">${c.title}</h5>
          <p class="text-muted small">${c.summary}</p>
          <a href="course.html?id=${c.id}" class="btn btn-dark btn-sm">Open</a>
        </div>
      </div>
    </div>
  `).join('');
}
function renderCourseDetail(){
  const params = new URLSearchParams(location.search);
  const id = Number(params.get('id')) || 1;
  const course = MOCK_COURSES.find(c => c.id === id) || MOCK_COURSES[0];
  const title = document.getElementById('courseTitle');
  if(title) title.textContent = course.title;
}

// ---- Reservations mock (Ascendia style) ----
const ROOMS = [
  {id:101, type:'Deluxe King', beds:'1 King', guests:2, price:120, img:'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop'},
  {id:205, type:'Twin Premium', beds:'2 Single', guests:2, price:95, img:'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop'},
  {id:303, type:'Family Suite', beds:'2 Queen + Sofa', guests:4, price:180, img:'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop'}
];
function renderRooms(){
  const grid = document.getElementById('roomsGrid');
  if(!grid) return;
  grid.innerHTML = ROOMS.map(r => `
    <div class="col-xl-4 col-md-6">
      <div class="card h-100">
        <img class="room-thumb" src="${r.img}" alt="">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="card-title mb-1">${r.type}</h5>
              <div class="text-muted small">${r.beds} • Up to ${r.guests} guests</div>
            </div>
            <div class="rate">$${r.price}<small>/night</small></div>
          </div>
          <div class="mt-3 d-flex gap-2">
            <span class="badge-chip">Free Cancel</span>
            <span class="badge-chip" style="background:rgba(255,122,0,.1); color:#ff7a00; border-color:rgba(255,122,0,.25)">Breakfast</span>
          </div>
          <button class="btn btn-dark btn-sm mt-3 w-100" onclick="prefillBooking(${r.id})">Select</button>
        </div>
      </div>
    </div>
  `).join('');
}
function prefillBooking(roomId){
  const room = ROOMS.find(r=>r.id===roomId);
  if(!room) return;
  const sel = document.getElementById('roomType');
  [...sel.options].forEach(o => { if(o.value===room.type) sel.value=o.value; });
  document.getElementById('pricePerNight').textContent = room.price;
  calcTotal();
  window.scrollTo({top:0, behavior:'smooth'});
}
function calcTotal(){
  const nights = diffNights(document.getElementById('checkin').value, document.getElementById('checkout').value);
  const qty = Number(document.getElementById('guests').value || 1);
  const base = Number(document.getElementById('pricePerNight').textContent || 0);
  const subtotal = base * Math.max(nights,1);
  const taxes = +(subtotal * 0.1).toFixed(2);
  const total = (subtotal + taxes);
  document.getElementById('summaryNights').textContent = Math.max(nights,1);
  document.getElementById('summarySubtotal').textContent = subtotal.toFixed(2);
  document.getElementById('summaryTaxes').textContent = taxes.toFixed(2);
  document.getElementById('summaryTotal').textContent = total.toFixed(2);
}
function diffNights(d1,d2){
  if(!d1 || !d2) return 1;
  const a = new Date(d1), b = new Date(d2);
  const ms = b - a; return Math.max(1, Math.ceil(ms / (1000*60*60*24)));
}
function handleReservationSubmit(){
  const f = document.getElementById('resForm');
  f.addEventListener('submit', e=>{
    e.preventDefault();
    const toast = document.getElementById('reserveToast');
    const msg = document.getElementById('reserveMsg');
    msg.textContent = 'Reservation submitted! (mock) You can wire this to your API later.';
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    f.reset(); calcTotal();
  });
}

// expose globals
window.guard = guard;
window.logout = logout;
window.toggleSidebar = toggleSidebar;
window.setActive = setActive;
window.initLogin = initLogin;
window.renderCourses = renderCourses;
window.renderCourseDetail = renderCourseDetail;
window.renderRooms = renderRooms;
window.prefillBooking = prefillBooking;
window.calcTotal = calcTotal;
window.handleReservationSubmit = handleReservationSubmit;


// ===== PROFILE HELPERS =====
function showToast(msgId='saveMsg', toastId='saveToast', text='Saved!'){
  const msg = document.getElementById(msgId);
  if(msg) msg.textContent = text;
  const toast = document.getElementById(toastId);
  if(toast){
    const t = new bootstrap.Toast(toast);
    t.show();
  }
}

function hookFormSaves(){
  // Account save
  const acc = document.getElementById('accountForm');
  if(acc){
    acc.addEventListener('submit', e=>{
      e.preventDefault();
      if(!acc.checkValidity()){ acc.classList.add('was-validated'); return; }
      // mock: store to localStorage
      localStorage.setItem('lms_profile_name', document.getElementById('nameInput').value.trim());
      localStorage.setItem('lms_profile_email', document.getElementById('emailInput').value.trim());
      showToast('saveMsg','saveToast','Account updated');
    });
  }

  // Security save
  const sec = document.getElementById('securityForm');
  if(sec){
    sec.addEventListener('submit', e=>{
      e.preventDefault();
      if(!sec.checkValidity()){ sec.classList.add('was-validated'); return; }
      // mock only
      showToast('saveMsg','saveToast','Security settings updated');
      sec.reset();
    });
  }

  // Preferences save
  const pf = document.getElementById('prefsForm');
  if(pf){
    pf.addEventListener('submit', e=>{
      e.preventDefault();
      showToast('saveMsg','saveToast','Preferences saved');
    });
  }
}

function togglePwd(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.type = (el.type === 'password') ? 'text' : 'password';
}

// Optional: reset account form to defaults
function resetAccount(){
  document.getElementById('nameInput').value = 'Venusha Weerasinghe';
  document.getElementById('roleInput').value = 'Trainee Associate QA Specialist';
  document.getElementById('emailInput').value = 'venusha@example.com';
  document.getElementById('phoneInput').value = '+94 76 377 3066';
  document.getElementById('bioInput').value = 'Passionate about building and testing web apps.';
}


// ---- Enhanced course data (you can expand later) ----
const COURSES = [
  {id:1, title:'Angular Fundamentals', topic:'Angular', level:'Beginner', rating:4.6, ratings:1280, lessons:24, hours:6.5, popular:true, img:'assets/course-thumb.jpg', progress:64},
  {id:2, title:'QA for Web Apps', topic:'QA', level:'Intermediate', rating:4.7, ratings:920, lessons:18, hours:4.0, popular:true, img:'assets/course-thumb.jpg', progress:38},
  {id:3, title:'SQL & Data Modeling', topic:'SQL', level:'Beginner', rating:4.5, ratings:1600, lessons:20, hours:5.5, popular:false, img:'assets/course-thumb.jpg', progress:12},
  {id:4, title:'Go Basics', topic:'Go', level:'Beginner', rating:4.4, ratings:410, lessons:16, hours:3.5, popular:false, img:'assets/course-thumb.jpg', progress:0},
  {id:5, title:'Advanced Angular Patterns', topic:'Angular', level:'Advanced', rating:4.8, ratings:530, lessons:14, hours:4.2, popular:true, img:'assets/course-thumb.jpg', progress:0}
];

function initCoursesUI(){
  renderCourseList(COURSES);
}

function applyChip(topic){
  const search = document.getElementById('searchBox');
  if(topic==='All'){ search.value=''; }
  else { search.value = topic; }
  filterCourses();
}

function filterCourses(){
  const q = (document.getElementById('searchBox')?.value || '').toLowerCase();
  const level = document.getElementById('levelSelect')?.value || '';
  const sort = document.getElementById('sortSelect')?.value || 'popular';

  let list = COURSES.filter(c=>{
    const matchesText = !q || c.title.toLowerCase().includes(q) || c.topic.toLowerCase().includes(q);
    const matchesLevel = !level || c.level===level;
    return matchesText && matchesLevel;
  });

  if(sort==='popular') list.sort((a,b)=>(b.popular?1:0)-(a.popular?1:0) || b.ratings-a.ratings);
  if(sort==='rating') list.sort((a,b)=>b.rating-a.rating);
  if(sort==='new') list.sort((a,b)=>b.id-a.id); // mock newest by id

  renderCourseList(list);
}

function renderCourseList(items){
  const grid = document.getElementById('courseGrid');
  const count = document.getElementById('resultCount');
  if(count) count.textContent = items.length;
  if(!grid) return;

  grid.innerHTML = items.map(c => courseCardHTML(c)).join('');
}

function courseCardHTML(c){
  const ribbon = c.popular ? `<span class="card-ribbon">Popular</span>` : '';
  const starFull = '★'.repeat(Math.round(c.rating));
  const starFade = '☆'.repeat(5 - Math.round(c.rating));
  const progress = (c.progress ?? 0);

  return `
  <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
    <div class="course-card h-100">
      <div class="course-media">
        <img src="${c.img}" alt="">
        ${ribbon}
        <span class="topic-chip">${c.topic}</span>
      </div>
      <div class="card-body">
        <div class="title mb-1">${c.title}</div>
        <div class="meta mb-2">
          <span class="me-2"><i class="bi bi-bar-chart-steps me-1"></i>${c.level}</span>
          <span class="me-2"><i class="bi bi-layers me-1"></i>${c.lessons} lessons</span>
          <span><i class="bi bi-clock me-1"></i>${c.hours}h</span>
        </div>
        <div class="d-flex align-items-center justify-content-between">
          <div class="stars small" aria-label="${c.rating} out of 5">${starFull}${starFade}</div>
          <div class="text-muted small">${c.rating.toFixed(1)} • ${c.ratings.toLocaleString()}</div>
        </div>
        ${progress>0 ? `
          <div class="mt-2">
            <div class="progress" style="height:6px"><div class="progress-bar" style="width:${progress}%"></div></div>
            <div class="small text-muted mt-1">${progress}% complete</div>
          </div>` : ``}
        <div class="d-grid mt-3">
          <a href="course.html?id=${c.id}" class="btn btn-dark btn-sm"><i class="bi bi-play-fill me-1"></i>${progress>0 ? 'Resume' : 'Start'}</a>
        </div>
      </div>
    </div>
  </div>`;
}



// ===== Course detail enhancements =====

// Mock lessons indexed by course id
const LESSONS_MAP = {
  1: [
    {id:'l1', title:'Introduction', duration:'12m', type:'video', done:false},
    {id:'l2', title:'Components Deep Dive', duration:'18m', type:'video', done:false},
    {id:'l3', title:'Routing Basics', duration:'15m', type:'video', done:false},
    {id:'l4', title:'Template Forms', duration:'11m', type:'video', done:false},
    {id:'l5', title:'Quiz 1', duration:'8m', type:'quiz', done:false},
  ],
  2: [
    {id:'l1', title:'Test Pyramid', duration:'9m', type:'video', done:false},
    {id:'l2', title:'Designing Test Cases', duration:'16m', type:'video', done:false},
    {id:'l3', title:'Automation Overview', duration:'13m', type:'video', done:false},
    {id:'l4', title:'Quiz 1', duration:'7m', type:'quiz', done:false},
  ],
  3: [
    {id:'l1', title:'ERD Basics', duration:'10m', type:'video', done:false},
    {id:'l2', title:'Joins & Indices', duration:'22m', type:'video', done:false},
    {id:'l3', title:'Quiz 1', duration:'6m', type:'quiz', done:false},
  ],
};

let CURRENT_COURSE = null;
let CURRENT_LESSONS = [];
let ACTIVE_INDEX = 0; // which lesson

function initCoursePage(){
  // Pick course from param
  const params = new URLSearchParams(location.search);
  const id = Number(params.get('id')) || 1;
  const course = (typeof COURSES !== 'undefined' ? COURSES.find(c=>c.id===id) : null) || {title:'Course', level:'Beginner', lessons:3, hours:1.2, rating:4.6, progress:0};
  CURRENT_COURSE = course;
  CURRENT_LESSONS = (LESSONS_MAP[id] || LESSONS_MAP[1]).slice();

  // Header fill
  setText('courseTitle', course.title);
  setText('bcCourse', course.title);
  setText('courseLevel', course.level || 'Beginner');
  setText('courseLessons', course.lessons || CURRENT_LESSONS.length);
  setText('courseHours', course.hours || 1.2);
  setText('courseRating', (course.rating || 4.6).toFixed(1));
  setText('courseProgress', `${course.progress || 0}%`);

  // Render syllabus & counters
  renderSyllabus();
  updateLessonCounters();

  // Notes restore
  const notesKey = notesStorageKey();
  const saved = localStorage.getItem(notesKey) || '';
  const area = document.getElementById('notesArea'); if(area) area.value = saved;
  setText('notesStatus', saved ? 'Saved locally' : 'Unsaved');
}

function renderSyllabus(){
  const acc = document.getElementById('syllabusAcc');
  if(!acc) return;
  acc.innerHTML = CURRENT_LESSONS.map((l, idx) => `
    <div class="accordion-item">
      <h2 class="accordion-header" id="h${idx}">
        <button class="accordion-button ${idx>0?'collapsed':''}" type="button" data-bs-toggle="collapse" data-bs-target="#c${idx}">
          <div class="w-100 d-flex align-items-center justify-content-between">
            <div><span class="me-2 lesson-badge">${idx+1}</span>${l.title}</div>
            <div class="lesson-meta">${l.duration}</div>
          </div>
        </button>
      </h2>
      <div id="c${idx}" class="accordion-collapse collapse ${idx===0?'show':''}" data-bs-parent="#syllabusAcc">
        <div class="accordion-body py-2">
          <div class="d-flex align-items-center justify-content-between">
            <div class="text-muted small">Type: ${l.type.toUpperCase()}</div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm ${idx===ACTIVE_INDEX?'btn-dark':'btn-outline-dark'}" onclick="gotoLesson(${idx})"><i class="bi bi-play-fill me-1"></i>${idx===ACTIVE_INDEX?'Playing':'Play'}</button>
              <button class="btn btn-sm btn-outline-secondary" onclick="toggleDone(${idx})">${l.done?'Mark Incomplete':'Mark Complete'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function gotoLesson(index){
  ACTIVE_INDEX = Math.max(0, Math.min(index, CURRENT_LESSONS.length-1));
  setText('lessonIndex', ACTIVE_INDEX+1);
  setText('lessonTotal', CURRENT_LESSONS.length);
  // update overview title & status
  const title = document.querySelector('#tabOverview .card-title');
  if(title) title.textContent = `Lesson ${ACTIVE_INDEX+1}: ${CURRENT_LESSONS[ACTIVE_INDEX].title}`;
  setText('lessonStatus', CURRENT_LESSONS[ACTIVE_INDEX].done ? 'Completed' : 'In progress');
  renderSyllabus();
  toast('Now playing: ' + CURRENT_LESSONS[ACTIVE_INDEX].title);
  window.scrollTo({top:0, behavior:'smooth'});
}

function gotoNextLesson(){ gotoLesson(ACTIVE_INDEX + 1); }
function gotoPrevLesson(){ gotoLesson(ACTIVE_INDEX - 1); }

function toggleDone(index){
  CURRENT_LESSONS[index].done = !CURRENT_LESSONS[index].done;
  renderSyllabus(); updateCourseProgress();
}

function markComplete(){
  CURRENT_LESSONS[ACTIVE_INDEX].done = true;
  renderSyllabus(); updateCourseProgress();
  setText('lessonStatus','Completed');
  toast('Lesson marked complete');
}

function updateCourseProgress(){
  const done = CURRENT_LESSONS.filter(l=>l.done).length;
  const total = CURRENT_LESSONS.length;
  const pct = Math.round((done/total)*100);
  setText('courseProgress', pct + '%');
  updateLessonCounters();
}

function updateLessonCounters(){
  setText('lessonIndex', ACTIVE_INDEX+1);
  setText('lessonTotal', CURRENT_LESSONS.length);
}

// --- Player toolbar (mock) ---
function setSpeed(mult){
  setText('speedLabel', (mult+'x').replace('.00',''));
  toast('Speed set to ' + mult + 'x');
}
function togglePlay(){ toast('Play/Pause (mock)'); }
function toggleMute(){ toast('Mute/Unmute (mock)'); }
function toggleCC(){ toast('Captions toggled (mock)'); }
function toggleFull(){ toast('Fullscreen (mock)'); }

// --- Notes ---
function notesStorageKey(){
  return `course_${CURRENT_COURSE?.id || 0}_lesson_${ACTIVE_INDEX}_notes`;
}
function saveNotes(){
  const area = document.getElementById('notesArea'); if(!area) return;
  localStorage.setItem(notesStorageKey(), area.value);
  setText('notesStatus','Saved locally');
  toast('Notes saved');
}
function insertTimestamp(){
  const area = document.getElementById('notesArea'); if(!area) return;
  const ts = new Date().toLocaleTimeString();
  area.value += (area.value ? '\n' : '') + `[${ts}] `;
  area.focus();
}

// --- Q&A (local, mock) ---
function postQuestion(){
  const ta = document.getElementById('qaText'); if(!ta) return;
  const txt = ta.value.trim(); if(!txt) return;
  const list = document.getElementById('qaList');
  const item = document.createElement('div');
  item.className = 'list-group-item';
  item.innerHTML = `<div class="fw-semibold">You</div><div class="text-muted small mb-1">${new Date().toLocaleString()}</div><div>${escapeHTML(txt)}</div>`;
  list.prepend(item);
  ta.value = '';
  toast('Question posted');
}

function escapeHTML(s){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// --- Quiz ---
function startQuiz(){ toast('Quiz starting (mock)'); }

// --- Utils ---
function setText(id, text){ const el=document.getElementById(id); if(el) el.textContent = String(text); }
function toast(msg){
  const t = document.getElementById('courseToast');
  const m = document.getElementById('toastMsg');
  if(m) m.textContent = msg;
  if(t) new bootstrap.Toast(t).show();
}
