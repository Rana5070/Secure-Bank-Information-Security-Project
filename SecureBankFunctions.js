
lucide.createIcons();

// ── STATE ──
const S = {
    modes: { auth: 'attack', xss: 'attack', sqli: 'attack', csrf: 'attack' },
    csrfToken: null, csrfBal: 10000, comments: [],
    fwRules: [{ ip: 'ANY', port: '443', proto: 'TCP', action: 'ALLOW', hits: 0 }, { ip: 'ANY', port: '80', proto: 'TCP', action: 'LOG', hits: 0 }, { ip: '10.0.0.0/8', port: 'ANY', proto: 'ANY', action: 'DENY', hits: 0 }, { ip: '192.168.1.0/24', port: '22', proto: 'TCP', action: 'ALLOW', hits: 0 }],
    atk: 0, blk: 0, lastCipher: '', sig: { msg: '', hash: '', sig: '' }
};

// ── NAV ──
function gp(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => { if (b.getAttribute('onclick')?.includes("'" + id + "'")) b.classList.add('active'); });
    if (id === 'dashboard') renderDash();
    lucide.createIcons();
}

// ── TABS ──
function st(page, tab) {
    const map = { xss: ['stored', 'reflected', 'csp'], sqli: ['auth', 'union', 'blind'], crypto: ['aes', 'hash', 'des', 'sig', 'pki'] };
    const pfx = { xss: 'xssTab', sqli: 'sqliTab', crypto: 'cryptoTab' };
    document.querySelectorAll('#page-' + page + ' .tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('#page-' + page + ' .tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(pfx[page] + '-' + tab).classList.add('active');
    const idx = (map[page] || []).indexOf(tab);
    if (idx >= 0) document.querySelectorAll('#page-' + page + ' .tab-btn')[idx]?.classList.add('active');
    lucide.createIcons();
}

// ── UTILS ──
function lg(id, msg, t = 'info') { const el = document.getElementById(id); if (!el) return; el.innerHTML += `<span class="${t}">${new Date().toLocaleTimeString()} › ${msg}</span>\n`; el.scrollTop = el.scrollHeight; }
function cl(id) { const el = document.getElementById(id); if (el) el.innerHTML = ''; }
function la(msg, blocked = false) {
    S.atk++; if (blocked) S.blk++;
    const a = document.getElementById('statAtk'), b = document.getElementById('statBlk'), ha = document.getElementById('heroAttacks'), hb = document.getElementById('heroBlocked');
    if (a) a.textContent = S.atk; if (b) b.textContent = S.blk; if (ha) ha.textContent = S.atk; if (hb) hb.textContent = S.blk;
    lg('atkLog', blocked ? `[BLOCKED] ${msg}` : `[ATTACK]  ${msg}`, blocked ? 'ok' : 'err');
}
function sh(str) { let h = BigInt(0); const s = 0x9e3779b97f4a7c15n; for (let i = 0; i < str.length; i++) { h = (h * 31n + BigInt(str.charCodeAt(i))) ^ s; h = h & 0xFFFFFFFFFFFFFFFFn; } let o = h.toString(16).padStart(16, '0'); while (o.length < 128) o += Math.abs(o.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 0)).toString(16).padStart(8, '0'); return o.slice(0, 128); }
function rh(n = 32) { return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join(''); }
function saes(t, k, enc = true) { const kb = k.slice(0, 32); let r = ''; for (let i = 0; i < t.length; i++)r += String.fromCharCode(t.charCodeAt(i) ^ kb.charCodeAt(i % kb.length)); if (enc) return btoa(r).replace(/=+$/, ''); try { return atob(t).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ kb.charCodeAt(i % kb.length))).join(''); } catch { return '[Invalid ciphertext]'; } }

