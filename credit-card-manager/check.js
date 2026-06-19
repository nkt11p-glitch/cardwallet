
'use strict';
// ============================================================
// CONSTANTS
// ============================================================
const GRADIENTS = ['cg-blue','cg-purple','cg-rose','cg-emerald','cg-orange','cg-teal','cg-indigo','cg-pink'];
const GRAD_NAMES = {'cg-blue':'น้ำเงิน','cg-purple':'ม่วง','cg-rose':'แดง','cg-emerald':'เขียว','cg-orange':'ส้ม','cg-teal':'เทียล','cg-indigo':'คราม','cg-pink':'ชมพู'};
const GRAD_SWATCHES = {'cg-blue':'swatch-blue','cg-purple':'swatch-purple','cg-rose':'swatch-rose','cg-emerald':'swatch-emerald','cg-orange':'swatch-orange','cg-teal':'swatch-teal','cg-indigo':'swatch-indigo','cg-pink':'swatch-pink'};
const GRAD_COLORS = {'cg-blue':'#3B82F6','cg-purple':'#8B5CF6','cg-rose':'#E11D48','cg-emerald':'#059669','cg-orange':'#EA580C','cg-teal':'#0D9488','cg-indigo':'#4F46E5','cg-pink':'#DB2777'};
const CATEGORIES = [
  {id:'food',icon:'🍜',label:'อาหาร'},{id:'shopping',icon:'🛍️',label:'ช้อปปิ้ง'},{id:'travel',icon:'✈️',label:'เดินทาง'},
  {id:'entertainment',icon:'🎬',label:'บันเทิง'},{id:'utilities',icon:'📡',label:'บิล/ค่าน้ำไฟ'},{id:'health',icon:'💊',label:'สุขภาพ'},
  {id:'fuel',icon:'⛽',label:'น้ำมัน'},{id:'beauty',icon:'💄',label:'ความงาม'},{id:'education',icon:'📚',label:'การศึกษา'},
  {id:'finance',icon:'🏦',label:'การเงิน'},{id:'car',icon:'🚗',label:'ยานยนต์'},{id:'groceries',icon:'🛒',label:'ซูเปอร์ฯ'},
  {id:'pets',icon:'🐾',label:'สัตว์เลี้ยง'},{id:'home',icon:'🏠',label:'ของใช้บ้าน'},{id:'family',icon:'👨‍👩‍👧‍👦',label:'ครอบครัว'},
  {id:'gadgets',icon:'💻',label:'ไอที'},{id:'sub',icon:'📦',label:'สมาชิก'},{id:'other',icon:'💳',label:'อื่นๆ'},
];
const MERCHANT_MAP = {
  'grab':'food','grabfood':'food','foodpanda':'food','kfc':'food','mcdonalds':'food','starbucks':'food','café':'food','coffee':'food',
  'netflix':'entertainment','spotify':'entertainment','youtube':'entertainment','steam':'entertainment',
  'shopee':'shopping','lazada':'shopping','amazon':'shopping','jd':'shopping','central':'shopping','robinson':'shopping',
  'agoda':'travel','airbnb':'travel','booking':'travel','klook':'travel','thai airways':'travel','air asia':'travel',
  'true':'utilities','ais':'utilities','dtac':'utilities','pea':'utilities','mea':'utilities',
  'hospital':'health','clinic':'health','pharmacy':'health','watsons':'health','boots':'health','bumrungrad':'health','medpark':'health',
  'ptt':'fuel','pt':'fuel','caltex':'fuel','shell':'fuel','esso':'fuel',
  'insurance':'finance','aia':'finance','fwd':'finance','muang thai':'finance',
};
const CAT_MAP = {};
CATEGORIES.forEach(c => { CAT_MAP[c.id] = c; });
const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const THAI_MONTHS_FULL = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const THAI_DAYS = ['อา','จ','อ','พ','พฤ','ศ','ส'];

