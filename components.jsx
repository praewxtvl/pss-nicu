// =========================================================
// PSS:NICU — Shared UI components
// =========================================================

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// --- i18n helper ---------------------------------------------------
const I18N = {
  en: {
    // Nav
    nav_dashboard: 'Risk Dashboard',
    nav_families: 'Families',
    nav_alerts: 'Alerts',
    nav_admin: 'Admin',
    nav_analytics: 'Analytics',
    // Common
    search: 'Search bed, parent, or HN…',
    new_assessment: 'New Assessment',
    back: 'Back',
    save_draft: 'Save Draft',
    cancel: 'Cancel',
    submit: 'Submit Assessment',
    next: 'Next',
    prev: 'Previous',
    notes: 'Notes',
    // Severity labels
    sev_none: 'No stress',
    sev_mild: 'Mild',
    sev_mod: 'Moderate',
    sev_high: 'High',
    sev_extreme: 'Extreme',
    // Subscale codes
    ss: 'Sights & Sounds',
    ia: 'Infant Appearance',
    pr: 'Parental Role',
    sc: 'Staff Communication',
    // Headings
    overview: 'Overview',
    rising: 'Rising stress',
    high_risk: 'High-risk parents',
    avg_score: 'Avg score',
    parents: 'parents',
    new_today: 'new today',
    trending_up: 'trending up',
    intervention_log: 'Intervention log',
    care_plan: 'Care plan',
    history: 'Assessment history',
    by: 'by',
    day: 'Day',
    of_admit: 'of admit',
    score: 'Score',
    severity: 'Severity',
    open: 'Open',
    new_family: 'New Family',
    parent: 'Parent',
    bed: 'Bed',
    ga: 'GA',
    bw: 'BW',
    last: 'Last',
    trend: 'Trend',
    risk: 'Risk',
    of: 'of'
  },
  th: {
    nav_dashboard: 'ภาพรวมความเสี่ยง',
    nav_families: 'รายชื่อครอบครัว',
    nav_alerts: 'การแจ้งเตือน',
    nav_admin: 'ผู้ดูแลระบบ',
    nav_analytics: 'วิเคราะห์',
    search: 'ค้นหาเตียง ชื่อ หรือ HN…',
    new_assessment: 'เริ่มประเมิน',
    back: 'กลับ',
    save_draft: 'บันทึกร่าง',
    cancel: 'ยกเลิก',
    submit: 'ส่งแบบประเมิน',
    next: 'ถัดไป',
    prev: 'ก่อนหน้า',
    notes: 'หมายเหตุ',
    sev_none: 'ไม่เครียด',
    sev_mild: 'เครียดเล็กน้อย',
    sev_mod: 'เครียดปานกลาง',
    sev_high: 'เครียดมาก',
    sev_extreme: 'เครียดมากที่สุด',
    ss: 'สภาพแวดล้อม',
    ia: 'รูปลักษณ์ทารก',
    pr: 'บทบาทพ่อแม่',
    sc: 'การสื่อสารเจ้าหน้าที่',
    overview: 'ภาพรวม',
    rising: 'แนวโน้มเพิ่มขึ้น',
    high_risk: 'ผู้ปกครองความเสี่ยงสูง',
    avg_score: 'คะแนนเฉลี่ย',
    parents: 'ราย',
    new_today: 'รายใหม่วันนี้',
    trending_up: 'เพิ่มขึ้น',
    intervention_log: 'บันทึกการช่วยเหลือ',
    care_plan: 'แผนการดูแล',
    history: 'ประวัติการประเมิน',
    by: 'โดย',
    day: 'วันที่',
    of_admit: 'ของการ admit',
    score: 'คะแนน',
    severity: 'ระดับความเครียด',
    open: 'เปิด',
    new_family: 'เพิ่มครอบครัว',
    parent: 'เตียง',
    bed: 'เตียง',
    ga: 'GA',
    bw: 'BW',
    last: 'ล่าสุด',
    trend: 'แนวโน้ม',
    risk: 'ระดับ',
    of: 'จาก'
  }
};

function t(key, lang) {return I18N[lang] && I18N[lang][key] || I18N.en[key] || key;}

