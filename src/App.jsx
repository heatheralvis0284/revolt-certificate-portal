import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ─── BRAND TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg:         '#F2F1F8',
  surface:    '#FFFFFF',
  card:       '#F8F7FC',
  sectionHd:  '#EEEDF7',
  border:     'rgba(101,96,150,0.12)',
  borderMid:  'rgba(101,96,150,0.25)',
  text:       '#43435B',
  sub:        '#656096',
  mute:       '#9896B8',
  placeholder:'#C4C2D9',
  cyan:       '#78DDFC',
  cyanDark:   '#3BBDE0',
  violet:     '#656096',
  violetDk:   '#4E4A7A',
  navy:       '#43435B',
  gold:       '#C9963A',
  green:      '#2E9E6A',
  orange:     '#D4682A',
  blue:       '#3A7DC9',
};

// ─── FONT STACK ───────────────────────────────────────────────────────────────
// Impact = headlines/display   |   Helvetica Neue = body   |   IBM Plex Mono = data
const F = {
  display: "Impact, 'Arial Narrow', Arial, sans-serif",
  body:    "'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono:    "'IBM Plex Mono', monospace",
};

// ─── LOGO & ICON PATHS ────────────────────────────────────────────────────────
// TO SET UP: copy both PNGs into your project's /public folder.
// logoDeck.png  → full "REVOLT ◌ ENERGY" logo bar  (used in nav + cert header)
// revoltIcon.png → circle-of-dots icon only          (used as watermark + accents)
const LOGO_PATH = "/logoDeck.png";
const ICON_PATH = "/revoltIcon.png";

// Full logo bar — just the PNG, sized by height prop
const RevoltLogo = ({ height = 32 }) => (
  <img
    src={LOGO_PATH}
    alt="ReVolt Energy"
    style={{ height: height, width: 'auto', objectFit: 'contain' }}
    onError={e => { e.target.style.display = 'none'; }}
  />
);

// Icon-only — circle of dots, used for watermarks and accents
const RevoltIcon = ({ size = 24, opacity = 1 }) => (
  <img
    src={ICON_PATH}
    alt=""
    aria-hidden="true"
    style={{ width: size, height: size, objectFit: 'contain', opacity, display: 'block' }}
    onError={e => { e.target.style.display = 'none'; }}
  />
);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const WTC_DATA = {
  certRef: "RV-WTC-2026-00847", electraRef: "EL-REG-NV-2024-00312",
  issueDate: "March 2, 2026", dateOfTransfer: "February 28, 2026", departureTime: "07:45 MST",
  arrivalDate: "March 1, 2026", arrivalTime: "16:30 CST", estProcessingDate: "March 10–14, 2026",
  blockchainHash: "0x4f9a2c…e847",
  generator: {
    name: "Clearwater Solar Partners LLC",
    site: "Eldorado Valley Solar Farm\n7800 Eldorado Valley Dr\nBoulder City, NV 89005",
    epaId: "NVR000049328", contact: "Marcus Webb — Director of Asset Management",
    phone: "(702) 441-8823", installYear: "2009",
    notes: "15-year commercial lease expiry. No fire, flood, or chemical damage. Planned EOL decommissioning.",
  },
  carrier: {
    name: "GreenHaul Logistics LLC", epaId: "NVR000061204", dot: "USDOT-4821093",
    address: "1420 Logistics Pkwy, Las Vegas, NV 89118", driver: "James R. Telford",
    vehicleReg: "NV-PLT-2291-K", trailer: "48ft flatbed — ratchet-strapped A-frame stillages",
    emergencyPhone: "(800) 555-0193",
  },
  facility: {
    name: "ReVolt Energy Recycling Facility",
    address: "Dockside Industrial Park\n2240 Industrial Blvd\nPlains, TX 79355",
    epaId: "TXR000082741", r2: "R2v3 App G — TX-2025-0041",
    iso14001: "ISO 14001:2015 — EMS-8824-US", iso45001: "ISO 45001:2018 — OHS-3317-US",
    contact: "Elena Kovacs — Compliance & Technical Director",
    phone: "(806) 739-4410", email: "elena@revolt-energy.co", permit: "TX-RCRA-SWP-2024-7712",
  },
  panels: [
    { mfr: "Jinko Solar",    model: "JKM400M-60HL4-V", type: "Mono-Si", watt: "400W", qty: 423, dim: "1.722 × 1.134m", batch: "JK-NV-A1" },
    { mfr: "LONGi Solar",    model: "LR4-60HPB-350M",  type: "Mono-Si", watt: "350W", qty: 248, dim: "1.722 × 1.040m", batch: "LG-NV-A2" },
    { mfr: "Canadian Solar", model: "CS3U-375MS",       type: "Mono-Si", watt: "375W", qty: 176, dim: "1.765 × 1.048m", batch: "CS-NV-A3" },
  ],
  quantity: { totalPanels: 847, totalPallets: 71, perPallet: "12 units (A-frame stillage)", grossKg: 18634, grossTonnes: "18.63 metric tonnes", netKg: 18520, weighbridge: "WB-NV-2026-04491" },
  condition: { overall: "Good — Standard EOL Degradation", glass: "Intact — no breakage observed at intake", frame: "Minor oxidation on ~12% of aluminium frames", electrical: "DC connectors removed and capped", hazmat: "Non-hazardous — TCLP verified (Report: TCLP-NV-2026-1147)", preTreatment: "None — no crushing, shredding, or chemical pre-treatment", contamination: "Free from asbestos, PCBs, and fire residue" },
  estMaterialValue: "$28,400 – $32,100 USD",
  valuePriceDate: "Pre-processing estimate at Feb 28, 2026 LME/LBMA spot",
  wasteCode: "Universal Waste — 40 CFR Part 273",
  rcra: "Non-Hazardous / Universal Waste (CA UW Rule effective 1/1/2021)",
  dot: "Non-regulated — universal waste transport exemption applied",
};