// ============================================================
// UTILITIES
// ============================================================
function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2,8); }
function fmt(n, d=0) { if (isNaN(n)) return '0'; return Number(n).toLocaleString('th-TH', {minimumFractionDigits:d, maximumFractionDigits:d}); }
function fmtAmt(n, d=0) { return App._hideData ? '***' : fmt(n, d); }
function fmtDate(iso) { if (!iso) return ''; const d=new Date(iso); return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
function fmtShortDate(iso) { if (!iso) return ''; const d=new Date(iso); return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`; }
function daysAgo(n) { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString(); }
function futureDate(n) { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString(); }
function daysUntil(iso) { const t=new Date(iso); t.setHours(0,0,0,0); const n=new Date(); n.setHours(0,0,0,0); return Math.ceil((t-n)/86400000); }
function nextOccurrenceOf(day) { const t=new Date(); t.setHours(0,0,0,0); const o=new Date(t.getFullYear(),t.getMonth(),day); if(o<=t) o.setMonth(o.getMonth()+1); return o; }
function clamp(v,mn,mx) { return Math.max(mn,Math.min(mx,v)); }
function catForMerchant(name) { if (!name) return null; const l=name.toLowerCase(); for(const[k,c] of Object.entries(MERCHANT_MAP)) if(l.includes(k)) return c; return null; }
function catIcon(id) { return (CAT_MAP[id]||CAT_MAP['other']).icon; }
function catLabel(id) { return (CAT_MAP[id]||CAT_MAP['other']).label; }
function vibrate(ms=30) { if (navigator.vibrate) navigator.vibrate(ms); }

// ============================================================
// STORE
// ============================================================
const Store = (function() {
  let _user = localStorage.getItem('cw_current_user') || null;
  function getKey() { return _user ? `cardwallet_v4_${_user}` : 'cardwallet_v4_guest'; }
  function load() { try { return JSON.parse(localStorage.getItem(getKey())) || def(); } catch { return def(); } }
  function save(d) { try { localStorage.setItem(getKey(), JSON.stringify(d)); } catch(e) {} }
  function def() { return {cards:[],transactions:[],installments:[],subscriptions:[],otherDebts:[],settings:{currency:'THB',lastAutoRun:null,autoLogs:[]}}; }
  function makeCRUD(key, cleanupFn) {
    return {
      getAll() { return load()[key]; },
      get(id) { return load()[key].find(x=>x.id===id)||null; },
      save(item) { const d=load(); const i=d[key].findIndex(x=>x.id===item.id); if(i>=0) d[key][i]=item; else d[key].push(item); save(d); },
      delete(id) { const d=load(); d[key]=d[key].filter(x=>x.id!==id); if(cleanupFn) cleanupFn(d,id); save(d); }
    };
  }
  return {
    getCurrentUser() { return _user; },
    login(userId) { _user = userId; localStorage.setItem('cw_current_user', userId); },
    logout() { _user = null; localStorage.removeItem('cw_current_user'); },
    clearCurrentUser() { localStorage.removeItem(getKey()); },
    cards: makeCRUD('cards', (d,id)=>{
      d.transactions=d.transactions.filter(t=>t.cardId!==id);
      d.installments=d.installments.filter(i=>i.cardId!==id);
      d.subscriptions=d.subscriptions.filter(s=>s.cardId!==id);
    }),
    transactions: {
      ...makeCRUD('transactions'),
      getByCard(cardId) { return load().transactions.filter(t=>t.cardId===cardId); }
    },
    installments: {
      ...makeCRUD('installments'),
      getByCard(cardId) { return load().installments.filter(i=>i.cardId===cardId); }
    },
    subscriptions: makeCRUD('subscriptions'),
    otherDebts: makeCRUD('otherDebts'),
    settings: {
      get() { return load().settings; },
      save(patch) { const d=load(); d.settings=Object.assign({},d.settings,patch); save(d); }
    }
  };
})();

// ============================================================
// MODELS
// ============================================================
function createCard(data) {
  return {
    id:genId(), name:data.name||'บัตรเครดิต', lastFour:(data.lastFour||'0000').slice(-4),
    type:data.type||'visa', gradient:data.gradient||'cg-blue',
    totalLimit:+data.totalLimit||0, usedCredit:+data.usedCredit||0,
    availableCredit:(+data.totalLimit||0)-(+data.usedCredit||0),
    interestRate:+data.interestRate||0, billingCycleDay:+data.billingCycleDay||15,
    gracePeriodDays:+data.gracePeriodDays||15, lastPaymentDate:data.lastPaymentDate||null, createdAt:new Date().toISOString(),
  };
}
function createTransaction(data) {
  return {
    id:genId(), cardId:data.cardId, amount:+data.amount||0, description:data.description||'',
    category:data.category||'other', date:data.date||new Date().toISOString(),
    isInstallment:!!data.isInstallment, installmentId:data.installmentId||null,
    isAutoDeducted:!!data.isAutoDeducted, isPaid:!!data.isPaid, createdAt:new Date().toISOString()
  };
}
function createInstallment(data) {
  const {monthlyPayment,totalInterest,totalAmount}=Interest.calcInstallment(+data.principalAmount,+data.annualInterestRate,+data.months,data.rateType||'flat');
  return {
    id:genId(), cardId:data.cardId, transactionId:data.transactionId, description:data.description||'',
    principalAmount:+data.principalAmount, months:+data.months, annualInterestRate:+data.annualInterestRate, rateType:data.rateType||'flat',
    monthlyPayment, totalInterest, totalAmount,
    schedule:Interest.amortizationSchedule(+data.principalAmount,+data.annualInterestRate,+data.months,data.startDate||new Date().toISOString(),data.rateType||'flat'),
    startDate:data.startDate||new Date().toISOString(), createdAt:new Date().toISOString(),
  };
}
function createSubscription(data) {
  return {
    id:genId(), cardId:data.cardId||null, name:data.name||'', amount:+data.amount||0,
    frequency:data.frequency||'monthly', category:data.category||'other', icon:data.icon||'💳',
    nextDueDate:data.nextDueDate||new Date().toISOString(), isActive:true, createdAt:new Date().toISOString(),
  };
}
function createOtherDebt(data) {
  return {
    id:genId(), name:data.name||'', icon:data.icon||'🏠',
    category:data.category||'other', totalAmount:+data.totalAmount||0,
    remainingAmount:+data.remainingAmount||0, monthlyPayment:+data.monthlyPayment||0,
    interestRate:+data.interestRate||0, dueDay:+data.dueDay||1,
    color:data.color||'#F59E0B', notes:data.notes||'', createdAt:new Date().toISOString(),
  };
}

// ============================================================
// INTEREST ENGINE
// ============================================================
const Interest = {
  monthlyInterest(balance, annualRate) { return 0; /* Normal usedCredit no longer auto-calculates global interest */ },
  minimumPayment(balance) { return Math.max(500, Math.ceil(balance*0.10)); },
  calcInstallment(principal, annualRatePct, months, rateType='flat') {
    if(!months) return {monthlyPayment:0,totalInterest:0,totalAmount:principal};
    if (rateType === 'flat') {
      const totalInterest = principal*(annualRatePct/100/12)*months;
      const totalAmount = principal+totalInterest;
      return {monthlyPayment:totalAmount/months, totalInterest, totalAmount};
    } else {
      const monthlyRate = annualRatePct/100/12;
      let monthlyPayment = 0;
      if (monthlyRate === 0) {
        monthlyPayment = principal / months;
      } else {
        monthlyPayment = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
      }
      const totalAmount = monthlyPayment * months;
      const totalInterest = totalAmount - principal;
      return {monthlyPayment, totalInterest, totalAmount};
    }
  },
  amortizationSchedule(principal, annualRatePct, months, startDate, rateType='flat') {
    const {monthlyPayment,totalInterest}=this.calcInstallment(principal,annualRatePct,months,rateType);
    const schedule=[];
    const start=new Date(startDate);
    let balance = principal;
    const monthlyRate = annualRatePct/100/12;
    for(let i=1;i<=months;i++){
      const due=new Date(start.getFullYear(),start.getMonth()+i,start.getDate());
      let interestPart = 0;
      let principalPart = 0;
      if(rateType==='flat'){
        interestPart = totalInterest/months;
        principalPart = principal/months;
      } else {
        interestPart = balance * monthlyRate;
        principalPart = monthlyPayment - interestPart;
        balance -= principalPart;
      }
      schedule.push({month:i,dueDate:due.toISOString(),principalPart,interestPart,amount:monthlyPayment,paid:false,paidDate:null});
    }
    return schedule;
  }
};

// ============================================================
// SCHEDULER
// ============================================================
const Scheduler = {
  run() {
    const today=new Date(); today.setHours(0,0,0,0);
    const settings=Store.settings.get();
    const lastRun=settings.lastAutoRun?new Date(settings.lastAutoRun):null;
    if(lastRun){const lr=new Date(lastRun);lr.setHours(0,0,0,0);if(lr.getTime()===today.getTime())return[];}
    const logs=[];
    for(const sub of Store.subscriptions.getAll()){
      if(!sub.isActive||!sub.cardId) continue;
      const nd=new Date(sub.nextDueDate); nd.setHours(0,0,0,0);
      if(nd<=today){
        const card=Store.cards.get(sub.cardId);
        if(card){
          card.usedCredit=(card.usedCredit||0)+sub.amount;
          card.availableCredit=card.totalLimit-card.usedCredit;
          Store.cards.save(card);
          Store.transactions.save(createTransaction({cardId:sub.cardId,amount:sub.amount,description:sub.name+' (Auto)',category:sub.category,date:today.toISOString(),isAutoDeducted:true}));
          const newDue=new Date(nd);
          if(sub.frequency==='monthly') newDue.setMonth(newDue.getMonth()+1);
          else if(sub.frequency==='yearly') newDue.setFullYear(newDue.getFullYear()+1);
          else if(sub.frequency==='weekly') newDue.setDate(newDue.getDate()+7);
          sub.nextDueDate=newDue.toISOString();
          Store.subscriptions.save(sub);
          logs.push({name:sub.name,amount:sub.amount,cardName:card.name});
        }
      }
    }
    const autoLogs=(settings.autoLogs||[]).concat(logs.map(l=>({...l,date:today.toISOString()}))).slice(-20);
    Store.settings.save({lastAutoRun:today.toISOString(),autoLogs});
    return logs;
  }
};

// ============================================================
// TOAST & MODAL
// ============================================================
const Toast = {
  show(msg,type='info',duration=3500) {
    const icons={success:'✅',warning:'⚠️',error:'❌',info:'ℹ️'};
    const el=document.createElement('div');
    el.className=`toast ${type}`;
    el.innerHTML=`<span class="t-icon">${icons[type]||'ℹ️'}</span><span class="t-msg">${msg}</span>`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(()=>{el.classList.add('leaving');setTimeout(()=>el.remove(),280);},duration);
  }
};
const Modal = {
  show(html){
    document.getElementById('modal-content').innerHTML=html;
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('modal-overlay').onclick=e=>{if(e.target===document.getElementById('modal-overlay'))this.close();};
  },
  close(){
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-content').innerHTML='';
  }
};

// ============================================================
// CAROUSEL ENGINE
// ============================================================
const Carousel = (function() {
  let _idx=0, _total=0, _slideW=300, _startX=0, _deltaX=0, _dragging=false;

  function _getSlideW() {
    const outer=document.getElementById('carouselOuter');
    if(!outer) return 300;
    return Math.min(300, outer.offsetWidth - 72);
  }

  function _getOffset() {
    const outer=document.getElementById('carouselOuter');
    if(!outer) return 0;
    const sw=_getSlideW();
    const gap=16;
    return (outer.offsetWidth-sw)/2 - _idx*(sw+gap) + _deltaX;
  }

  function _apply(animated=true) {
    const track=document.getElementById('carouselTrack');
    const outer=document.getElementById('carouselOuter');
    if(!track||!outer) return;

    _slideW=_getSlideW();
    // Update slide widths
    track.querySelectorAll('.c-slide').forEach(s=>{ s.style.width=_slideW+'px'; });

    if(animated) track.classList.remove('no-trans');
    else track.classList.add('no-trans');

    track.style.transform=`translateX(${_getOffset()}px)`;

    // Active states
    track.querySelectorAll('.c-slide').forEach((s,i)=>s.classList.toggle('active',i===_idx));

    // Dots
    document.querySelectorAll('.c-dot').forEach((d,i)=>d.classList.toggle('active',i===_idx));

    // Arrows
    const l=document.getElementById('carouselArrL');
    const r=document.getElementById('carouselArrR');
    if(l) l.classList.toggle('dis',_idx===0);
    if(r) r.classList.toggle('dis',_idx===_total-1);
  }

  return {
    init(total) {
      _total=total; _idx=0; _deltaX=0;
      setTimeout(()=>_apply(false),30);
      this._bind();
    },
    prev() {
      if (_total <= 1) return;
      _idx = (_idx - 1 + _total) % _total;
      _apply(true);
    },
    next() {
      if (_total <= 1) return;
      _idx = (_idx + 1) % _total;
      _apply(true);
    },
    goTo(idx,animated=true) {
      _idx=Math.max(0,Math.min(_total-1,idx));
      _deltaX=0;
      _apply(animated);
    },
    current() { return _idx; },
    _bind() {
      const outer=document.getElementById('carouselOuter');
      if(!outer||outer._carouselBound) return;
      outer._carouselBound=true;

      // Touch
      outer.addEventListener('touchstart',e=>{_startX=e.touches[0].clientX;_dragging=true;_deltaX=0;},{passive:true});
      outer.addEventListener('touchmove',e=>{if(!_dragging)return;_deltaX=e.touches[0].clientX-_startX;_apply(false);},{passive:true});
      outer.addEventListener('touchend',()=>{
        if(Math.abs(_deltaX)>55){if(_deltaX<0)Carousel.next();else Carousel.prev();}
        else _apply(true);
        _dragging=false;_deltaX=0;
      });

      // Mouse drag (desktop)
      outer.addEventListener('mousedown',e=>{
        _startX=e.clientX;_dragging=true;_deltaX=0;
        outer.classList.add('dragging');
        e.preventDefault();
      });
      window.addEventListener('mousemove',e=>{
        if(!_dragging||App._route!=='dashboard')return;
        _deltaX=e.clientX-_startX;_apply(false);
      });
      window.addEventListener('mouseup',()=>{
        if(!_dragging)return;
        if(Math.abs(_deltaX)>55){if(_deltaX<0)Carousel.next();else Carousel.prev();}
        else _apply(true);
        _dragging=false;_deltaX=0;
        const o2=document.getElementById('carouselOuter');
        if(o2) o2.classList.remove('dragging');
      });

      // Window resize
      window.addEventListener('resize',()=>{ if(App._route==='dashboard') _apply(false); });
    }
  };
})();

// ============================================================
// HELPERS
// ============================================================
function renderCardVisual(card) {
  const typeHtml = card.type==='visa'
    ? `<div class="visa-logo">VISA</div>`
    : card.type==='mastercard'
      ? `<div class="mc-logo"><div class="mc-l"></div><div class="mc-r"></div></div>`
      : `<div style="font-size:18px;font-weight:900;font-style:italic;color:rgba(255,255,255,0.9);letter-spacing:1px">CARD</div>`;
  const hide=App._hideData;
  return `
    <div class="cc ${card.gradient||'cg-blue'}" data-card-id="${card.id}">
      <div class="cc-chip"></div>
      <div class="cc-type">${typeHtml}</div>
      <div class="cc-bal-area">
        <div class="cc-bal-lbl">ยอดใช้ไปแล้ว</div>
        <div class="cc-bal">${hide?'••••':`฿${fmt(card.usedCredit)}`}</div>
      </div>
      <div class="cc-footer">
        <div class="cc-name">${card.name}</div>
        <div class="cc-num">•••• ${card.lastFour}</div>
      </div>
    </div>`;
}

function renderTxItem(tx, cards) {
  const card=cards?cards.find(c=>c.id===tx.cardId):Store.cards.get(tx.cardId);
  const badges=[];
  if(tx.isInstallment) badges.push('<span class="tx-badge">ผ่อนชำระ</span>');
  if(tx.isAutoDeducted) badges.push('<span class="tx-badge auto">อัตโนมัติ</span>');
  return `
    <div class="tx-item" onclick="App.txClick('${tx.id}')">
      <div class="tx-icon-wrap">${catIcon(tx.category)}</div>
      <div class="tx-info">
        <div class="tx-name">${tx.description||catLabel(tx.category)}</div>
        <div class="tx-meta">${catLabel(tx.category)} ${badges.join('')}${card?`• ${card.name}`:''}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amt">${App._hideData?'-••••':`-฿${fmt(tx.amount)}`}</div>
        <div class="tx-date">${fmtShortDate(tx.date)}</div>
      </div>
    </div>`;
}

function getCardTotals() {
  const cards=Store.cards.getAll();
  const ods=Store.otherDebts.getAll();
  const insts=Store.installments.getAll();
  const totalDebt=cards.reduce((s,c)=>s+(c.usedCredit||0),0);
  const totalLimit=cards.reduce((s,c)=>s+(c.totalLimit||0),0);
  const otherDebt=ods.reduce((s,o)=>s+(o.remainingAmount||0),0);
  let monthlyInt=0;
  insts.forEach(i=>{const un=i.schedule.find(x=>!x.paid);if(un)monthlyInt+=un.interestPart;});
  const totalMonthlyOd=ods.reduce((s,o)=>s+(o.monthlyPayment||0),0);
  return {totalDebt,totalLimit,totalAvailable:totalLimit-totalDebt,monthlyInt,otherDebt,totalMonthlyOd,cardCount:cards.length,grandTotal:totalDebt+otherDebt};
}

// ============================================================
// PAGE: DASHBOARD
// ============================================================
const PageDashboard = {
  render() {
    const cards=Store.cards.getAll();
    const allTx=Store.transactions.getAll();
    const totals=getCardTotals();
    const hide=App._hideData;

    const slides = cards.map((card,i) => `
      <div class="c-slide" style="width:300px">
        ${renderCardVisual(card)}
        <div class="c-actions">
          <button class="c-act-btn" onclick="App.navigate('payment',{id:'${card.id}'})">💳 จ่ายหนี้</button>
          <button class="c-act-btn blue" onclick="App.navigate('add-transaction',{cardId:'${card.id}'})">+ รายจ่าย</button>
          <button class="c-act-btn" onclick="App.navigate('card-detail',{id:'${card.id}'})">📋</button>
        </div>
      </div>`).join('');

    const addSlide = `
      <div class="c-slide" style="width:300px">
        <div class="c-add-card" onclick="App.navigate('add-card',{})">
          <div class="add-icon">➕</div>
          <span>เพิ่มบัตรใหม่</span>
        </div>
        <div style="padding:0 20px 20px">
          <div class="summary-card mb20">
            <div class="sum-row"><div class="sum-lbl">วงเงินรวมทั้งหมด</div><div class="sum-val b">${hide?'••••':`฿${fmt(totals.totalLimit)}`}</div></div>
            <div class="sum-row"><div class="sum-lbl">วงเงินคงเหลือรวม</div><div class="sum-val g">${hide?'••••':`฿${fmt(totals.totalAvailable)}`}</div></div>
            <div class="sum-row"><div class="sum-lbl">ดอกเบี้ยผ่อน/เดือน</div><div class="sum-val r">${hide?'••••':`฿${fmt(totals.monthlyInt,2)}`}</div></div>
          </div>
          ${recentTx.length>0?`<details class="acc-wrap"><summary class="acc-sum sec-hdr" style="padding-bottom:12px;margin:0;cursor:pointer;list-style:none;outline:none"><div style="display:flex;justify-content:space-between;width:100%"><span class="sec-title">รายการล่าสุด</span><span style="font-size:12px;color:var(--t3);font-weight:700">▼ ซ่อน/แสดง</span></div></summary><div class="tx-list" style="padding-top:8px">${recentTx.map(tx=>renderTxItem(tx,cards)).join('')}</div></details>`:''}
        </div>
      </div>`;

    const totalSlides = cards.length + 1;
    const dots = Array.from({length:totalSlides},(_,i)=>`<button class="c-dot${i===0?' active':''}" onclick="Carousel.goTo(${i})" aria-label="สไลด์ ${i+1}"></button>`).join('');

    const recentTx = allTx.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);

    const content=document.getElementById('page-content');
    content.innerHTML=`
      <div class="p-enter">
        <div class="hero">
          <div class="hero-label">ยอดหนี้รวมทั้งหมด</div>
          <div class="hero-amount">${hide?'••••':`฿${fmt(totals.grandTotal)}`}</div>
          <div class="hero-row">
            <div class="hero-item"><span class="hero-item-label">บัตรเครดิต</span><span class="hero-item-val r">${hide?'••••':`฿${fmt(totals.totalDebt)}`}</span></div>
            <div class="hero-item"><span class="hero-item-label">หนี้อื่นๆ</span><span class="hero-item-val a">${hide?'••••':`฿${fmt(totals.otherDebt)}`}</span></div>
            <div class="hero-item"><span class="hero-item-label">วงเงินคงเหลือ</span><span class="hero-item-val g">${hide?'••••':`฿${fmt(totals.totalAvailable)}`}</span></div>
            <div class="hero-item"><span class="hero-item-label">ดอกเบี้ย/เดือน</span><span class="hero-item-val b">${hide?'••••':`฿${fmt(totals.monthlyInt,0)}`}</span></div>
          </div>
        </div>

        <div class="carousel-wrap">
          <div class="carousel-outer" id="carouselOuter">
            <div class="carousel-track" id="carouselTrack">
              ${slides}${addSlide}
            </div>
            <button class="carousel-arrow arr-l dis" id="carouselArrL" onclick="Carousel.prev()" aria-label="ก่อนหน้า">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button class="carousel-arrow arr-r${totalSlides<=1?' dis':''}" id="carouselArrR" onclick="Carousel.next()" aria-label="ถัดไป">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div class="carousel-dots" id="carouselDots">${dots}</div>
        </div>

        <div class="dash-shortcuts">
          <div class="dash-shortcut" onclick="App.navigate('subscriptions',{})">
            <div class="dash-shortcut-icon" style="color:var(--teal)">📦</div>
            <div class="dash-shortcut-info">
              <div class="dash-shortcut-title">รายจ่ายประจำ</div>
              <div class="dash-shortcut-sub">จัดการ Subscriptions</div>
            </div>
          </div>
          <div class="dash-shortcut" onclick="App.navigate('subscriptions',{tab:'debt'})">
            <div class="dash-shortcut-icon" style="color:var(--amber)">🏠</div>
            <div class="dash-shortcut-info">
              <div class="dash-shortcut-title">หนี้สินอื่นๆ</div>
              <div class="dash-shortcut-sub">บ้าน, รถ, เงินกู้</div>
            </div>
          </div>
        </div>

        <div style="padding:0 20px 24px">
          <div class="sec-hdr">
            <span class="sec-title">รายการล่าสุด</span>
            <span class="sec-action" onclick="App.navigate('overview',{})">ดูทั้งหมด</span>
          </div>
          ${recentTx.length
            ?`<div class="tx-list">${recentTx.map(tx=>renderTxItem(tx,cards)).join('')}</div>`
            :`<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">ยังไม่มีรายการ</div><div class="empty-sub">กด + เพื่อบันทึกรายจ่ายแรก</div></div>`
          }
        </div>
      </div>`;

    // Init carousel
    Carousel.init(totalSlides);

    // Card click → detail
    content.querySelectorAll('.cc').forEach(el=>{
      el.addEventListener('click',()=>{ const id=el.dataset.cardId; if(id) App.navigate('card-detail',{id}); });
    });
  }
};

// ============================================================
// PAGE: CARD DETAIL
// ============================================================
const PageCardDetail = {
  render(params) {
    const card=Store.cards.get(params.id);
    if(!card){App.navigate('dashboard',{});return;}
    const txs=Store.transactions.getByCard(card.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
    const insts=Store.installments.getByCard(card.id);
    const usePct=card.totalLimit>0?clamp((card.usedCredit/card.totalLimit)*100,0,100):0;
    const instTotal=insts.reduce((s,i)=>s+i.schedule.filter(x=>!x.paid).reduce((ss,x)=>ss+x.amount,0),0);
    const billDate=nextOccurrenceOf(card.billingCycleDay);
    const dueDate=nextOccurrenceOf(card.paymentDueDay);
    if(dueDate<=billDate) dueDate.setMonth(dueDate.getMonth()+1);
    const billDays=daysUntil(billDate.toISOString());
    const dueDays=daysUntil(dueDate.toISOString());
    const monthInt=Interest.monthlyInterest(card.usedCredit,card.interestRate);
    const minPay=Interest.minimumPayment(card.usedCredit);
    const hide=App._hideData;

    document.getElementById('page-content').innerHTML=`
      <div class="p-enter">
        <div class="cd-header">
          <div class="cd-card-wrap">${renderCardVisual(card)}</div>
          <div class="mb16">
            <div style="display:flex;justify-content:space-between;margin-bottom:7px">
              <span style="font-size:13px;font-weight:700;color:var(--t2)">การใช้วงเงิน</span>
              <span style="font-size:13px;font-weight:800;color:var(--t2)">${usePct.toFixed(1)}%</span>
            </div>
            <div class="prog-bar-track"><div class="prog-bar-fill" style="width:${usePct}%"></div></div>
            <div class="prog-labels"><span class="prog-lbl g">คงเหลือ ${hide?'••••':`฿${fmt(card.availableCredit)}`}</span><span class="prog-lbl r">ใช้ไป ${hide?'••••':`฿${fmt(card.usedCredit)}`}</span></div>
          </div>
          <div class="stats-grid mb16">
            <div class="stat-card"><div class="stat-label">วงเงินทั้งหมด</div><div class="stat-val b">${hide?'••••':`฿${fmt(card.totalLimit)}`}</div></div>
            <div class="stat-card"><div class="stat-label">วงเงินคงเหลือ</div><div class="stat-val g">${hide?'••••':`฿${fmt(card.availableCredit)}`}</div></div>
            <div class="stat-card"><div class="stat-label">ยอดใช้ไป</div><div class="stat-val r">${hide?'••••':`฿${fmt(card.usedCredit)}`}</div></div>
            <div class="stat-card"><div class="stat-label">ยอดผ่อนคงค้าง</div><div class="stat-val p">${hide?'••••':`฿${fmt(instTotal)}`}</div></div>
          </div>
          <div class="countdown-row mb16">
            <div class="cd-block billing">
              <div class="cd-lbl">วันตัดรอบบิล</div>
              <div class="cd-days">${billDays}</div>
              <div class="cd-date">วันที่ ${card.billingCycleDay} ${THAI_MONTHS[billDate.getMonth()]}</div>
              <div class="cd-urgency">${billDays<=3?'⚡ ใกล้แล้ว!':billDays<=7?'เร็วๆ นี้':'ยังมีเวลา'}</div>
            </div>
            <div class="cd-block due">
              <div class="cd-lbl">วันครบกำหนดชำระ</div>
              <div class="cd-days">${dueDays}</div>
              <div class="cd-date">วันที่ ${card.paymentDueDay} ${THAI_MONTHS[dueDate.getMonth()]}</div>
              <div class="cd-urgency">${dueDays<=3?'🚨 ด่วน!':dueDays<=7?'⚠️ ระวัง!':'ยังไม่ถึง'}</div>
            </div>
          </div>
          ${monthInt>0?`<div class="int-warn mb16"><div class="int-warn-title">⚠️ ดอกเบี้ยเดือนนี้</div><div class="int-warn-val">${hide?'••••':`฿${fmt(monthInt,2)}`}</div><div class="int-warn-sub">อัตรา ${card.interestRate}% ต่อปี • ชำระขั้นต่ำ ${hide?'••••':`฿${fmt(minPay)}`}</div></div>`:''}
          <div class="flex gap8 mb12">
            <button class="btn btn-primary" style="flex:1" onclick="App.navigate('payment',{id:'${card.id}'})">💳 ชำระเงิน</button>
            <button class="btn btn-secondary" style="flex:1" onclick="App.navigate('add-transaction',{cardId:'${card.id}'})">+ รายจ่าย</button>
          </div>
          <div class="flex gap8 mb8">
            <button class="btn btn-secondary full" onclick="App.navigate('add-card',{id:'${card.id}'})">✏️ แก้ไขบัตร</button>
            <button class="btn btn-danger" style="width:56px;flex-shrink:0;padding:0" onclick="PageCardDetail.confirmDelete('${card.id}')">🗑️</button>
          </div>
        </div>
        <div style="padding:0 20px 24px">
          <div class="sec-hdr"><span class="sec-title">รายการใช้จ่าย</span><span class="sec-action" onclick="App.navigate('add-transaction',{cardId:'${card.id}'})">+ เพิ่ม</span></div>
          ${txs.length
            ?`<div class="tx-list">${txs.map(tx=>renderTxItemDetail(tx)).join('')}</div>`
            :`<div class="empty-state" style="padding:40px 0"><div class="empty-icon">🛒</div><div class="empty-title">ยังไม่มีรายการ</div></div>`
          }
          ${insts.length?`<div class="sec-hdr" style="margin-top:20px"><span class="sec-title">การผ่อนชำระ</span></div>${insts.map(i=>renderInstSummary(i)).join('')}`:''}
        </div>
      </div>`;
  },
  confirmDelete(id) {
    const card=Store.cards.get(id);
    if(!card)return;
    Modal.show(`<div class="modal-handle"></div><div class="modal-hdr"><span class="modal-title">ลบบัตร</span><button class="icon-btn" onclick="Modal.close()">✕</button></div><div style="padding:20px"><div style="text-align:center;padding:16px 0"><div style="font-size:48px;margin-bottom:12px">🗑️</div><div style="font-size:16px;font-weight:800;color:var(--t1);margin-bottom:8px">ลบ "${card.name}"?</div><div style="font-size:14px;color:var(--t2);line-height:1.5">รายการทั้งหมดของบัตรนี้จะถูกลบด้วย</div></div><div class="flex gap8" style="margin-top:8px"><button class="btn btn-secondary full" onclick="Modal.close()">ยกเลิก</button><button class="btn btn-danger full" onclick="PageCardDetail.deleteCard('${id}')">ลบบัตร</button></div></div>`);
  },
  deleteCard(id) { Store.cards.delete(id); Modal.close(); Toast.show('ลบบัตรแล้ว','info'); App.navigate('dashboard',{}); }
};

function renderTxItemDetail(tx) {
  const instBtn=!tx.isInstallment?`<button style="background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);color:var(--purple-l);font-size:11px;font-weight:700;padding:4px 10px;border-radius:9999px;cursor:pointer" onclick="App.navigate('installment',{txId:'${tx.id}'})">แบ่งผ่อน</button>`:'';
  const badges=[];
  if(tx.isInstallment) badges.push('<span class="tx-badge">ผ่อนชำระ</span>');
  if(tx.isAutoDeducted) badges.push('<span class="tx-badge auto">อัตโนมัติ</span>');
  return `<div class="tx-item"><div class="tx-icon-wrap">${catIcon(tx.category)}</div><div class="tx-info"><div class="tx-name">${tx.description||catLabel(tx.category)}</div><div class="tx-meta">${fmtShortDate(tx.date)} ${badges.join('')} ${instBtn}</div></div><div class="tx-right"><div class="tx-amt">${App._hideData?'-••••':`-฿${fmt(tx.amount)}`}</div></div></div>`;
}

function renderInstSummary(inst) {
  const paid=inst.schedule.filter(x=>x.paid).length;
  const total=inst.schedule.length;
  const remaining=inst.schedule.filter(x=>!x.paid).reduce((s,x)=>s+x.amount,0);
  const hide=App._hideData;
  return `<div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r-md);padding:14px;margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div><div style="font-size:14px;font-weight:800;color:var(--t1)">${inst.description||'ผ่อนชำระ'}</div><div style="font-size:12px;color:var(--t3);margin-top:2px">ชำระแล้ว ${paid}/${total} งวด • เหลือ ${hide?'••••':`฿${fmt(remaining)}`}</div></div><div style="text-align:right"><div style="font-size:16px;font-weight:900;color:var(--purple-l)">${hide?'••••':`฿${fmt(inst.monthlyPayment,2)}`}</div><div style="font-size:11px;color:var(--t3)">ต่องวด</div></div></div><div style="background:var(--glass2);border-radius:9999px;height:6px;overflow:hidden"><div style="width:${total>0?(paid/total*100):0}%;height:100%;background:linear-gradient(90deg,var(--green),var(--teal));border-radius:9999px"></div></div><button class="btn btn-secondary btn-sm" style="margin-top:10px;width:100%" onclick="App.navigate('installment',{instId:'${inst.id}'})">ดูตาราง</button></div>`;
}

// ============================================================
// PAGE: ADD / EDIT CARD
// ============================================================
const PageAddCard = {
  _grad:'cg-blue', _type:'visa',
  render(params) {
    const ed=params&&params.id?Store.cards.get(params.id):null;
    this._grad=ed?ed.gradient:'cg-blue'; this._type=ed?ed.type:'visa';
    const prev=ed?{...ed}:{id:'preview',name:'ชื่อบัตร',lastFour:'0000',type:'visa',gradient:'cg-blue',usedCredit:0};
    const swatches=GRADIENTS.map(gr=>`<div class="grad-swatch ${GRAD_SWATCHES[gr]}${gr===this._grad?' sel':''}" data-grad="${gr}" title="${GRAD_NAMES[gr]}"></div>`).join('');
    document.getElementById('page-content').innerHTML=`
      <div class="p-enter" style="padding:20px">
        <div class="card-preview-wrap" id="cardPreviewWrap">${renderCardVisual(prev)}</div>
        <div class="form-group mb12"><label class="form-label">ชื่อบัตร</label><input id="f-name" class="form-input" type="text" placeholder="เช่น KBank Platinum" value="${ed?ed.name:''}"></div>
        <div class="input-row mb12">
          <div class="form-group"><label class="form-label">เลขท้าย 4 หลัก</label><input id="f-last4" class="form-input center" type="text" inputmode="numeric" maxlength="4" placeholder="0000" value="${ed?ed.lastFour:''}"></div>
          <div class="form-group"><label class="form-label">วงเงิน (บาท)</label><input id="f-limit" class="form-input" type="number" inputmode="numeric" placeholder="50000" value="${ed?ed.totalLimit:''}"></div>
        </div>
        <div class="form-group mb12">
          <label class="form-label">ประเภทบัตร</label>
          <div class="type-row">
            <button class="type-btn${this._type==='visa'?' sel':''}" data-type="visa" onclick="PageAddCard.setType('visa')"><div class="visa-logo" style="font-size:22px">VISA</div><div class="type-btn-label">Visa</div></button>
            <button class="type-btn${this._type==='mastercard'?' sel':''}" data-type="mastercard" onclick="PageAddCard.setType('mastercard')"><div style="display:flex"><div style="width:22px;height:22px;border-radius:50%;background:#EB001B;opacity:.9"></div><div style="width:22px;height:22px;border-radius:50%;background:#F79E1B;opacity:.9;margin-left:-9px"></div></div><div class="type-btn-label">Mastercard</div></button>
            <button class="type-btn${this._type==='other'?' sel':''}" data-type="other" onclick="PageAddCard.setType('other')"><div style="font-size:22px;font-weight:900;color:var(--t2)">✦</div><div class="type-btn-label">อื่นๆ</div></button>
          </div>
        </div>
        <div class="form-group mb12"><label class="form-label">สีบัตร</label><div class="color-picker-row" id="swatchRow">${swatches}</div></div>
        <div class="input-row mb12">
          <div class="form-group"><label class="form-label">ดอกเบี้ย (%/ปี)</label><input id="f-rate" class="form-input" type="number" inputmode="decimal" step="0.1" placeholder="0" value="${ed?ed.interestRate:'0'}"><div class="form-hint">ใส่ 0 ถ้าไม่มีดอกเบี้ย</div></div>
          <div class="form-group"><label class="form-label">วันตัดรอบ</label><input id="f-billday" class="form-input center" type="number" inputmode="numeric" min="1" max="31" placeholder="15" value="${ed?ed.billingCycleDay:'15'}"></div>
        </div>
        <div class="form-group mb20"><label class="form-label">ระยะปลอดดอกเบี้ย (วัน)</label><input id="f-grace" class="form-input center" type="number" inputmode="numeric" min="1" max="60" placeholder="15" value="${ed?(ed.gracePeriodDays||15):'15'}"><div class="form-hint">เช่น 15, 20 หรือ 45 วัน</div></div>
        <button class="btn btn-primary full mb12" onclick="PageAddCard.save('${ed?ed.id:''}')">${ed?'💾 บันทึกการแก้ไข':'✨ เพิ่มบัตร'}</button>
        ${ed?`<button class="btn btn-danger full" onclick="PageCardDetail.confirmDelete('${ed.id}')">🗑️ ลบบัตรนี้</button>`:''}
      </div>`;

    let prevCard={...prev};
    const upd=()=>{
      prevCard.name=document.getElementById('f-name').value||'ชื่อบัตร';
      prevCard.lastFour=(document.getElementById('f-last4').value||'0000').slice(-4).padStart(4,'0');
      prevCard.gradient=this._grad; prevCard.type=this._type;
      const w=document.getElementById('cardPreviewWrap');
      if(w) w.innerHTML=renderCardVisual(prevCard);
    };
    document.getElementById('f-name').addEventListener('input',upd);
    document.getElementById('f-last4').addEventListener('input',upd);
    document.getElementById('swatchRow').querySelectorAll('.grad-swatch').forEach(sw=>{
      sw.addEventListener('click',()=>{
        document.querySelectorAll('.grad-swatch').forEach(s=>s.classList.remove('sel'));
        sw.classList.add('sel'); this._grad=sw.dataset.grad; upd();
      });
    });
  },
  setType(t) {
    this._type=t;
    document.querySelectorAll('.type-btn').forEach(b=>b.classList.toggle('sel',b.dataset.type===t));
    document.getElementById('f-name')&&document.getElementById('f-name').dispatchEvent(new Event('input'));
  },
  save(editId) {
    const name=document.getElementById('f-name').value.trim();
    const lastFour=document.getElementById('f-last4').value.trim();
    const limit=parseFloat(document.getElementById('f-limit').value);
    const rate=parseFloat(document.getElementById('f-rate').value)||0;
    const billDay=parseInt(document.getElementById('f-billday').value)||15;
    const grace=parseInt(document.getElementById('f-grace').value)||15;
    if(!name){Toast.show('กรุณากรอกชื่อบัตร','warning');return;}
    if(!lastFour||lastFour.length<4){Toast.show('กรุณากรอกเลขท้าย 4 หลัก','warning');return;}
    if(!limit||limit<=0){Toast.show('กรุณากรอกวงเงินบัตร','warning');return;}
    if(editId){
      const card=Store.cards.get(editId); if(!card)return;
      Object.assign(card,{name,lastFour:lastFour.slice(-4),type:this._type,gradient:this._grad,totalLimit:limit,availableCredit:limit-card.usedCredit,interestRate:rate,billingCycleDay:billDay,gracePeriodDays:grace});
      Store.cards.save(card); Toast.show('แก้ไขบัตรสำเร็จ ✅','success'); App.navigate('dashboard',{});
    } else {
      const card=createCard({name,lastFour,type:this._type,gradient:this._grad,totalLimit:limit,interestRate:rate,billingCycleDay:billDay,gracePeriodDays:grace});
      Store.cards.save(card); Toast.show('เพิ่มบัตรสำเร็จ 🎉','success'); App.navigate('dashboard',{});
    }
  }
};

// ============================================================
// PAGE: ADD TRANSACTION
// ============================================================
const PageAddTransaction = {
  _card:null, _cat:'food', _date:new Date().toISOString().slice(0,10),
  render(params) {
    const cards=Store.cards.getAll();
    if(cards.length===0){document.getElementById('page-content').innerHTML=`<div class="empty-state" style="padding:80px 20px"><div class="empty-icon">💳</div><div class="empty-title">ยังไม่มีบัตร</div><div class="empty-sub">เพิ่มบัตรเครดิตก่อน</div><button class="btn btn-primary" style="margin-top:16px" onclick="App.navigate('add-card',{})">+ เพิ่มบัตร</button></div>`;return;}
    const preselect=params&&params.cardId?params.cardId:cards[0].id;
    this._card=preselect; this._cat='food'; this._date=new Date().toISOString().slice(0,10);
    const catGrid=CATEGORIES.map(c=>`<button class="cat-btn${c.id==='food'?' sel':''}" data-cat="${c.id}" onclick="PageAddTransaction.setCat('${c.id}')"><div class="cat-icon">${c.icon}</div><div class="cat-label">${c.label}</div></button>`).join('');
    const cardItems=cards.map(c=>`<div class="mini-card${c.id===preselect?' sel':''} ${c.gradient||'cg-blue'}" data-cid="${c.id}" onclick="PageAddTransaction.setCard('${c.id}')"><div class="mini-card-name">${c.name}</div><div class="mini-card-last4">•••• ${c.lastFour}</div></div>`).join('');
    document.getElementById('page-content').innerHTML=`
      <div class="p-enter" style="padding:20px">
        <div class="form-group mb16"><label class="form-label">เลือกบัตรที่ใช้จ่าย</label><div class="card-sel-row">${cardItems}</div></div>
        <div class="form-group mb16"><label class="form-label">ยอดเงิน</label><div class="amount-wrap"><span class="amount-currency">฿</span><input id="f-amount" class="form-input big" style="padding-left:55px" type="number" inputmode="decimal" placeholder="0" min="0"></div></div>
        <div class="form-group mb8"><label class="form-label">รายการ / ชื่อร้าน</label><input id="f-desc" class="form-input" type="text" placeholder="เช่น Grab, Netflix, Central..." autocomplete="off"></div>
        <div class="smart-row" id="smartRow"></div>
        <div class="form-group mb16" style="margin-top:12px"><label class="form-label">หมวดหมู่</label><div class="cat-grid">${catGrid}</div></div>
        <div class="pay-option mb16" id="inst-toggle" onclick="this.classList.toggle('sel')"><div class="pay-radio"><div class="pay-radio-dot"></div></div><div class="pay-info"><div class="pay-title">📅 ผ่อนชำระ (Installment)</div><div class="pay-sub">ตั้งค่าแบ่งจ่ายและดอกเบี้ย</div></div></div>
        <div class="form-group mb20"><label class="form-label">วันที่</label><input id="f-date" class="form-input" type="date" value="${this._date}"></div>
        <button class="btn btn-primary full" onclick="PageAddTransaction.save()">💾 บันทึกรายจ่าย</button>
      </div>`;
    document.getElementById('f-desc').addEventListener('input',e=>{
      const cat=catForMerchant(e.target.value);
      const sr=document.getElementById('smartRow');
      if(cat&&e.target.value.length>=2){this.setCat(cat);const co=CAT_MAP[cat]||CAT_MAP['other'];sr.innerHTML=`<div class="smart-chip" onclick="PageAddTransaction.setCat('${cat}')">✨ ${co.icon} ${co.label}</div>`;}
      else sr.innerHTML='';
    });
    document.getElementById('f-date').addEventListener('change',e=>this._date=e.target.value);
  },
  setCard(id){this._card=id;document.querySelectorAll('.mini-card').forEach(el=>el.classList.toggle('sel',el.dataset.cid===id));
    const selEl = document.querySelector(`.mini-card[data-cid="${id}"]`);
    if(selEl) selEl.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  },
  setCat(id){this._cat=id;document.querySelectorAll('.cat-btn').forEach(b=>b.classList.toggle('sel',b.dataset.cat===id));},
  save(){
    const amount=parseFloat(document.getElementById('f-amount').value);
    const desc=document.getElementById('f-desc').value.trim();
    const dateVal=document.getElementById('f-date').value;
    if(!amount||amount<=0){Toast.show('กรุณากรอกยอดเงิน','warning');return;}
    if(!this._card){Toast.show('กรุณาเลือกบัตร','warning');return;}
    const card=Store.cards.get(this._card);
    if(!card){Toast.show('ไม่พบบัตร','error');return;}
    if(amount>card.availableCredit) Toast.show(`⚠️ วงเงินไม่พอ (คงเหลือ ฿${fmt(card.availableCredit)})`,'warning');
    card.usedCredit=(card.usedCredit||0)+amount; card.availableCredit=card.totalLimit-card.usedCredit;
    Store.cards.save(card);
    const tx=createTransaction({cardId:this._card,amount,description:desc,category:this._cat,date:new Date(dateVal||Date.now()).toISOString()});
    Store.transactions.save(tx);
    const isInst=document.getElementById('inst-toggle').classList.contains('sel');
    if(isInst){
      App.navigate('installment',{txId:tx.id});
    }else{
      vibrate(); Toast.show(`บันทึก ฿${fmt(amount)} สำเร็จ ✅`,'success'); App.navigate('dashboard',{});
    }
  }
};

// ============================================================
// PAGE: PAYMENT
// ============================================================
const PagePayment = {
  _sel:'full', _card:null,
  render(params) {
    const card=Store.cards.get(params.id);
    if(!card){App.navigate('dashboard',{});return;}
    this._card=card; this._sel='full';
    const minPay=Interest.minimumPayment(card.usedCredit);
    const monthInt=Interest.monthlyInterest(card.usedCredit,card.interestRate);
    const hide=App._hideData;
    document.getElementById('page-content').innerHTML=`
      <div class="p-enter" style="padding:20px">
        <div style="display:flex;justify-content:center;margin-bottom:20px">${renderCardVisual(card)}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:var(--r-md);margin-bottom:16px">
          <div><div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--t3)">ยอดค้างชำระ</div><div style="font-size:30px;font-weight:900;letter-spacing:-1px;color:var(--red-l);margin-top:2px">${hide?'••••':`฿${fmt(card.usedCredit)}`}</div></div>
          <div style="text-align:right"><div style="font-size:12px;color:var(--t3)">ดอกเบี้ยเดือนนี้</div><div style="font-size:18px;font-weight:800;color:var(--amber)">${hide?'••••':`฿${fmt(monthInt,2)}`}</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
          <div class="pay-option sel" data-pay="full" onclick="PagePayment.selectPay('full')"><div class="pay-radio"><div class="pay-radio-dot"></div></div><div class="pay-info"><div class="pay-title">💯 จ่ายเต็มจำนวน</div><div class="pay-sub">ล้างยอดหนี้ทั้งหมด</div></div><div class="pay-amount" style="color:var(--green-l)">${hide?'••••':`฿${fmt(card.usedCredit)}`}</div></div>
          <div class="pay-option" data-pay="min" onclick="PagePayment.selectPay('min')"><div class="pay-radio"><div class="pay-radio-dot"></div></div><div class="pay-info"><div class="pay-title">⚡ จ่ายขั้นต่ำ</div><div class="pay-sub">10% ของยอด</div></div><div class="pay-amount" style="color:var(--amber)">${hide?'••••':`฿${fmt(minPay)}`}</div></div>
          <div class="pay-option" data-pay="custom" onclick="PagePayment.selectPay('custom')"><div class="pay-radio"><div class="pay-radio-dot"></div></div><div class="pay-info"><div class="pay-title">✏️ ระบุเอง</div><div class="pay-sub">กรอกยอดที่ต้องการ</div></div><div class="pay-amount" style="color:var(--blue-l)">กำหนดเอง</div></div>
        </div>
        <div id="customAmtWrap" class="hidden mb16"><div class="form-group"><label class="form-label">ยอดที่ต้องการจ่าย</label><div class="amount-wrap"><span class="amount-currency">฿</span><input id="f-custom-amt" class="form-input big" style="padding-left:55px" type="number" inputmode="decimal" placeholder="0" min="0"></div></div></div>
        <div id="minWarnWrap" class="warn-box hidden mb16"><span class="warn-icon">⚠️</span><div class="warn-text"><strong>ดอกเบี้ยสะสม!</strong> ยอดที่เหลือ <strong>${hide?'••••':`฿${fmt(card.usedCredit-minPay)}`}</strong> จะถูกคิดดอกเบี้ย ${card.interestRate}% ต่อปี<br>ดอกเบี้ยเดือนหน้าประมาณ: <strong>${hide?'••••':`฿${fmt(Interest.monthlyInterest(card.usedCredit-minPay,card.interestRate),2)}`}</strong></div></div>
        <button class="btn btn-success full" onclick="PagePayment.confirm()">✅ ยืนยันการชำระ</button>
      </div>`;
  },
  selectPay(t){this._sel=t;document.querySelectorAll('.pay-option').forEach(el=>el.classList.toggle('sel',el.dataset.pay===t));document.getElementById('customAmtWrap').classList.toggle('hidden',t!=='custom');document.getElementById('minWarnWrap').classList.toggle('hidden',t!=='min');},
  confirm(){
    const card=this._card; if(!card)return;
    let amount=0;
    if(this._sel==='full') amount=card.usedCredit;
    else if(this._sel==='min') amount=Interest.minimumPayment(card.usedCredit);
    else{amount=parseFloat(document.getElementById('f-custom-amt').value);if(!amount||amount<=0){Toast.show('กรุณากรอกยอดเงิน','warning');return;}}
    amount=Math.min(amount,card.usedCredit);
    card.usedCredit=Math.max(0,card.usedCredit-amount); card.availableCredit=card.totalLimit-card.usedCredit;
    card.lastPaymentDate=new Date().toISOString();
    Store.cards.save(card); vibrate(50); Toast.show(`ชำระ ฿${fmt(amount)} สำเร็จ ✅`,'success'); App.navigate('dashboard',{});
  }
};

// ============================================================
// PAGE: INSTALLMENT
// ============================================================
const PageInstallment = {
  _months:6,_rate:0,_rateType:'flat',_tx:null,_inst:null,
  render(params) {
    if(params&&params.instId){const inst=Store.installments.get(params.instId);if(!inst){App.navigate('dashboard',{});return;}this._inst=inst;this.renderView(inst);return;}
    const tx=Store.transactions.get(params&&params.txId);
    if(!tx){App.navigate('dashboard',{});return;}
    this._tx=tx; this._months=6; this._rate=0; this._rateType='flat';
    const hide=App._hideData;
    document.getElementById('page-content').innerHTML=`
      <div class="p-enter" style="padding:20px">
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r-md);padding:16px;margin-bottom:20px">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--t3);margin-bottom:6px">รายการที่จะผ่อน</div>
          <div style="font-size:15px;font-weight:800;color:var(--t1)">${tx.description||catLabel(tx.category)}</div>
          <div style="font-size:28px;font-weight:900;letter-spacing:-1px;color:var(--blue-l);margin-top:4px">${hide?'••••':`฿${fmt(tx.amount)}`}</div>
        </div>
        <div class="form-group mb16"><label class="form-label">จำนวนงวด</label><div class="months-row">${[3,6,10,12,18,24].map(m=>`<button class="month-btn${m===6?' active':''}" data-m="${m}" onclick="PageInstallment.setMonths(${m})">${m} เดือน</button>`).join('')}</div></div>
        <div class="form-group mb16"><label class="form-label">ดอกเบี้ย (% ต่อปี)</label><input id="f-inst-rate" class="form-input" type="number" inputmode="decimal" step="0.01" placeholder="0 = ไม่มีดอกเบี้ย" value="0"><div class="form-hint">0% = แบ่งชำระแบบไม่มีดอกเบี้ย</div></div>
        <div class="form-group mb16"><label class="form-label">วิธีคิดดอกเบี้ย</label><div class="type-row"><div class="type-btn sel" data-rt="flat" onclick="PageInstallment.setRateType('flat')"><div class="type-btn-label">คงที่ (Flat)</div></div><div class="type-btn" data-rt="effective" onclick="PageInstallment.setRateType('effective')"><div class="type-btn-label">ลดต้นลดดอก</div></div></div></div>
        <div class="calc-result mb16" id="calcResult"><div><div class="cr-label">จ่ายต่อเดือน</div><div class="cr-val blue" id="cr-monthly">฿0</div></div><div><div class="cr-label">ดอกเบี้ยรวม</div><div class="cr-val amber" id="cr-interest">฿0</div></div><div><div class="cr-label">ยอดรวมทั้งหมด</div><div class="cr-val red" id="cr-total">฿0</div></div><div><div class="cr-label">จำนวนงวด</div><div class="cr-val green" id="cr-months">6 งวด</div></div></div>
        <div class="mb16"><div class="sec-hdr"><span class="sec-title" style="font-size:14px">ตัวอย่างตาราง</span></div><div class="sched-table" id="schedPreview"></div></div>
        <button class="btn btn-primary full" onclick="PageInstallment.save()">✅ ยืนยันแบ่งผ่อน</button>
      </div>`;
    this.updateCalc();
    document.getElementById('f-inst-rate').addEventListener('input',e=>{this._rate=parseFloat(e.target.value)||0;this.updateCalc();});
  },
  renderView(inst) {
    const card=Store.cards.get(inst.cardId);
    const hide=App._hideData;
    document.getElementById('page-content').innerHTML=`
      <div class="p-enter" style="padding:20px">
        <div style="background:linear-gradient(135deg,rgba(139,92,246,0.1),rgba(59,130,246,0.1));border:1px solid var(--gb2);border-radius:var(--r-lg);padding:18px;margin-bottom:20px">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--t3);margin-bottom:4px">รายละเอียดการผ่อน</div>
          <div style="font-size:16px;font-weight:800;color:var(--t1);margin-bottom:12px">${inst.description||'ผ่อนชำระ'}${card?' • '+card.name:''}</div>
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">ยอดต้น</div><div class="stat-val b">${hide?'••••':`฿${fmt(inst.principalAmount)}`}</div></div>
            <div class="stat-card"><div class="stat-label">จ่ายต่องวด</div><div class="stat-val p">${hide?'••••':`฿${fmt(inst.monthlyPayment,2)}`}</div></div>
            <div class="stat-card"><div class="stat-label">ดอกเบี้ยรวม</div><div class="stat-val a">${hide?'••••':`฿${fmt(inst.totalInterest,2)}`}</div></div>
            <div class="stat-card"><div class="stat-label">ชำระแล้ว</div><div class="stat-val g">${inst.schedule.filter(x=>x.paid).length}/${inst.months} งวด</div></div>
          </div>
        </div>
        <div class="sec-hdr"><span class="sec-title">ตารางชำระทั้งหมด</span></div>
        <div class="sched-table">${inst.schedule.map((row,i)=>`<div class="sched-row${row.paid?' paid':''}"><div><div class="sched-mo">งวดที่ ${row.month}</div><div class="sched-date">${fmtShortDate(row.dueDate)}</div></div><div class="sched-amt" style="display:flex;flex-direction:column;align-items:flex-end"><div>${hide?'••••':`฿${fmt(row.amount,2)}`}</div><div style="font-size:11px;color:var(--amber-l);font-weight:600">ด/บ ฿${fmt(row.interestPart,2)}</div></div><div class="sched-st">${row.paid?'✅':'⏳'}</div>${!row.paid?`<button style="background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);color:var(--green-l);font-size:12px;font-weight:700;padding:6px 12px;border-radius:9999px;cursor:pointer;min-height:36px" onclick="PageInstallment.markPaid('${inst.id}',${i})">จ่ายแล้ว</button>`:''}</div>`).join('')}</div>
      </div>`;
  },
  setRateType(t){this._rateType=t;document.querySelectorAll('[data-rt]').forEach(b=>b.classList.toggle('sel',b.dataset.rt===t));this.updateCalc();},
  setMonths(m){this._months=m;document.querySelectorAll('.month-btn').forEach(b=>b.classList.toggle('active',+b.dataset.m===m));this.updateCalc();},
  updateCalc(){
    if(!this._tx)return;
    const hide=App._hideData;
    const c=Interest.calcInstallment(this._tx.amount,this._rate,this._months,this._rateType);
    const el=id=>document.getElementById(id);
    if(el('cr-monthly'))el('cr-monthly').textContent=hide?'••••':`฿${fmt(c.monthlyPayment,2)}`;
    if(el('cr-interest'))el('cr-interest').textContent=hide?'••••':`฿${fmt(c.totalInterest,2)}`;
    if(el('cr-total'))el('cr-total').textContent=hide?'••••':`฿${fmt(c.totalAmount,2)}`;
    if(el('cr-months'))el('cr-months').textContent=this._months+' งวด';
    const prev=document.getElementById('schedPreview');
    if(prev){const s=Interest.amortizationSchedule(this._tx.amount,this._rate,this._months,new Date().toISOString(),this._rateType);prev.innerHTML=s.slice(0,4).map(r=>`<div class="sched-row"><div><div class="sched-mo">งวดที่ ${r.month}</div><div class="sched-date">${fmtShortDate(r.dueDate)}</div></div><div class="sched-amt" style="display:flex;flex-direction:column;align-items:flex-end"><div>${hide?'••••':`฿${fmt(r.amount,2)}`}</div><div style="font-size:11px;color:var(--amber-l);font-weight:600">ด/บ ฿${fmt(r.interestPart,2)}</div></div><div class="sched-st">⏳</div></div>`).join('')+(this._months>4?`<div style="text-align:center;padding:10px;color:var(--t3);font-size:13px">... และอีก ${this._months-4} งวด</div>`:'');}
  },
  save(){
    if(!this._tx)return;
    const inst=createInstallment({cardId:this._tx.cardId,transactionId:this._tx.id,description:this._tx.description||catLabel(this._tx.category),principalAmount:this._tx.amount,months:this._months,annualInterestRate:this._rate,rateType:this._rateType,startDate:new Date().toISOString()});
    Store.installments.save(inst);
    this._tx.isInstallment=true; this._tx.installmentId=inst.id; Store.transactions.save(this._tx);
    Toast.show('ตั้งการผ่อนชำระสำเร็จ ✅','success'); App.navigate('dashboard',{});
  },
  markPaid(instId,idx){
    const inst=Store.installments.get(instId); if(!inst)return;
    inst.schedule[idx].paid=true; inst.schedule[idx].paidDate=new Date().toISOString();
    Store.installments.save(inst); vibrate(); Toast.show('บันทึกการชำระงวดแล้ว ✅','success'); this.renderView(inst);
  }
};

// ============================================================
// PAGE: OVERVIEW
// ============================================================
const PageOverview = {
  _chart:null,
  render() {
    const cards=Store.cards.getAll();
    const totals=getCardTotals();
    const ods=Store.otherDebts.getAll();
    const allTx=Store.transactions.getAll();
    const allInsts=Store.installments.getAll();
    const totalMonthlyPay=cards.reduce((s,c)=>{const im=allInsts.filter(i=>i.cardId===c.id).reduce((ss,i)=>{const u=i.schedule.find(x=>!x.paid);return ss+(u?u.amount:0);},0);return s+im;},0);
    const pieColors=['#3B82F6','#8B5CF6','#E11D48','#059669','#EA580C','#0D9488','#4F46E5','#DB2777','#F59E0B','#14B8A6'];
    const pieSets=[
      ...cards.filter(c=>c.usedCredit>0).map((c,i)=>({label:c.name,value:c.usedCredit,color:pieColors[i%pieColors.length]})),
      ...ods.filter(o=>o.remainingAmount>0).map((o,i)=>({label:o.name,value:o.remainingAmount,color:'#F59E0B'}))
    ];
    const grandTotal=totals.grandTotal;
    const hide=App._hideData;

    document.getElementById('page-content').innerHTML=`
      <div class="p-enter" style="padding:20px">
        <div class="ov-total"><div class="ov-total-label">ยอดหนี้รวมทั้งหมด</div><div class="ov-total-amt">${hide?'••••':`฿${fmt(grandTotal)}`}</div><div class="ov-total-sub">ดอกเบี้ยบัตรเครดิต/เดือน • ${hide?'••••':`฿${fmt(totals.monthlyInt,2)}`}</div></div>
        <div class="stats-grid mb20">
          <div class="stat-card"><div class="stat-label">บัตรเครดิต</div><div class="stat-val r">${hide?'••••':`฿${fmt(totals.totalDebt)}`}</div></div>
          <div class="stat-card"><div class="stat-label">หนี้อื่นๆ</div><div class="stat-val a">${hide?'••••':`฿${fmt(totals.otherDebt)}`}</div></div>
          <div class="stat-card"><div class="stat-label">ผ่อน/เดือน</div><div class="stat-val p">${hide?'••••':`฿${fmt(totalMonthlyPay,0)}`}</div></div>
          <div class="stat-card"><div class="stat-label">วงเงินคงเหลือ</div><div class="stat-val g">${hide?'••••':`฿${fmt(totals.totalAvailable)}`}</div></div>
        </div>
        ${pieSets.length>0?`
        <div class="sec-hdr"><span class="sec-title">โครงสร้างหนี้</span></div>
        <div class="chart-container mb12"><canvas id="debtPieChart"></canvas></div>
        <div class="pie-legend mb20">${pieSets.map(p=>`<div class="pie-li"><div class="pie-li-color" style="background:${p.color}"></div><div class="pie-li-name">${p.label}</div><div class="pie-li-pct">${grandTotal>0?((p.value/grandTotal)*100).toFixed(1):0}%</div><div class="pie-li-amt">${hide?'••••':`฿${fmt(p.value)}`}</div></div>`).join('')}</div>`:''}
        
        <details class="acc-wrap mb16" style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r-md)"><summary class="acc-sum sec-hdr" style="padding:16px;margin:0;cursor:pointer;list-style:none;outline:none"><div style="display:flex;justify-content:space-between;width:100%"><span class="sec-title">ดอกเบี้ยรายบัตร (กรณีค้างชำระ)</span><span style="font-size:12px;color:var(--t3);font-weight:700">▼ ซ่อน/แสดง</span></div></summary><div style="padding:0 16px 16px">
        ${cards.map((c,i)=>{const mi=c.usedCredit*(c.interestRate/100/12);return `<div class="int-card" style="border:none;padding:8px 0"><div class="int-l"><div class="int-dot" style="background:${pieColors[i%pieColors.length]}"></div><div><div class="int-name">${c.name}</div><div class="int-rate">${c.interestRate}% ต่อปี • ยอด ${hide?'••••':`฿${fmt(c.usedCredit)}`}</div></div></div><div class="int-amt">${hide?'••••':`฿${fmt(mi,2)}/เดือน`}</div></div>`;}).join('')}
        </div></details>
        
        ${ods.length>0?`<div class="sec-hdr" style="margin-top:16px"><span class="sec-title">หนี้อื่นๆ</span><span class="sec-action" onclick="App.navigate('subscriptions',{})">จัดการ</span></div>${ods.map(o=>`<div class="od-item mb8"><div class="od-icon">${o.icon}</div><div class="od-info"><div class="od-name">${o.name}</div><div class="od-meta">ดอกเบี้ย ${o.interestRate}% • วันที่ ${o.dueDay} ของเดือน</div></div><div class="od-r"><div class="od-monthly">${hide?'••••':`฿${fmt(o.monthlyPayment)}/เดือน`}</div><div class="od-remaining">ยอดคงเหลือ ${hide?'••••':`฿${fmt(o.remainingAmount)}`}</div></div></div>`).join('')}`:''}
        
        ${allTx.length>0?`<details class="acc-wrap" style="margin-top:20px;background:var(--glass);border:1px solid var(--border);border-radius:var(--r-md)"><summary class="acc-sum sec-hdr" style="padding:16px;margin:0;cursor:pointer;list-style:none;outline:none"><div style="display:flex;justify-content:space-between;width:100%"><span class="sec-title">รายการทั้งหมด (${allTx.length})</span><span style="font-size:12px;color:var(--t3);font-weight:700">▼ ซ่อน/แสดง</span></div></summary><div class="tx-list" style="padding:0 16px 16px">${allTx.slice().sort((a,b)=>new Date(b.createdAt||b.date)-new Date(a.createdAt||a.date)).map(tx=>renderTxItem(tx,cards)).join('')}</div></details>`:''}
      </div>`;

    if(pieSets.length>0){
      setTimeout(()=>{
        const ctx=document.getElementById('debtPieChart'); if(!ctx)return;
        if(PageOverview._chart) PageOverview._chart.destroy();
        PageOverview._chart=new Chart(ctx,{type:'doughnut',data:{labels:pieSets.map(p=>p.label),datasets:[{data:pieSets.map(p=>p.value),backgroundColor:pieSets.map(p=>p.color),borderColor:'#111827',borderWidth:3}]},options:{cutout:'68%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`฿${fmt(ctx.parsed)} (${((ctx.parsed/grandTotal)*100).toFixed(1)}%)`}}},animation:{duration:800}}});
      },100);
    }
  }
};

// ============================================================
// PAGE: CALENDAR
// ============================================================
const PageCalendar = {
  _year:new Date().getFullYear(),_month:new Date().getMonth(),_selDay:null,_filter:0,

  render() {
    document.getElementById('page-content').innerHTML=`<div class="p-enter" id="calWrap"></div>`;
    this.renderCal();
  },

  buildEvents(y,m) {
    const events={};
    const allEvs=[];
    const addEv=(day,ev)=>{
      const k=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      if(!events[k]) events[k]=[];
      events[k].push(ev);
      allEvs.push({...ev,day});
    };
    for(const card of Store.cards.getAll()){
      addEv(card.billingCycleDay,{type:'b',name:`ตัดรอบ: ${card.name}`,amt:card.usedCredit,color:'#F59E0B',card:card.name});
      addEv(card.paymentDueDay,{type:'d',name:`ชำระ: ${card.name}`,amt:Interest.minimumPayment(card.usedCredit),color:'#EF4444',card:card.name});
    }
    for(const inst of Store.installments.getAll()){
      for(const row of inst.schedule){
        if(!row.paid){const d=new Date(row.dueDate);if(d.getFullYear()===y&&d.getMonth()===m) addEv(d.getDate(),{type:'i',name:`ผ่อน: ${inst.description||''}`,amt:row.amount,color:'#8B5CF6'});}
      }
    }
    for(const sub of Store.subscriptions.getAll()){
      const d=new Date(sub.nextDueDate);
      if(d.getFullYear()===y&&d.getMonth()===m){const c=sub.cardId?Store.cards.get(sub.cardId):null;addEv(d.getDate(),{type:'s',name:`${sub.name}${c?` (${c.name})`:''}`,amt:sub.amount,color:'#14B8A6'});}
    }
    for(const od of Store.otherDebts.getAll()){
      addEv(od.dueDay,{type:'d',name:`${od.name} (ผ่อน)`,amt:od.monthlyPayment,color:'#F59E0B'});
    }
    allEvs.sort((a,b)=>a.day-b.day);
    return {events, allEvs};
  },

  renderCal() {
    const {_year:y,_month:m}=this;
    const today=new Date();
    const {events,allEvs}=this.buildEvents(y,m);
    const firstDay=new Date(y,m,1).getDay();
    const daysInMonth=new Date(y,m+1,0).getDate();
    const hide=App._hideData;

    let dayCells='';
    for(let i=0;i<firstDay;i++) dayCells+=`<div class="cal-day empty"></div>`;
    for(let d=1;d<=daysInMonth;d++){
      const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const evs=events[k]||[];
      const isToday=d===today.getDate()&&m===today.getMonth()&&y===today.getFullYear();
      const isSel=d===this._selDay;
      const dots=[evs.some(e=>e.type==='b')?'<div class="cdot b"></div>':'',evs.some(e=>e.type==='d')?'<div class="cdot d"></div>':'',evs.some(e=>e.type==='i')?'<div class="cdot i"></div>':'',evs.some(e=>e.type==='s')?'<div class="cdot s"></div>':''].filter(Boolean).join('');
      dayCells+=`<div class="cal-day${isToday?' today':''}${isSel?' sel':''}" onclick="PageCalendar.selDay(${d})">${d}${dots?`<div class="cal-dots-row">${dots}</div>`:''}</div>`;
    }

    const FILTERS=[
      {label:'ทั้งหมด',types:null},
      {label:'🟡 ตัดรอบ',types:['b']},
      {label:'🔴 ชำระ',types:['d']},
      {label:'🟣 ผ่อน',types:['i']},
      {label:'🩵 รายจ่าย',types:['s']},
    ];
    const filterTabs=FILTERS.map((f,i)=>`<button class="filter-tab${i===this._filter?' active':''}" onclick="PageCalendar.setFilter(${i})">${f.label}</button>`).join('');

    const activeFilter=FILTERS[this._filter];
    const filtEvs=activeFilter.types?allEvs.filter(e=>activeFilter.types.includes(e.type)):allEvs;

    let selEvHtml='';
    if(this._selDay!==null){
      const k=`${y}-${String(m+1).padStart(2,'0')}-${String(this._selDay).padStart(2,'0')}`;
      const dayEvs=events[k]||[];
      const typeLabels={b:'ตัดรอบบิล',d:'ครบกำหนดชำระ',i:'ผ่อนชำระ',s:'รายจ่ายประจำ'};
      selEvHtml=`<div class="cal-events"><div class="cal-ev-title">📅 ${this._selDay} ${THAI_MONTHS_FULL[m]} ${y+543}</div>${dayEvs.length===0?`<div style="color:var(--t3);font-size:13px;padding:12px 0">ไม่มีรายการในวันนี้</div>`:dayEvs.map(ev=>`<div class="cal-ev-item"><div class="cal-ev-dot" style="background:${ev.color}"></div><div style="flex:1"><div class="cal-ev-name">${ev.name}</div><div class="cal-ev-type">${typeLabels[ev.type]||''}</div></div><div class="cal-ev-amt">${hide?'••••':`฿${fmt(ev.amt)}`}</div></div>`).join('')}</div>`;
    }

    const monthListHtml=filtEvs.length===0?`<div style="color:var(--t3);font-size:13px;padding:8px 0">ไม่มีรายการในเดือนนี้</div>`:filtEvs.map(ev=>{
      const typeLabels={b:'ตัดรอบบิล',d:'ครบกำหนดชำระ',i:'ผ่อนชำระ',s:'รายจ่ายประจำ'};
      return `<div class="cal-ev-item"><div class="cal-ev-dot" style="background:${ev.color}"></div><div style="flex:1"><div class="cal-ev-name">${ev.name}</div><div class="cal-ev-type">${typeLabels[ev.type]||''} • วันที่ ${ev.day}</div></div><div class="cal-ev-amt">${hide?'••••':`฿${fmt(ev.amt)}`}</div></div>`;
    }).join('');

    const wrap=document.getElementById('calWrap');
    if(!wrap)return;
    wrap.innerHTML=`
      <div class="cal-nav">
        <button class="cal-nav-btn" onclick="PageCalendar.prevMonth()" aria-label="เดือนก่อน">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div class="cal-month-title">${THAI_MONTHS_FULL[m]} ${y+543}</div>
        <button class="cal-nav-btn" onclick="PageCalendar.nextMonth()" aria-label="เดือนถัดไป">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
      <div class="cal-grid mb8">
        ${THAI_DAYS.map(d=>`<div class="cal-dh">${d}</div>`).join('')}
        ${dayCells}
      </div>
      <div style="display:flex;gap:10px;padding:6px 20px 4px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:5px"><div class="cdot b" style="width:7px;height:7px"></div><span style="font-size:11px;color:var(--t3)">ตัดรอบ</span></div>
        <div style="display:flex;align-items:center;gap:5px"><div class="cdot d" style="width:7px;height:7px"></div><span style="font-size:11px;color:var(--t3)">ชำระ</span></div>
        <div style="display:flex;align-items:center;gap:5px"><div class="cdot i" style="width:7px;height:7px"></div><span style="font-size:11px;color:var(--t3)">ผ่อน</span></div>
        <div style="display:flex;align-items:center;gap:5px"><div class="cdot s" style="width:7px;height:7px"></div><span style="font-size:11px;color:var(--t3)">รายจ่ายประจำ</span></div>
      </div>
      </div>
      <div class="cal-filter-row" style="border-bottom:1px solid var(--border)">
        ${filterTabs}
      </div>
      <div style="padding:10px 20px;overflow-y:auto;max-height:40vh;scrollbar-width:none;-webkit-overflow-scrolling:touch">
        ${selEvHtml}
        ${this._selDay===null?`<div class="cal-events"><div class="cal-ev-title">รายการทั้งเดือน (${allEvs.length})</div>${monthListHtml}</div>`:''}
      </div>
      <div style="height:20px"></div>`;
  },

  selDay(d){this._selDay=d;this.renderCal();},
  setFilter(i){this._filter=i;this.renderCal();},
  prevMonth(){this._month--;if(this._month<0){this._month=11;this._year--;}this._selDay=null;this.renderCal();},
  nextMonth(){this._month++;if(this._month>11){this._month=0;this._year++;}this._selDay=null;this.renderCal();}
};

// ============================================================
// PAGE: SUBSCRIPTIONS + OTHER DEBTS
// ============================================================
const PageSubscriptions = {
  _tab:'subs', // 'subs' | 'debt'

  render(params) {
    if(params&&params.tab) this._tab=params.tab;
    const subs=Store.subscriptions.getAll();
    const ods=Store.otherDebts.getAll();
    const cards=Store.cards.getAll();
    const settings=Store.settings.get();
    const autoLogs=(settings.autoLogs||[]).slice().reverse().slice(0,5);
    const monthlyTotal=subs.filter(s=>s.isActive&&s.frequency==='monthly').reduce((s,x)=>s+x.amount,0);
    const yearlyTotal=subs.filter(s=>s.isActive&&s.frequency==='yearly').reduce((s,x)=>s+x.amount,0);
    const odTotal=ods.reduce((s,o)=>s+(o.monthlyPayment||0),0);
    const hide=App._hideData;

    const content=document.getElementById('page-content');
    content.innerHTML=`
      <div class="p-enter" style="padding:20px">
        <!-- Tab toggle -->
        <div class="segment mb16">
          <button class="seg-btn${this._tab==='subs'?' active':''}" onclick="PageSubscriptions.setTab('subs')">📦 Subscription</button>
          <button class="seg-btn${this._tab==='debt'?' active':''}" onclick="PageSubscriptions.setTab('debt')">🏠 หนี้อื่นๆ</button>
        </div>

        ${this._tab==='subs'?this.renderSubs(subs,cards,monthlyTotal,yearlyTotal,autoLogs,hide):this.renderDebts(ods,odTotal,hide)}
      </div>`;
  },

  renderSubs(subs,cards,monthlyTotal,yearlyTotal,autoLogs,hide) {
    return `
      <div class="total-bar mb16">
        <div><div class="total-bar-label">รายจ่ายประจำ/เดือน</div><div class="total-bar-val">${hide?'••••':`฿${fmt(monthlyTotal+yearlyTotal/12,0)}`}</div></div>
        <div style="text-align:right"><div style="font-size:11px;color:var(--t3)">รายปี ÷ 12</div><div style="font-size:15px;font-weight:800;color:var(--amber)">${hide?'••••':`+฿${fmt(yearlyTotal/12,0)}`}</div></div>
      </div>
      <button class="btn btn-primary full mb20" onclick="PageSubscriptions.showSubForm()">+ เพิ่ม Subscription</button>
      <div class="sec-hdr"><span class="sec-title">รายจ่ายทั้งหมด (${subs.length})</span></div>
      ${subs.length===0?`<div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">ยังไม่มีรายจ่ายประจำ</div><div class="empty-sub">เพิ่ม Netflix, Spotify หรือค่าบริการต่างๆ</div></div>`:
        `<div style="display:flex;flex-direction:column;gap:10px">${subs.map(sub=>{
          const card=sub.cardId?cards.find(c=>c.id===sub.cardId):null;
          const days=daysUntil(sub.nextDueDate);
          const uc=days<=3?'chip-r':days<=7?'chip-a':'chip-t';
          return `<div class="sub-item"><div class="sub-icon">${sub.icon}</div><div class="sub-info"><div class="sub-name">${sub.name}</div><div class="sub-meta">${{monthly:'รายเดือน',yearly:'รายปี',weekly:'รายสัปดาห์'}[sub.frequency]||sub.frequency} • ${fmtShortDate(sub.nextDueDate)} <span class="chip ${uc}" style="font-size:10px">อีก ${days} วัน</span></div>${card?`<div class="sub-tag">💳 ${card.name}</div>`:`<div class="sub-tag amber">ไม่ผูกบัตร</div>`}</div><div class="sub-r"><div class="sub-amt">${hide?'••••':`฿${fmt(sub.amount)}`}</div><div style="display:flex;gap:6px;margin-top:7px;justify-content:flex-end"><button style="background:var(--glass);border:1px solid var(--border);color:var(--t2);font-size:12px;font-weight:700;padding:5px 10px;border-radius:9999px;cursor:pointer;min-height:34px" onclick="PageSubscriptions.editSub('${sub.id}')">แก้ไข</button><button style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.2);color:var(--red-l);font-size:12px;font-weight:700;padding:5px 10px;border-radius:9999px;cursor:pointer;min-height:34px" onclick="PageSubscriptions.delSub('${sub.id}')">ลบ</button></div></div></div>`;
        }).join('')}</div>`}
      ${autoLogs.length>0?`<div class="sec-hdr" style="margin-top:24px"><span class="sec-title">บันทึกหักอัตโนมัติ</span></div>${autoLogs.map(l=>`<div class="auto-log"><span class="auto-log-icon">🤖</span><span class="auto-log-text">${l.name} ตัดจาก ${l.cardName} • ${fmtShortDate(l.date)}</span><span class="auto-log-amt">${hide?'••••':`฿${fmt(l.amount)}`}</span></div>`).join('')}`:''}`;
  },

  renderDebts(ods,odTotal,hide) {
    return `
      <div class="total-bar mb16">
        <div><div class="total-bar-label">ผ่อนหนี้รวม/เดือน</div><div class="total-bar-val">${hide?'••••':`฿${fmt(odTotal,0)}`}</div></div>
        <div style="text-align:right"><div style="font-size:11px;color:var(--t3)">จำนวนรายการ</div><div style="font-size:18px;font-weight:800;color:var(--amber)">${ods.length} รายการ</div></div>
      </div>
      <button class="btn btn-amber full mb20" onclick="PageSubscriptions.showDebtForm()">+ เพิ่มหนี้อื่นๆ (บ้าน/รถ)</button>
      <div class="sec-hdr"><span class="sec-title">หนี้ทั้งหมด</span></div>
      ${ods.length===0?`<div class="empty-state"><div class="empty-icon">🏠</div><div class="empty-title">ยังไม่มีหนี้อื่นๆ</div><div class="empty-sub">เพิ่มค่าผ่อนบ้าน รถ หรือสินเชื่อต่างๆ ที่ไม่ใช่บัตรเครดิต</div></div>`:
        `<div style="display:flex;flex-direction:column;gap:10px">${ods.map(od=>`
          <div class="od-item">
            <div class="od-icon">${od.icon}</div>
            <div class="od-info">
              <div class="od-name">${od.name}</div>
              <div class="od-meta">ดอกเบี้ย ${od.interestRate}%/ปี • วันที่ ${od.dueDay} ของเดือน</div>
              <div style="margin-top:6px"><div style="background:var(--glass2);border-radius:9999px;height:5px;overflow:hidden"><div style="width:${od.totalAmount>0?Math.min(100,((od.totalAmount-od.remainingAmount)/od.totalAmount)*100):0}%;height:100%;background:linear-gradient(90deg,var(--green),var(--teal));border-radius:9999px"></div></div><div style="font-size:10px;color:var(--t3);margin-top:3px">ชำระแล้ว ${hide?'••••':`฿${fmt(od.totalAmount-od.remainingAmount)}`} จาก ${hide?'••••':`฿${fmt(od.totalAmount)}`}</div></div>
            </div>
            <div class="od-r">
              <div class="od-monthly">${hide?'••••':`฿${fmt(od.monthlyPayment)}`}</div>
              <div class="od-remaining">คงเหลือ ${hide?'••••':`฿${fmt(od.remainingAmount)}`}</div>
              <div style="display:flex;gap:6px;margin-top:7px;justify-content:flex-end">
                <button style="background:var(--glass);border:1px solid var(--border);color:var(--t2);font-size:12px;font-weight:700;padding:5px 10px;border-radius:9999px;cursor:pointer;min-height:34px" onclick="PageSubscriptions.editDebt('${od.id}')">แก้ไข</button>
                <button style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.2);color:var(--red-l);font-size:12px;font-weight:700;padding:5px 10px;border-radius:9999px;cursor:pointer;min-height:34px" onclick="PageSubscriptions.delDebt('${od.id}')">ลบ</button>
              </div>
            </div>
          </div>`).join('')}</div>`}`;
  },

  setTab(t){this._tab=t;this.render({});},

  showSubForm(sub=null) {
    const cards=Store.cards.getAll();
    const isEdit=!!sub;
    Modal.show(`
      <div class="modal-handle"></div>
      <div class="modal-hdr"><span class="modal-title">${isEdit?'แก้ไข':'เพิ่ม'} Subscription</span><button class="icon-btn" onclick="Modal.close()">✕</button></div>
      <div style="padding:0 20px 20px">
        <div class="cat-grid mb16" id="subIconGrid">
          ${[['🎬','entertainment'],['🎵','entertainment'],['📺','entertainment'],['🌐','utilities'],['📡','utilities'],['🚗','car'],['🏠','other'],['💊','health'],['📚','education'],['🏋️','health'],['☕','food'],['💼','other']].map(([icon,cat])=>`<button class="cat-btn${sub&&sub.icon===icon?' sel':''}" data-icon="${icon}" data-cat="${cat}" onclick="PageSubscriptions._subIcon='${icon}';PageSubscriptions._subCat='${cat}';document.querySelectorAll('#subIconGrid .cat-btn').forEach(b=>b.classList.toggle('sel',b.dataset.icon==='${icon}'))"><div class="cat-icon">${icon}</div></button>`).join('')}
        </div>
        <div class="form-group mb12"><label class="form-label">ชื่อรายจ่าย</label><input id="sub-name" class="form-input" type="text" placeholder="Netflix, ค่าผ่อนรถ..." value="${sub?sub.name:''}"></div>
        <div class="input-row mb12">
          <div class="form-group"><label class="form-label">ยอด (บาท)</label><input id="sub-amount" class="form-input" type="number" inputmode="decimal" placeholder="0" value="${sub?sub.amount:''}"></div>
          <div class="form-group"><label class="form-label">ความถี่</label><select id="sub-freq" class="form-select"><option value="monthly" ${!sub||sub.frequency==='monthly'?'selected':''}>รายเดือน</option><option value="yearly" ${sub&&sub.frequency==='yearly'?'selected':''}>รายปี</option><option value="weekly" ${sub&&sub.frequency==='weekly'?'selected':''}>รายสัปดาห์</option></select></div>
        </div>
        <div class="form-group mb12"><label class="form-label">บัตรที่ผูก</label><select id="sub-card" class="form-select"><option value="">ไม่ผูกบัตร</option>${cards.map(c=>`<option value="${c.id}" ${sub&&sub.cardId===c.id?'selected':''}>${c.name} (••••${c.lastFour})</option>`).join('')}</select></div>
        <div class="form-group mb20"><label class="form-label">วันที่ชำระครั้งถัดไป</label><input id="sub-date" class="form-input" type="date" value="${sub?sub.nextDueDate.slice(0,10):futureDate(1).slice(0,10)}"></div>
        <button class="btn btn-primary full" onclick="PageSubscriptions.saveSub('${sub?sub.id:''}')">${isEdit?'💾 บันทึก':'+ เพิ่ม'}</button>
      </div>`);
    PageSubscriptions._subIcon=sub?sub.icon:'🎬'; PageSubscriptions._subCat=sub?sub.category:'entertainment';
  },

  _subIcon:'🎬', _subCat:'entertainment',

  saveSub(editId) {
    const name=document.getElementById('sub-name').value.trim();
    const amount=parseFloat(document.getElementById('sub-amount').value);
    const freq=document.getElementById('sub-freq').value;
    const cardId=document.getElementById('sub-card').value;
    const dateVal=document.getElementById('sub-date').value;
    if(!name){Toast.show('กรุณากรอกชื่อ','warning');return;}
    if(!amount||amount<=0){Toast.show('กรุณากรอกยอดเงิน','warning');return;}
    const data={cardId:cardId||null,name,amount,frequency:freq,category:this._subCat,icon:this._subIcon,nextDueDate:new Date(dateVal).toISOString()};
    if(editId){const sub=Store.subscriptions.get(editId);if(!sub)return;Object.assign(sub,data);Store.subscriptions.save(sub);}
    else Store.subscriptions.save(createSubscription(data));
    Modal.close(); Toast.show(editId?'แก้ไขสำเร็จ ✅':'เพิ่มสำเร็จ ✅','success'); App.navigate('dashboard',{});
  },

  editSub(id){const sub=Store.subscriptions.get(id);if(sub)this.showSubForm(sub);},
  delSub(id){Store.subscriptions.delete(id);Toast.show('ลบแล้ว','info');this.render({});},

  showDebtForm(od=null) {
    const isEdit=!!od;
    const debtIcons=[['🏠','บ้าน'],['🚗','รถ'],['🏢','คอนโด'],['💼','สินเชื่อ'],['📱','มือถือ'],['🏫','การศึกษา'],['💰','เงินกู้'],['🔑','ที่ดิน']];
    Modal.show(`
      <div class="modal-handle"></div>
      <div class="modal-hdr"><span class="modal-title">${isEdit?'แก้ไข':'เพิ่ม'}หนี้อื่นๆ</span><button class="icon-btn" onclick="Modal.close()">✕</button></div>
      <div style="padding:0 20px 20px">
        <div class="cat-grid mb16" id="debtIconGrid" style="grid-template-columns:repeat(4,1fr)">
          ${debtIcons.map(([icon,lbl])=>`<button class="cat-btn${od&&od.icon===icon?' sel':''}" data-icon="${icon}" onclick="PageSubscriptions._debtIcon='${icon}';document.querySelectorAll('#debtIconGrid .cat-btn').forEach(b=>b.classList.toggle('sel',b.dataset.icon==='${icon}'))"><div class="cat-icon">${icon}</div><div class="cat-label">${lbl}</div></button>`).join('')}
        </div>
        <div class="form-group mb12"><label class="form-label">ชื่อหนี้</label><input id="od-name" class="form-input" type="text" placeholder="เช่น ค่าผ่อนบ้าน Sansiri..." value="${od?od.name:''}"></div>
        <div class="input-row mb12">
          <div class="form-group"><label class="form-label">วงเงินต้น</label><input id="od-total" class="form-input" type="number" inputmode="decimal" placeholder="2500000" value="${od?od.totalAmount:''}"></div>
          <div class="form-group"><label class="form-label">ยอดคงเหลือ</label><input id="od-remaining" class="form-input" type="number" inputmode="decimal" placeholder="2000000" value="${od?od.remainingAmount:''}"></div>
        </div>
        <div class="input-row mb12">
          <div class="form-group"><label class="form-label">ผ่อน/เดือน</label><input id="od-monthly" class="form-input" type="number" inputmode="decimal" placeholder="15000" value="${od?od.monthlyPayment:''}"></div>
          <div class="form-group"><label class="form-label">ดอกเบี้ย (%/ปี)</label><input id="od-rate" class="form-input" type="number" inputmode="decimal" step="0.1" placeholder="5.5" value="${od?od.interestRate:''}"></div>
        </div>
        <div class="form-group mb20"><label class="form-label">วันตัดยอดของเดือน</label><input id="od-dueday" class="form-input center" type="number" inputmode="numeric" min="1" max="31" placeholder="1" value="${od?od.dueDay:'1'}"><div class="form-hint">วันที่ผ่อนจะถูกหักทุกเดือน</div></div>
        <button class="btn btn-amber full" onclick="PageSubscriptions.saveDebt('${od?od.id:''}')">${isEdit?'💾 บันทึก':'+ เพิ่มหนี้'}</button>
      </div>`);
    PageSubscriptions._debtIcon=od?od.icon:'🏠';
  },

  _debtIcon:'🏠',

  saveDebt(editId) {
    const name=document.getElementById('od-name').value.trim();
    const total=parseFloat(document.getElementById('od-total').value)||0;
    const remaining=parseFloat(document.getElementById('od-remaining').value)||0;
    const monthly=parseFloat(document.getElementById('od-monthly').value)||0;
    const rate=parseFloat(document.getElementById('od-rate').value)||0;
    const dueDay=parseInt(document.getElementById('od-dueday').value)||1;
    if(!name){Toast.show('กรุณากรอกชื่อ','warning');return;}
    if(!monthly||monthly<=0){Toast.show('กรุณากรอกยอดผ่อน/เดือน','warning');return;}
    const data={name,icon:this._debtIcon,category:'other',totalAmount:total,remainingAmount:remaining,monthlyPayment:monthly,interestRate:rate,dueDay};
    if(editId){const od=Store.otherDebts.get(editId);if(!od)return;Object.assign(od,data);Store.otherDebts.save(od);}
    else Store.otherDebts.save(createOtherDebt(data));
    Modal.close(); Toast.show(editId?'แก้ไขสำเร็จ ✅':'เพิ่มหนี้สำเร็จ ✅','success'); App.navigate('dashboard',{});
  },

  editDebt(id){const od=Store.otherDebts.get(id);if(od)this.showDebtForm(od);},
  delDebt(id){Store.otherDebts.delete(id);Toast.show('ลบแล้ว','info');this.render({tab:'debt'});}
};

