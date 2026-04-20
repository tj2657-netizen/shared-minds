const CARDS = [
	{
		id: 'starter', name: 'Starter', full: 'Chase Freedom Rise', sub: 'Build your credit',
		accent: '#1D9E75', track: '#9FE1CB', cycleBg: '#F0FBF6', catBg: '#EAF6F1',
		tP: 'var(--color-text-primary)', tS: 'var(--color-text-secondary)', tT: 'var(--color-text-tertiary)',
		brd: 'var(--color-border-tertiary)', brdFill: 'rgba(0,0,0,.07)',
		limit: 800, used: 0, daysLeft: 18, cycleDays: 30, isPoints: false,
		limitRange: '$500-$2,000',
		note: 'Milestone: each on-time payment builds your credit history. Keep your spendings upto 30% to build maximum credit',
		cats: [
			{ nm: 'Essentials (Groceries & Basic Needs)', ab: 'GR', spent: 0, lim: 150, extra: '1% back' },
			{ nm: 'Transport',  ab: 'TR', spent: 0,  lim: 80,  extra: '1% back' },
			{ nm: 'Daily Treats', ab: 'EN', spent: 0, lim: 50, extra: '1% back' },
			{ nm: 'Lifestyle', ab: 'LS', spent: 0, lim: 60, extra: '1% back' },
			{ nm: 'Bills & Utilities', ab: 'BI', spent: 0,  lim: 100, extra: '1% back' },
		],
		ctx: 'Chase Freedom Rise starter card, user-defined limit and utilization. Student/first-time user. Spending includes Essentials, Transport, Daily Treats, Lifestyle, and Bills & Utilities. 18 days left in billing cycle. Focus tips on building credit score, payment habits, credit history length, and avoiding common beginner mistakes.'
	},
	{
		id: 'everyday', name: 'Everyday', full: 'Chase Freedom Unlimited', sub: 'Maximize cash back',
		accent: '#185FA5', track: '#85B7EB', cycleBg: '#EDF5FC', catBg: '#E6F1FB',
		tP: 'var(--color-text-primary)', tS: 'var(--color-text-secondary)', tT: 'var(--color-text-tertiary)',
		brd: 'var(--color-border-tertiary)', brdFill: 'rgba(0,0,0,.07)',
		limit: 5000, used: 0, daysLeft: 12, cycleDays: 30, isPoints: false,
		limitRange: '$500-$20000+',
		note: 'Estimated cash back this cycle: ~$14.85',
		cats: [
			{ nm: 'Reward-Optimized Spending (Groceries, Dining, Drugstores)', ab: 'RS', spent: 0, lim: 900,  extra: '3-5% back' },
			{ nm: 'Fixed Commitments (Rent, Utilities, Phone, Streaming)',      ab: 'FC', spent: 0, lim: 1400, extra: '1-2% back' },
			{ nm: 'Mobility & Convenience (Uber/Lyft, Gas, Transit, Delivery)', ab: 'MC', spent: 0, lim: 700,  extra: '2-3% back' },
			{ nm: 'Lifestyle & Experience (Shopping, Entertainment, Travel)',    ab: 'LE', spent: 0, lim: 1000, extra: '1.5-3% back' },
		],
		ctx: 'Chase Freedom Unlimited, $5000 limit, 18% utilization. Cash back categories this cycle: Reward-Optimized Spending (Groceries, Dining, Drugstores), Fixed Commitments (Rent, Utilities, Phone/Internet, Streaming), Mobility & Convenience (Uber/Lyft, Gas, Transit, Delivery), Lifestyle & Experience (Shopping, Entertainment, Travel). 12 days left. Focus on maximizing category rewards, timing purchases for statement close, and optimizing recurring bills.'
	},
	{
		id: 'travel', name: 'Travel', full: 'Chase Sapphire Preferred', sub: 'Earn your next trip',
		accent: '#534AB7', track: '#AFA9EC', cycleBg: '#EEEDFE', catBg: '#E8E6FC',
		tP: 'var(--color-text-primary)', tS: 'var(--color-text-secondary)', tT: 'var(--color-text-tertiary)',
		brd: 'var(--color-border-tertiary)', brdFill: 'rgba(0,0,0,.07)',
		limit: 12000, used: 0, daysLeft: 8, cycleDays: 30, isPoints: true,
		note: 'Points balance: 47,200 pts ~= $590 in travel redemptions',
		cats: [
			{ nm: 'Travel',  ab: 'TV', spent: 0, lim: 5000,  extra: '5x pts' },
			{ nm: 'Dining',  ab: 'DI', spent: 0, lim: 3000,  extra: '3x pts' },
			{ nm: 'Hotels',  ab: 'HT', spent: 0,  lim: 2000,  extra: '2x pts' },
			{ nm: 'Other',   ab: 'OT', spent: 0,  lim: 2000,  extra: '1x pts' },
		],
		ctx: 'Chase Sapphire Preferred, $12000 limit, 15% utilization. Points this cycle: Travel 2400pts/5000 (5x), Dining 1800pts/3000 (3x), Hotels 800pts/2000 (2x), Other 600pts/2000 (1x). Total balance 47,200 points. 8 days until cycle closes. Focus tips on transfer partners, maximizing point value, and upcoming trip redemption strategy.'
	},
	{
		id: 'premium', name: 'Premium', full: 'Chase Sapphire Reserve', sub: 'Elite benefits',
		accent: '#BA7517', track: '#633806', cycleBg: '#252218', catBg: '#1E1C12',
		isDark: true,
		tP: '#F0DEC8', tS: '#A89070', tT: '#705E48',
		brd: 'rgba(255,255,255,.12)', brdFill: 'rgba(255,255,255,.08)',
		limit: 25000, used: 0, daysLeft: 5, cycleDays: 30, isPoints: true,
		note: 'Annual travel credit: $245 of $300 used - $55 remaining',
		cats: [
			{ nm: 'Travel',  ab: 'TV', spent: 0, lim: 15000, extra: '10x pts' },
			{ nm: 'Dining',  ab: 'DI', spent: 0, lim: 6000,  extra: '3x pts' },
			{ nm: 'Hotels',  ab: 'HT', spent: 0, lim: 4000,  extra: '2x pts' },
			{ nm: 'Other',   ab: 'OT', spent: 0, lim: 3000,  extra: '1x pts' },
		],
		ctx: 'Chase Sapphire Reserve, $25000 limit, 22% utilization. $300 annual travel credit ($245 used, $55 remaining). Cycle ends in 5 DAYS - urgent. Points: Travel 8800pts (10x), Dining 3600pts (3x), Hotels 2200pts (2x), Other 1100pts. Priority Pass lounge access active. Focus tips on using remaining $55 travel credit before cycle, lounge access strategy, and points redemption at maximum value.'
	},
	{
		id: 'business', name: 'Business', full: 'Chase Ink Business', sub: 'Grow your business',
		accent: '#3C3489', track: '#7F77DD', cycleBg: '#EEEDFE', catBg: '#E8E6FC',
		tP: 'var(--color-text-primary)', tS: 'var(--color-text-secondary)', tT: 'var(--color-text-tertiary)',
		brd: 'var(--color-border-tertiary)', brdFill: 'rgba(0,0,0,.07)',
		limit: 20000, used: 0, daysLeft: 22, cycleDays: 30, isPoints: false,
		note: 'Estimated cash back this cycle: ~$68.10',
		cats: [
			{ nm: 'Office',     ab: 'OF', spent: 0,  lim: 800,  extra: '5% back' },
			{ nm: 'Ads & Mktg', ab: 'AD', spent: 0, lim: 2000, extra: '3% back' },
			{ nm: 'Software',   ab: 'SW', spent: 0,  lim: 500,  extra: '3% back' },
			{ nm: 'Travel',     ab: 'TV', spent: 0,  lim: 1500, extra: '2% back' },
		],
		ctx: 'Chase Ink Business Unlimited, $20000 limit, 28% utilization. Business spending: Office 5% ($450/$800), Ads & Marketing 3% ($1200/$2000), Software 3% ($380/$500 - nearly at limit), Travel 2% ($970/$1500). 22 days left. Focus tips on business expense optimization, tax deduction strategies for card rewards, employee card benefits, and using the signup bonus effectively.'
	}
];