const MAT = [
  { material: "Tempered Glass Cullet",   id: "RV-GL-2026-0847", kg: 11880, pct: 64.1, purity: "99.2%",  grade: "Float Glass Cullet, Type A",      dest: "Vitro Architectural Glass, Wichita Falls TX",  priceKg: 0.08,  value: 950.40,  color: '#78DDFC' },
  { material: "Aluminium (Frames+MBB)", id: "RV-AL-2026-0847", kg: 2475,  pct: 13.3, purity: "99.8%",  grade: "Secondary Alloy 6063",            dest: "Novelis Recycling, Oswego NY",                  priceKg: 1.85,  value: 4578.75, color: '#656096' },
  { material: "Silicon (Solar-Grade)",   id: "RV-SI-2026-0847", kg: 1782,  pct: 9.6,  purity: "99.9%",  grade: "Solar-Grade Polysilicon (RoHS)", dest: "Hemlock Semiconductor, Hemlock MI",             priceKg: 2.20,  value: 3920.40, color: '#4E4A7A' },
  { material: "Silver (Paste Fraction)", id: "RV-AG-2026-0847", kg: 18.3,  pct: 0.1,  purity: "99.95%", grade: "LBMA Good Delivery Standard",    dest: "Asahi Refining USA, Salt Lake City UT",         priceKg: 1050,  value: 19215.00,color: '#C9963A' },
  { material: "Copper Wire+Connectors", id: "RV-CU-2026-0847", kg: 183,   pct: 1.0,  purity: "98.5%",  grade: "No. 2 Copper Scrap",              dest: "Aurubis Buffalo, Buffalo NY",                   priceKg: 9.50,  value: 1738.50, color: '#D4682A' },
  { material: "Residual (Energy Rec.)", id: "RV-RS-2026-0847", kg: 296,   pct: 1.6,  purity: "N/A",    grade: "EVA/Backsheet — Waste-to-Energy",  dest: "Clean Harbors Energy, Deer Park TX",            priceKg: 0,     value: 0,       color: '#9896B8' },
];

const COC_DATA = {
  certRef: "RV-COC-2026-00847", linkedWTC: "RV-WTC-2026-00847", electraRef: "EL-REG-NV-2024-00312",
  processedDate: "March 11–14, 2026", issueDate: "March 17, 2026", blockchainHash: "0x7f4a9b…9c2e",
  technology: "Laser Photonic Delamination (LPD™)",
  techDesc: "Non-thermal, non-chemical selective laser ablation separates encapsulant layers from silicon wafers and glass without compromising crystal integrity. Developed in partnership with Dr. Mool C. Gupta (UVA Dept. Electrical & Computer Engineering).",
  stages: [
    "Intake inspection & Electra QR scan → chain-of-custody log entry",
    "Pneumatic frame de-crimping → aluminium fraction separated",
    "Junction box removal → copper wire harvest",
    "LPD™ laser delamination → EVA/backsheet separation",
    "Silicon wafer recovery & optical sorting",
    "Glass cullet cleaning & quality grading",
    "Silver paste recovery → wet-chemical refining",
    "Material batching, assay certification & downstream packaging",
  ],
  throughput: "2,200 kg/day",
  energySource: "100% Renewable — West Texas Wind (ERCOT RECs #ERCOT-2026-R-009241)",
  carbon: {
    methodology: "IEA-PVPS Task 12 LCA (2020) + EPA WARM v15 emission factors",
    avoided: { glass: 2.47, aluminium: 25.99, silicon: 1.43, silver: 2.29, copper: 0.64 },
    totalAvoided: 32.82, processEmissions: 2.14, netBenefit: 30.68,
    energyMWh: 8.4, waterL: 12400, renewablePct: 100,
    scope3: "GHG Protocol Scope 3 — Category 12 (End-of-Life Treatment of Sold Products)",
  },
  totals: { weightIn: 18634, weightRecovered: 16338, recoveryRate: 99.1, landfillKg: 0, grossRevenue: 30403.05, processingFee: 3210.00, netRevenue: 27193.05, revenueShare: 8157.92, sharePct: "30%" },
  circularity: { mciScore: "0.94 / 1.00", closedLoop: "87.4%", diversionRate: "98.4%", recycledOutputContent: "100% post-consumer" },
  compliance: [
    { jurisdiction: "Federal",      ref: "40 CFR Part 273",    desc: "Universal Waste Rule — Solar Panel Classification" },
    { jurisdiction: "Nevada",       ref: "NRS Chapter 459",    desc: "Hazardous Materials — TCLP verified non-hazardous" },
    { jurisdiction: "Texas",        ref: "30 TAC Chapter 335", desc: "Industrial Solid Waste and Municipal Hazardous Waste" },
    { jurisdiction: "DOT",          ref: "49 CFR 173.159",     desc: "Non-regulated — universal waste exemption applied" },
    { jurisdiction: "GHG Protocol", ref: "Corp. Standard §4.5",desc: "Avoided emissions reported separately — not netted from Scope inventory" },
  ],
};

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────
// All font sizes are ~20% larger than the original dark-theme version

const Lbl = ({ children, color = C.sub }) => (
  <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color, marginBottom: 4 }}>
    {children}
  </div>
);