// ── MODE TOGGLE ──
function setMode(page, m) {
    S.modes[page] = m;
    const atkId = { auth: 'authAtk', xss: 'xssAtk', sqli: 'sqliAtk', csrf: 'csrfAtk' }[page];
    const defId = { auth: 'authDef', xss: 'xssDef', sqli: 'sqliDef', csrf: 'csrfDef' }[page];
    document.getElementById(atkId).className = 'mode-btn' + (m === 'attack' ? ' active attack' : '');
    document.getElementById(defId).className = 'mode-btn' + (m === 'defend' ? ' active defend' : '');
    // CSRF extra
    if (page === 'csrf') { if (m === 'defend') { S.csrfToken = rh(32); document.getElementById('csrfTknField').style.display = 'block'; document.getElementById('csrfTknVal').value = S.csrfToken; document.getElementById('csrfDefExp').style.display = 'flex'; } else { document.getElementById('csrfTknField').style.display = 'none'; document.getElementById('csrfDefExp').style.display = 'none'; } }
    // XSS re-render
    if (page === 'xss') renderComments();
    updateBadge();
    cl(page === 'auth' ? 'authOut' : page === 'xss' ? 'reflectOut' : page === 'sqli' ? 'sqliOut' : 'csrfOut');
    lg(page === 'auth' ? 'authOut' : page === 'xss' ? 'reflectOut' : page === 'sqli' ? 'sqliOut' : 'csrfOut', 'Mode → ' + (m === 'attack' ? '⚡ ATTACK (vulnerable)' : '🛡️ DEFENSE (secure)'), m === 'attack' ? 'err' : 'ok');
}
function updateBadge() {
    const any = Object.values(S.modes).includes('attack');
    const b = document.getElementById('modeBadge'); b.className = 'mode-badge ' + (any ? 'insecure' : 'secure');
    document.getElementById('modeText').textContent = any ? 'Attack Mode' : 'Secure Mode';
    const sm = document.getElementById('statMode'); if (sm) sm.textContent = any ? 'ATTACK' : 'SECURE';
}

// ── AUTH ──
const USERS = { admin: { hash: sh('admin123slt_admin'), salt: 'slt_admin', role: 'admin' }, alice: { hash: sh('alice2024slt_alice'), salt: 'slt_alice', role: 'user' } };
function doLogin() {
    const u = document.getElementById('authUser').value.trim(), p = document.getElementById('authPass').value; cl('authOut');
    if (S.modes.auth === 'attack') { const pl = { admin: 'admin123', alice: 'alice2024' }; lg('authOut', '[VULNERABLE] Comparing plain text passwords...', 'warn'); lg('authOut', `Query: SELECT * FROM users WHERE username='${u}' AND password='${p}'`, 'warn'); if (pl[u] === p) { lg('authOut', `✓ LOGIN SUCCESS as ${u} — plain text match`, 'ok'); lg('authOut', '⚠ DB breach = all passwords exposed!', 'err'); } else lg('authOut', '✗ Login FAILED', 'err'); la(`Login as ${u} (attack mode)`, false); }
    else { const user = USERS[u]; if (!user) { lg('authOut', '✗ User not found', 'err'); return; } const h = sh(p + user.salt); lg('authOut', '[SECURE] Hashing with stored salt...', 'info'); lg('authOut', `SHA-512(${p}+${user.salt}) = ${h.slice(0, 28)}...`, 'dim'); if (h === user.hash) { lg('authOut', `✓ Hash match — LOGIN SUCCESS as ${u} (${user.role})`, 'ok'); } else lg('authOut', '✗ Hash mismatch — Invalid credentials', 'err'); }
}
function attackLogin() { cl('authOut'); if (S.modes.auth === 'attack') { const h = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })), p = btoa(JSON.stringify({ sub: 'alice', role: 'admin', iat: Date.now() })); lg('authOut', '⚡ Forging JWT with alg:none...', 'err'); lg('authOut', `Forged: ${h}.${p}.`, 'err'); lg('authOut', '⚠ Server accepted unsigned token — alice now has admin!', 'err'); la('JWT alg:none forgery', false); } else { lg('authOut', '[BLOCKED] alg:none rejected — HMAC-SHA256 required', 'ok'); lg('authOut', '[BLOCKED] Forged token is invalid', 'ok'); la('JWT forgery attempt', true); } }
function rbacTest(role) { cl('rbacOut'); const A = { user: [{ r: 'GET /account/balance', ok: true }, { r: 'POST /transfer', ok: true }, { r: 'GET /admin/users', ok: false }, { r: 'DELETE /account/any', ok: false }], admin: [{ r: 'GET /account/balance', ok: true }, { r: 'POST /transfer', ok: true }, { r: 'GET /admin/users', ok: true }, { r: 'DELETE /account/any', ok: true }], none: [{ r: 'GET /account/balance', ok: false }, { r: 'POST /transfer', ok: false }, { r: 'GET /admin/users', ok: false }, { r: 'DELETE /account/any', ok: false }] }; lg('rbacOut', `Testing: ${role.toUpperCase()}`, 'info'); (A[role] || []).forEach(a => lg('rbacOut', `${a.ok ? '✅ ALLOW' : '❌ DENY '} › ${a.r}`, a.ok ? 'ok' : 'err')); }
function liveHash() { const v = document.getElementById('hashInput').value; if (!v) { document.getElementById('hashOut').innerHTML = ''; return; } const h = sh(v); document.getElementById('hashOut').innerHTML = `<span class="info">SHA-512("${v}") =</span>\n<span class="ok">${h}</span>`; }