// ============================================================
// PAGE: LOGIN
// ============================================================
const PageLogin = {
  render() {
    document.getElementById('page-content').innerHTML=`
      <div class="login-wrap">
        <div class="login-logo">💳</div>
        <div class="login-title">CardWallet</div>
        <div class="login-sub">แอปจัดการบัตรเครดิตอัจฉริยะ<br>บันทึกยอด คำนวณดอกเบี้ย วางแผนการชำระ</div>
        <button class="btn btn-google full" onclick="PageLogin.mockGoogleLogin()">
          <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign in with Google
        </button>
        <button class="login-guest" onclick="PageLogin.continueAsGuest()">ดำเนินการต่อแบบ Guest (ทดลองใช้)</button>
      </div>`;
  },
  mockGoogleLogin() {
    const mockEmail = 'user_' + Math.random().toString(36).substr(2,6) + '@gmail.com';
    Store.login(mockEmail);
    Store.clearCurrentUser(); 
    Toast.show('เข้าสู่ระบบสำเร็จ (จำลอง)', 'success');
    App.navigate('dashboard', {});
  },
  continueAsGuest() {
    Store.login('guest');
    if(Store.cards.getAll().length === 0) loadDemoData();
    Toast.show('เข้าสู่ระบบแบบ Guest', 'info');
    App.navigate('dashboard', {});
  }
};

