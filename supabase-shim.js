/* Adapter: menyediakan window.claude.use("user"|"db"|"downloads") di atas Supabase,
   sehingga aplikasi tetap local-first (localStorage) dan menyinkronkan ke Supabase setelah login. */
(function () {
  var cfg = window.SMLH_CONFIG || {};
  var configured = cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf("YOUR-") === -1 && window.supabase;
  var sb = configured ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  function bar(html) {
    var el = document.getElementById("smlh-auth");
    if (!el) {
      el = document.createElement("div");
      el.id = "smlh-auth";
      el.setAttribute("role", "region");
      el.setAttribute("aria-label", "Sinkronisasi akun");
      el.style.cssText = "position:fixed;right:12px;top:12px;z-index:90;background:#fff;border:1px solid #DCCDC7;border-radius:14px;padding:8px 12px;font:600 13px system-ui,sans-serif;color:#2D292B;box-shadow:0 4px 16px rgba(80,50,55,.12);max-width:calc(100% - 24px)";
      document.body.appendChild(el);
    }
    el.innerHTML = html;
    return el;
  }

  function loginUI() {
    var el = bar('<form id="smlh-f" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><label for="smlh-e" style="font-weight:600">Sinkron antar perangkat:</label><input id="smlh-e" type="email" required placeholder="email Anda" style="min-height:36px;border:1px solid #DCCDC7;border-radius:10px;padding:0 10px;font:inherit"><button style="min-height:36px;border:0;border-radius:999px;background:#A94B63;color:#fff;padding:0 14px;font:inherit;cursor:pointer">Kirim link masuk</button></form>');
    el.querySelector("form").onsubmit = function (ev) {
      ev.preventDefault();
      var email = el.querySelector("input").value.trim();
      sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + location.pathname } })
        .then(function (r) { bar(r.error ? "Gagal: " + r.error.message : "Cek email Anda lalu klik link masuk."); });
    };
  }

  function userUI(email) {
    var el = bar('<span>' + email.replace(/</g, "&lt;") + ' · tersinkron</span> <button style="margin-left:8px;border:1px solid #DCCDC7;background:#fff;border-radius:999px;min-height:32px;padding:0 12px;font:inherit;cursor:pointer">Keluar</button>');
    el.querySelector("button").onclick = function () { sb.auth.signOut().then(function () { location.reload(); }); };
  }

  var ready = null;
  function session() {
    if (!sb) return Promise.resolve(null);
    if (!ready) ready = sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      document.addEventListener("DOMContentLoaded", function () { s ? userUI(s.user.email || "") : loginUI(); });
      if (document.readyState !== "loading") { s ? userUI(s.user.email || "") : loginUI(); }
      return s;
    }).catch(function () { return null; });
    return ready;
  }

  function docRef(path, id) {
    return {
      get: function () {
        return sb.from("progress").select("data").eq("doc_id", id).maybeSingle().then(function (r) {
          if (r.error) throw r.error;
          return { exists: !!r.data, data: function () { return r.data && r.data.data; } };
        });
      },
      set: function (obj) {
        return session().then(function (s) {
          return sb.from("progress").upsert({ user_id: s.user.id, doc_id: id, data: obj, updated_at: new Date().toISOString() });
        }).then(function (r) { if (r.error) throw r.error; });
      }
    };
  }

  var downloads = {
    save: function (o) {
      var blob = new Blob([o.data], { type: "application/octet-stream" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = o.filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      return Promise.resolve();
    }
  };

  window.claude = window.claude || {
    use: function (name) {
      if (name === "downloads") return Promise.resolve(downloads);
      if (name === "user") return Promise.resolve({ id: function () { return session().then(function (s) { return s ? s.user.id : null; }); } });
      if (name === "db") return Promise.resolve({ collection: function (p) { return { doc: function (id) { return docRef(p, id); } }; } });
      return Promise.reject(new Error("unsupported: " + name));
    }
  };
  if (sb) session();
})();