// ── XSS ──
function postComment() { const u = document.getElementById('xssUser').value, c = document.getElementById('xssComment').value; S.comments.push({ u, c, t: new Date().toLocaleTimeString() }); renderComments(); la(`XSS payload posted by ${u}`, S.modes.xss === 'defend'); }
function renderComments() { const b = document.getElementById('commentBoard'); b.innerHTML = ''; S.comments.forEach(cm => { const d = document.createElement('div'); d.style.cssText = 'border-bottom:1px solid var(--border);padding:.45rem 0;font-size:.84rem'; d.innerHTML = `<strong style="color:var(--teal)">${cm.u}</strong> <span style="color:var(--text3);font-size:.72rem">${cm.t}</span><br>`; const cd = document.createElement('div'); if (S.modes.xss === 'attack') { cd.innerHTML = cm.c; } else { cd.textContent = cm.c; const s = document.createElement('span'); s.style.cssText = 'font-size:.7rem;color:var(--success)'; s.textContent = ' [sanitized ✓]'; d.appendChild(cd); d.appendChild(s); b.appendChild(d); return; } d.appendChild(cd); b.appendChild(d); }); if (!S.comments.length) b.innerHTML = '<span style="color:var(--text3);font-size:.84rem">No comments yet.</span>'; }
function doSearch() { const q = document.getElementById('xssSearch').value; const res = document.getElementById('searchResult'); cl('reflectOut'); if (S.modes.xss === 'attack') { res.innerHTML = 'Results for: ' + q; lg('reflectOut', '[VULNERABLE] Reflected via innerHTML — scripts execute', 'err'); la('Reflected XSS via search', false); } else { const s = document.createElement('span'); s.textContent = 'Results for: ' + q; res.innerHTML = ''; res.appendChild(s); lg('reflectOut', '[PROTECTED] textContent used — tags are literal text', 'ok'); la('Reflected XSS attempt', true); } }