// ============================================================
// APP ROUTER
// ============================================================
const App = {
  _route:'login', _params:{}, _history:[], _hideData:false,

  toggleHideData() {
    this._hideData = !this._hideData;
    const btn = document.getElementById('hide-btn');
    if(btn) {
      if(this._hideData) {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;
      } else {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
      }
    }
    this.render();
  },

  navigate(route, params) {
    this._history.push({route:this._route,params:this._params});
    this._route=route; this._params=params||{};
    this.render(); window.scrollTo(0,0); vibrate(15);
  },
  goBack() {
    if(this._history.length>0){const p=this._history.pop();this._route=p.route;this._params=p.params;this.render();}
    else this.navigate('dashboard',{});
  },
  editUser() {
    const curr = localStorage.getItem('cw_display_name') || Store.getCurrentUser() || 'Guest';
    const newName = prompt('ตั้งชื่อผู้ใช้งาน (เว้นว่างเพื่อออกจากระบบ):', curr);
    if(newName === null) return;
    if(newName.trim() === '') {
      if(confirm('คุณต้องการออกจากระบบใช่หรือไม่?')){
        Store.logout(); this._history=[]; this.navigate('login',{});
      }
    } else {
      localStorage.setItem('cw_display_name', newName.trim());
      this.render();
    }
  },

  render() {
    const r=this._route, p=this._params;
    const isLogin = (r === 'login');
    const isTop=['dashboard','overview','calendar','subscriptions'].includes(r);
    const titles={
      'dashboard':'CardWallet 💳','card-detail':'รายละเอียดบัตร',
      'add-card':p.id?'แก้ไขบัตร':'เพิ่มบัตรใหม่','add-transaction':'บันทึกรายจ่าย',
      'payment':'ชำระเงิน','installment':p.instId?'ตารางผ่อน':'แบ่งชำระ',
      'overview':'ภาพรวมหนี้สิน','calendar':'ปฏิทินหนี้สิน','subscriptions':'รายจ่ายประจำ',
      'login':'เข้าสู่ระบบ'
    };
    document.getElementById('header-title').textContent=titles[r]||'CardWallet';
    document.getElementById('app-header').classList.toggle('hidden', isLogin);
    document.getElementById('back-btn').classList.toggle('hidden',isTop||isLogin);
    document.getElementById('settings-btn').classList.toggle('hidden',!isTop||isLogin);
    document.getElementById('hide-btn').classList.toggle('hidden',!isTop||isLogin);
    
    const userWrap = document.getElementById('user-profile');
    if(userWrap){
      userWrap.classList.toggle('hidden', r!=='dashboard');
      if(r==='dashboard'){
        const uName = localStorage.getItem('cw_display_name') || Store.getCurrentUser() || 'Guest';
        document.getElementById('user-name').textContent = uName.split('@')[0].substring(0,8);
        document.getElementById('user-avatar').textContent = uName.charAt(0).toUpperCase();
      }
    }
    
    document.getElementById('bottom-nav').classList.toggle('hide', isLogin);
    document.getElementById('fab').classList.toggle('hide', isLogin);
    
    document.querySelectorAll('.nav-item[data-route]').forEach(btn=>btn.classList.toggle('active',btn.dataset.route===r));

    switch(r){
      case 'login': PageLogin.render(); break;
      case 'dashboard': PageDashboard.render(); break;
      case 'card-detail': PageCardDetail.render(p); break;
      case 'add-card': PageAddCard.render(p); break;
      case 'add-transaction': PageAddTransaction.render(p); break;
      case 'payment': PagePayment.render(p); break;
      case 'installment': PageInstallment.render(p); break;
      case 'overview': PageOverview.render(); break;
      case 'calendar': PageCalendar.render(); break;
      case 'subscriptions': PageSubscriptions.render(p); break;
      default: PageDashboard.render();
    }
  },

  txClick(txId) {
    const tx=Store.transactions.get(txId);
    if(!tx)return;
    if(tx.isInstallment&&tx.installmentId) this.navigate('installment',{instId:tx.installmentId});
    else this.navigate('card-detail',{id:tx.cardId});
  },

  openSettings() {
    Modal.show(`
      <div class="modal-handle"></div>
      <div class="modal-hdr"><span class="modal-title">⚙️ ตั้งค่า</span><button class="icon-btn" onclick="Modal.close()">✕</button></div>
      <div style="padding:0 20px 20px">
        <div class="info-row"><span class="info-key">เวอร์ชัน</span><span class="info-val">CardWallet v2.0</span></div>
        <div class="info-row"><span class="info-key">บัตรทั้งหมด</span><span class="info-val">${Store.cards.getAll().length} ใบ</span></div>
        <div class="info-row"><span class="info-key">รายการทั้งหมด</span><span class="info-val">${Store.transactions.getAll().length} รายการ</span></div>
        <div class="info-row"><span class="info-key">หนี้อื่นๆ</span><span class="info-val">${Store.otherDebts.getAll().length} รายการ</span></div>
        <div class="divider" style="margin:16px 0"></div>
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r-md);padding:14px;margin-bottom:16px">
          <div style="font-size:13px;font-weight:700;color:var(--t1);margin-bottom:8px">⌨️ ทางลัดคีย์บอร์ด</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--t2)"><span>ย้อนกลับ / ปิด modal</span><span class="kbd">Esc</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--t2)"><span>สไลด์บัตร</span><span style="display:flex;gap:4px"><span class="kbd">←</span><span class="kbd">→</span></span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--t2)"><span>เปลี่ยนเดือน (ปฏิทิน)</span><span style="display:flex;gap:4px"><span class="kbd">←</span><span class="kbd">→</span></span></div>
          </div>
        </div>
        <button class="btn btn-secondary full mb16" onclick="App.printDebtOverview()">📥 ส่งออกสรุปหนี้ (PDF)</button>
        <button class="btn btn-danger full" onclick="App.confirmReset()">🗑️ รีเซ็ตข้อมูลทั้งหมด</button>
      </div>`);
  },

  printDebtOverview() {
    Modal.close();
    if(this._route !== 'overview') {
      this.navigate('overview', {});
      setTimeout(() => window.print(), 300);
    } else {
      window.print();
    }
  },

  confirmReset() {
    if(confirm('⚠️ ต้องการรีเซ็ตข้อมูลทั้งหมดของคุณ? ข้อมูลจะไม่สามารถกู้คืนได้')){
      Store.clearCurrentUser(); 
      Store.logout();
      Modal.close(); 
      Toast.show('รีเซ็ตข้อมูลแล้ว','info'); 
      App._history=[];
      App.navigate('login',{});
    }
  }
};

