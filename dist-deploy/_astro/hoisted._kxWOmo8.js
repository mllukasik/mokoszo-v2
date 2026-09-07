import{a as j,l as O,c as X,e as Z,f as N}from"./store.RKPXJExi.js";import{S as g}from"./types.DeAfvgSP.js";import"./hoisted.BJmqyGi7.js";const F=["sniadanie","drugie-sniadanie","obiad","kolacja","deser"];function B(t){return t!=null&&F.includes(t)}let $=[],b=[],u=0,o=null,m="",c="",h=[],v=!1,p=!1,S=!1,T=!1,d=!1;function D(){const t=document.getElementById("all-recipes");if(!t)return;$=JSON.parse(t.textContent??"[]");const e=new URLSearchParams(window.location.search);m=e.get("date")??H(),c=e.get("slot")??"";const n=j(m);if(n&&c){const i=n.slots.find(s=>s.id===c);i&&B(i.name)&&(o=i.name)}!o&&B(c)&&(o=c),P(),k()}function H(){return new Date().toISOString().slice(0,10)}function P(){o?b=$.filter(t=>t.slots.includes(o)):b=[...$],u=0,h=[],d=!1}function C(){o=null,c="",P(),k()}function R(){const t=j(m);return!t||!c?0:t.slots.find(n=>n.id===c)?.dishes.length??0}function k(){const t=document.getElementById("cards-mount");t&&(v=!1,p=!1,t.innerHTML=`
    <div class="relative flex flex-col min-h-dvh text-na-emalii" role="main" style="overflow-x:clip">
      ${Y()}
      ${q()}
      ${U()}
      ${_()}
      ${K()}
      ${V()}
    </div>
  `,st())}function Y(){const t=o?g[o]:"Wszystkie",e=b.length,n=Math.max(0,e-u);return`
    <div class="flex items-center justify-between px-4 pt-4 pb-2">
      <a
        href="${L()}/plan?date=${m}"
        class="flex items-center gap-1 text-na-emalii-2 text-[14px] font-semibold min-h-touch px-2 -ml-2 rounded-m hover:text-na-emalii"
        aria-label="Zamknij tryb wybierania"
      >
        ✕ Zamknij
      </a>
      <div class="text-[13px] text-na-emalii-2 text-right" aria-live="polite">
        <strong class="text-na-emalii">${t}</strong>
        &nbsp;·&nbsp;${n} z ${e} przepisów
      </div>
    </div>
  `}function q(){return!o&&!c?"":`
    <div class="flex items-center gap-2 px-4 pb-2">
      ${o?`<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-emalia-800 text-na-emalii border border-white/20">
        Filtr: ${g[o]}
      </span>`:""}
      <button
        id="btn-remove-filter"
        class="text-[13px] text-kurkuma font-semibold underline min-h-touch px-2"
      >
        Pokaż wszystkie przepisy
      </button>
    </div>
  `}function U(){const t=R();return!c||t===0?"":`
    <div class="px-4 pb-2 text-[13px] text-na-emalii-2">
      W ${(o?g[o]:"slocie").toLowerCase()} masz już ${t} ${t===1?"danie":"dania"}
    </div>
  `}function _(){const t=b[u],e=b[u+1];return t?`
    <div id="card-stack" class="flex-1 px-4 relative" style="min-height: 360px;">
      ${e?M(e,"next"):""}
      ${M(t,"current")}
    </div>
  `:G()}function M(t,e){const n=e==="next",i=e==="current",s=i&&d,l=`
    absolute inset-0 rounded-karta overflow-hidden bg-emalia-800
    ${n?"scale-[0.95] opacity-60 pointer-events-none":"cursor-grab active:cursor-grabbing shadow-cien-noc"}
  `,r=t.image?`<img src="${t.image}" alt="" class="w-full h-full object-cover" loading="${n?"lazy":"eager"}" onerror="this.style.display='none'" />`:'<div class="w-full h-full flex items-center justify-center text-na-emalii-2">🍽️</div>',f=`
    <!-- Panel szczegółów: zdjęcie jako tło z półprzezroczystą warstwą + blur -->
    <div class="absolute inset-0 bg-emalia-900/80 backdrop-blur-sm overflow-y-auto" data-details-panel ${s?"":"hidden"}>
      <div class="p-5 font-prose text-[15px] text-na-emalii leading-relaxed">
        <div class="flex items-start justify-between mb-4">
          <h2 class="text-xl font-extrabold text-white leading-tight pr-4">
            ${t.title}
          </h2>
          <button
            type="button"
            data-close-details
            class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Zamknij szczegóły"
          >
            ✕
          </button>
        </div>
        <p class="text-[13px] text-white/70 mb-4">
          ${t.timeMinutes} min · ${t.calories} kcal
          · ${t.slots.map(a=>g[a]).join(", ")}
        </p>
        ${t.description?`<p class="mb-4">${t.description}</p>`:""}
        <h3 class="font-ui font-bold text-[13px] uppercase tracking-wide text-na-emalii-2 mb-2">Składniki</h3>
        <ul class="space-y-1 mb-4">
          ${t.ingredients.map(a=>`<li>${a.name} — ${a.amount} ${a.unit}</li>`).join("")}
        </ul>
        ${t.steps&&t.steps.length>0?`
          <h3 class="font-ui font-bold text-[13px] uppercase tracking-wide text-na-emalii-2 mb-2">Przygotowanie</h3>
          <ol class="list-decimal pl-5 space-y-1">
            ${t.steps.map(a=>`<li>${a}</li>`).join("")}
          </ol>
        `:""}
      </div>
    </div>
  `;return`
    <article
      id="${i?"card-current":"card-next"}"
      class="${l}"
      ${i?'role="article"':""}
      aria-label="${t.title}"
      ${i?`aria-expanded="${d}"`:""}
    >
      <!-- Zdjęcie na całą kartę -->
      <div class="absolute inset-0">
        ${r}
        <!-- Gradient czytelności -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
        <!-- Metadane nad gradientem (widoczne w zwiniętym) -->
        <div class="absolute bottom-0 left-0 right-0 p-4 ${s?"hidden":""}">
          <h2 class="text-xl font-extrabold text-white leading-tight mb-1">
            ${t.title}
          </h2>
          <p class="text-[13px] text-white/80">
            ${t.timeMinutes} min · ${t.calories} kcal
            · ${t.slots.map(a=>g[a]).join(", ")}
          </p>
        </div>
        <!-- Wstęga "biorę" -->
        <div id="ribbon-tak" class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 transition-opacity bg-tak/20">
          <span class="text-4xl font-black text-tak-tint rotate-[-20deg]">Biorę</span>
        </div>
        <!-- Wstęga "nie dziś" -->
        <div id="ribbon-nie" class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 transition-opacity bg-nie/20">
          <span class="text-4xl font-black text-nie-tint rotate-[20deg]">Nie dziś</span>
        </div>
      </div>
      ${f}
    </article>
  `}function G(){const t=o!==null,e=o?g[o]:"",n=$.length;if(t){const i=b.length,s=n-i;return`
      <div class="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        <p class="text-na-emalii text-lg font-bold">
          Obejrzałeś wszystkie ${i} przepisów na ${e.toLowerCase()}.
        </p>
        <p class="text-na-emalii-2 text-[14px]">
          Wyłącz filtr, żeby zobaczyć pozostałe ${s}.
        </p>
        <button id="btn-remove-filter-empty" class="px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
          Pokaż wszystkie przepisy
        </button>
      </div>
    `}return`
    <div class="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <p class="text-na-emalii text-lg font-bold">
        To wszystkie ${n} przepisów, jakie na razie mamy.
      </p>
      <p class="text-na-emalii-2 text-[14px]">
        Możesz je przejrzeć na liście albo zacząć wybieranie od nowa.
      </p>
      <div class="flex gap-3 flex-wrap justify-center">
        <a href="${L()}/" class="px-5 py-3 rounded-l border border-white/30 text-na-emalii font-semibold min-h-touch">
          Przeglądaj listę
        </a>
        <button id="btn-restart" class="px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
          Zacznij od nowa
        </button>
      </div>
    </div>
  `}function K(){return b[u]?`
    <div class="flex items-center justify-center gap-3 px-6 py-4">
      <button
        id="btn-nie"
        aria-label="Nie dziś"
        class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-l bg-nie-tint text-nie border border-[var(--nie-jasny)] font-bold min-h-touch active:scale-[0.97] transition-transform"
      >
        ✕ Nie dziś
      </button>

      <button
        id="btn-cofnij"
        aria-label="Cofnij ostatnią decyzję"
        title="Cofnij"
        class="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-na-emalii border border-white/20 active:scale-[0.97] transition-transform disabled:opacity-30"
        ${h.length===0?"disabled":""}
      >
        ↺
      </button>

      <button
        id="btn-tak"
        aria-label="Biorę"
        class="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-l bg-tak-tint text-tak border border-[var(--tak-jasny)] font-bold min-h-touch active:scale-[0.97] transition-transform"
      >
        ✓ Biorę
      </button>
    </div>
  `:""}function V(){return T?"":`
    <p class="text-center text-[12px] text-na-emalii-2 pb-4 px-4" id="keyboard-hint" aria-hidden="true">
      ← → strzałkami też · Backspace cofa
    </p>
  `}function E(t){if(v||p)return;p=!0;const e=b[u];if(!e){p=!1;return}t?J(e):(d=!1,h.push(e.slug),u++,k())}function J(t){if(!c||!m){alert(`Przepis "${t.title}" gotowy do dodania. Wróć do planu i wybierz slot.`),p=!1;return}let e=j(m);const n=O();e||(e=X(m,n.defaultSlots));const i=e.slots.find(r=>r.id===c),s=i?g[i.name]:"posiłku";if(i&&i.dishes.length>0){const r=i.dishes[0].recipeSlug,f=$.find(a=>a.slug===r)?.title??r;Q(t,f,s,e);return}Z(e,c,t.slug);const l=`${t.title} — ${s.toLowerCase()} zaplanowany`;W(l)}function Q(t,e,n,i){if(!i)return;const s=document.getElementById("cards-mount");if(!s)return;document.getElementById("replace-dialog")?.remove();const l=document.createElement("div");l.id="replace-dialog",l.innerHTML=`
    <div
      id="replace-backdrop"
      class="fixed inset-0 bg-black/60 z-40 flex items-end justify-center"
      style="touch-action:none"
    >
      <div class="bg-emalia-800 rounded-t-2xl p-6 w-full max-w-md pb-8">
        <p class="text-na-emalii font-bold text-[17px] mb-1">
          Wybierasz danie na ${n.toLowerCase()}
        </p>
        <p class="text-na-emalii-2 text-[13px] mb-5 leading-snug">
          Masz już: <span class="text-na-emalii font-semibold">${e}</span>.<br>
          Zastąpić daniem <span class="text-na-emalii font-semibold">${t.title}</span>?
        </p>
        <div class="flex gap-3">
          <button
            id="btn-replace-cancel"
            class="flex-1 py-3 rounded-l border border-white/30 text-na-emalii font-semibold min-h-touch"
          >
            Anuluj
          </button>
          <button
            id="btn-replace-confirm"
            class="flex-1 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch"
          >
            Zastąp
          </button>
        </div>
      </div>
    </div>
  `,s.appendChild(l);const r=()=>{l.remove(),p=!1};document.getElementById("btn-replace-cancel")?.addEventListener("click",r),document.getElementById("replace-backdrop")?.addEventListener("click",f=>{f.target===f.currentTarget&&r()}),document.getElementById("btn-replace-confirm")?.addEventListener("click",()=>{l.remove(),N(i,c,t.slug);const f=`${t.title} — ${n.toLowerCase()} zaplanowany`;W(f)})}function W(t){const e=document.getElementById("cards-mount");e&&(v=!0,p=!1,e.innerHTML=`
    <div class="flex flex-col items-center justify-center min-h-dvh px-6 text-center gap-6">
      <div class="text-4xl">✓</div>
      <p class="text-na-emalii text-lg font-bold" aria-live="assertive">${t}</p>
      <div class="flex flex-col gap-3 w-full max-w-[280px]">
        <button id="btn-next-slot" class="px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
          Zaplanuj kolejny posiłek
        </button>
        <a
          href="${L()}/plan?date=${m}#slot-${c}"
          class="px-5 py-3 rounded-l border border-white/30 text-na-emalii font-semibold min-h-touch flex items-center justify-center"
        >
          Wróć do planu
        </a>
      </div>
    </div>
  `,document.getElementById("btn-next-slot")?.addEventListener("click",()=>{d=!1,u++,k()}))}function A(){v||h.length!==0&&(d=!1,h.pop(),u=Math.max(0,u-1),k())}function tt(){d=!1,u=0,h=[],k()}function w(){d=!d;const t=document.getElementById("card-current");if(!t)return;const e=t.querySelector("[data-details-panel]"),n=t.querySelector(".absolute.bottom-0.left-0.right-0.p-4");e&&(e.hidden=!d),n&&(n.hidden=d),t.setAttribute("aria-expanded",String(d))}function et(){const t=document.getElementById("card-current");if(!t)return;t.style.touchAction="pan-y";let e=0,n=0,i=0,s=null,l=!1,r=null;t.addEventListener("pointerdown",a=>{a.isPrimary&&(a.target.closest("[data-close-details]")||(r=a.pointerId,e=a.clientX,n=a.clientY,i=0,s=null,l=!0))}),t.addEventListener("pointermove",a=>{if(!l||a.pointerId!==r)return;const x=a.clientX-e,y=a.clientY-n;!s&&(Math.abs(x)>7||Math.abs(y)>7)&&(s=Math.abs(x)>Math.abs(y)*1.3?"x":"y"),s==="x"&&(i=x,nt(x))});const f=a=>{if(!(!l||a.pointerId!==r)){if(l=!1,r=null,s===null){const x=a.clientX-e,y=a.clientY-n;Math.hypot(x,y)<10&&!v&&w()}else if(s==="x"){const y=t.offsetWidth*.28;if(Math.abs(i)>=y){const I=i>0;it(t,I)}else z(t)}i=0,s=null}};t.addEventListener("pointerup",f),t.addEventListener("pointercancel",()=>{l=!1,r=null,i=0,s=null,z(t)})}function nt(t){const e=document.getElementById("card-current");if(!e)return;const n=t*.08;e.style.transform=`translateX(${t}px) rotate(${n}deg)`,e.style.transition="none";const i=Math.min(1,Math.abs(t)/110),s=document.getElementById("ribbon-tak"),l=document.getElementById("ribbon-nie");t>0&&s&&(s.style.opacity=String(i)),t<0&&l&&(l.style.opacity=String(i))}function it(t,e){if(v||p){z(t);return}const n=e?window.innerWidth:-window.innerWidth;t.style.transition="transform 250ms ease-out",t.style.transform=`translateX(${n}px) rotate(${e?15:-15}deg)`,setTimeout(()=>{E(e)},250)}function z(t){t.style.transition="transform 250ms ease-out",t.style.transform="translateX(0) rotate(0deg)";const e=document.getElementById("ribbon-tak"),n=document.getElementById("ribbon-nie");e&&(e.style.opacity="0"),n&&(n.style.opacity="0")}function at(){S||(S=!0,document.addEventListener("keydown",t=>{if(d&&t.key==="Escape"){t.preventDefault(),w();return}if(!d&&(t.key==="Enter"||t.key===" ")){t.preventDefault(),w();return}if(d&&(t.key==="Enter"||t.key===" ")){t.preventDefault(),w();return}["ArrowRight"].includes(t.key)&&(t.preventDefault(),E(!0)),["ArrowLeft"].includes(t.key)&&(t.preventDefault(),E(!1)),t.key==="Backspace"&&(t.preventDefault(),A())}),document.addEventListener("keydown",()=>{T=!0,document.getElementById("keyboard-hint")?.remove()},{once:!0}))}function st(){document.getElementById("btn-tak")?.addEventListener("click",()=>E(!0)),document.getElementById("btn-nie")?.addEventListener("click",()=>E(!1)),document.getElementById("btn-cofnij")?.addEventListener("click",A),document.getElementById("btn-remove-filter")?.addEventListener("click",C),document.getElementById("btn-remove-filter-empty")?.addEventListener("click",C),document.getElementById("btn-restart")?.addEventListener("click",tt),document.getElementById("card-current")?.addEventListener("click",t=>{t.target.closest("[data-close-details]")&&(t.stopPropagation(),w())}),et(),at()}function L(){return(document.querySelector('meta[name="base-url"]')?.content??"").replace(/\/$/,"")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",D):D();