// ── SQLi ──
function sqliPl(t) { const p = { 'bypass': "admin' OR '1'='1' --", 'drop': "'; DROP TABLE users; --" }; document.getElementById('sqliUser').value = p[t] || ''; }
function sqlLogin() { const u = document.getElementById('sqliUser').value, p = document.getElementById('sqliPass').value; cl('sqliOut'); const q = `SELECT * FROM users WHERE username='${u}' AND password='${p}'`; document.getElementById('sqliQuery').innerHTML = `<span class="warn">Constructed query:</span>\n<span class="${S.modes.sqli === 'attack' ? 'err' : 'ok'}">${q}</span>`; if (S.modes.sqli === 'attack') { lg('sqliOut', '[VULNERABLE] Executing raw concatenated query...', 'warn'); if (u.toLowerCase().includes('drop')) { lg('sqliOut', '💥 DROP TABLE executed — database destroyed!', 'err'); la('SQL DROP TABLE', false); } else if (u.includes("'") || u.toLowerCase().includes('or ')) { lg('sqliOut', '✓ AUTH BYPASS — logged in as admin without password!', 'err'); lg('sqliOut', 'Returned: {id:1, username:"admin", role:"admin"}', 'err'); la('SQL auth bypass', false); } else lg('sqliOut', 'Normal login attempt', 'ok'); } else { lg('sqliOut', '[SECURE] Parameterized — input treated as DATA', 'ok'); if (u.includes("'") || u.toLowerCase().includes('or ') || u.toLowerCase().includes('drop')) { lg('sqliOut', '⚠ Malicious input NEUTRALIZED — no injection possible', 'ok'); la('SQL injection attempt', true); } } }
function unionAttack() { cl('unionOut'); if (S.modes.sqli === 'attack' && document.getElementById('unionInput').value.toLowerCase().includes('union')) { lg('unionOut', '[ATTACK] UNION injection executed!', 'err');['admin', 'alice', 'bob'].forEach(u => lg('unionOut', `  ${u}: ${sh(u + 'pass').slice(0, 24)}...`, 'err')); la('UNION exfiltration', false); } else { lg('unionOut', '[BLOCKED] Parameterized query neutralizes UNION injection', 'ok'); la('UNION attempt', true); } }
function blindAtk() { cl('blindOut'); lg('blindOut', '[ATTACK] Boolean-based blind SQLi started...', 'err'); lg('blindOut', 'Inferring password char by char...', 'warn'); }
function simBlind() { cl('blindOut'); const c = 'admin123'; let i = 0; const iv = setInterval(() => { if (i >= c.length) { lg('blindOut', `\n[RESULT] Extracted: "${c}"`, S.modes.sqli === 'attack' ? 'err' : 'ok'); if (S.modes.sqli === 'attack') lg('blindOut', '⚠ Leaked via TRUE/FALSE queries!', 'err'); else lg('blindOut', '[BLOCKED] Blind inference impossible with parameterized queries', 'ok'); clearInterval(iv); la('Blind SQLi exfiltration', S.modes.sqli === 'defend'); return; } lg('blindOut', `Query ${i + 1}: char[${i + 1}]='${c[i]}' → ${S.modes.sqli === 'attack' ? 'TRUE' : 'BLOCKED'}`, S.modes.sqli === 'attack' ? 'err' : 'ok'); i++; }, 360); }

// ── CSRF ──
function legTransfer() { const to = document.getElementById('csrfTo').value, amt = parseInt(document.getElementById('csrfAmt').value) || 0; cl('csrfOut'); if (amt > S.csrfBal) { lg('csrfOut', 'Insufficient funds', 'err'); return; } S.csrfBal -= amt; document.getElementById('csrfBal').textContent = '$' + S.csrfBal.toLocaleString(); lg('csrfOut', `✅ Legitimate transfer: $${amt} → ${to}`, 'ok'); if (S.modes.csrf === 'defend') lg('csrfOut', '✅ CSRF token validated: ' + S.csrfToken.slice(0, 16) + '...', 'ok'); }
function forgedTransfer() { const to = document.getElementById('csrfTo').value, amt = parseInt(document.getElementById('csrfAmt').value) || 0; cl('csrfOut'); lg('csrfOut', "⚡ Forged request from evil.com...", 'err'); lg('csrfOut', "Browser auto-sends alice's session cookie", 'warn'); if (S.modes.csrf === 'attack') { if (amt > S.csrfBal) { lg('csrfOut', 'Insufficient funds', 'err'); return; } S.csrfBal -= amt; document.getElementById('csrfBal').textContent = '$' + S.csrfBal.toLocaleString(); lg('csrfOut', `💥 CSRF SUCCESS! $${amt} stolen → ${to}`, 'err'); la(`CSRF: $${amt} transferred`, false); } else { lg('csrfOut', '[BLOCKED] No valid CSRF token in forged request', 'ok'); lg('csrfOut', 'Server returned 403 Forbidden', 'ok'); la('CSRF forged transfer', true); } }

