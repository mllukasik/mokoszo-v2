import{S as m}from"./types.DeAfvgSP.js";import{a as S,l as b,g as P,c as N,s as v,e as T}from"./store.RKPXJExi.js";import"./hoisted.BJmqyGi7.js";let d=[],s=new Set,r=null,i=null,c="",x=!1;const E=["sniadanie","drugie-sniadanie","obiad","kolacja","deser"],D={sniadanie:"śniadania","drugie-sniadanie":"drugiego śniadania",obiad:"obiadu",kolacja:"kolacji",deser:"deseru"},I={sniadanie:"śniadaniu","drugie-sniadanie":"drugim śniadaniu",obiad:"obiedzie",kolacja:"kolacji",deser:"deserze"};function O(e){return E.includes(e)}function $(){try{d=JSON.parse(document.getElementById("all-recipes")?.textContent??"[]")}catch{d=[]}const e=new Date;c=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`,L(),i=S(c),x=b().seenLocalStorageNotice,u()}function L(){const e=new URLSearchParams(window.location.search);s=new Set,e.getAll("slot").flatMap(a=>a.split(",")).map(a=>a.trim()).filter(O).forEach(a=>s.add(a));const t=e.get("czas");r=t!==null&&/^\d+$/.test(t)?Number(t):null}function f(){try{const t=document.getElementById("base-url")?.textContent;if(t&&t.trim())return JSON.parse(t).replace(/\/$/,"")}catch{}const e=document.querySelector('meta[name="base-url"]');return e?.content?e.content.replace(/\/$/,""):""}function C(){let e=[...d];return s.size>0&&(e=e.filter(t=>t.slots.some(a=>s.has(a)))),r!==null&&(e=e.filter(t=>t.timeMinutes<=r)),e}function w(e){s.has(e)?s.delete(e):s.add(e),g(),u()}function z(e){r=e,g(),u()}function j(){s.clear(),r=null,g(),u()}function g(){const e=new URL(window.location.href);s.size>0?e.searchParams.set("slot",Array.from(s).join(",")):e.searchParams.delete("slot"),r!==null?e.searchParams.set("czas",String(r)):e.searchParams.delete("czas"),window.history.pushState({},"",e.toString())}function u(){const e=document.getElementById("home-mount");if(!e)return;const t=C(),a=d.length,o=s.size>0||r!==null;e.innerHTML=`
    <div class="max-w-[900px] mx-auto">

      <!-- Nagłówek -->
      <header class="bg-emalia-900 text-na-emalii px-4 py-6">
        <p class="text-kurkuma text-[12.5px] font-bold mb-1">Jutro jem</p>
        <h1 class="text-[28px] font-extrabold tracking-tight">Przepisy</h1>
      </header>

      <!-- Komunikat o localStorage (pierwsze wejście) -->
      ${x?"":`
        <div id="localstorage-notice"
          class="mx-4 mt-4 bg-kurkuma-tint border-l-4 border-kurkuma rounded-r-m p-4 flex items-start justify-between gap-3">
          <p class="text-[14px] text-ink">
            <strong>Plan zostaje w tej przeglądarce.</strong> Nie ma konta, więc nie zobaczysz go
            na innym urządzeniu — a wyczyszczenie danych przeglądarki usuwa go bez śladu.
          </p>
          <button id="btn-close-notice" type="button" aria-label="Zamknij komunikat"
            class="text-ink-2 min-h-touch min-w-touch w-12 flex-shrink-0 flex items-center justify-center text-lg">✕</button>
        </div>
      `}

      <!-- Wstążka planu (gdy coś zaplanowane) -->
      ${B()}

      <!-- Filtry (sticky) -->
      <div class="sticky top-0 z-10 bg-porcelana border-b border-kreska">
        ${M()}
        ${o?q(t.length,a):""}
      </div>

      <!-- Lista przepisów -->
      ${t.length>0?R(t):W()}

      <!-- Wejście do kart — równorzędne (Q-08) -->
      ${Z()}

      <!-- Koniec listy -->
      ${t.length===a&&a>0?`
        <p class="text-center text-[13px] text-ink-2 py-6 px-4">
          To wszystkie ${a} przepisów. Nowe pojawiają się po publikacji przez redakcję.
        </p>
      `:""}
    </div>
  `,J()}function B(){if(!i)return"";const e=i.slots.filter(n=>n.dishes.length>0).length,t=i.slots.length;if(e===0)return"";const a=new Date(`${i.date}T12:00:00`).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"}),o=i.slots.filter(n=>n.dishes.length===0).map(n=>m[n.name]).join(", ");return`
    <a href="${f()}/plan?date=${i.date}"
      class="flex items-center justify-between gap-3 px-4 py-3 bg-biel border-b border-kreska text-[14px] text-ink hover:bg-porcelana min-h-touch">
      <div>
        <strong>Plan na ${a}:</strong> ${e} z ${t} posiłków
        ${o?`<span class="text-ink-2"> · ${o} puste</span>`:""}
      </div>
      <span class="text-emalia-500 text-[12px] font-semibold" aria-hidden="true">→</span>
    </a>
  `}function M(){const e=[{label:"do 20 min",value:20},{label:"do 45 min",value:45}];return`
    <div class="px-4 py-3 space-y-2">
      <!-- Filtry posiłku (wielokrotny wybór - OR) -->
      <div class="flex flex-wrap gap-2" role="group" aria-label="Filtruj po posiłku">
        ${E.map(t=>`
          <button
            type="button"
            data-slot-filter="${t}"
            class="slot-filter-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold border min-h-touch transition-colors
              ${s.has(t)?"bg-emalia-900 text-na-emalii border-emalia-900":"bg-biel text-ink border-kreska hover:border-ink"}"
            aria-pressed="${s.has(t)}"
          >
            ${m[t]}
          </button>
        `).join("")}
      </div>

      <!-- Filtr czasu (pojedynczy wybór - AND z posiłkami) -->
      <!-- Ukryty gdy baza < 20 przepisów (Q-01) -->
      ${d.length>=20?`
        <div class="flex flex-wrap gap-2" role="group" aria-label="Filtruj po czasie">
          ${e.map(t=>`
            <button
              type="button"
              data-time-filter="${t.value}"
              class="time-filter-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold border min-h-touch transition-colors
                ${r===t.value?"bg-emalia-900 text-na-emalii border-emalia-900":"bg-biel text-ink border-kreska hover:border-ink"}"
              aria-pressed="${r===t.value}"
            >
              ${t.label}
            </button>
          `).join("")}
          ${r!==null?`
            <button type="button" data-time-filter="null"
              class="time-filter-btn text-[13px] text-ink-2 px-2 min-h-touch">
              ✕ czas
            </button>
          `:""}
        </div>
      `:""}
    </div>
  `}function q(e,t){return`
    <div class="px-4 pb-3 flex flex-wrap items-center gap-2">
      ${[...Array.from(s).map(o=>({label:m[o],removeAction:`slot:${o}`})),...r!==null?[{label:`do ${r} min`,removeAction:"time"}]:[]].map(o=>`
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-emalia-900 text-na-emalii">
          ${o.label}
          <button type="button" data-remove-filter="${o.removeAction}"
            class="remove-filter-btn text-na-emalii-2 hover:text-na-emalii min-w-touch min-h-touch inline-flex items-center justify-center"
            aria-label="Zdejmij filtr ${o.label}">✕</button>
        </span>
      `).join("")}
      <button id="btn-clear-all" type="button" class="text-[13px] text-emalia-500 font-semibold min-h-touch px-2">
        wyczyść filtry
      </button>
      <span class="text-[13px] text-ink-2 ml-auto font-semibold" aria-live="polite">
        ${e} z ${t}
      </span>
    </div>
  `}function R(e){return`
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-kreska border-t border-kreska">
      ${e.map(t=>U(t)).join("")}
    </ul>
  `}function U(e){const t=f(),a=i?.slots.find(n=>n.dishes.some(l=>l.recipeSlug===e.slug)),o=!!a;return`
    <li class="bg-biel">
      <!-- Kafelek — CELOWO inaczej niż karta E-04: brak cienia, mały promień, zdjęcie mniejsze -->
      <div class="flex gap-3 p-3 hover:bg-porcelana transition-colors">
        <!-- Zdjęcie — pomocnicze, nie dominujące -->
        <a href="${t}/przepis/${e.slug}" class="flex-shrink-0 min-w-touch min-h-touch" tabindex="-1" aria-hidden="true">
          ${e.image?`<img src="${e.image}" alt=""
                class="w-16 h-16 rounded-s object-cover"
                loading="lazy" width="64" height="64" />`:'<div class="w-16 h-16 rounded-s bg-kreska flex items-center justify-center text-xl" aria-hidden="true">🍽️</div>'}
        </a>
        <!-- Treść -->
        <div class="flex-1 min-w-0">
          <a href="${t}/przepis/${e.slug}"
            class="font-bold text-[15px] text-ink hover:text-emalia-500 leading-snug block">
            ${e.title}
          </a>
          <p class="text-[12.5px] text-ink-2 mt-0.5">
            ${e.timeMinutes} min · ${e.calories} kcal
          </p>
          <!-- Akcja: dodaj do planu -->
          ${o?`
            <span class="text-[12.5px] text-tak font-semibold mt-1 block">
              ✓ Masz to w ${I[a.name]??"planie"}
            </span>
          `:`
            <button
              type="button"
              data-recipe-slug="${e.slug}"
              class="btn-add-to-plan text-[12.5px] text-kurkuma font-semibold mt-1 min-h-touch inline-flex items-center gap-1"
            >
              + Dodaj do planu
            </button>
          `}
        </div>
      </div>
    </li>
  `}function W(){return`
    <div class="px-4 py-10 text-center">
      <p class="font-bold text-[16px] text-ink mb-3">
        Żaden przepis nie pasuje do filtrów: ${[...Array.from(s).map(t=>m[t]),...r!==null?[`do ${r} min`]:[]].join(", ")}.
      </p>
      <button id="btn-clear-empty" type="button" class="px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
        Wyczyść filtry
      </button>
    </div>
  `}function Z(){const e=f();return`
    <div class="mx-4 my-6 p-4 bg-emalia-900 rounded-m flex items-center justify-between gap-4">
      <div class="text-na-emalii">
        <p class="font-bold text-[16px] leading-snug">
          <a href="${e}/wybieram?date=${c}" class="hover:underline">Wybieraj kartami</a>
        </p>
        <p class="text-na-emalii-2 text-[13px]">szybciej, jedna decyzja naraz</p>
      </div>
      <a
        href="${e}/wybieram?date=${c}"
        data-testid="start-picker"
        class="flex-shrink-0 px-4 py-2.5 rounded-l bg-kurkuma text-kurkuma-tekst font-bold text-[14px] min-h-touch inline-flex items-center"
      >
        Zacznij
      </a>
    </div>
  `}function J(){document.getElementById("btn-close-notice")?.addEventListener("click",()=>{document.getElementById("localstorage-notice")?.remove(),x=!0;const e=b();e.seenLocalStorageNotice=!0,P(e)}),document.querySelectorAll(".slot-filter-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.slotFilter;w(t)})}),document.querySelectorAll(".time-filter-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.timeFilter;z(t==="null"?null:Number(t))})}),document.querySelectorAll(".remove-filter-btn").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.removeFilter;t==="time"?z(null):t.startsWith("slot:")&&w(t.slice(5))})}),document.getElementById("btn-clear-all")?.addEventListener("click",j),document.getElementById("btn-clear-empty")?.addEventListener("click",j),document.querySelectorAll(".btn-add-to-plan").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.recipeSlug;K(t)})})}function K(e){const t=d.find(l=>l.slug===e);if(!t)return;const a=b();i||(i=N(c,a.defaultSlots),v(i));const o=i,n=document.createElement("div");n.className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center",n.innerHTML=`
    <div class="w-full bg-biel rounded-t-l p-5 max-w-[480px] mx-auto" role="dialog" aria-label="Dodaj do planu: ${t.title}">
      <p class="font-bold text-[15px] text-ink mb-1">${t.title}</p>
      <p class="text-ink-2 text-[13px] mb-4">Do którego posiłku?</p>
      <div class="space-y-1">
        ${o.slots.map(l=>`
          <button
            type="button"
            data-slot-id="${l.id}"
            class="btn-choose-slot flex items-center justify-between py-3 px-3 rounded-m text-[15px] font-semibold text-ink hover:bg-porcelana w-full min-h-touch"
          >
            <span>${m[l.name]}</span>
            ${l.dishes.length>0?`<span class="text-[12px] text-ink-2">${l.dishes.length} ${l.dishes.length===1?"danie":"dania"}</span>`:'<span class="text-[12px] text-ink-3">puste</span>'}
          </button>
        `).join("")}
        <button id="overlay-close-add" type="button" class="py-3 px-3 text-[14px] text-ink-2 hover:bg-porcelana w-full rounded-m min-h-touch">Anuluj</button>
      </div>
    </div>
  `,document.body.appendChild(n),n.addEventListener("click",l=>{l.target===n&&n.remove()}),document.getElementById("overlay-close-add")?.addEventListener("click",()=>n.remove()),n.addEventListener("keydown",l=>{l.key==="Escape"&&n.remove()}),n.querySelector(".btn-choose-slot")?.focus(),n.querySelectorAll(".btn-choose-slot").forEach(l=>{l.addEventListener("click",()=>{const h=l.dataset.slotId;if(n.remove(),!i)return;i=T(i,h,e),v(i);const p=i.slots.find(F=>F.id===h),y=p?D[p.name]:"planu",k=p?.dishes.length??1,A=k===1?`${t.title} — dodany do ${y} na dziś`:`${t.title} — dodany jako danie ${k} do ${y}`;_(A),u()})})}function _(e){document.querySelector("[data-home-toast]")?.remove();const t=document.createElement("div");t.setAttribute("data-home-toast","true"),t.className="fixed bottom-[calc(var(--nav-height)+12px)] left-4 right-4 max-w-[480px] mx-auto bg-emalia-900 text-na-emalii rounded-m px-4 py-3 text-[14px] font-medium shadow-lg z-40",t.textContent=e,t.setAttribute("aria-live","polite"),document.body.appendChild(t),setTimeout(()=>t.remove(),3e3)}window.addEventListener("popstate",()=>{L(),i=S(c||new Date().toISOString().slice(0,10)),u()});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",$):$();