function useIsMobile(bp = 640) {
  const [m, setM] = useState(() => window.innerWidth <= bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h, { passive: true });
    window.addEventListener('orientationchange', h, { passive: true });
    return () => {
      window.removeEventListener('resize', h);
      window.removeEventListener('orientationchange', h);
    };
  }, [bp]);
  return m;
}

function SkeletonBlock({ w = '100%', h = 16, r = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
      backgroundImage: 'linear-gradient(90deg, var(--paper-3) 25%, var(--line-soft) 50%, var(--paper-3) 75%)',
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.4s ease infinite',
    }} />
  );
}

// --- Tiny icon set (outline, hand-drawn-ish strokes) ---------------
const Icon = ({ name, size = 18, stroke = 1.6, color = 'currentColor' }) => {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round'
  };
  switch (name) {
    case 'home':return <svg {...props}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" /></svg>;
    case 'users':return <svg {...props}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 19c.5-3 3.4-5 6.5-5s6 2 6.5 5" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14c2.5 0 4.5 1.5 5 4" /></svg>;
    case 'bell':return <svg {...props}><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 7H4c0-1 2-2 2-7z" /><path d="M10 19a2 2 0 004 0" /></svg>;
    case 'cog':return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19 12c0-.6-.06-1.18-.18-1.74l1.95-1.5-2-3.46-2.32.78a7.04 7.04 0 00-3-1.74L13 2h-4l-.45 2.34A7.04 7.04 0 005.55 6.08L3.23 5.3l-2 3.46 1.95 1.5C3.06 10.82 3 11.4 3 12s.06 1.18.18 1.74l-1.95 1.5 2 3.46 2.32-.78a7.04 7.04 0 003 1.74L9 22h4l.45-2.34a7.04 7.04 0 003-1.74l2.32.78 2-3.46-1.95-1.5c.12-.56.18-1.14.18-1.74z" /></svg>;
    case 'plus':return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
    case 'arrow-right':return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case 'arrow-left':return <svg {...props}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>;
    case 'arrow-up':return <svg {...props}><path d="M12 19V5M6 11l6-6 6 6" /></svg>;
    case 'arrow-down':return <svg {...props}><path d="M12 5v14M6 13l6 6 6-6" /></svg>;
    case 'check':return <svg {...props}><path d="M4 12l5 5 11-11" /></svg>;
    case 'x':return <svg {...props}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case 'search':return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
    case 'heart':return <svg {...props}><path d="M12 21s-7-4.5-9.5-9A5 5 0 0112 6a5 5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>;
    case 'baby':return <svg {...props}><circle cx="12" cy="9" r="4" /><path d="M9 9h.01M15 9h.01M10 11c.5.5 1 1 2 1s1.5-.5 2-1" /><path d="M5 21c0-3 3-5 7-5s7 2 7 5" /></svg>;
    case 'message':return <svg {...props}><path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
    case 'sparkle':return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>;
    case 'flag':return <svg {...props}><path d="M5 21V4a1 1 0 011-1h11l-2 4 2 4H6" /></svg>;
    case 'trend-up':return <svg {...props}><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>;
    case 'trend-down':return <svg {...props}><path d="M3 7l6 6 4-4 8 8" /><path d="M14 17h7v-7" /></svg>;
    case 'note':return <svg {...props}><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" /><path d="M14 3v6h6M9 14h6M9 18h6" /></svg>;
    case 'phone':return <svg {...props}><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" /></svg>;
    case 'eye':return <svg {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'globe':return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></svg>;
    case 'chart':return <svg {...props}><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="4" width="4" height="17" rx="1"/></svg>;
    case 'download':return <svg {...props}><path d="M12 3v13M7 13l5 5 5-5" /><path d="M5 21h14" /></svg>;
    case 'logo':return (
        <img src="assets/pss-nicu-logo.png" alt="PSS:NICU" width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} />);
    case 'logo-framed':return (
        <span style={{
          width: size, height: size, borderRadius: '50%',
          background: 'var(--peach-soft)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: size * 0.1, flexShrink: 0,
          boxShadow: 'inset 0 0 0 1px rgba(196,90,62,.18)',
        }}>
          <img src="assets/pss-nicu-logo.png" alt="PSS:NICU" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </span>);


    default:return null;
  }
};