// ── CRYPTO ──
function aesEnc() { const p = document.getElementById('aesPlain').value, k = document.getElementById('aesKey').value; cl('aesOut'); S.lastCipher = saes(p, k, true); document.getElementById('aesFlow').innerHTML = `<div class="cnode" style="color:var(--teal)">${p.slice(0, 16)}...</div><div class="carrow"><i data-lucide="arrow-right" style="width:14px;height:14px"></i></div><div class="cnode" style="background:var(--teal-bg);border-color:var(--teal)">AES-256-CBC</div><div class="carrow"><i data-lucide="arrow-right" style="width:14px;height:14px"></i></div><div class="cnode" style="color:var(--success)">${S.lastCipher.slice(0, 16)}...</div>`; lucide.createIcons(); lg('aesOut', '[ENCRYPT] Plaintext → AES-256-CBC → Ciphertext', 'info'); lg('aesOut', 'Plaintext : ' + p, 'dim'); lg('aesOut', 'IV (rand) : ' + rh(32), 'dim'); lg('aesOut', 'Ciphertext: ' + S.lastCipher, 'ok'); }
function aesDec() { if (!S.lastCipher) { lg('aesOut', 'Encrypt first!', 'warn'); return; } const pl = saes(S.lastCipher, document.getElementById('aesKey').value, false); lg('aesOut', '\n[DECRYPT] Ciphertext → Plaintext:', 'info'); lg('aesOut', 'Decrypted : ' + pl, 'ok'); }
function doHash() { const p = document.getElementById('sha512In').value, s = document.getElementById('sha512Salt').value; cl('sha512Out'); const h = sh(p + s); lg('sha512Out', 'Computing SHA-512(password+salt)...', 'info'); lg('sha512Out', 'Hash: ' + h, 'ok'); const h2 = sh(p + 'x' + s); lg('sha512Out', '\nAvalanche (change 1 char):', 'info'); lg('sha512Out', 'Modified: ' + h2, 'warn'); lg('sha512Out', 'Same? ' + (h === h2 ? 'YES (collision!)' : 'NO ✓ Completely different'), 'ok'); }
function newSalt() { document.getElementById('sha512Salt').value = rh(16); }
function runDes() { cl('desOut');[['DES-56   ', '56-bit ', '2⁵⁶', '~22 hours (1999)', 'BROKEN'], ['3DES-168 ', '168-bit', '2¹¹²', '3× DES ops, slow', 'DEPRECATED 2023'], ['AES-256  ', '256-bit', '2²⁵⁶', '~10³² years', 'RECOMMENDED']].forEach(([n, k, sp, t, st]) => lg('desOut', `${n} │ ${k} │ ${sp} │ ${t} │ [${st}]`, st.includes('BROKEN') || st.includes('DEPRECATED') ? 'err' : 'ok')); lg('desOut', '\nConclusion: Never use DES. Use AES-256-GCM in all new systems.', 'warn'); }
function signMsg() { const msg = document.getElementById('sigMsg').value; cl('sigOut'); const hash = sh(msg).slice(0, 64); const sig = sh(hash + 'PRIV_KEY_ALICE').slice(0, 64); S.sig = { msg, hash, sig }; lg('sigOut', '[SIGN] Using Alice private key...', 'info'); lg('sigOut', 'Msg hash : ' + hash.slice(0, 28) + '...', 'dim'); lg('sigOut', 'Signature: ' + sig, 'ok'); lg('sigOut', '✅ Signed — transmit {message, signature}', 'ok'); }
function verifyMsg() { cl('sigOut'); if (!S.sig.sig) { lg('sigOut', 'Sign a message first!', 'warn'); return; } const cm = document.getElementById('sigMsg').value, ch = sh(cm).slice(0, 64), ok = ch === S.sig.hash; lg('sigOut', '[VERIFY] Checking with public key...', 'info'); lg('sigOut', 'Recv hash : ' + ch.slice(0, 28) + '...', ok ? 'ok' : 'err'); lg('sigOut', 'Sign hash : ' + S.sig.hash.slice(0, 28) + '...', 'dim'); lg('sigOut', 'Match     : ' + (ok ? 'YES ✅' : 'NO — TAMPERED ⚠'), ok ? 'ok' : 'err'); lg('sigOut', 'Signature : ' + (ok ? 'VALID ✅' : 'INVALID ❌'), ok ? 'ok' : 'err'); }
function tamperMsg() { const m = document.getElementById('sigMsg'); m.value = m.value.replace('$1000', '$99999').replace('Alice', 'HACKER'); lg('sigOut', '⚡ Tampered! Now verify — signature will fail.', 'err'); }