const STARTER_ALLOCATIONS = [
	{ name: 'Bills & Utilities', pct: 0.40 },
	{ name: 'Essentials (Groceries & Basic Needs)', pct: 0.25 },
	{ name: 'Transport', pct: 0.10 },
	{ name: 'Daily Treats', pct: 0.15 },
	{ name: 'Lifestyle', pct: 0.10 }
];

function applyStarterCategoryLimits(card) {
	if (!card || card.id !== 'starter') {
		return;
	}

	let assigned = 0;
	STARTER_ALLOCATIONS.forEach((rule, idx) => {
		const cat = card.cats.find((c) => c.nm === rule.name);
		if (!cat) {
			return;
		}

		if (idx === STARTER_ALLOCATIONS.length - 1) {
			cat.lim = Math.max(0, Math.round(card.limit - assigned));
			return;
		}

		const allocation = Math.round(card.limit * rule.pct);
		cat.lim = allocation;
		assigned += allocation;
	});
}

const starterCard = CARDS.find((card) => card.id === 'starter');
applyStarterCategoryLimits(starterCard);

function mkRing(pct, accent, track) {
	const r = 69;
	const cx = 76;
	const cy = 76;
	const sw = 14;
	const circ = 2 * Math.PI * r;
	const fill = Math.max(0, Math.min(1, pct / 100)) * circ;
	return `<svg width="152" height="152" viewBox="0 0 152 152" role="img" aria-label="Credit utilization ${pct}%"><title>Credit utilization: ${pct}%</title><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${track}" stroke-width="${sw}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${accent}" stroke-width="${sw}" stroke-dasharray="${fill.toFixed(1)} ${(circ - fill).toFixed(1)}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/></svg>`;
}

