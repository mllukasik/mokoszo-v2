import{h as v,l as f,a as w,c as h,s as g,r as $,b as z,d as E,e as j}from"./store.RKPXJExi.js";import{S as p}from"./types.DeAfvgSP.js";import"./hoisted.BJmqyGi7.js";let i=null,s="",m=[],r=null,u=null,x=!1;function b(){if(x)return;x=!0,m=JSON.parse(document.getElementById("all-recipes")?.textContent??"[]"),s=new URLSearchParams(window.location.search).get("date")?.trim()||L();const t=v(s);if(t){D(t);return}const n=f();i=w(s)??h(s,n.defaultSlots),g(i),d();const a=window.location.hash.replace("#slot-","");a&&a!==window.location.hash&&setTimeout(()=>{const o=document.getElementById(`slot-${a}`);o?.scrollIntoView({behavior:"smooth",block:"center"}),o?.classList.add("ring-2","ring-kurkuma","ring-offset-2"),setTimeout(()=>o?.classList.remove("ring-2","ring-kurkuma","ring-offset-2"),2e3)},100)}function L(){return new Date().toISOString().slice(0,10)}function c(){const e=document.getElementById("base-url")?.textContent;if(e)try{const n=JSON.parse(e);if(typeof n=="string")return n.replace(/\/$/,"")}catch{}return(document.querySelector('meta[name="base-url"]')?.content??"").replace(/\/$/,"")}function D(e){const t=document.getElementById("plan-mount");if(!t)return;const n=e.slots.reduce((l,y)=>l+y.dishes.length,0),a=new Date(e.date).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"}),o=new Date(s).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"});t.innerHTML=`
    <div class="page-content max-w-[480px] mx-auto py-8 px-4">
      <div class="bg-biel border-l-4 border-nie rounded-r-m p-5">
        <p class="font-bold mb-2">Masz zaplanowane ${n} posiłków na ${a}.</p>
        <p class="text-ink-2 text-[14px] mb-4">
          Przejście na ${o} zacznie plan od nowa — poprzedni dzień zostanie usunięty.
        </p>
        <div class="flex gap-3 flex-wrap">
          <button id="btn-confirm-change"
            class="px-4 py-2.5 rounded-l bg-nie text-white font-bold min-h-touch">
            Zacznij nowy dzień
          </button>
          <button id="btn-cancel-change"
            class="px-4 py-2.5 rounded-l border border-kreska bg-biel text-ink font-semibold min-h-touch">
            Zostań na ${a}
          </button>
        </div>
      </div>
    </div>
  `,document.getElementById("btn-confirm-change")?.addEventListener("click",()=>{const l=f();i=h(s,l.defaultSlots),g(i),d()}),document.getElementById("btn-cancel-change")?.addEventListener("click",()=>{window.location.href=`${c()}/plan?date=${e.date}`})}function S(e){return m.find(n=>n.slug===e)?.calories??0}function k(e){let t=0,n=!1;for(const a of e.dishes){const o=S(a.recipeSlug);o===0&&(n=!0),t+=o}return{total:t,incomplete:n}}function I(e){let t=0,n=!1;for(const a of e.slots){const o=k(a);t+=o.total,o.incomplete&&(n=!0)}return{total:t,incomplete:n}}function d(){const e=document.getElementById("plan-mount");if(!e||!i)return;const t=new Date(s).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"}),n=I(i);e.innerHTML=`
    <div class="max-w-[680px] mx-auto">
      <!-- Nagłówek -->
      <header class="bg-emalia-900 text-na-emalii px-4 py-6">
        <p class="text-[13px] text-na-emalii-2 mb-1">Plan na</p>
        <div class="flex items-baseline justify-between gap-4">
          <h1 class="text-2xl font-extrabold tracking-tight capitalize">${t}</h1>
          <button id="btn-change-date" class="text-[13px] text-kurkuma font-semibold min-h-touch px-2">
            Zmień dzień
          </button>
        </div>
      </header>

      <!-- Suma dnia -->
      ${n.total>0?`
        <div class="bg-biel border-b border-kreska px-4 py-3 flex items-center justify-between gap-3 text-[14px]">
          <span class="font-semibold">Łącznie w tym dniu</span>
          <span class="text-right">
            <span class="font-semibold ${n.incomplete?"text-ink":"text-ink-2"}">
              ${n.total} kcal
            </span>
            ${n.incomplete?`
              <span class="text-kurkuma font-semibold text-[13px]">· suma niepełna ⚠</span>
              <button
                type="button"
                class="btn-incomplete-why block ml-auto text-[12px] text-kurkuma-tekst underline min-h-touch px-1"
                aria-expanded="false"
                aria-controls="incomplete-explanation-day"
              >
                Dlaczego?
              </button>
              <span id="incomplete-explanation-day" hidden class="block text-[13px] text-ink-2 mt-1">
                Jeden składnik tego przepisu nie ma jeszcze podanej kaloryczności, więc suma jest zaniżona.
              </span>
            `:""}
          </span>
        </div>
      `:""}

      <!-- Sloty: mobile jedna kolumna, ≥600px dwie kolumny -->
      <ul class="divide-y divide-kreska sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-x-4" id="slots-list">
        ${i.slots.map(a=>B(a)).join("")}
      </ul>

      <!-- Dodaj posiłek -->
      <div class="px-4 py-3">
        <button id="btn-add-slot" class="text-[14px] font-semibold text-emalia-500 flex items-center gap-1 min-h-touch">
          + Dodaj posiłek do tego dnia
        </button>
      </div>

      <!-- Przejście do zakupów -->
      ${i.slots.some(a=>a.dishes.length>0)?`
        <div class="px-4 pb-6">
          <a
            href="${c()}/zakupy?date=${s}"
            class="flex items-center justify-center gap-2 w-full py-3.5 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch"
          >
            Zrób listę zakupów na ten dzień
          </a>
        </div>
      `:""}
    </div>
  `,T()}function B(e){const t=k(e),n=p[e.name]??e.name,a=c();return`
    <li id="slot-${e.id}" class="px-4 py-4 transition-all sm:border-b sm:border-kreska">
      <!-- Nagłówek slotu -->
      <div class="flex items-center justify-between mb-2">
        <div>
          <h2 class="font-bold text-[16px]">${n}</h2>
          ${t.total>0?`
            <span class="text-[12.5px] ${t.incomplete?"text-ink":"text-ink-2"}">
              <span class="font-semibold">${t.total} kcal</span>${t.incomplete?`
              <span class="text-kurkuma font-semibold text-[13px]"> · suma niepełna ⚠</span>
              <button
                type="button"
                class="btn-incomplete-why text-[12px] text-kurkuma-tekst underline min-h-touch px-1"
                aria-expanded="false"
                aria-controls="incomplete-explanation-${e.id}"
              >
                Dlaczego?
              </button>
              <span id="incomplete-explanation-${e.id}" hidden class="block text-[13px] text-ink-2 mt-1">
                Jeden składnik tego przepisu nie ma jeszcze podanej kaloryczności, więc suma jest zaniżona.
              </span>`:""}
            </span>
          `:""}
        </div>
        <button
          data-slot-id="${e.id}"
          class="btn-remove-slot text-[12.5px] text-ink-2 min-h-touch px-2"
          aria-label="Usuń posiłek ${n}"
        >
          Usuń posiłek
        </button>
      </div>

      <!-- Lista dań -->
      ${e.dishes.length>0?`
        <ul class="space-y-2 mb-2">
          ${e.dishes.map(o=>C(o.recipeSlug,e.id)).join("")}
        </ul>
        <!-- Dodaj kolejne danie -->
        <a
          href="${a}/wybieram?date=${s}&slot=${e.id}"
          class="text-[13px] text-emalia-500 font-semibold flex items-center gap-1 min-h-touch py-1"
        >
          + Dodaj kolejne danie
        </a>
      `:`
        <!-- Pusty slot — wyróżniony -->
        <a
          href="${a}/wybieram?date=${s}&slot=${e.id}"
          class="flex items-center justify-center border-2 border-dashed border-kurkuma rounded-m py-4 text-kurkuma font-semibold text-[14px] min-h-touch"
        >
          Wybierz przepis
        </a>
      `}
    </li>
  `}function C(e,t){const n=m.find(o=>o.slug===e);if(!n)return"";const a=c();return`
    <li class="flex items-center gap-3 py-1">
      ${n.image?`<img src="${n.image}" alt="" class="w-10 h-10 rounded-s object-cover flex-shrink-0" loading="lazy" />`:'<div class="w-10 h-10 rounded-s bg-kreska flex items-center justify-center flex-shrink-0" aria-hidden="true">🍽️</div>'}
      <a href="${a}/przepis/${e}" class="flex-1 min-h-touch flex items-center text-[14px] font-semibold text-ink hover:text-emalia-500">
        ${n.title}
      </a>
      <span class="text-[12.5px] text-ink-2">${n.calories} kcal</span>
      <!-- Menu dania -->
      <div class="relative">
        <button
          data-slot-id="${t}"
          data-recipe-slug="${e}"
          class="btn-dish-menu w-12 h-12 min-w-touch min-h-touch flex items-center justify-center rounded-s text-ink-2 hover:bg-kreska"
          aria-label="Opcje dania ${n.title}"
        >
          ⋯
        </button>
      </div>
    </li>
  `}function T(){document.querySelectorAll(".btn-incomplete-why").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("aria-controls");if(!t)return;const n=document.getElementById(t);if(!n)return;const a=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",String(!a)),a?n.setAttribute("hidden",""):n.removeAttribute("hidden")})}),document.querySelectorAll(".btn-dish-menu").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.slotId,n=e.dataset.recipeSlug;A(t,n)})}),document.querySelectorAll(".btn-remove-slot").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.slotId;N(t)})}),document.getElementById("btn-add-slot")?.addEventListener("click",O),document.getElementById("btn-change-date")?.addEventListener("click",U)}function A(e,t){const n=m.find(l=>l.slug===t),a=c(),o=document.createElement("div");o.className="fixed inset-0 bg-black/50 z-50 flex items-end",o.innerHTML=`
    <div class="w-full bg-biel rounded-t-l p-4 max-w-[480px] mx-auto" role="dialog" aria-label="Opcje dania">
      <p class="font-bold text-[16px] mb-4">${n?.title}</p>
      <div class="space-y-1">
        <a
          href="${a}/wybieram?date=${s}&slot=${e}&replace=${t}"
          class="flex items-center gap-3 py-3 px-2 rounded-m text-[15px] font-semibold hover:bg-porcelana w-full min-h-touch"
        >
          Podmień przepis
        </a>
        <button
          id="overlay-remove"
          class="flex items-center gap-3 py-3 px-2 rounded-m text-[15px] font-semibold text-nie hover:bg-nie-tint w-full min-h-touch"
        >
          Usuń z planu
        </button>
        <button
          id="overlay-close"
          class="flex items-center gap-3 py-3 px-2 rounded-m text-[15px] text-ink-2 hover:bg-porcelana w-full min-h-touch"
        >
          Anuluj
        </button>
      </div>
    </div>
  `,document.body.appendChild(o),o.addEventListener("click",l=>{l.target===o&&o.remove()}),document.getElementById("overlay-close")?.addEventListener("click",()=>o.remove()),document.getElementById("overlay-remove")?.addEventListener("click",()=>{o.remove(),P(e,t)})}function P(e,t){i&&(u={slotId:e,recipeSlug:t},i=E(i,e,t),d(),M("Usunięto z planu. ",()=>{!i||!u||(i=j(i,u.slotId,u.recipeSlug),d())}))}function M(e,t){document.getElementById("undo-toast")?.remove(),r&&clearTimeout(r);const a=document.createElement("div");a.id="undo-toast",a.className="fixed bottom-[calc(var(--nav-height)+12px)] left-4 right-4 max-w-[480px] mx-auto bg-emalia-900 text-na-emalii rounded-m px-4 py-3 flex items-center justify-between gap-3 shadow-lg z-40",a.innerHTML=`
    <span class="text-[14px]">${e}</span>
    <button id="toast-undo" class="text-kurkuma font-bold text-[14px] min-h-touch px-2">Cofnij</button>
  `,document.body.appendChild(a),document.getElementById("toast-undo")?.addEventListener("click",()=>{a.remove(),r&&clearTimeout(r),t()}),r=setTimeout(()=>a.remove(),5e3)}function N(e){if(!i)return;const t=i.slots.find(a=>a.id===e);if(!t)return;const n=t.dishes.length;n>0&&!confirm(`Usunąć posiłek "${p[t.name]}"? Razem z nim znikną ${n} ${n===1?"danie":"dania"}.`)||(i=$(i,e),d())}function O(){const e=["sniadanie","drugie-sniadanie","obiad","kolacja","deser"],t=i?.slots.map(o=>o.name)??[],n=e.filter(o=>!t.includes(o)),a=document.createElement("div");a.className="fixed inset-0 bg-black/50 z-50 flex items-end",a.innerHTML=`
    <div class="w-full bg-biel rounded-t-l p-4 max-w-[480px] mx-auto" role="dialog">
      <p class="font-bold text-[16px] mb-4">Dodaj posiłek do tego dnia</p>
      <div class="space-y-1">
        ${n.map(o=>`
          <button data-slot="${o}" class="btn-add-slot-option flex items-center py-3 px-2 rounded-m text-[15px] font-semibold hover:bg-porcelana w-full min-h-touch">
            ${p[o]}
          </button>
        `).join("")}
        ${n.length===0?'<p class="text-ink-2 py-3">Wszystkie posiłki już dodane.</p>':""}
        <button id="overlay-close2" class="py-3 px-2 text-[14px] text-ink-2 hover:bg-porcelana w-full rounded-m min-h-touch">Anuluj</button>
      </div>
    </div>
  `,document.body.appendChild(a),a.addEventListener("click",o=>{o.target===a&&a.remove()}),document.getElementById("overlay-close2")?.addEventListener("click",()=>a.remove()),document.querySelectorAll(".btn-add-slot-option").forEach(o=>{o.addEventListener("click",()=>{const l=o.dataset.slot;a.remove(),i&&(i=z(i,l),d())})})}function U(){const e=document.createElement("div");e.className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4",e.innerHTML=`
    <div class="bg-biel rounded-l p-5 w-full max-w-[320px]" role="dialog">
      <p class="font-bold mb-4">Wybierz dzień</p>
      <input type="date" id="date-input" value="${s}"
        class="w-full border border-kreska rounded-m px-3 py-2 text-[15px] mb-4 min-h-touch" />
      <div class="flex gap-3">
        <button id="btn-date-ok" class="flex-1 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">OK</button>
        <button id="btn-date-cancel" class="flex-1 py-3 rounded-l border border-kreska text-ink font-semibold min-h-touch">Anuluj</button>
      </div>
    </div>
  `,document.body.appendChild(e),document.getElementById("btn-date-cancel")?.addEventListener("click",()=>e.remove()),document.getElementById("btn-date-ok")?.addEventListener("click",()=>{const t=document.getElementById("date-input").value;e.remove(),t&&t!==s&&(window.location.href=`${c()}/plan?date=${t}`)})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):b();