// ============================================================
// DEMO DATA
// ============================================================
function loadDemoData() {
  const c1=createCard({name:'KBank Platinum',lastFour:'1234',type:'visa',gradient:'cg-blue',totalLimit:50000,interestRate:16,billingCycleDay:15,paymentDueDay:5});
  c1.usedCredit=18750; c1.availableCredit=50000-18750; c1.lastPaymentDate=daysAgo(20);
  const c2=createCard({name:'SCB Infinite',lastFour:'5678',type:'mastercard',gradient:'cg-purple',totalLimit:80000,interestRate:18,billingCycleDay:20,paymentDueDay:10});
  c2.usedCredit=31500; c2.availableCredit=80000-31500; c2.lastPaymentDate=daysAgo(15);
  Store.cards.save(c1); Store.cards.save(c2);

  const txs=[
    createTransaction({cardId:c1.id,amount:850,description:'Grab Food',category:'food',date:daysAgo(2)}),
    createTransaction({cardId:c1.id,amount:2490,description:'Shopee',category:'shopping',date:daysAgo(5)}),
    createTransaction({cardId:c1.id,amount:349,description:'Netflix',category:'entertainment',date:daysAgo(8)}),
    createTransaction({cardId:c1.id,amount:1200,description:'Central Ladprao',category:'shopping',date:daysAgo(12)}),
    createTransaction({cardId:c2.id,amount:5800,description:'Thai Airways',category:'travel',date:daysAgo(3)}),
    createTransaction({cardId:c2.id,amount:12000,description:'MacBook Stand',category:'shopping',date:daysAgo(16)}),
    createTransaction({cardId:c2.id,amount:780,description:'Agoda Hotel',category:'travel',date:daysAgo(1)}),
    createTransaction({cardId:c2.id,amount:280,description:'PTT น้ำมัน',category:'fuel',date:daysAgo(4)}),
  ];
  txs.forEach(tx=>Store.transactions.save(tx));

  const inst=createInstallment({cardId:c2.id,transactionId:txs[5].id,description:'MacBook Stand',principalAmount:12000,months:6,monthlyInterestRate:0,startDate:daysAgo(16)});
  inst.schedule[0].paid=true; inst.schedule[0].paidDate=daysAgo(10);
  Store.installments.save(inst);
  txs[5].isInstallment=true; txs[5].installmentId=inst.id; Store.transactions.save(txs[5]);

  Store.subscriptions.save(createSubscription({cardId:c1.id,name:'Netflix',amount:349,frequency:'monthly',category:'entertainment',icon:'🎬',nextDueDate:futureDate(8)}));
  Store.subscriptions.save(createSubscription({cardId:c1.id,name:'Spotify',amount:129,frequency:'monthly',category:'entertainment',icon:'🎵',nextDueDate:futureDate(15)}));
  Store.subscriptions.save(createSubscription({cardId:c2.id,name:'True Internet',amount:790,frequency:'monthly',category:'utilities',icon:'🌐',nextDueDate:futureDate(5)}));
  Store.subscriptions.save(createSubscription({cardId:null,name:'AIA ประกันชีวิต',amount:18000,frequency:'yearly',category:'finance',icon:'💼',nextDueDate:futureDate(60)}));

  // Other debts
  Store.otherDebts.save(createOtherDebt({name:'ค่าผ่อนบ้าน',icon:'🏠',totalAmount:3200000,remainingAmount:2750000,monthlyPayment:18500,interestRate:5.5,dueDay:1,notes:'LH Bank'}));
  Store.otherDebts.save(createOtherDebt({name:'ค่าผ่อนรถ Honda',icon:'🚗',totalAmount:650000,remainingAmount:380000,monthlyPayment:9800,interestRate:2.5,dueDay:15}));
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Determine initial route based on auth state
  if(Store.getCurrentUser()){
    App._route = 'dashboard';
    if(Store.cards.getAll().length===0 && Store.getCurrentUser()==='guest') loadDemoData();
    
    // Run scheduler
    const logs=Scheduler.run();
    if(logs&&logs.length>0){
      setTimeout(()=>logs.forEach(l=>Toast.show(`🤖 Auto: ${l.name} ฿${fmt(l.amount)} จาก ${l.cardName}`,'info',5000)),600);
    }
  } else {
    App._route = 'login';
  }

  // Nav
  document.querySelectorAll('.nav-item[data-route]').forEach(btn=>{
    btn.addEventListener('click',()=>{App._history=[];App.navigate(btn.dataset.route,{});});
  });

  // Back btn
  document.getElementById('back-btn').addEventListener('click',()=>App.goBack());

  // FAB
  document.getElementById('fab').addEventListener('click',()=>App.navigate('add-transaction',{}));

  // ===== KEYBOARD NAVIGATION =====
  document.addEventListener('keydown', e => {
    const modal=document.getElementById('modal-overlay');
    const modalOpen=!modal.classList.contains('hidden');

    // ESC: close modal or go back
    if(e.key==='Escape'){
      if(modalOpen){Modal.close();}
      else if(App._history.length>0){App.goBack();}
      return;
    }

    // No keyboard shortcuts when typing in inputs
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;

    // Arrow keys: carousel on dashboard
    if(App._route==='dashboard'){
      if(e.key==='ArrowLeft'){e.preventDefault();Carousel.prev();}
      else if(e.key==='ArrowRight'){e.preventDefault();Carousel.next();}
    }

    // Arrow keys: calendar month navigation
    if(App._route==='calendar'){
      if(e.key==='ArrowLeft'){e.preventDefault();PageCalendar.prevMonth();}
      else if(e.key==='ArrowRight'){e.preventDefault();PageCalendar.nextMonth();}
    }
  });

  // Initial render
  App.render();
});