const Val = ({ children, mono, cyan, gold, green, mute, small, pre, bold }) => (
  <div style={{
    fontFamily: mono ? F.mono : F.body,
    fontSize: mono ? 13 : small ? 14 : 16,
    color: cyan ? C.cyanDark : gold ? C.gold : green ? C.green : mute ? C.mute : C.text,
    lineHeight: 1.55,
    fontWeight: bold ? 600 : 400,
    whiteSpace: pre ? 'pre-line' : 'normal',
  }}>
    {children}
  </div>
);

const Field = ({ label, value, mono, cyan, gold, green, mute, small, pre, bold, style = {} }) => (
  <div style={{ marginBottom: 12, ...style }}>
    <Lbl>{label}</Lbl>
    <Val mono={mono} cyan={cyan} gold={gold} green={green} mute={mute} small={small} pre={pre} bold={bold}>{value}</Val>
  </div>
);

const Chip = ({ children, color = C.cyanDark }) => (
  <span style={{
    display: 'inline-block',
    background: `${color}15`,
    border: `1px solid ${color}55`,
    color,
    borderRadius: 4,
    padding: '3px 10px',
    fontSize: 11,
    fontFamily: F.mono,
    letterSpacing: '0.04em',
    fontWeight: 500,
  }}>
    {children}
  </span>
);

const SecHead = ({ children, color = C.violet }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 9, borderBottom: `1.5px solid ${C.border}` }}>
    <div style={{ width: 3, height: 18, background: color, borderRadius: 2, flexShrink: 0 }} />
    <div style={{ fontFamily: F.display, fontSize: 15, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.sub, flex: 1 }}>
      {children}
    </div>
    {/* Tiny icon accent — right edge of every section header */}
    <RevoltIcon size={16} opacity={0.18} />
  </div>
);

const Block = ({ children, style = {}, accentColor }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '18px 20px', borderTop: accentColor ? `2.5px solid ${accentColor}` : undefined, ...style }}>
    {children}
  </div>
);

const Divider = ({ my = 18 }) => <div style={{ height: 1, background: C.border, margin: `${my}px 0` }} />;

const QRBlock = () => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ width: 72, height: 72, background: C.sectionHd, border: `1px solid ${C.borderMid}`, borderRadius: 6, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, padding: 8 }}>
      {[...Array(25)].map((_, i) => (
        <div key={i} style={{ background: [0,1,5,10,11,14,15,20,24,12,6,18].includes(i) ? C.violet : C.border, borderRadius: 1 }} />
      ))}
    </div>
    <div style={{ fontSize: 10, fontFamily: F.mono, color: C.mute, marginTop: 4, lineHeight: 1.3 }}>SCAN TO<br />VERIFY</div>
  </div>
);