// --- Severity helpers ---------------------------------------------
function sevPill(sev, lang) {
  const map = {
    none: { cls: 'bg-sev-none', label: t('sev_none', lang) },
    mild: { cls: 'bg-sev-mild', label: t('sev_mild', lang) },
    mod: { cls: 'bg-sev-mod', label: t('sev_mod', lang) },
    high: { cls: 'bg-sev-high', label: t('sev_high', lang) },
    extreme: { cls: 'bg-sev-extreme', label: t('sev_extreme', lang) }
  };
  return map[sev.key] || map.none;
}

function SeverityBadge({ severity: sev, lang, size = 'md' }) {
  const m = sevPill(sev, lang);
  const pad = size === 'sm' ? '2px 8px' : '4px 10px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <span className={'pill ' + m.cls}
    style={{ padding: pad, fontSize: fs, fontWeight: 700, border: 'none' }}>
      <span className="dot" style={{ background: 'currentColor' }} />
      {m.label}
    </span>);

}

// --- Trend mini-chart ---------------------------------------------
function MiniTrend({ values, max = 104, width = 80, height = 28, color = 'var(--ink-3)' }) {
  if (!values || values.length === 0) {
    return <div style={{ width, height, color: 'var(--ink-4)', fontSize: 10, display: 'flex', alignItems: 'center' }}>—</div>;
  }
  if (values.length === 1) {
    const h = Math.max(3, values[0] / max * height);
    return (
      <svg width={width} height={height}>
        <circle cx={width / 2} cy={height - h} r="3" fill={color} />
      </svg>);

  }
  const pts = values.map((v, i) => {
    const x = i / (values.length - 1) * (width - 4) + 2;
    const y = height - v / max * (height - 4) - 2;
    return [x, y];
  });
  const path = pts.map((p, i) => i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`).join(' ');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) =>
      <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 2.5 : 1.5}
      fill={i === pts.length - 1 ? color : 'var(--paper)'}
      stroke={color} strokeWidth="1" />
      )}
    </svg>);

}

// --- Subscale bars -------------------------------------------------
function SubscaleBars({ subTotals, lang, dense = false }) {
  if (!subTotals) return null;
  const order = ['ss', 'ia', 'pr', 'sc'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: dense ? 6 : 10 }}>
      {order.map((k) => {
        const meta = SUBSCALE_META[k];
        const v = subTotals[k] || 0;
        const pct = v / meta.max * 100;
        return (
          <div key={k}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, letterSpacing: '0.04em' }}>
                {meta.code} · <span style={{ fontWeight: 500, color: 'var(--ink-3)' }}>{lang === 'th' ? meta.th : meta.en}</span>
              </span>
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ink-2)' }}>
                {v}<span style={{ color: 'var(--ink-4)' }}>/{meta.max}</span>
              </span>
            </div>
            <div style={{ height: dense ? 4 : 6, background: meta.bg, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: pct + '%', background: meta.color,
                borderRadius: 99, transition: 'width .4s ease'
              }} />
            </div>
          </div>);

      })}
    </div>);

}

// --- Sparkline area chart for risk trend over time -----------------
function AreaTrend({ values, dates, max = 104, width = 600, height = 160, color = 'var(--terracotta)', thresholds }) {
  if (!values || values.length === 0) return null;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const n = values.length;
  const xAt = (i) => pad.l + (n === 1 ? w / 2 : i / (n - 1) * w);
  const yAt = (v) => pad.t + h - v / max * h;

  const pts = values.map((v, i) => [xAt(i), yAt(v)]);
  const linePath = pts.map((p, i) => i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`).join(' ');
  const areaPath = linePath + ` L${xAt(n - 1)} ${pad.t + h} L${xAt(0)} ${pad.t + h} Z`;

  // Threshold lines
  const tLines = thresholds ? [
  { v: thresholds.mild, label: 'Mild', color: 'var(--sev-mild)' },
  { v: thresholds.mod, label: 'Mod', color: 'var(--sev-mod)' },
  { v: thresholds.high, label: 'High', color: 'var(--sev-high)' }] :
  [];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* y-axis labels */}
      {[0, 26, 52, 78, 104].map((v) =>
      <g key={v}>
          <line x1={pad.l} x2={width - pad.r} y1={yAt(v)} y2={yAt(v)} stroke="var(--line-soft)" strokeDasharray="2 4" />
          <text x={pad.l - 6} y={yAt(v) + 3} fontSize="9" fill="var(--ink-4)" textAnchor="end" fontFamily="var(--mono)">{v}</text>
        </g>
      )}

      {/* threshold lines */}
      {tLines.map((tl) =>
      <g key={tl.v}>
          <line x1={pad.l} x2={width - pad.r} y1={yAt(tl.v)} y2={yAt(tl.v)}
        stroke={tl.color} strokeOpacity="0.4" strokeDasharray="3 3" />
        </g>
      )}

      {/* area + line */}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* points */}
      {pts.map((p, i) =>
      <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4" fill="var(--paper)" stroke={color} strokeWidth="2" />
          <text x={p[0]} y={p[1] - 10} fontSize="10" fill="var(--ink-2)" textAnchor="middle" fontFamily="var(--mono)" fontWeight="600">
            {values[i]}
          </text>
        </g>
      )}

      {/* x labels */}
      {pts.map((p, i) =>
      <text key={i} x={p[0]} y={height - 8} fontSize="9" fill="var(--ink-4)" textAnchor="middle" fontFamily="var(--mono)">
          {dates ? dates[i].slice(5) : i + 1}
        </text>
      )}
    </svg>);

}

