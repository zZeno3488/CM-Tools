(() => {
  "use strict";
  var e = {
      11: (e, t, o) => {
        o.d(t, { ZP: () => C, H5: () => I });
        var s = o(35);
        class a {
          constructor() {
            this.callbacks = [];
          }
          async save(e) {
            await chrome.storage.local.set({ filter: e });
          }
          async get() {
            return (
              (await chrome.storage.local.get("filter")).filter || {
                urls: a.defaultUrls,
              }
            );
          }
          addCallback(e) {
            this.callbacks.push(e);
          }
          initListeners() {
            chrome.storage.onChanged.addListener((e, t) => {
              "local" === t &&
                e.filter &&
                this.callbacks.forEach((t) => t(e.filter.newValue));
            });
          }
          async loadAndApply() {
            const e = await this.get();
            e && this.callbacks.forEach((t) => t(e));
          }
        }
        a.defaultUrls = [
          "*://*.ukyuh.tech/*",
          "*://*.hzmk.site/*",
          "*://*.like.video/*",
          "*://*.tiki.video/*",
          "*://*.video/*",
          "*://*.bigolive.tv/*",
          "*://*.piojm.tech/*",
          "*://*.bigo.sg/*",
          "*://*.bigo.tv/*",
          "*://*.ppx520.com/*",
          "*://*.hello.fun/*",
          "*://*.helloyo.sg/*",
          "*://*.bigoapp.tv/*",
          "*://*.sg/*",
          "*://*.youxishequ.com/*",
          "*://*.imo.im/*",
          "*://*.cubetecn.com/*",
          "*://*.zmqdez.com/*",
          "*://*.uhgzgnb.com/*",
        ];
        const r = new a();
        class n {
          constructor(e) {
            (this.key = e), (this.patterns = []), this.init();
          }
          async init() {
            const e = await this.getFilter();
            this.buildPatterns(e);
          }
          buildPatterns(e) {
            this.patterns = e.map((e) => new URLPattern({ hostname: e }));
          }
          async save(e) {
            const t = await chrome.storage.local.set({ [this.key]: e });
            return this.buildPatterns(e), t;
          }
          async getFilter() {
            return (await chrome.storage.local.get(this.key))[this.key] || [];
          }
          async isMatch(e) {
            return this.patterns.some((t) => t.test(e));
          }
        }
        const i = new n("mediaWatermarkFilter"),
          c = new n("downloadBlockFilter");
        const l = new (class {
            constructor(e) {
              this.prefix = e;
            }
            async clear() {
              const e = await chrome.storage.local.get(),
                t = [];
              for (const [o] of Object.entries(e))
                o.startsWith(this.prefix) && t.push(o);
              t.length > 0 && (await chrome.storage.local.remove(t));
            }
            add(e) {
              const t = `${this.prefix}:${((e = 21) => {
                let t = "",
                  o = crypto.getRandomValues(new Uint8Array((e |= 0)));
                for (; e--; )
                  t +=
                    "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"[
                      63 & o[e]
                    ];
                return t;
              })()}`;
              return chrome.storage.local.set({ [t]: e });
            }
            async getAllAndClear() {
              const e = await chrome.storage.local.get(),
                t = [],
                o = [];
              for (const [s, a] of Object.entries(e))
                s.startsWith(this.prefix) && (t.push(a), o.push(s));
              return o.length > 0 && (await chrome.storage.local.remove(o)), t;
            }
          })("msgQueue"),
          d = new Map();
        function m() {
          const e = Date.now();
          for (const [t, o] of d) e - o.timestamp >= 6e4 && d.delete(t);
        }
        const u = async (e, t) => {
            const o = await i.isMatch(t);
            if (!o) return void console.log("watermark", t, o);
            const s = await (async function () {
              return await chrome.storage.local.get(["userName", "userId"]);
            })();
            s.userName &&
              (await chrome.scripting.executeScript({
                target: { tabId: e },
                func: (e) => {
                  const t = document.createElement("meta");
                  t.setAttribute("name", "global-oss-userinfo"),
                    t.setAttribute("content", JSON.stringify(e)),
                    document.head.appendChild(t);
                },
                args: [s],
              }),
              await chrome.scripting.executeScript({
                target: { tabId: e },
                files: ["inject_watermark.js"],
              }));
          },
          g = async (e) => {
            u(e.tabId, e.url), console.log("Media DOMContentLoaded:", e);
            const t = {
              msgType: s.Qr,
              msgSubType: "event",
              eventType: "media",
              url: e.url,
            };
            l.add(t);
          },
          h = (e) => ({ pathSuffix: e }),
          p = {
            url: [
              ...[
                ".jpg",
                ".jpeg",
                ".png",
                ".gif",
                ".bmp",
                ".webp",
                ".svg",
                ".avif",
              ].map(h),
              ...[".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"].map(
                h
              ),
              ...[".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"].map(h),
            ],
          };
        function f() {
          chrome.webNavigation.onDOMContentLoaded.removeListener(g),
            chrome.webNavigation.onDOMContentLoaded.addListener(g, p);
        }
        const b = new Map();
        function w(e) {
          b.set(e.requestId, e);
        }
        const y = [
          "media",
          "websocket",
          "image",
          "xmlhttprequest",
          "script",
          "stylesheet",
          "other",
        ];
        function v(e, t) {
          if (-1 === e.tabId || !1 === y.includes(e.type)) return;
          const o = {
            msgType: "chrome-extension-global-oss",
            msgSubType: "transfer",
            type: e.type,
            method: e.method,
            from: e.initiator,
            statusCode: e.statusCode,
            responseHeaders: e.responseHeaders,
            startTime: t.timeStamp,
            endTime: e.timeStamp,
            elapsed: e.timeStamp - t.timeStamp,
            url: e.url,
            ip: e.ip,
            fromCache: e.fromCache,
          };
          (function (e) {
            return null != e.error;
          })(e) && (o.error = e.error),
            chrome.tabs.sendMessage(e.tabId, o).catch(() => {});
        }
        async function k(e) {
          try {
            await (function (e) {
              const t = Date.now(),
                o = d.get(e);
              if (o && t - o.timestamp < 6e4) return o.promise;
              const a = { msgType: s.Qr, msgSubType: "ping" },
                r = chrome.tabs.sendMessage(e, a);
              return d.set(e, { promise: r, timestamp: t }), r;
            })(e);
          } catch (e) {
            return;
          }
          const t = await l.getAllAndClear();
          if (0 !== t.length)
            for (const o of t)
              console.debug("[msg] send to tab content:", e, o),
                chrome.tabs.sendMessage(e, o).catch(() => {});
        }
        function L(e) {
          const t = b.get(e.requestId);
          t && e.tabId > 0 && (v(e, t), k(e.tabId)), b.delete(e.requestId);
        }
        function T(e) {
          const t = b.get(e.requestId);
          t && e.tabId > 0 && (v(e, t), k(e.tabId)), b.delete(e.requestId);
        }
        async function x(e, t, o) {
          if (t.url?.startsWith("view-source:")) {
            const e = t.url.replace("view-source:", ""),
              o = {
                msgType: s.Qr,
                msgSubType: "event",
                eventType: "view-source",
                url: e,
              };
            l.add(o);
          }
        }
        function I(e) {
          console.info("[main] receive reload command:", e),
            e.args &&
              (r.save(e.args.filter),
              e.args?.userName &&
                e.args.userId &&
                (async function (e, t) {
                  await chrome.storage.local.set({ userName: e, userId: t });
                })(e.args.userName, e.args.userId),
              Array.isArray(e.args.mediaWatermarkFilter) &&
                i.save(e.args.mediaWatermarkFilter),
              Array.isArray(e.args.blockDownloadFilter) &&
                c.save(e.args.blockDownloadFilter),
              f());
        }
        async function q(e) {
          const t = await chrome.tabs.get(e.tabId),
            o = {
              msgType: s.Qr,
              msgSubType: "event",
              eventType: "devtools",
              url: t.url,
            };
          l.add(o);
        }
        async function C() {
          r.addCallback((e) => {
            var t;
            (t = e)
              ? (console.log("[main] set filter: ", t),
                chrome.webRequest.onBeforeRequest.hasListener(w) &&
                  chrome.webRequest.onBeforeRequest.removeListener(w),
                chrome.webRequest.onBeforeRequest.addListener(w, t, [
                  "requestBody",
                ]),
                chrome.webRequest.onCompleted.hasListener(L) &&
                  chrome.webRequest.onCompleted.removeListener(L),
                chrome.webRequest.onCompleted.addListener(L, t, [
                  "responseHeaders",
                ]),
                chrome.webRequest.onErrorOccurred.hasListener(T) &&
                  chrome.webRequest.onErrorOccurred.removeListener(T),
                chrome.webRequest.onErrorOccurred.addListener(T, t),
                chrome.tabs.onUpdated.hasListener(x) &&
                  chrome.tabs.onUpdated.removeListener(x),
                chrome.tabs.onUpdated.addListener(x))
              : console.log("[main] filter is empty, skipping...", t);
          }),
            r.initListeners(),
            await r.loadAndApply(),
            f(),
            chrome.runtime.onConnect.addListener(function (e) {
              "global-oss-devtools-page" === e.name &&
                e.onMessage.addListener(q);
            }),
            chrome.downloads.onCreated.addListener(async function (e) {
              const t = await c.isMatch(e.url);
              if ((console.log("blocked", t, e.url), t)) {
                chrome.downloads.cancel(e.id),
                  console.log("Download blocked:", e.url),
                  chrome.notifications.create({
                    type: "basic",
                    iconUrl:
                      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                    title: "Download Blocked",
                    message: `Download blocked: ${e.filename || e.url}`,
                  });
                const t = {
                  msgType: s.Qr,
                  msgSubType: "event",
                  eventType: "download_block",
                  url: e.url,
                };
                l.add(t);
              } else console.log("Download started:", e);
            }),
            chrome.downloads.onChanged.addListener(async (e) => {
              if ("complete" === e.state?.current) {
                console.log("Download completed:", e.id);
                const t = await chrome.downloads.search({ id: e.id });
                if (0 === t.length) return;
                console.log("download info", t[0]);
                const o = t[0].finalUrl ?? t[0].url ?? "",
                  a = {
                    msgType: s.Qr,
                    msgSubType: "event",
                    eventType: "download_block",
                    url: o,
                    downloadDetails: t[0],
                  };
                l.add(a);
              }
            }),
            setInterval(m, 6e4);
        }
      },
      35: (e, t, o) => {
        o.d(t, { O_: () => a, Qr: () => s, Rt: () => r });
        const s = "chrome-extension-global-oss",
          a = "call-extension";
        var r;
        !(function (e) {
          (e[(e.init = 1)] = "init"),
            (e[(e.getAllInstalledExtensions = 2)] =
              "getAllInstalledExtensions");
        })(r || (r = {}));
      },
    },
    t = {};
  function o(s) {
    var a = t[s];
    if (void 0 !== a) return a.exports;
    var r = (t[s] = { exports: {} });
    return e[s](r, r.exports, o), r.exports;
  }
  (o.d = (e, t) => {
    for (var s in t)
      o.o(t, s) &&
        !o.o(e, s) &&
        Object.defineProperty(e, s, { enumerable: !0, get: t[s] });
  }),
    (o.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (() => {
      var e = o(11);
      var t = o(35);
      async function s(o, s) {
        if (o.msgType === t.O_)
          if (o.command === t.Rt.init) (0, e.H5)(o);
          else if (o.command === t.Rt.getAllInstalledExtensions) {
            const e = {
              msgType: "chrome-extension-global-oss",
              msgSubType: "extension",
              extensions: await (async function () {
                return await chrome.management.getAll();
              })(),
            };
            chrome.tabs.sendMessage(s.tab?.id, e);
          }
      }
      (0, e.ZP)(), chrome.runtime.onMessage.addListener(s);
    })();
})();