// ─── CERT HEADER ─────────────────────────────────────────────────────────────
const CertHeader = ({ title, subtitle, certRef, issueDate, electraRef, hash }) => (
  <div style={{
    background: C.violet,
    backgroundImage: `linear-gradient(135deg, ${C.violetDk} 0%, ${C.violet} 60%, #7B78AD 100%)`,
    borderRadius: '8px 8px 0 0',
    padding: '26px 30px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 24,
    position: 'relative',
    overflow: 'hidden',
  }}>

    {/* ── WATERMARK: large icon centred-right, behind all content ── */}
    <div style={{ position: 'absolute', right: 200, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', userSelect: 'none' }}>
      <RevoltIcon size={220} opacity={0.07} />
    </div>

    {/* ── LEFT: logo + title + chips ── */}
    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: 16 }}>
        {/* Full logo bar PNG — white version sits well on the violet header */}
        <RevoltLogo height={30} />
      </div>
      <div style={{ fontFamily: F.display, fontSize: 36, letterSpacing: '0.04em', color: '#FFFFFF', lineHeight: 1.0, marginBottom: 7 }}>
        {title}
      </div>
      <div style={{ fontFamily: F.body, fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 16 }}>
        {subtitle}
      </div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {[['✓ BLOCKCHAIN VERIFIED', C.cyan], ['R2v3 CERTIFIED', 'rgba(255,255,255,0.85)'], ['ISO 14001:2015', 'rgba(255,255,255,0.85)'], ['ELECTRA TRACKED', C.cyan]].map(([label, c]) => (
          <span key={label} style={{ background: 'rgba(255,255,255,0.12)', border: `1px solid ${c === C.cyan ? C.cyan + '88' : 'rgba(255,255,255,0.3)'}`, color: c, borderRadius: 4, padding: '3px 11px', fontSize: 11, fontFamily: F.mono, letterSpacing: '0.05em' }}>
            {label}
          </span>
        ))}
      </div>
    </div>

    {/* ── RIGHT: QR + cert IDs + small icon accent in corner ── */}
    <div style={{ textAlign: 'right', minWidth: 175, position: 'relative', zIndex: 1 }}>
      {/* Small icon above QR as a design element */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
        <RevoltIcon size={28} opacity={0.45} />
      </div>
      <QRBlock />
      <div style={{ marginTop: 14 }}>
        {[['Certificate Ref', certRef, true], ['Issue Date', issueDate, false], ['Electra Reg #', electraRef, true], ['Blockchain Hash', hash, true]].map(([l, v, mono]) => (
          <div key={l} style={{ marginBottom: 8, textAlign: 'right' }}>
            <div style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{l}</div>
            <div style={{ fontFamily: mono ? F.mono : F.body, fontSize: mono ? 12 : 14, color: l === 'Certificate Ref' ? C.cyan : 'rgba(255,255,255,0.9)' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StatusBar = ({ items, accentColor = C.cyanDark, label }) => (
  <div style={{ background: `${accentColor}0A`, borderBottom: `1px solid ${accentColor}30`, padding: '8px 30px', display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: accentColor }} />
      <span style={{ fontFamily: F.mono, fontSize: 12, color: accentColor, fontWeight: 500 }}>{label}</span>
    </div>
    {items.map((item, i) => <span key={i} style={{ fontFamily: F.mono, fontSize: 12, color: C.sub }}>{item}</span>)}
  </div>
);

// ─── WASTE TRANSFER CERTIFICATE ───────────────────────────────────────────────
const WasteTransferCert = () => {
  const d = WTC_DATA;
  return (
    <div>
      <CertHeader title="Waste Transfer Certificate" subtitle="Solar Photovoltaic Panel End-of-Life Transfer & Chain-of-Custody Record" certRef={d.certRef} issueDate={d.issueDate} electraRef={d.electraRef} hash={d.blockchainHash} />
      <StatusBar label="STATUS: ACTIVE — LINKED TO CERTIFICATE OF CIRCULARITY" accentColor={C.cyanDark} items={[`Transfer Date: ${d.dateOfTransfer}`, `Panels: ${d.quantity.totalPanels.toLocaleString()} units`, `Weight: ${d.quantity.grossTonnes}`, `→ Linked CoC: RV-COC-2026-00847`]} />

      <div style={{ padding: '26px 30px', background: C.bg }}>

        {/* PARTIES */}
        <SecHead color={C.cyan}>Parties to This Transfer</SecHead>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { role: "Transferor (Generator)", color: C.blue, fields: [
              { l: "Organisation", v: d.generator.name, bold: true },
              { l: "Site Address", v: d.generator.site, pre: true },
              { l: "EPA ID", v: d.generator.epaId, mono: true },
              { l: "Contact", v: d.generator.contact, small: true },
              { l: "Phone", v: d.generator.phone },
              { l: "Installation Year", v: d.generator.installYear },
            ]},
            { role: "Carrier", color: C.orange, fields: [
              { l: "Company", v: d.carrier.name, bold: true },
              { l: "Address", v: d.carrier.address },
              { l: "EPA ID", v: d.carrier.epaId, mono: true },
              { l: "USDOT No.", v: d.carrier.dot, mono: true },
              { l: "Driver Name", v: d.carrier.driver },
              { l: "Vehicle Reg.", v: d.carrier.vehicleReg },
              { l: "Trailer Type", v: d.carrier.trailer, small: true },
              { l: "Emergency Tel.", v: d.carrier.emergencyPhone },
            ]},
            { role: "Receiving Facility", color: C.cyanDark, fields: [
              { l: "Facility Name", v: d.facility.name, bold: true },
              { l: "Address", v: d.facility.address, pre: true },
              { l: "EPA ID", v: d.facility.epaId, mono: true },
              { l: "R2v3 Cert #", v: d.facility.r2, mono: true, small: true },
              { l: "ISO 14001", v: d.facility.iso14001, small: true },
              { l: "Contact", v: d.facility.contact, small: true },
              { l: "Email", v: d.facility.email },
              { l: "TX Permit #", v: d.facility.permit, mono: true },
            ]},
          ].map(({ role, color, fields }) => (
            <Block key={role} accentColor={color}>
              <div style={{ fontFamily: F.display, fontSize: 13, letterSpacing: '0.12em', color, marginBottom: 14, textTransform: 'uppercase' }}>{role}</div>
              {fields.map(f => <Field key={f.l} label={f.l} value={f.v} mono={f.mono} small={f.small} pre={f.pre} bold={f.bold} />)}
            </Block>
          ))}
        </div>

        {/* LOGISTICS */}
        <SecHead color={C.violet}>Logistics & Transfer Timeline</SecHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { l: "Date of Transfer",   v: d.dateOfTransfer,       sub: d.departureTime + " — Departure" },
            { l: "Date of Arrival",    v: d.arrivalDate,          sub: d.arrivalTime + " — Facility intake" },
            { l: "Est. Processing",    v: d.estProcessingDate,    sub: "8-day window (LPD™ throughput)" },
            { l: "Weighbridge Ticket", v: d.quantity.weighbridge, sub: "Certified — Boulder City NV" },
          ].map(item => (
            <Block key={item.l}>
              <Lbl>{item.l}</Lbl>
              <div style={{ fontFamily: F.display, fontSize: 20, letterSpacing: '0.02em', color: C.text, marginBottom: 4 }}>{item.v}</div>
              <div style={{ fontFamily: F.body, fontSize: 13, color: C.mute }}>{item.sub}</div>
            </Block>
          ))}
        </div>

        {/* PANEL INVENTORY */}
        <SecHead color={C.blue}>Panel Inventory</SecHead>
        <Block style={{ marginBottom: 24, overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: F.body }}>
            <thead>
              <tr style={{ background: C.sectionHd }}>
                {['Manufacturer', 'Model', 'Technology', 'Wattage', 'Qty', 'Dimensions', 'Batch ID'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: C.sub, textTransform: 'uppercase', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.panels.map((p, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 1 ? C.card : 'transparent' }}>
                  <td style={{ padding: '10px 14px', fontSize: 14, color: C.text, fontWeight: 500 }}>{p.mfr}</td>
                  <td style={{ padding: '10px 14px', fontFamily: F.mono, fontSize: 13, color: C.sub }}>{p.model}</td>
                  <td style={{ padding: '10px 14px', fontSize: 14, color: C.sub }}>{p.type}</td>
                  <td style={{ padding: '10px 14px', fontFamily: F.mono, fontSize: 13, color: C.gold, fontWeight: 600 }}>{p.watt}</td>
                  <td style={{ padding: '10px 14px', fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: C.text }}>{p.qty.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', fontFamily: F.mono, fontSize: 12, color: C.sub }}>{p.dim}</td>
                  <td style={{ padding: '10px 14px' }}><Chip color={C.violet}>{p.batch}</Chip></td>
                </tr>
              ))}
              <tr style={{ background: C.sectionHd, borderTop: `2px solid ${C.borderMid}` }}>
                <td colSpan={4} style={{ padding: '10px 14px', fontFamily: F.display, fontSize: 13, letterSpacing: '0.1em', color: C.sub, textTransform: 'uppercase' }}>Total</td>
                <td style={{ padding: '10px 14px', fontFamily: F.mono, fontSize: 14, color: C.cyanDark, fontWeight: 700 }}>{d.quantity.totalPanels.toLocaleString()}</td>
                <td colSpan={2} style={{ padding: '10px 14px', fontSize: 13, color: C.sub }}>{d.quantity.totalPallets} pallets @ {d.quantity.perPallet}</td>
              </tr>
            </tbody>
          </table>
        </Block>

        {/* QUANTITY + CONDITION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <Block accentColor={C.gold}>
            <SecHead color={C.gold}>Quantity & Weight</SecHead>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="Total Panels"  value={d.quantity.totalPanels.toLocaleString() + " units"} bold />
              <Field label="Total Pallets" value={d.quantity.totalPallets + " A-frame stillages"} />
              <Field label="Gross Weight"  value={d.quantity.grossTonnes} gold bold />
              <Field label="Net Weight"    value={d.quantity.netKg.toLocaleString() + " kg"} />
              <Field label="Gross (kg)"    value={d.quantity.grossKg.toLocaleString() + " kg"} />
              <Field label="Weighbridge"   value={d.quantity.weighbridge} mono />
            </div>
          </Block>
          <Block accentColor={C.orange}>
            <SecHead color={C.orange}>Panel Condition Assessment</SecHead>
            {[
              { l: "Overall Condition",  v: d.condition.overall,       bold: true },
              { l: "Glass Integrity",    v: d.condition.glass,         cyan: true },
              { l: "Frame Condition",    v: d.condition.frame },
              { l: "Electrical Safety",  v: d.condition.electrical },
              { l: "TCLP Hazmat Status", v: d.condition.hazmat,        cyan: true },
              { l: "Pre-Treatment",      v: d.condition.preTreatment },
              { l: "Contamination",      v: d.condition.contamination },
            ].map(f => <Field key={f.l} label={f.l} value={f.v} cyan={f.cyan} bold={f.bold} small />)}
          </Block>
        </div>

        {/* MATERIAL VALUE */}
        <Block style={{ marginBottom: 24, borderLeft: `4px solid ${C.gold}` }}>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <div>
              <Lbl color={C.gold}>Estimated Recoverable Material Value (Pre-Processing)</Lbl>
              <div style={{ fontFamily: F.display, fontSize: 42, letterSpacing: '0.02em', color: C.gold }}>{d.estMaterialValue}</div>
              <div style={{ fontFamily: F.body, fontSize: 13, color: C.mute, marginTop: 3 }}>{d.valuePriceDate}</div>
            </div>
            <div style={{ flex: 1, borderLeft: `1px solid ${C.border}`, paddingLeft: 26 }}>
              <Field label="Federal Waste Classification" value={d.wasteCode} mono small />
              <Field label="RCRA Classification"          value={d.rcra} small />
              <Field label="DOT Shipping Status"          value={d.dot} cyan small />
            </div>
          </div>
        </Block>

        {/* NOTES + SIGNATURES */}
        <Block style={{ marginBottom: 24 }}>
          <SecHead color={C.sub}>Transfer Notes / Generator Declaration</SecHead>
          <div style={{ fontFamily: F.body, fontSize: 14, color: C.sub, lineHeight: 1.7, marginBottom: 18 }}>{d.generator.notes}</div>
          <Divider my={14} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
            {['Generator Representative', 'Carrier Driver', 'Facility Operator'].map(sig => (
              <div key={sig}>
                <Lbl>{sig} Signature</Lbl>
                <div style={{ height: 42, borderBottom: `1.5px solid ${C.borderMid}`, marginBottom: 5 }} />
                <div style={{ fontFamily: F.body, fontSize: 13, color: C.mute }}>Print Name / Date</div>
              </div>
            ))}
          </div>
        </Block>

        <div style={{ textAlign: 'center', fontFamily: F.mono, fontSize: 11, color: C.placeholder, paddingTop: 8 }}>
          This certificate is issued for compliance, audit, and regulatory reporting purposes. | revolt-energy.co | goelectra.io | {d.certRef}
        </div>
      </div>
    </div>
  );
};

// ─── CERTIFICATE OF CIRCULARITY ───────────────────────────────────────────────
const CircularityCert = () => {
  const d = COC_DATA;
  const pieData = MAT.map(m => ({ name: m.material.split(' (')[0].split(' ')[0], value: m.pct, color: m.color }));

  const DonutLabel = ({ cx, cy }) => (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fontFamily="Impact, Arial Narrow, Arial, sans-serif" fontSize={32} fill={C.text}>{d.totals.recoveryRate}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize={12} fill={C.sub}>RECOVERY</text>
    </g>
  );

  return (
    <div>
      <CertHeader title="Certificate of Circularity" subtitle="Material Recovery, Environmental Impact & Circular Economy Outcomes" certRef={d.certRef} issueDate={d.issueDate} electraRef={d.electraRef} hash={d.blockchainHash} />
      <StatusBar label="PROCESSING COMPLETE — CIRCULARITY VERIFIED" accentColor={C.violet} items={[`Processed: ${d.processedDate}`, `Recovery Rate: ${d.totals.recoveryRate}%`, `→ Linked WTC: ${d.linkedWTC}`]} />

      <div style={{ padding: '26px 30px', background: C.bg }}>

        {/* PROCESSING */}
        <SecHead color={C.cyan}>Processing Technology & Method</SecHead>
        <Block accentColor={C.cyanDark} style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 26 }}>
            <div>
              <Field label="Technology"       value={d.technology} bold />
              <Field label="Process Description" value={d.techDesc} small mute />
              <Field label="Energy Source"    value={d.energySource} cyan small />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Processing Period" value={d.processedDate} />
                <Field label="Throughput"        value={d.throughput} />
              </div>
            </div>
            <div>
              <Lbl>Processing Stages</Lbl>
              {d.stages.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 19, height: 19, borderRadius: '50%', background: `${C.cyan}25`, border: `1px solid ${C.cyan}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontFamily: F.mono, fontSize: 10, color: C.cyanDark, fontWeight: 600 }}>{i + 1}</span>
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </Block>

        {/* MATERIAL RECOVERY TABLE + DONUT */}
        <SecHead color={C.violet}>Material Recovery Output</SecHead>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: 12, marginBottom: 24 }}>
          <Block style={{ overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: F.body }}>
              <thead>
                <tr style={{ background: C.sectionHd }}>
                  {['Material Fraction', 'Batch ID', 'Weight (kg)', '% Total', 'Purity', 'Grade', 'Destination', '$/kg', 'Value'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontFamily: F.body, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.sub, textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MAT.map((m, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 1 ? C.card : 'transparent' }}>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 9, height: 9, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{m.material}</span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 12, color: C.sub }}>{m.id}</td>
                    <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 14, color: C.text, fontWeight: 600 }}>{m.kg.toLocaleString()}</td>
                    <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 14 }}><span style={{ color: m.color, fontWeight: 600 }}>{m.pct}%</span></td>
                    <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 13, color: C.cyanDark, fontWeight: 500 }}>{m.purity}</td>
                    <td style={{ padding: '9px 12px', fontSize: 13, color: C.sub }}>{m.grade}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, color: C.sub }}>{m.dest}</td>
                    <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 13, color: C.gold }}>{m.priceKg > 0 ? `$${m.priceKg.toLocaleString()}` : '—'}</td>
                    <td style={{ padding: '9px 12px', fontFamily: F.mono, fontSize: 13, color: m.value > 0 ? C.green : C.mute, fontWeight: 600 }}>
                      {m.value > 0 ? `$${m.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: C.sectionHd, borderTop: `2px solid ${C.borderMid}` }}>
                  <td colSpan={2} style={{ padding: '10px 12px', fontFamily: F.display, fontSize: 13, letterSpacing: '0.1em', color: C.sub, textTransform: 'uppercase' }}>Totals</td>
                  <td style={{ padding: '10px 12px', fontFamily: F.mono, fontSize: 14, color: C.cyanDark, fontWeight: 700 }}>{d.totals.weightRecovered.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', fontFamily: F.mono, fontSize: 14, color: C.cyanDark, fontWeight: 700 }}>{d.totals.recoveryRate}%</td>
                  <td colSpan={4} style={{ padding: '10px 12px', fontSize: 13, color: C.sub }}>Landfill: 0 kg — Energy Recovery: 296 kg</td>
                  <td style={{ padding: '10px 12px', fontFamily: F.mono, fontSize: 14, color: C.green, fontWeight: 700 }}>$30,403.05</td>
                </tr>
              </tbody>
            </table>
          </Block>

          {/* DONUT */}
          <Block>
            <Lbl color={C.violet}>Material Composition by Weight</Lbl>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={86} dataKey="value" labelLine={false}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke={C.bg} strokeWidth={2} />)}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`, '']} contentStyle={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 6, fontFamily: F.mono, fontSize: 13, color: C.text }} />
                  <DonutLabel cx={135} cy={100} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {MAT.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                <div style={{ fontFamily: F.body, fontSize: 12, color: C.sub, flex: 1 }}>{m.material.split(' (')[0]}</div>
                <div style={{ fontFamily: F.mono, fontSize: 12, color: m.color, fontWeight: 600 }}>{m.pct}%</div>
              </div>
            ))}
          </Block>
        </div>

        {/* GHG */}
        <SecHead color={C.green}>Environmental Impact & GHG Accounting</SecHead>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: "Total CO₂e Avoided", value: `${d.carbon.totalAvoided} t`, sub: "From virgin material substitution", color: C.cyanDark },
            { label: "Process Emissions",  value: `${d.carbon.processEmissions} t`, sub: "Laser + transport energy", color: C.orange },
            { label: "Net GHG Benefit",    value: `${d.carbon.netBenefit} t CO₂e`, sub: "Gross avoided minus process", color: C.green },
          ].map(item => (
            <Block key={item.label} accentColor={item.color} style={{ textAlign: 'center' }}>
              <Lbl color={item.color}>{item.label}</Lbl>
              <div style={{ fontFamily: F.display, fontSize: 34, letterSpacing: '0.02em', color: item.color, margin: '5px 0' }}>{item.value}</div>
              <div style={{ fontFamily: F.body, fontSize: 13, color: C.mute }}>{item.sub}</div>
            </Block>
          ))}
        </div>

        <Block style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }}>
            <div>
              <Lbl color={C.sub}>CO₂e Avoided by Material (tonnes)</Lbl>
              {Object.entries(d.carbon.avoided).map(([mat, val]) => (
                <div key={mat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: F.body, fontSize: 14, color: C.sub, textTransform: 'capitalize' }}>{mat}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ height: 4, width: Math.round(val * 3.5), background: C.cyan, borderRadius: 2, opacity: 0.7, maxWidth: 100 }} />
                    <span style={{ fontFamily: F.mono, fontSize: 13, color: C.cyanDark, fontWeight: 600 }}>{val} t</span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <Field label="Energy Consumed"  value={`${d.carbon.energyMWh} MWh`} />
                <Field label="Renewable Energy" value={`${d.carbon.renewablePct}%`} cyan />
                <Field label="Water Consumed"   value={`${d.carbon.waterL.toLocaleString()} L`} />
                <Field label="GHG Scope"        value="Scope 3 Cat. 12" mono small />
              </div>
              <Field label="Calculation Methodology"  value={d.carbon.methodology} small mute />
              <Field label="GHG Protocol Compliance"  value={d.carbon.scope3} small mute />
            </div>
          </div>
        </Block>

        {/* REVENUE */}
        <SecHead color={C.gold}>Revenue & Value Distribution</SecHead>
        <Block style={{ marginBottom: 24, borderLeft: `4px solid ${C.gold}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {[
              { l: "Gross Material Revenue",   v: "$30,403.05",  color: C.gold },
              { l: "Processing Fee (ReVolt)",  v: "– $3,210.00", color: C.orange },
              { l: "Net Revenue",              v: "$27,193.05",  color: C.text },
              { l: `Generator Share (${d.totals.sharePct})`, v: "$8,157.92", color: C.green },
            ].map(item => (
              <div key={item.l}>
                <Lbl>{item.l}</Lbl>
                <div style={{ fontFamily: F.display, fontSize: 25, letterSpacing: '0.02em', color: item.color }}>{item.v}</div>
              </div>
            ))}
          </div>
          <Divider my={13} />
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.mute }}>
            All commodity prices referenced to LME (aluminium, copper), LBMA (silver), and S&P Global Platts (silicon) spot rates as of processing settlement date. Revenue share per signed RSA on file with Clearwater Solar Partners LLC.
          </div>
        </Block>

        {/* CIRCULARITY + ESG */}
        <SecHead color={C.violet}>Circularity Metrics & ESG Alignment</SecHead>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <Block>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: "Material Circularity Indicator (MCI)", v: d.circularity.mciScore, color: C.violet },
                { l: "Closed-Loop Recycling %",             v: d.circularity.closedLoop, color: C.cyanDark },
                { l: "Landfill Diversion Rate",             v: d.circularity.diversionRate, color: C.green },
                { l: "Recycled Output Content",             v: d.circularity.recycledOutputContent, color: C.text },
              ].map(item => (
                <Block key={item.l} style={{ textAlign: 'center', background: C.card }}>
                  <Lbl>{item.l}</Lbl>
                  <div style={{ fontFamily: F.display, fontSize: 22, letterSpacing: '0.02em', color: item.color }}>{item.v}</div>
                </Block>
              ))}
            </div>
          </Block>
          <Block>
            <Lbl color={C.violet}>ESG Framework Alignment</Lbl>
            {[
              { std: "GRI 306-4/306-5",    scope: "Waste Diverted / Directed to Disposal",   color: C.blue },
              { std: "ESRS E5-4/E5-5",     scope: "Resource Inflows & Outflows — CSRD",       color: C.cyanDark },
              { std: "SASB IF-EU-150a.1",  scope: "Waste Diverted from Disposal",             color: C.violet },
              { std: "GHG Protocol §4.5",  scope: "Avoided Emissions — reported separately",  color: C.green },
              { std: "Ellen MacArthur MCI",scope: "Material Circularity Indicator v1.3",      color: C.gold },
            ].map(item => (
              <div key={item.std} style={{ display: 'flex', gap: 9, marginBottom: 9, alignItems: 'center' }}>
                <Chip color={item.color}>{item.std}</Chip>
                <span style={{ fontFamily: F.body, fontSize: 13, color: C.sub }}>{item.scope}</span>
              </div>
            ))}
          </Block>
        </div>

        {/* COMPLIANCE */}
        <SecHead color={C.sub}>Regulatory Compliance</SecHead>
        <Block style={{ marginBottom: 24, overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.sectionHd }}>
                {['Jurisdiction', 'Reference', 'Compliance Basis'].map(h => (
                  <th key={h} style={{ padding: '9px 15px', textAlign: 'left', fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: C.sub, textTransform: 'uppercase', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.compliance.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 1 ? C.card : 'transparent' }}>
                  <td style={{ padding: '10px 15px' }}><Chip color={C.cyanDark}>{c.jurisdiction}</Chip></td>
                  <td style={{ padding: '10px 15px', fontFamily: F.mono, fontSize: 13, color: C.violet, fontWeight: 500 }}>{c.ref}</td>
                  <td style={{ padding: '10px 15px', fontFamily: F.body, fontSize: 14, color: C.sub }}>{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>

        {/* CERT STATEMENT */}
        <Block accentColor={C.violet} style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

          {/* Watermark icon — faint, centred behind the statement text */}
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0 }}>
            <RevoltIcon size={180} opacity={0.05} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: F.display, fontSize: 15, letterSpacing: '0.16em', color: C.sub, marginBottom: 13, textTransform: 'uppercase' }}>Certification Statement</div>
            <div style={{ fontFamily: F.body, fontSize: 16, color: C.sub, lineHeight: 1.8, maxWidth: 660, margin: '0 auto 22px' }}>
              I hereby certify that the above-described photovoltaic panels have been received, processed using Laser Photonic Delamination (LPD™) technology, and all recovered materials directed to verified downstream recycling and recovery partners in accordance with applicable environmental legislation and R2v3 Appendix G standards.
            </div>

            {/* Cert badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
              {[['R2v3\nAPP G', C.cyanDark], ['ISO\n14001', C.violet], ['ISO\n45001', C.violet], ['ELECTRA\nCERT', C.gold]].map(([b, c], i) => (
                <div key={i} style={{ width: 58, height: 58, borderRadius: 8, background: `${c}12`, border: `1.5px solid ${c}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: F.display, fontSize: 11, letterSpacing: '0.06em', color: c, textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre-line' }}>{b}</div>
                </div>
              ))}
            </div>

            <Divider my={18} />

            {/* Signatures with small icon accents on each side */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16 }}>
              <RevoltIcon size={20} opacity={0.25} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52, maxWidth: 500, flex: 1 }}>
                {['ReVolt Energy Representative', 'Electra Stewardship Network'].map(sig => (
                  <div key={sig}>
                    <div style={{ height: 40, borderBottom: `1.5px solid ${C.borderMid}`, marginBottom: 6 }} />
                    <div style={{ fontFamily: F.body, fontSize: 13, color: C.mute }}>{sig}</div>
                  </div>
                ))}
              </div>
              <RevoltIcon size={20} opacity={0.25} />
            </div>
          </div>
        </Block>

        <div style={{ textAlign: 'center', fontFamily: F.mono, fontSize: 11, color: C.placeholder, paddingTop: 18, paddingBottom: 4 }}>
          revolt-energy.co | goelectra.io | {d.certRef} | Linked WTC: {d.linkedWTC}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('coc');
  const [toast, setToast] = useState('');

  useEffect(() => {
    // Only IBM Plex Mono needed now — headlines use Impact (system), body uses Helvetica Neue (system)
    const gf = document.createElement('link');
    gf.rel = 'stylesheet';
    gf.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap';
    gf.id = 'revolt-gf';
    if (!document.getElementById('revolt-gf')) document.head.appendChild(gf);
    const st = document.createElement('style');
    st.id = 'revolt-st';
    st.textContent = `* { box-sizing: border-box; margin: 0; padding: 0; } @media print { .no-print { display: none !important; } }`;
    if (!document.getElementById('revolt-st')) document.head.appendChild(st);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2400); };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F.body }}>

      {/* NAV */}
      <div className="no-print" style={{ background: C.violet, backgroundImage: `linear-gradient(90deg, ${C.violetDk} 0%, ${C.violet} 100%)`, padding: '0 30px', display: 'flex', alignItems: 'center', gap: 18, height: 60, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(67,67,91,0.2)' }}>
        <RevoltLogo height={24} light />
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)', marginLeft: 8 }} />
        <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 3 }}>
          {[{ id: 'coc', label: 'Certificate of Circularity' }, { id: 'wtc', label: 'Waste Transfer Certificate' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '6px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', background: tab === t.id ? 'rgba(255,255,255,0.18)' : 'transparent', color: tab === t.id ? '#FFFFFF' : 'rgba(255,255,255,0.55)', fontFamily: F.display, fontSize: 14, letterSpacing: '0.1em', transition: 'all 0.15s', outline: tab === t.id ? '1px solid rgba(255,255,255,0.3)' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 9, alignItems: 'center' }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{tab === 'coc' ? 'RV-COC-2026-00847' : 'RV-WTC-2026-00847'}</span>
          <button onClick={() => { navigator.clipboard.writeText(`https://certs.revolt-energy.co/verify/${tab === 'coc' ? 'RV-COC-2026-00847' : 'RV-WTC-2026-00847'}`).catch(() => {}); showToast('Certificate link copied'); }} style={{ padding: '7px 17px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontFamily: F.display, fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer' }}>
            ↗ SHARE
          </button>
          <button onClick={() => window.print()} style={{ padding: '7px 17px', borderRadius: 6, border: `1px solid ${C.cyan}66`, background: `${C.cyan}20`, color: C.cyan, fontFamily: F.display, fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer' }}>
            ⎙ PRINT / PDF
          </button>
        </div>
      </div>

      {/* META STRIP */}
      <div className="no-print" style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '8px 30px', display: 'flex', gap: 22, alignItems: 'center' }}>
        <div style={{ fontFamily: F.mono, fontSize: 12, color: C.mute }}>
          Project: Eldorado Valley Solar Farm — Boulder City, NV &nbsp;·&nbsp; Generator: Clearwater Solar Partners LLC &nbsp;·&nbsp; 847 panels / 18.63 metric tonnes
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 7 }}>
          <Chip color={C.cyanDark}>R2v3 ✓</Chip>
          <Chip color={C.violet}>ISO 14001 ✓</Chip>
          <Chip color={C.gold}>ELECTRA TRACKED ✓</Chip>
        </div>
      </div>

      {/* CERTIFICATE */}
      <div style={{ maxWidth: 1180, margin: '26px auto', padding: '0 22px 60px' }}>
        <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.borderMid}`, boxShadow: '0 8px 40px rgba(67,67,91,0.10)', overflow: 'hidden' }}>
          {tab === 'coc' ? <CircularityCert /> : <WasteTransferCert />}
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: C.surface, border: `1px solid ${C.cyan}55`, color: C.cyanDark, padding: '11px 26px', borderRadius: 8, fontFamily: F.mono, fontSize: 13, boxShadow: '0 4px 20px rgba(67,67,91,0.15)', zIndex: 999 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}