function mkStatus(pct) {
	if (pct < 10) {
		return { bg: '#FAEEDA', txt: '#854F0B', dot: '#BA7517', lbl: 'Very low - may seem inactive', tip: 'Aim for 1-5% to signal responsible activity to bureaus.' };
	}
	if (pct <= 30) {
		return { bg: '#EAF3DE', txt: '#3B6D11', dot: '#639922', lbl: 'Excellent range', tip: 'Under 30% is the sweet spot. Your score thanks you.' };
	}
	if (pct <= 50) {
		return { bg: '#FAEEDA', txt: '#854F0B', dot: '#BA7517', lbl: 'Moderate - try to reduce', tip: 'Pay down before your statement closes to lower reported utilization.' };
	}
	return { bg: '#FCEBEB', txt: '#A32D2D', dot: '#A32D2D', lbl: 'High utilization', tip: 'Above 50% can significantly drop your score. Pay down soon.' };
}

function renderPanel(c) {
	const pct = Math.round(c.used / c.limit * 100);
	const cpct = Math.round((c.cycleDays - c.daysLeft) / c.cycleDays * 100);
	const s = mkStatus(pct);
	const rc = pct > 50 ? '#E24B4A' : pct > 30 ? '#BA7517' : c.accent;
	const cc = c.daysLeft <= 5 ? '#E24B4A' : c.daysLeft <= 10 ? '#BA7517' : c.accent;
	const panelStyle = c.isDark ? 'background:#1C1A0E;border-radius:var(--border-radius-lg);padding:1.25rem;' : '';
	const limitInputId = `limit-${c.id}`;

	const cats = c.cats.map((cat) => {
		const cp = Math.round(cat.spent / cat.lim * 100);
		const over = cp > 100;
		const bc = over ? '#E24B4A' : cp > 85 ? '#BA7517' : c.accent;
		const amt = c.isPoints ? `${cat.spent.toLocaleString()} pts` : `$${cat.spent}`;
		const lmt = c.isPoints ? `${cat.lim.toLocaleString()} pts` : `$${cat.lim}`;
		const inputId = `ci-${c.id}-${cat.ab}`;
		const categoryPoints = (c.loopPointsMap && c.loopPointsMap[cat.nm]) || 0;
		const rewardLabel = c.isPoints ? 'Points earned' : 'Rewards earned';
		const categoryActions = `<div class="grocery-inline">
				<div class="gctrl">
					<input class="gi" id="${inputId}" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Amount ($)" />
					<button class="gb" onclick="logCategorySpend('${c.id}', '${cat.nm}', '${inputId}')" style="background:${c.accent};">Add</button>
				</div>
				<div class="gp" style="color:${c.tS};">${rewardLabel}: <strong style="color:${c.tP};">${categoryPoints}</strong></div>
			</div>`;

		return `<div class="ck" style="background:${c.catBg};border:0.5px solid ${c.brd};">
			<div class="ci">
				<div class="cx" style="background:${bc}25;color:${bc};">${cat.ab}</div>
				${over
					? '<span class="ctag" style="background:#FCEBEB;color:#791F1F;">Over</span>'
					: `<span class="ctag" style="background:${c.accent}20;color:${c.accent};">${cat.extra}</span>`
				}
			</div>
			<div class="cn" style="color:${c.tS};">${cat.nm}</div>
			<div class="ca" style="color:${c.tP};">${amt}</div>
			<div class="cf" style="color:${c.tT};">of ${lmt}</div>
			<div class="mb" style="background:${c.brdFill};"><div class="mf" style="width:${Math.min(100, cp)}%;background:${bc};"></div></div>
			<div class="cpct" style="color:${c.tT};">${cp}%</div>
			${categoryActions}
		</div>`;
	}).join('');

	return `<div class="pnl" id="pnl-${c.id}" style="${panelStyle}">
		<div class="rs">
			<div class="sl" style="color:${c.tT};">${c.sub}</div>
			<div style="font-size:13px;font-weight:500;color:${c.tP};margin-bottom:10px;">${c.full}</div>
			<div class="rw">${mkRing(pct, rc, c.track)}<div class="rc"><div class="rp" style="color:${rc};">${pct}%</div><div class="rm" style="color:${c.tS};">utilization</div></div></div>
			<div class="bdg" style="background:${s.bg};color:${s.txt};">
				<svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="${s.dot}"/></svg>
				${s.lbl}
			</div>
			<p class="tt" style="color:${c.tT};">${s.tip}</p>
			<div class="limit-box" style="background:${c.cycleBg};border:0.5px solid ${c.brd};">
				<div class="sl" style="color:${c.tT};margin-bottom:8px;">Set your credit limit</div>
				${c.limitRange ? `<div style="font-size:11px;color:${c.tS};margin-bottom:8px;">Typical range: ${c.limitRange}</div>` : ''}
				<div class="gctrl">
					<input class="gi" id="${limitInputId}" type="number" min="1" step="1" inputmode="numeric" placeholder="Credit limit ($)" value="${c.limit}" />
					<button class="gb" onclick="updateCreditLimit('${c.id}', '${limitInputId}')" style="background:${c.accent};">Update limit</button>
				</div>
			</div>
		</div>
		${c.note ? `<div class="sn" style="background:${c.accent}18;color:${c.accent};">${c.note}</div>` : ''}
		<div class="cc" style="background:${c.cycleBg};">
			<div class="ct">
				<div>
					<div class="sl" style="color:${c.tT};">Billing cycle</div>
					<div class="cd" style="color:${cc};">${c.daysLeft} days left</div>
					<div class="cs" style="color:${c.tS};">until renewal</div>
				</div>
				<div style="text-align:right;">
					<div style="font-size:11px;color:${c.tT};">Cycle used</div>
					<div style="font-size:15px;font-weight:500;color:${c.tP};">${cpct}%</div>
				</div>
			</div>
			<div class="bt" style="background:${c.brdFill};"><div class="bf" style="width:${cpct}%;background:${cc};"></div></div>
		</div>
		<div class="sl" style="color:${c.tT};margin-bottom:7px;">Spending by category</div>
		<div class="cg">${cats}</div>
		<div class="sl" style="color:${c.tT};margin-bottom:7px;">Smart insights</div>
		<button class="ib" id="ib-${c.id}" onclick="getIns('${c.id}')" style="border:0.5px solid ${c.isDark ? 'rgba(255,255,255,.22)' : 'var(--color-border-secondary)'};color:${c.tP};">
			<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 10.25h-1.5v-4h1.5v4zm0-5.5h-1.5V4.25h1.5V5.75z" fill="currentColor"/></svg>
			Get personalized tips ->
		</button>
		<div id="io-${c.id}" style="margin-top:10px;"></div>
	</div>`;
}