// ── FIREWALL ──
function renderFw() { const b = document.getElementById('fwBody'); b.innerHTML = ''; S.fwRules.forEach((r, i) => { const cls = r.action === 'ALLOW' ? 'b-allow' : r.action === 'DENY' ? 'b-deny' : 'b-log'; b.innerHTML += `<tr><td style="color:var(--text3);font-size:.82rem">${i + 1}</td><td>${r.ip}</td><td>${r.port}</td><td>${r.proto}</td><td><span class="badge ${cls}">${r.action}</span></td><td style="font-family:'Courier New',monospace;font-size:.82rem">${r.hits}</td><td><button class="btn btn-ghost btn-sm" onclick="rmRule(${i})" style="padding:.18rem .5rem"><i data-lucide="x" style="width:12px;height:12px"></i></button></td></tr>`; }); lucide.createIcons(); }
function addRule() { S.fwRules.push({ ip: document.getElementById('fwIP').value || 'ANY', port: document.getElementById('fwPort').value || 'ANY', proto: document.getElementById('fwProto').value, action: document.getElementById('fwAct').value, hits: 0 }); renderFw(); }
function rmRule(i) { S.fwRules.splice(i, 1); renderFw(); }
function simPkt() { const ip = document.getElementById('simIP').value, port = document.getElementById('simPort').value, proto = document.getElementById('simProto').value; cl('fwSimOut'); lg('fwSimOut', `Packet: ${proto} ${ip}:${port}`, 'info'); let hit = false; for (let i = 0; i < S.fwRules.length; i++) { const r = S.fwRules[i]; const im = r.ip === 'ANY' || r.ip === ip || (r.ip.endsWith('/24') && ip.startsWith(r.ip.slice(0, -4))); const pm = r.port === 'ANY' || r.port === port; const prm = r.proto === 'ANY' || r.proto === proto; if (im && pm && prm) { S.fwRules[i].hits++; renderFw(); const t = r.action === 'ALLOW' ? 'ok' : r.action === 'DENY' ? 'err' : 'warn'; lg('fwSimOut', `Rule ${i + 1} matched → ${r.action} ${r.action === 'ALLOW' ? '✅' : r.action === 'DENY' ? '❌' : '⚠'}`, t); hit = true; break; } } if (!hit) lg('fwSimOut', 'No rule matched → DEFAULT DENY (fail-safe) ❌', 'err'); }

// ── DASHBOARD ──
function renderDash() {
    const topics = [['XSS — Cross-Site Scripting', 65], ['CSRF — Request Forgery', 70], ['SQL Injection', 70], ['Authentication & JWT', 80], ['AES-256 / SHA-512', 78], ['Digital Signatures', 72], ['PKI / TLS Chain', 68], ['Firewall Rules', 75], ['Malware Detection (ML)', 42], ['Security Design Principles', 88], ['Buffer Overflow (theory)', 50], ['Wireless Security (WPA3)', 62]];
    document.getElementById('topicProg').innerHTML = topics.map(([n, p]) => `<div style="margin-bottom:.82rem"><div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.28rem"><span style="font-weight:500;color:var(--text)">${n}</span><span style="color:var(--text3);font-family:'Courier New',monospace;font-size:.73rem">${p}%</span></div><div class="ptrack"><div class="pfill" style="width:${p}%"></div></div></div>`).join('');
}
function scanFile() { const f = document.getElementById('mwFile').files[0]; if (!f) return; cl('mwOut'); lg('mwOut', `Scanning: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`, 'info'); setTimeout(() => { const hash = sh(f.name + f.size); const isExe = f.name.endsWith('.exe'); const isSusp = isExe || f.name.includes('crack') || f.name.includes('hack'); const ent = (3 + Math.random() * 4).toFixed(2); lg('mwOut', `SHA-512: ${hash.slice(0, 48)}...`, 'dim'); lg('mwOut', `Entropy: ${ent} bits/byte`, (parseFloat(ent) > 7) ? 'err' : 'ok'); lg('mwOut', `Type: ${isExe ? 'PE Executable (HIGH RISK)' : 'Document/Script'}`, 'dim'); if (isSusp) { lg('mwOut', '⚠ SUSPICIOUS INDICATORS FOUND', 'err'); lg('mwOut', '  - High entropy + executable type', 'err'); lg('mwOut', 'RISK SCORE: 78/100 — QUARANTINE', 'err'); } else { lg('mwOut', 'No malicious hashes matched', 'ok'); lg('mwOut', 'RISK SCORE: 12/100 — BENIGN', 'ok'); } }, 600); }

// ── INIT ──
renderFw(); renderComments();
setTimeout(() => { lg('atkLog', 'System initialized — all modules ready', 'ok'); lg('atkLog', 'Navigate to any module to begin demos', 'info'); }, 400);
lucide.createIcons();