// --- Avatar (initials, warm gradient) -----------------------------
function Avatar({ initials, size = 36, palette = 'terracotta', _fontSize }) {
  const palettes = {
    terracotta: ['#d68a5e', '#c45a3e'],
    sage: ['#8fa78a', '#6e8a6a'],
    plum: ['#a87391', '#6f3b58'],
    blue: ['#8da9c4', '#5d7d9c']
  };
  const [a, b] = palettes[palette] || palettes.terracotta;
  const s = String(initials || '?');
  // Auto-shrink long bed labels (e.g. "iso 1-1") so they always fit inside the circle.
  const baseFs = _fontSize || (s.length <= 2 ? size * 0.42 : s.length <= 3 ? size * 0.34 : s.length <= 4 ? size * 0.26 : size * 0.22);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${a}, ${b})`,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: baseFs, fontWeight: 700, letterSpacing: s.length > 3 ? 0 : '0.02em',
      boxShadow: 'inset 0 -2px 4px rgba(0,0,0,.12)',
      flexShrink: 0, lineHeight: 1,
      overflow: 'hidden', padding: '0 6%', textAlign: 'center',
      whiteSpace: 'nowrap',
    }}>{s}</div>);

}

const ROLE_TH = { doctor: 'แพทย์', nurse: 'พยาบาล', admin: 'ผู้ดูแลระบบ' };

// Derive 1 initial from a name or email
// Thai rule: skip leading vowels (เ แ โ ใ ไ = U+0E40-U+0E44), take first consonant
function nameToInitials(s) {
  if (!s) return '?';
  const src = s.includes('@') ? s.split('@')[0] : s;
  const firstWord = src.trim().split(/[\s._-]+/)[0] || src;
  const withoutLeadVowel = firstWord.replace(/^[\u0e40-\u0e44]+/, '');
  const ch = withoutLeadVowel[0] || firstWord[0] || '?';
  return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
}

// Derive 1–2-char initials from a full Thai/English name.
//   'สมชาย แซ่หวัง' → 'สซ'
//   'John Smith' → 'JS'
//   'มาลี'         → 'ม'   (single word → single initial)
function deriveInitials(s) {
  if (!s) return '';
  const parts = s.trim().split(/\s+/).slice(0, 2);
  const grab = (p) => {
    const noLeadVowel = p.replace(/^[\u0e40-\u0e44]+/, '');
    const ch = noLeadVowel[0] || p[0] || '';
    return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch;
  };
  return parts.map(grab).join('').slice(0, 3);
}

// Display label for a family card.
// Prefer hand-entered initials, then derived initials from name, then fall back to bed.
function famLabel(fam) {
  if (!fam) return '';
  if (fam.initials) return fam.initials;
  if (fam.name) return deriveInitials(fam.name);
  return 'เตียง ' + (fam.bed || '');
}

// Show name part only (strip email domain)
function fmtBy(by) { return by ? (by.includes('@') ? by.split('@')[0] : by) : ''; }

// --- Top nav ------------------------------------------------------
function TopNav({ user, route, onRoute, lang, onLangToggle, alertCount, onLogout, onSearch }) {
  const isMobile = useIsMobile(640);
  // Higher than App's own 1024px compact switch (which is what decides TopNav vs
  // BottomTabBar) so there's an icon-only band above it — otherwise labels wrap
  // (e.g. iPad landscape ~1024-1150px never had room for 5 full-text pills).
  const isCompact = useIsMobile(1180);

  const items = [
  { k: 'dashboard',  icon: 'home',  label: t('nav_dashboard', lang) },
  { k: 'families',   icon: 'users', label: t('nav_families', lang) },
  { k: 'alerts',     icon: 'bell',  label: t('nav_alerts', lang), badge: alertCount },
  { k: 'analytics',  icon: 'chart', label: t('nav_analytics', lang) },
  ...(user.role === 'admin' ? [{ k: 'admin', icon: 'cog', label: t('nav_admin', lang) }] : [])];

  return (
    <header style={{
      display: 'flex', alignItems: 'center',
      gap: isMobile ? 6 : isCompact ? 10 : 24,
      padding: isMobile ? '10px 14px' : isCompact ? '12px 20px' : '14px 28px',
      background: 'rgba(251,246,239,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line)',
      position: 'sticky', top: 0, zIndex: 50
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Icon name="logo-framed" size={isCompact ? 30 : 38} />
        {!isCompact && (
          <div style={{ lineHeight: 1.05 }}>
            <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 21, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--ink)' }}>
              PSS<span style={{ color: 'var(--terracotta)', margin: '0 0.08em', fontWeight: 500 }}>:</span>NICU
            </div>
            <div style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>Parental Stress Scale</div>
            {(() => {
              const HOSP = { KCMH: 'โรงพยาบาลจุฬาลงกรณ์', SPR: 'โรงพยาบาลสวรรค์ประชารักษ์' };
              const name = user?.hospitalName || HOSP[user?.hospitalCode] || '';
              return name ? (
                <div style={{ fontSize: 10, color: 'var(--terracotta)', fontWeight: 500, letterSpacing: '0.01em', marginTop: 3, lineHeight: 1.2 }}>
                  {name}
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 2, marginLeft: isCompact ? 2 : 16 }}>
        {items.map((it) => {
          const active = route === it.k;
          return (
            <button key={it.k} onClick={() => onRoute(it.k)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: isCompact ? '8px 9px' : '8px 14px',
              borderRadius: 99,
              fontSize: 13, fontWeight: 600,
              color: active ? 'var(--terracotta)' : 'var(--ink-2)',
              background: active ? 'var(--peach-soft)' : 'transparent',
              transition: 'all .15s',
              position: 'relative', justifyContent: 'center', textAlign: 'center'
            }}>
              <Icon name={it.icon} size={isCompact ? 18 : 16} />
              {!isCompact && <span className="nav-label">{it.label}</span>}
              {it.badge > 0 &&
              <span style={{
                background: 'var(--rose)', color: '#fff',
                fontSize: 10, fontWeight: 800, borderRadius: 99,
                padding: '1px 6px', minWidth: 18, textAlign: 'center'
              }}>{it.badge}</span>
              }
            </button>);
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Search */}
      {onSearch && (
        <button onClick={onSearch}
          style={{
            display: 'flex', alignItems: 'center', gap: isCompact ? 0 : 8,
            padding: isCompact ? '8px 10px' : '7px 13px', borderRadius: 99,
            border: '1px solid var(--line)',
            fontSize: 13, fontWeight: 500,
            color: 'var(--ink-3)',
            background: 'var(--card)',
            transition: 'all .15s',
            marginRight: isCompact ? 2 : 6,
          }}>
          <Icon name="search" size={15} color="var(--ink-3)" />
          {!isCompact && <span>ค้นหา</span>}
          {!isCompact && <kbd style={{
            fontSize: 10, padding: '1px 5px',
            background: 'var(--paper-2)', border: '1px solid var(--line)',
            borderRadius: 4, fontFamily: 'var(--mono)', color: 'var(--ink-4)',
          }}>⌘K</kbd>}
        </button>
      )}

      {/* User section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isCompact ? 6 : 10, flexShrink: 0 }}>
        {!isCompact && (
          <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name || fmtBy(user.email)}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              <span style={{
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: user.role === 'doctor' ? 'var(--terracotta)' :
                user.role === 'admin' ? 'var(--plum)' :
                'var(--sage)',
                fontWeight: 700
              }}>{ROLE_TH[user.role] || user.role}</span>
            </div>
          </div>
        )}
        <Avatar initials={nameToInitials(user.name || user.email)} size={isCompact ? 30 : 36}
        palette={user.role === 'doctor' ? 'terracotta' : user.role === 'admin' ? 'plum' : 'sage'} />
        {onLogout &&
        <button onClick={onLogout} title={isCompact ? 'ออกจากระบบ' : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: isCompact ? 0 : 6,
          padding: isCompact ? '7px 8px' : '7px 13px', borderRadius: 99,
          border: '1px solid var(--line)',
          fontSize: 12, fontWeight: 600,
          color: 'var(--ink-3)',
          background: 'var(--card)',
          transition: 'all .15s'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {!isCompact && 'ออกจากระบบ'}
        </button>
        }
      </div>
    </header>);

}

// --- Section heading ----------------------------------------------
function SectionHeading({ eyebrow, title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        {eyebrow &&
        <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>{eyebrow}</div>
        }
        <h2 className="serif">{title}</h2>
      </div>
      {action}
    </div>);

}

// --- Stat card -----------------------------------------------------
function StatCard({ label, value, suffix, hint, accent = 'var(--terracotta)', children }) {
  return (
    <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="serif" style={{ fontSize: 44, lineHeight: 1, color: 'var(--ink)' }}>{value}</span>
        {suffix && <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>{suffix}</span>}
      </div>
      {hint &&
      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-3)' }}>{hint}</div>
      }
      {children}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent, borderRadius: '14px 0 0 14px' }} />
    </div>);

}

// --- Slim Header (mobile-native — replaces TopNav on ≤1024px) -----
function SlimHeader({ alertCount, onSearch, user, onLogout, title = 'PSS:NICU' }) {
  return (
    <header className="pss-slim-header">
      <Icon name="logo-framed" size={30} />
      <span style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 19, fontWeight: 500, letterSpacing: '0.04em', flex: 1, color: 'var(--ink)' }}>
        PSS<span style={{ color: 'var(--terracotta)', margin: '0 0.06em' }}>:</span>NICU
      </span>
      {onSearch && (
        <button onClick={onSearch} style={{ padding: '8px', touchAction: 'manipulation', color: 'var(--ink-3)' }}>
          <Icon name="search" size={20} />
        </button>
      )}
      <Avatar initials={nameToInitials(user.name || user.email)} size={30}
        palette={user.role === 'doctor' ? 'terracotta' : user.role === 'admin' ? 'plum' : 'sage'} />
      {onLogout && (
        <button onClick={onLogout} title="ออกจากระบบ" style={{ padding: '8px', touchAction: 'manipulation' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      )}
    </header>
  );
}

// --- Bottom Tab Bar (mobile-native nav — ≤1024px) -----------------
function BottomTabBar({ route, onRoute, alertCount, userRole }) {
  const activeRoute = ['familyDetail','assessment','result'].includes(route) ? 'families' : route;
  const tabs = [
    { k: 'dashboard', icon: 'home',  label: 'หน้าหลัก' },
    { k: 'families',  icon: 'users', label: 'ครอบครัว' },
    { k: 'alerts',    icon: 'bell',  label: 'แจ้งเตือน', badge: alertCount },
    { k: 'analytics', icon: 'chart', label: 'วิเคราะห์' },
    ...(userRole === 'admin' ? [{ k: 'admin', icon: 'cog', label: 'ผู้ดูแลระบบ' }] : []),
  ];
  return (
    <nav className="pss-bottom-tab">
      {tabs.map(tab => {
        const active = activeRoute === tab.k;
        return (
          <button key={tab.k} onClick={() => onRoute(tab.k)}
            className={`pss-bottom-tab-btn${active ? ' tab-active' : ''}`}>
            <div style={{ position: 'relative' }}>
              <Icon name={tab.icon} size={22} />
              {tab.badge > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -6,
                  background: 'var(--rose)', color: '#fff',
                  fontSize: 9, fontWeight: 800, borderRadius: 99,
                  padding: '1px 4px', minWidth: 15, textAlign: 'center', lineHeight: 1.4,
                }}>{tab.badge}</span>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// --- Family card (list row) ---------------------------------------
function FamilyRow({ fam, lastAss, trend, onOpen, lang, dense, thresholds }) {
  const isMobile = useIsMobile();
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(0);
  const sev = severity(lastAss?.total, thresholds);
  const flag = lastAss && trend && trend.length >= 2 && trend[trend.length - 1] > trend[trend.length - 2];
  const pillM = sevPill(sev, lang);

  const s = String(fam.bed || '');
  const lbl = s.startsWith('iso ') ? s.slice(4) : s;
  const days = fam.admitDate
    ? Math.max(1, Math.floor((Date.now() - new Date(fam.admitDate)) / 86400000) + 1)
    : (Number(fam.dayAdmit) || null);
  const dateStr = fam.admitDate
    ? new Date(fam.admitDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
    : null;

  if (isMobile) {
    const avSz = 40;
    const clampedSwipe = Math.min(swipeX, 80);
    const showAction = clampedSwipe > 50;

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchMove = (e) => {
      const dx = e.touches[0].clientX - touchStartX.current;
      if (dx > 0) setSwipeX(Math.min(dx, 85));
    };
    const handleTouchEnd = () => {
      if (swipeX > 65) onOpen();
      setSwipeX(0);
    };
    const handleTouchCancel = () => setSwipeX(0);

    return (
      <div style={{ position: 'relative', borderRadius: 'var(--r3)', overflow: 'hidden' }}>
        {/* Swipe action hint (revealed behind card) */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 80, background: 'var(--terracotta)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          flexDirection: 'column',
          opacity: clampedSwipe / 80,
          transition: swipeX === 0 ? 'opacity .2s' : 'none',
        }}>
          <Icon name="plus" size={18} color="#fff" />
          <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>ประเมิน</span>
        </div>
        {/* Card */}
        <button onClick={onOpen}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          style={{
            width: '100%', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderLeft: `3px solid ${sev.color}`,
            borderRadius: 'var(--r3)',
            boxShadow: showAction ? 'var(--sh2)' : 'var(--sh1)',
            transform: `translateX(${clampedSwipe}px)`,
            transition: swipeX === 0 ? 'transform .2s ease, box-shadow .15s' : 'none',
            position: 'relative', zIndex: 1,
          }}>
          <Avatar initials={lbl} size={avSz} _fontSize={lbl.length > 3 ? avSz * 0.26 : avSz * 0.38}
            palette={sev.key === 'extreme' ? 'plum' : sev.key === 'high' ? 'terracotta' : sev.key === 'mod' ? 'terracotta' : 'sage'} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{famLabel(fam)}</span>
              {days && <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--ink-4)', background: 'var(--paper-3)', padding: '1px 5px', borderRadius: 99, marginLeft: 'auto', flexShrink: 0 }}>DOL {days}</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              เตียง {fam.bed} · GA {fam.ga}wk · BW {fam.bw}g
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span className="serif" style={{ fontSize: 20, color: sev.color, lineHeight: 1 }}>{lastAss ? lastAss.total : '—'}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>/104</span>
              {flag && <Icon name="trend-up" size={12} color="var(--rose)" />}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: sev.color, letterSpacing: '0.02em' }}>{pillM.label}</span>
          </div>
          <Icon name="arrow-right" size={16} color="var(--ink-4)" />
        </button>
      </div>
    );
  }

  const sz = dense ? 36 : 44;
  return (
    <button onClick={onOpen}
    style={{
      width: '100%', textAlign: 'left',
      display: 'grid',
      gridTemplateColumns: 'auto 2.4fr 0.8fr 1fr 1.5fr auto',
      alignItems: 'center', gap: dense ? 12 : 18,
      padding: dense ? '12px 18px' : '16px 20px',
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r3)',
      boxShadow: 'var(--sh1)',
      transition: 'transform .12s ease, box-shadow .12s ease'
    }}
    onMouseEnter={(e) => {e.currentTarget.style.boxShadow = 'var(--sh2)';e.currentTarget.style.transform = 'translateY(-1px)';}}
    onMouseLeave={(e) => {e.currentTarget.style.boxShadow = 'var(--sh1)';e.currentTarget.style.transform = 'none';}}>
      <Avatar initials={lbl} size={sz} _fontSize={lbl.length > 3 ? sz * 0.26 : sz * 0.38}
        palette={sev.key === 'extreme' ? 'plum' : sev.key === 'high' ? 'terracotta' : sev.key === 'mod' ? 'terracotta' : 'sage'} />

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: dense ? 14 : 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {famLabel(fam)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          เตียง {fam.bed} · GA {fam.ga}wk · BW {fam.bw}g
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>DOL</div>
        <div>
          {days && <span style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{days}</span>}
          {dateStr && <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>{dateStr}</div>}
          {!days && !dateStr && <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-3)' }}>—</span>}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{t('last', lang)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="serif" style={{ fontSize: 22, color: sev.color, lineHeight: 1 }}>{lastAss ? lastAss.total : '—'}</span>
          <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--mono)' }}>/104</span>
          {flag && <Icon name="trend-up" size={14} color="var(--rose)" />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <MiniTrend values={trend || []} color={sev.color} width={70} height={26} />
        <span className="pill" style={{ whiteSpace: 'nowrap', background: pillM.cls.includes('extreme') ? 'rgba(111,59,88,.12)' : pillM.cls.includes('high') ? 'rgba(179,80,62,.12)' : pillM.cls.includes('mod') ? 'rgba(214,138,94,.14)' : pillM.cls.includes('mild') ? 'rgba(200,154,62,.12)' : 'rgba(110,138,106,.10)', color: sev.color, border: 'none', fontWeight: 700 }}>
          {pillM.label}
        </span>
      </div>

      <Icon name="arrow-right" size={18} color="var(--ink-4)" />
    </button>);

}

// --- Toast notification system ------------------------------------
function Toast({ msg, type, onDismiss }) {
  const cfg = {
    success: { bg: 'rgba(110,138,106,.12)', border: '#6e8a6a', icon: '✓', ic: '#6e8a6a' },
    error:   { bg: 'rgba(179,80,62,.10)',   border: '#b3503e', icon: '✕', ic: '#b3503e' },
    info:    { bg: 'var(--peach-soft)',      border: '#c45a3e', icon: 'ℹ', ic: '#c45a3e' },
  };
  const c = cfg[type] || cfg.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 14px 11px 12px',
      background: c.bg,
      border: `1px solid ${c.border}30`,
      borderLeft: `3px solid ${c.border}`,
      borderRadius: 10,
      boxShadow: 'var(--sh2)',
      fontSize: 13, color: 'var(--ink)',
      minWidth: 220, maxWidth: 340,
      animation: 'slideIn .22s ease both',
    }}>
      <span style={{ color: c.ic, fontWeight: 700, fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{c.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{msg}</span>
      <button onClick={onDismiss} style={{ color: 'var(--ink-4)', fontSize: 18, lineHeight: 1, padding: '0 0 0 4px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
    </div>
  );
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    window.showToast = (msg, type = 'info', duration = 3500) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev.slice(-4), { id, msg, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    };
    return () => { delete window.showToast; };
  }, []);
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      right: 'max(16px, env(safe-area-inset-right, 16px))',
      zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
      pointerEvents: 'none',
      maxWidth: 'calc(100vw - 32px)',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <Toast msg={t.msg} type={t.type} onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  I18N, t, Icon, SeverityBadge, sevPill, MiniTrend, SubscaleBars,
  AreaTrend, Avatar, TopNav, SlimHeader, BottomTabBar, SectionHeading,
  StatCard, FamilyRow, useIsMobile, SkeletonBlock, ToastContainer,
  deriveInitials, famLabel, nameToInitials,
});