const tabsEl = document.getElementById('tabs');
const panelsEl = document.getElementById('panels');
let activeTabIndex = 0;

function renderPanels() {
	panelsEl.innerHTML = CARDS.map((c) => renderPanel(c)).join('');
}

CARDS.forEach((c, i) => {
	const tb = document.createElement('button');
	tb.className = 'tb';
	tb.textContent = c.name;
	tb.onclick = () => show(i);
	tabsEl.appendChild(tb);
});

renderPanels();

function show(idx) {
	activeTabIndex = idx;
	document.querySelectorAll('.pnl').forEach((p, i) => p.classList.toggle('on', i === idx));
	document.querySelectorAll('.tb').forEach((t, i) => {
		const on = i === idx;
		t.classList.toggle('act', on);
		t.style.background = on ? CARDS[i].accent : '';
		t.style.color = on ? '#fff' : '';
		t.style.borderColor = on ? 'transparent' : '';
	});
}

function getRewardMultiplier(extraLabel) {
	const match = extraLabel.match(/([\d.]+)%/);
	if (!match) {
		return 1;
	}
	return Math.max(1, Math.round(Number(match[1])));
}

function logCategorySpend(cardId, categoryName, inputId) {
	const card = CARDS.find((c) => c.id === cardId);
	if (!card) {
		return;
	}

	const category = card.cats.find((cat) => cat.nm === categoryName);
	if (!category) {
		return;
	}

	const amountInput = document.getElementById(inputId);
	const enteredAmount = Number(amountInput?.value);
	if (!Number.isFinite(enteredAmount) || enteredAmount <= 0) {
		if (amountInput) {
			amountInput.focus();
		}
		return;
	}

	category.spent += enteredAmount;
	card.used += enteredAmount;
	if (!card.loopPointsMap) {
		card.loopPointsMap = {};
	}
	card.loopPointsMap[categoryName] = (card.loopPointsMap[categoryName] || 0) + enteredAmount * getRewardMultiplier(category.extra);

	renderPanels();
	show(activeTabIndex);
}

