import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Info, Copy, X } from 'lucide-react';

// ─── Berekeningsfuncties ────────────────────────────────────────────────────

function berekenMaandlast(hoofdsom, rente, looptijdJaar, type) {
  const r = rente / 100 / 12;
  const n = looptijdJaar * 12;

  if (type === 'aflossingsvrij') {
    return { rente: hoofdsom * r, aflossing: 0, totaal: hoofdsom * r };
  }
  if (type === 'lineair') {
    const aflossing = hoofdsom / n;
    const eersteRente = hoofdsom * r;
    return { rente: eersteRente, aflossing, totaal: eersteRente + aflossing, isVariabel: true };
  }
  if (type === 'annuiteit') {
    if (r === 0) {
      const maand = hoofdsom / n;
      return { rente: 0, aflossing: maand, totaal: maand };
    }
    const maand = (hoofdsom * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const eersteRente = hoofdsom * r;
    return { rente: eersteRente, aflossing: maand - eersteRente, totaal: maand };
  }
  return { rente: 0, aflossing: 0, totaal: 0 };
}

function berekenMaandSchema(hoofdsom, rente, looptijdJaar, type) {
  const r = rente / 100 / 12;
  const n = looptijdJaar * 12;
  const schema = [];
  let saldo = hoofdsom;

  for (let m = 1; m <= n && saldo > 0.01; m++) {
    const renteKosten = saldo * r;
    let aflossing;
    let maandlast;

    if (type === 'aflossingsvrij') {
      aflossing = 0;
      maandlast = renteKosten;
    } else if (type === 'lineair') {
      aflossing = hoofdsom / n;
      maandlast = renteKosten + aflossing;
    } else {
      // annuiteit
      if (r === 0) {
        aflossing = hoofdsom / n;
        maandlast = aflossing;
      } else {
        maandlast = (hoofdsom * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        aflossing = maandlast - renteKosten;
      }
    }

    saldo = Math.max(0, saldo - aflossing);
    schema.push({ maand: m, rente: renteKosten, aflossing, maandlast, saldo });
  }
  return schema;
}

function berekenNettoLast(brutoRente, belastingschijf) {
  return brutoRente * (1 - belastingschijf / 100);
}

// ─── Constanten ─────────────────────────────────────────────────────────────

const LENING_TYPES = [
  { value: 'annuiteit', label: 'Annuïteit' },
  { value: 'lineair', label: 'Lineair' },
  { value: 'aflossingsvrij', label: 'Aflossingsvrij' },
];

const BELASTING_SCHIJVEN = [
  { value: 36.97, label: '36,97% (schijf 1 t/m 68.507)' },
  { value: 49.5, label: '49,50% (schijf 2 boven 68.507)' },
  { value: 0, label: 'Geen aftrek' },
];

const defaultDeel = (id) => ({
  id,
  naam: `Deel ${id}`,
  hoofdsom: '',
  rente: '',
  looptijd: 30,
  type: 'annuiteit',
  aftrekbaar: true,
  rentevastPeriode: 10,
});

const defaultScenario = (id) => ({
  id,
  naam: `Scenario ${id}`,
  belastingschijf: 36.97,
  delen: [defaultDeel(1)],
});

// ─── Hulpcomponenten ─────────────────────────────────────────────────────────

const Tooltip = ({ tekst }) => {
  const [zichtbaar, setZichtbaar] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        onMouseEnter={() => setZichtbaar(true)}
        onMouseLeave={() => setZichtbaar(false)}
        className="text-gray-400 hover:text-blue-500 transition-colors"
        tabIndex={-1}
      >
        <Info size={13} />
      </button>
      {zichtbaar && (
        <span className="absolute z-50 bottom-6 left-1/2 -translate-x-1/2 w-56 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none">
          {tekst}
        </span>
      )}
    </span>
  );
};

const EuroInput = ({ label, value, onChange, tooltip, placeholder = '0' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
      {label}
      {tooltip && <Tooltip tekst={tooltip} />}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
);

const PctInput = ({ label, value, onChange, tooltip, step = '0.01' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
      {label}
      {tooltip && <Tooltip tekst={tooltip} />}
    </label>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        min="0"
        max="20"
        placeholder="0,00"
        className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
    </div>
  </div>
);

const fmt = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n || 0);

const fmtGetal = (n, decimalen = 0) =>
  new Intl.NumberFormat('nl-NL', { minimumFractionDigits: decimalen, maximumFractionDigits: decimalen }).format(n || 0);

// ─── Deel formulier ──────────────────────────────────────────────────────────

const DeelFormulier = ({ deel, onChange, onVerwijder, index, isEnig }) => {
  const [uitgevouwen, setUitgevouwen] = useState(true);

  const update = (veld, val) => onChange({ ...deel, [veld]: val });

  const resultaat = useMemo(() => {
    if (!deel.hoofdsom || !deel.rente) return null;
    return berekenMaandlast(
      parseFloat(deel.hoofdsom),
      parseFloat(deel.rente),
      parseInt(deel.looptijd),
      deel.type
    );
  }, [deel]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-3">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={() => setUitgevouwen(!uitgevouwen)}
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            {index + 1}
          </span>
          <span className="font-medium text-gray-700 text-sm">{deel.naam || `Deel ${index + 1}`}</span>
          {resultaat && (
            <span className="text-xs text-gray-400 ml-2">
              {fmt(resultaat.totaal)}/mnd
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEnig && (
            <button
              onClick={(e) => { e.stopPropagation(); onVerwijder(); }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
            >
              <Trash2 size={14} />
            </button>
          )}
          {uitgevouwen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {uitgevouwen && (
        <div className="px-4 py-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {/* Naam */}
          <div className="col-span-2 md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Naam deel</label>
            <input
              type="text"
              value={deel.naam}
              onChange={(e) => update('naam', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="bijv. Bestaande hypotheek"
            />
          </div>

          <EuroInput
            label="Hoofdsom"
            value={deel.hoofdsom}
            onChange={(v) => update('hoofdsom', v)}
            tooltip="Het geleende bedrag voor dit hypotheekdeel"
          />
          <PctInput
            label="Rente"
            value={deel.rente}
            onChange={(v) => update('rente', v)}
            tooltip="De jaarlijkse rente voor dit deel"
          />

          {/* Looptijd */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
              Looptijd
              <Tooltip tekst="Totale looptijd van dit hypotheekdeel in jaren" />
            </label>
            <div className="relative">
              <input
                type="number"
                value={deel.looptijd}
                onChange={(e) => update('looptijd', e.target.value)}
                min="1"
                max="40"
                className="w-full pl-3 pr-12 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">jaar</span>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
              Type
              <Tooltip tekst="Annuïteit: vaste maandlast. Lineair: vaste aflossing, dalende rente. Aflossingsvrij: alleen rente." />
            </label>
            <select
              value={deel.type}
              onChange={(e) => update('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {LENING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Rentevast periode */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
              Rentevast periode
              <Tooltip tekst="Periode (in jaren) waarvoor de rente vaststaat" />
            </label>
            <div className="relative">
              <input
                type="number"
                value={deel.rentevastPeriode}
                onChange={(e) => update('rentevastPeriode', e.target.value)}
                min="1"
                max="30"
                className="w-full pl-3 pr-12 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">jaar</span>
            </div>
          </div>

          {/* Aftrekbaar */}
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id={`aftrek-${deel.id}`}
              checked={deel.aftrekbaar}
              onChange={(e) => update('aftrekbaar', e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`aftrek-${deel.id}`} className="text-xs font-medium text-gray-600 flex items-center">
              Rente aftrekbaar
              <Tooltip tekst="Vink aan als de rente van dit deel aftrekbaar is van de belasting" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Resultatenkaart ─────────────────────────────────────────────────────────

const ResultatenKaart = ({ scenario, toonDetails }) => {
  const [jaarweergave, setJaarweergave] = useState(false);

  const berekeningen = useMemo(() => {
    return scenario.delen.map((deel) => {
      if (!deel.hoofdsom || !deel.rente) return null;
      const hfdsom = parseFloat(deel.hoofdsom);
      const rente = parseFloat(deel.rente);
      const looptijd = parseInt(deel.looptijd);
      const schema = berekenMaandSchema(hfdsom, rente, looptijd, deel.type);
      const eersteRente = schema[0]?.rente ?? 0;
      const eersteAflossing = schema[0]?.aflossing ?? 0;
      const eersteTotaal = schema[0]?.maandlast ?? 0;
      const totaalRente = schema.reduce((s, m) => s + m.rente, 0);
      const nettoRente = deel.aftrekbaar
        ? berekenNettoLast(eersteRente, scenario.belastingschijf)
        : eersteRente;
      const nettoTotaal = nettoRente + eersteAflossing;
      return { deel, schema, eersteRente, eersteAflossing, eersteTotaal, totaalRente, nettoRente, nettoTotaal };
    }).filter(Boolean);
  }, [scenario]);

  const totaalBruto = berekeningen.reduce((s, b) => s + b.eersteTotaal, 0);
  const totaalNetto = berekeningen.reduce((s, b) => s + b.nettoTotaal, 0);
  const totaalRenteKosten = berekeningen.reduce((s, b) => s + b.totaalRente, 0);
  const totaalHoofdsom = berekeningen.reduce((s, b) => s + parseFloat(b.deel.hoofdsom || 0), 0);

  if (berekeningen.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
        Vul hoofdsom en rente in om resultaten te zien
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Samenvatting */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 text-white">
        <div className="text-xs opacity-80 mb-1">Totale maandlasten (eerste maand)</div>
        <div className="flex items-end gap-4">
          <div>
            <div className="text-2xl font-bold">{fmt(totaalBruto)}</div>
            <div className="text-xs opacity-70">bruto/mnd</div>
          </div>
          <div className="text-blue-200 text-xl pb-0.5">→</div>
          <div>
            <div className="text-2xl font-bold text-green-300">{fmt(totaalNetto)}</div>
            <div className="text-xs opacity-70">netto/mnd</div>
          </div>
        </div>
        <div className="mt-2 text-xs opacity-70">
          Besparing: {fmt(totaalBruto - totaalNetto)}/mnd via hypotheekrente aftrek ({fmtGetal(scenario.belastingschijf, 2)}%)
        </div>
      </div>

      {/* Totalen */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-4 py-3 text-center">
          <div className="text-xs text-gray-500">Totale schuld</div>
          <div className="font-semibold text-gray-800 text-sm">{fmt(totaalHoofdsom)}</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-xs text-gray-500">Totale rentekosten</div>
          <div className="font-semibold text-gray-800 text-sm">{fmt(totaalRenteKosten)}</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="text-xs text-gray-500">Netto/jaar</div>
          <div className="font-semibold text-green-600 text-sm">{fmt(totaalNetto * 12)}</div>
        </div>
      </div>

      {/* Per deel */}
      {toonDetails && (
        <div className="divide-y divide-gray-100">
          {berekeningen.map((b, i) => (
            <div key={b.deel.id} className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  {b.deel.naam}
                </span>
                <span className="text-xs text-gray-400">
                  {b.deel.type} · {b.deel.looptijd}j · {b.deel.rente}%
                  {b.deel.rentevastPeriode && ` · rv ${b.deel.rentevastPeriode}j`}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-gray-500">Rente/mnd</div>
                  <div className="font-semibold text-gray-800">{fmt(b.eersteRente)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-gray-500">Aflossing/mnd</div>
                  <div className="font-semibold text-gray-800">{fmt(b.eersteAflossing)}</div>
                  {b.deel.type === 'lineair' && (
                    <div className="text-gray-400 text-xs">(vast)</div>
                  )}
                </div>
                <div className="bg-blue-50 rounded-lg px-3 py-2">
                  <div className="text-blue-600">Bruto/mnd</div>
                  <div className="font-semibold text-blue-700">{fmt(b.eersteTotaal)}</div>
                </div>
                <div className="bg-green-50 rounded-lg px-3 py-2">
                  <div className="text-green-600">Netto/mnd</div>
                  <div className="font-semibold text-green-700">{fmt(b.nettoTotaal)}</div>
                  {!b.deel.aftrekbaar && (
                    <div className="text-gray-400 text-xs">(geen aftrek)</div>
                  )}
                </div>
              </div>

              {/* Amortisatieschema preview */}
              {b.deel.type === 'lineair' && (
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-orange-600">Let op:</span> lineaire lening — maandlast daalt van {fmt(b.eersteTotaal)} naar{' '}
                  {fmt(b.schema[b.schema.length - 1]?.maandlast ?? 0)} aan het einde.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Jaarlijks overzicht toggle */}
      {toonDetails && (
        <div className="border-t border-gray-100 px-5 py-3">
          <button
            onClick={() => setJaarweergave(!jaarweergave)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
          >
            {jaarweergave ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Jaarlijks amortisatieoverzicht {jaarweergave ? 'verbergen' : 'tonen'}
          </button>

          {jaarweergave && <JaarOverzicht berekeningen={berekeningen} belastingschijf={scenario.belastingschijf} />}
        </div>
      )}
    </div>
  );
};

// ─── Jaar overzicht ──────────────────────────────────────────────────────────

const JaarOverzicht = ({ berekeningen, belastingschijf }) => {
  const maxJaar = Math.max(...berekeningen.map((b) => Math.ceil(b.schema.length / 12)));

  const jaarData = useMemo(() => {
    return Array.from({ length: maxJaar }, (_, jIdx) => {
      let brutoRente = 0, brutolast = 0, aflossing = 0, aftrekbaar = 0;
      berekeningen.forEach((b) => {
        for (let m = jIdx * 12; m < Math.min((jIdx + 1) * 12, b.schema.length); m++) {
          brutoRente += b.schema[m].rente;
          brutolast += b.schema[m].maandlast;
          aflossing += b.schema[m].aflossing;
          if (b.deel.aftrekbaar) aftrekbaar += b.schema[m].rente;
        }
      });
      const belastingvoordeel = aftrekbaar * (belastingschijf / 100);
      const nettolast = brutolast - belastingvoordeel;
      const restschuld = berekeningen.reduce((s, b) => s + (b.schema[Math.min((jIdx + 1) * 12 - 1, b.schema.length - 1)]?.saldo ?? 0), 0);
      return { jaar: jIdx + 1, brutoRente, brutolast, aflossing, belastingvoordeel, nettolast, restschuld };
    });
  }, [berekeningen, belastingschijf, maxJaar]);

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-600">
            <th className="text-left px-3 py-2 font-medium rounded-tl-lg">Jaar</th>
            <th className="text-right px-3 py-2 font-medium">Bruto/jr</th>
            <th className="text-right px-3 py-2 font-medium">Rente/jr</th>
            <th className="text-right px-3 py-2 font-medium">Aflossing/jr</th>
            <th className="text-right px-3 py-2 font-medium text-green-700">Belastingvoord.</th>
            <th className="text-right px-3 py-2 font-medium text-green-700">Netto/jr</th>
            <th className="text-right px-3 py-2 font-medium rounded-tr-lg">Restschuld</th>
          </tr>
        </thead>
        <tbody>
          {jaarData.map((r, i) => (
            <tr key={r.jaar} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-3 py-1.5 font-medium text-gray-700">{r.jaar}</td>
              <td className="px-3 py-1.5 text-right text-gray-700">{fmt(r.brutolast)}</td>
              <td className="px-3 py-1.5 text-right text-gray-500">{fmt(r.brutoRente)}</td>
              <td className="px-3 py-1.5 text-right text-gray-500">{fmt(r.aflossing)}</td>
              <td className="px-3 py-1.5 text-right text-green-600">{fmt(r.belastingvoordeel)}</td>
              <td className="px-3 py-1.5 text-right text-green-700 font-medium">{fmt(r.nettolast)}</td>
              <td className="px-3 py-1.5 text-right text-gray-600">{fmt(r.restschuld)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Scenario editor ─────────────────────────────────────────────────────────

const ScenarioEditor = ({ scenario, onChange, onVerwijder, isEnig, toonResultaten }) => {
  const [uitgevouwen, setUitgevouwen] = useState(true);

  const updateDeel = (index, nieuwDeel) => {
    const delen = [...scenario.delen];
    delen[index] = nieuwDeel;
    onChange({ ...scenario, delen });
  };

  const verwijderDeel = (index) => {
    const delen = scenario.delen.filter((_, i) => i !== index);
    onChange({ ...scenario, delen });
  };

  const voegDeelToe = () => {
    const maxId = Math.max(...scenario.delen.map((d) => d.id), 0);
    onChange({ ...scenario, delen: [...scenario.delen, defaultDeel(maxId + 1)] });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
      {/* Scenario header */}
      <div
        className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setUitgevouwen(!uitgevouwen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow">
            {scenario.id}
          </div>
          <div>
            <input
              type="text"
              value={scenario.naam}
              onChange={(e) => { e.stopPropagation(); onChange({ ...scenario, naam: e.target.value }); }}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1 text-sm"
              placeholder="Naam scenario"
            />
            <div className="text-xs text-gray-400">{scenario.delen.length} deel{scenario.delen.length !== 1 ? 'en' : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEnig && (
            <button
              onClick={(e) => { e.stopPropagation(); onVerwijder(); }}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <X size={15} />
            </button>
          )}
          {uitgevouwen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </div>

      {uitgevouwen && (
        <div className="px-5 py-4 space-y-4">
          {/* Belastingschijf */}
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center">
              Belastingschijf hypotheekrente aftrek
              <Tooltip tekst="Uw marginale belastingtarief bepaalt hoeveel belastingvoordeel u krijgt over de betaalde hypotheekrente" />
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {BELASTING_SCHIJVEN.map((s) => (
                <label
                  key={s.value}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-xs ${
                    scenario.belastingschijf === s.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name={`schijf-${scenario.id}`}
                    value={s.value}
                    checked={scenario.belastingschijf === s.value}
                    onChange={() => onChange({ ...scenario, belastingschijf: s.value })}
                    className="sr-only"
                  />
                  <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                    scenario.belastingschijf === s.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`} />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          {/* Hypotheekdelen */}
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Hypotheekdelen</div>
            {scenario.delen.map((deel, i) => (
              <DeelFormulier
                key={deel.id}
                deel={deel}
                index={i}
                onChange={(nieuw) => updateDeel(i, nieuw)}
                onVerwijder={() => verwijderDeel(i)}
                isEnig={scenario.delen.length === 1}
              />
            ))}
            <button
              onClick={voegDeelToe}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 text-sm hover:bg-blue-50 transition-colors font-medium"
            >
              <Plus size={16} />
              Hypotheekdeel toevoegen
            </button>
          </div>

          {/* Resultaten */}
          {toonResultaten && (
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Resultaten</div>
              <ResultatenKaart scenario={scenario} toonDetails={true} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Scenario vergelijking ────────────────────────────────────────────────────

const ScenarioVergelijking = ({ scenarios }) => {
  const geldigeScenarios = scenarios.filter((s) =>
    s.delen.some((d) => d.hoofdsom && d.rente)
  );

  if (geldigeScenarios.length < 2) return null;

  const data = geldigeScenarios.map((scenario) => {
    let bruto = 0, netto = 0, totaalRente = 0, hoofdsom = 0;
    scenario.delen.forEach((deel) => {
      if (!deel.hoofdsom || !deel.rente) return;
      const schema = berekenMaandSchema(
        parseFloat(deel.hoofdsom),
        parseFloat(deel.rente),
        parseInt(deel.looptijd),
        deel.type
      );
      const eersteRente = schema[0]?.rente ?? 0;
      const eersteAfl = schema[0]?.aflossing ?? 0;
      const eersteTotal = schema[0]?.maandlast ?? 0;
      const nettoRente = deel.aftrekbaar
        ? berekenNettoLast(eersteRente, scenario.belastingschijf)
        : eersteRente;
      bruto += eersteTotal;
      netto += nettoRente + eersteAfl;
      totaalRente += schema.reduce((s, m) => s + m.rente, 0);
      hoofdsom += parseFloat(deel.hoofdsom);
    });
    return { scenario, bruto, netto, totaalRente, hoofdsom };
  });

  const minNetto = Math.min(...data.map((d) => d.netto));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="font-semibold text-gray-700 text-sm">Scenario vergelijking</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Scenario</th>
              <th className="text-right px-4 py-3 font-medium">Hoofdsom</th>
              <th className="text-right px-4 py-3 font-medium">Bruto/mnd</th>
              <th className="text-right px-4 py-3 font-medium text-green-700">Netto/mnd</th>
              <th className="text-right px-4 py-3 font-medium">Netto/jaar</th>
              <th className="text-right px-4 py-3 font-medium">Totale rente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((d, i) => {
              const isGoedkoopst = d.netto === minNetto;
              return (
                <tr key={d.scenario.id} className={isGoedkoopst ? 'bg-green-50' : 'hover:bg-gray-50'}>
                  <td className="px-5 py-3 font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    {d.scenario.naam}
                    {isGoedkoopst && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Voordeligst
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(d.hoofdsom)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(d.bruto)}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${isGoedkoopst ? 'text-green-700' : 'text-gray-700'}`}>
                    {fmt(d.netto)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(d.netto * 12)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{fmt(d.totaalRente)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Hoofd component ──────────────────────────────────────────────────────────

const HypotheekCalculator = ({ onSluiten }) => {
  const [scenarios, setScenarios] = useState([defaultScenario(1)]);
  const [toonResultatenInEditor, setToonResultatenInEditor] = useState(true);
  const [activeTab, setActiveTab] = useState('invoer');

  let scenarioTeller = scenarios.length;

  const voegScenarioToe = () => {
    scenarioTeller += 1;
    const nieuwScenario = defaultScenario(scenarioTeller);
    // kopieer eerste deel als basis
    if (scenarios.length > 0) {
      nieuwScenario.belastingschijf = scenarios[scenarios.length - 1].belastingschijf;
    }
    setScenarios([...scenarios, nieuwScenario]);
  };

  const kopieerScenario = (index) => {
    scenarioTeller += 1;
    const kopie = JSON.parse(JSON.stringify(scenarios[index]));
    kopie.id = scenarioTeller;
    kopie.naam = `${kopie.naam} (kopie)`;
    setScenarios([...scenarios.slice(0, index + 1), kopie, ...scenarios.slice(index + 1)]);
  };

  const updateScenario = (index, nieuw) => {
    const nieuweLijst = [...scenarios];
    nieuweLijst[index] = nieuw;
    setScenarios(nieuweLijst);
  };

  const verwijderScenario = (index) => {
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-100">
      {/* Topbalk */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-base leading-tight">Hypotheek Calculator</h1>
            <p className="text-xs text-gray-400">Bruto/netto lasten per scenario</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
            <div
              onClick={() => setToonResultatenInEditor(!toonResultatenInEditor)}
              className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${toonResultatenInEditor ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${toonResultatenInEditor ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            Resultaten naast invoer
          </label>
          <button
            onClick={onSluiten}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Scenarios */}
          <div className="space-y-4">
            {scenarios.map((scenario, i) => (
              <div key={scenario.id} className="relative">
                <div className="flex justify-end gap-2 mb-1">
                  <button
                    onClick={() => kopieerScenario(i)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Copy size={12} />
                    Dupliceer
                  </button>
                </div>
                <ScenarioEditor
                  scenario={scenario}
                  onChange={(nieuw) => updateScenario(i, nieuw)}
                  onVerwijder={() => verwijderScenario(i)}
                  isEnig={scenarios.length === 1}
                  toonResultaten={toonResultatenInEditor}
                />
              </div>
            ))}
          </div>

          {/* Scenario toevoegen */}
          <button
            onClick={voegScenarioToe}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Nieuw scenario toevoegen
          </button>

          {/* Vergelijking */}
          <ScenarioVergelijking scenarios={scenarios} />

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
            <strong>Let op:</strong> Deze berekeningen zijn indicatief. De werkelijke hypotheekrente aftrek wordt begrensd door de wet Hillen en andere fiscale regelgeving. Raadpleeg een hypotheekadviseur voor bindend advies.
          </div>
        </div>
      </div>
    </div>
  );
};

export default HypotheekCalculator;
