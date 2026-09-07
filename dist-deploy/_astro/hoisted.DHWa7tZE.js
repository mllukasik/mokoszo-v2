import{S as d}from"./types.DeAfvgSP.js";import{l as p,a as m,g as u,i as y}from"./store.RKPXJExi.js";import"./hoisted.BJmqyGi7.js";let a,s=!1;function o(){s||(s=!0,a=p(),l())}function x(){return new URLSearchParams(window.location.search).get("date")??new Date().toISOString().slice(0,10)}function l(){const e=document.getElementById("settings-mount");if(!e)return;const n=m(x())?.slots.reduce((c,r)=>c+r.dishes.length,0)??0;e.innerHTML=`
    <div class="max-w-[680px] mx-auto">
      <header class="bg-emalia-900 text-na-emalii px-4 py-6">
        <h1 class="text-[28px] font-extrabold tracking-tight">Więcej</h1>
      </header>

      <!-- Informacja o zapisie lokalnym (NFR-09) -->
      <section class="px-4 py-5 border-b border-kreska">
        <h2 class="font-bold text-[16px] mb-2">Gdzie jest Twój plan</h2>
        <p class="text-[14px] text-ink-2 leading-relaxed">
          Plan posiłków jest zapisany wyłącznie w tej przeglądarce, na tym urządzeniu.
          Nie ma konta, nie ma chmury — plan nie pojawi się na innym telefonie ani komputerze.
        </p>
        <p class="text-[14px] text-ink-2 mt-2">
          Wyczyszczenie danych przeglądarki lub używanie trybu prywatnego usuwa plan bez śladu.
        </p>
      </section>

      <!-- Domyślne sloty dnia -->
      <section class="px-4 py-5 border-b border-kreska">
        <h2 class="font-bold text-[16px] mb-1">Domyślne posiłki nowego dnia</h2>
        <p class="text-[13px] text-ink-2 mb-4">
          Te posiłki pojawią się gdy zaczniesz planować nowy dzień.
        </p>
        <div class="space-y-2">
          ${k()}
        </div>
        <button id="btn-save-slots"
          class="mt-4 px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
          Zapisz domyślne posiłki
        </button>
      </section>

      <!-- Czyszczenie planu (FR-17) -->
      <section class="px-4 py-5 border-b border-kreska">
        <h2 class="font-bold text-[16px] mb-1">Wyczyść plan</h2>
        <p class="text-[14px] text-ink-2 mb-4">
          ${n>0?`Masz teraz zaplanowane ${n} ${n===1?"danie":"dania"}. Wyczyszczenie usuwa wszystko bezpowrotnie.`:"Plan jest pusty."}
        </p>
        <button id="btn-clear-plan"
          ${n===0?"disabled":""}
          class="px-5 py-3 rounded-l border border-nie text-nie font-bold min-h-touch disabled:opacity-40">
          Wyczyść plan
        </button>
      </section>

      <!-- Eksport/Import (FR-21 — etap 2) -->
      <section class="px-4 py-5 opacity-50">
        <h2 class="font-bold text-[16px] mb-1">Eksport i import planu</h2>
        <p class="text-[13px] text-ink-2">
          Przenoszenie planu między urządzeniami — planowane w kolejnej wersji.
        </p>
      </section>

      <!-- Wersja aplikacji -->
      <section class="px-4 py-5">
        <p class="text-[12.5px] text-ink-3">Jutro jem · MVP v0.1 · plan lokalny</p>
      </section>
    </div>
  `,z()}const b=["sniadanie","drugie-sniadanie","obiad","kolacja","deser"];function k(){return b.map(e=>`
    <label class="flex items-center gap-3 py-2 cursor-pointer min-h-touch">
      <input
        type="checkbox"
        data-slot="${e}"
        class="default-slot-check w-5 h-5 rounded-s accent-kurkuma"
        ${a.defaultSlots.includes(e)?"checked":""}
      />
      <span class="font-semibold text-[15px]">${d[e]}</span>
    </label>
  `).join("")}function z(){document.getElementById("btn-save-slots")?.addEventListener("click",()=>{const e=Array.from(document.querySelectorAll(".default-slot-check")).filter(t=>t.checked).map(t=>t.dataset.slot);if(e.length===0){alert("Wybierz co najmniej jeden domyślny posiłek.");return}a.defaultSlots=e,u(a),i("Zapisano domyślne posiłki")}),document.getElementById("btn-clear-plan")?.addEventListener("click",()=>{confirm("Wyczyszczenie usuwa wszystkie zaplanowane posiłki. Tej operacji nie można cofnąć.")&&(y(),i("Plan wyczyszczony"),l())})}function i(e){const t=document.createElement("div");t.className="fixed bottom-[calc(var(--nav-height)+12px)] left-4 right-4 max-w-[480px] mx-auto bg-emalia-900 text-na-emalii rounded-m px-4 py-3 text-[14px] shadow-lg z-40",t.textContent=e,document.body.appendChild(t),setTimeout(()=>t.remove(),2500)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",o):o();