function updateCreditLimit(cardId, inputId) {
	const card = CARDS.find((c) => c.id === cardId);
	if (!card) {
		return;
	}

	const limitInput = document.getElementById(inputId);
	const rawValue = String(limitInput?.value ?? '').replace(/[$,\s]/g, '');
	const enteredLimit = Number(rawValue);
	if (!Number.isFinite(enteredLimit) || enteredLimit <= 0) {
		if (limitInput) {
			limitInput.focus();
		}
		return;
	}

	const previousLimit = Math.max(1, Number(card.limit) || 1);
	card.limit = Math.round(enteredLimit);
	if (card.id === 'starter') {
		applyStarterCategoryLimits(card);
	} else {
		const ratio = card.limit / previousLimit;
		let assigned = 0;
		card.cats.forEach((cat, idx) => {
			if (idx === card.cats.length - 1) {
				cat.lim = Math.max(0, Math.round(card.limit - assigned));
				return;
			}
			const nextLimit = Math.max(1, Math.round(cat.lim * ratio));
			cat.lim = nextLimit;
			assigned += nextLimit;
		});
	}
	renderPanels();
	show(activeTabIndex);
}

async function getIns(id) {
	const c = CARDS.find((x) => x.id === id);
	const btn = document.getElementById(`ib-${id}`);
	const out = document.getElementById(`io-${id}`);
	btn.disabled = true;
	out.innerHTML = `<div class="lm" style="color:${c.tS};">Analyzing your ${c.name.toLowerCase()} card profile...</div>`;

	const prompt = `You are a concise credit advisor. The user has a ${c.full}. Context: ${c.ctx}. Give exactly 3 short, specific, actionable tips tailored to THIS card type that many users overlook. Return only a JSON array: [{"title":"...","tip":"..."}]. No markdown, no preamble, no extra text.`;

	try {
		const r = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: 'claude-sonnet-4-20250514',
				max_tokens: 500,
				messages: [{ role: 'user', content: prompt }]
			})
		});
		const d = await r.json();
		const txt = (d.content || []).find((b) => b.type === 'text')?.text || '[]';
		const tips = JSON.parse(txt.replace(/```json|```/g, '').trim());
		out.innerHTML = tips.map((t) => `
			<div class="ik" style="background:${c.cycleBg};">
				<div class="it" style="color:${c.tP};">${t.title}</div>
				<div class="iy" style="color:${c.tS};">${t.tip}</div>
			</div>`).join('');
	} catch (e) {
		out.innerHTML = `<div class="lm" style="color:${c.tS};">Could not load insights - please try again.</div>`;
	}
	btn.disabled = false;
}

show(0);
