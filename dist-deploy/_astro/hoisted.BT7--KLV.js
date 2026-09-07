import{a as E,j as O,k as j}from"./store.RKPXJExi.js";import"./hoisted.BJmqyGi7.js";const L=[{id:"sniadanie",label:"Śniadanie",emoji:"🌅",defaultOrder:1},{id:"drugie-sniadanie",label:"Drugie śniadanie",emoji:"🍎",defaultOrder:2},{id:"obiad",label:"Obiad",emoji:"🍽️",defaultOrder:3},{id:"kolacja",label:"Kolacja",emoji:"🌙",defaultOrder:4},{id:"deser",label:"Deser",emoji:"🍮",defaultOrder:5}];Object.fromEntries(L.map(e=>[e.id,e]));const h=["warzywa-owoce","nabial","mieso-ryby","suche-produkty","pieczywo","przyprawy","inne"],C={"warzywa-owoce":"Warzywa i owoce",nabial:"Nabiał","mieso-ryby":"Mięso i ryby","suche-produkty":"Produkty suche",pieczywo:"Pieczywo",przyprawy:"Przyprawy",inne:"Pozostałe"};function A(e,n,o){const i=new Map;for(const c of e.slots)for(const s of c.dishes){const a=n.find(t=>t.slug===s.recipeSlug);if(a)for(const t of a.ingredients){const p=o[t.slug],l=i.get(t.slug);if(l)if(l.unit===t.unit)l.totalAmount+=t.amount,l.sources.push({recipeTitle:a.title,amount:t.amount,unit:t.unit});else{const g=f(l.totalAmount,l.unit,p),k=f(t.amount,t.unit,p);if(g!==null&&k!==null)l.totalAmount=g+k,l.unit="g",l.sources.push({recipeTitle:a.title,amount:t.amount,unit:t.unit});else{const x=`${t.slug}__${t.unit}`,S={ingredientSlug:x,name:t.name,totalAmount:t.amount,unit:t.unit,category:p?.category??"inne",sources:[{recipeTitle:a.title,amount:t.amount,unit:t.unit}],checked:!1,mergeError:!0};i.set(x,S)}}else i.set(t.slug,{ingredientSlug:t.slug,name:t.name,totalAmount:t.amount,unit:t.unit,category:p?.category??"inne",sources:[{recipeTitle:a.title,amount:t.amount,unit:t.unit}],checked:!1})}}const r=Array.from(i.values());return r.sort((c,s)=>{const a=h.indexOf(c.category),t=h.indexOf(s.category);return(a===-1?999:a)-(t===-1?999:t)}),r}function f(e,n,o){return o?n==="g"?e:n==="szt"&&o.conversion_to_grams?e*o.conversion_to_grams:null:null}let u="",d=[],m={},y=[],b={},w=!1;function z(){if(w)return;w=!0,y=JSON.parse(document.getElementById("all-recipes")?.textContent??"[]"),b=JSON.parse(document.getElementById("ingredients-data")?.textContent??"{}"),u=new URLSearchParams(window.location.search).get("date")??new Date().toISOString().slice(0,10);const n=E(u);if(!n||n.slots.every(o=>o.dishes.length===0)){P();return}d=A(n,y,b),m=O(u),d=d.map(o=>({...o,checked:m[o.ingredientSlug]??!1})),v()}function I(){const e=document.getElementById("base-url")?.textContent??'""';try{return JSON.parse(e).replace(/\/$/,"")}catch{return""}}function P(){const e=document.getElementById("shopping-mount");if(!e)return;const n=new Date(u).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"});e.innerHTML=`
    <div class="max-w-[480px] mx-auto px-4 py-12 text-center">
      <p class="text-[18px] font-bold mb-3">Nic nie zaplanowano na ${n}.</p>
      <p class="text-ink-2 mb-6">Zaplanuj posiłki, a lista zrobi się sama.</p>
      <a href="${I()}/plan?date=${u}"
        class="inline-flex items-center px-5 py-3 rounded-l bg-kurkuma text-kurkuma-tekst font-bold min-h-touch">
        Idź do planu
      </a>
    </div>
  `}function v(){const e=document.getElementById("shopping-mount");if(!e)return;const n=d.filter(s=>s.checked).length,o=d.length,i=n===o&&o>0,r=new Date(u).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"}),c=new Map;for(const s of d){const a=s.category;c.has(a)||c.set(a,[]),c.get(a).push(s)}e.innerHTML=`
    <div class="max-w-[680px] mx-auto min-[900px]:max-w-[960px]">
      <!-- Nagłówek — przyklejony -->
      <header class="sticky top-0 z-10 bg-biel border-b border-kreska px-4 py-3">
        <h1 class="font-extrabold text-[18px] tracking-tight">Zakupy na ${r}</h1>
        <p class="text-[13px] text-ink-2 mt-0.5" aria-live="polite">
          ${i?"Wszystko odhaczone. Można wracać.":`${n} z ${o} odhaczone`}
        </p>
      </header>

      ${i?`
        <div class="px-4 py-4 bg-tak-tint text-tak font-semibold text-[14px]">
          ✓ Wszystko odhaczone. Można wracać.
        </div>
      `:""}

      <!-- Kategorie — od 900px dwie kolumny -->
      <div class="min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:gap-x-6">
        ${Array.from(c.entries()).map(([s,a])=>T(s,a)).join("")}
      </div>

      <!-- Brak sieci — info -->
      <div class="px-4 py-6 text-[13px] text-ink-2 border-t border-kreska mt-4">
        Lista działa bez internetu — dane są zapisane w tej przeglądarce.
      </div>
    </div>
  `,M()}function T(e,n){return`
    <section class="border-b border-kreska last:border-b-0">
      <h2 class="px-4 pt-4 pb-2 text-[12.5px] font-bold text-ink-2 uppercase tracking-wide">${C[e]??e}</h2>
      <ul>
        ${n.map(i=>D(i)).join("")}
      </ul>
    </section>
  `}function D(e){const n=e.checked,o=e.sources.length>1,i=$(e.totalAmount,e.unit);return`
    <li class="border-t border-kreska first:border-t-0">
      <!-- Cel dotykowy — cały wiersz -->
      <label
        class="flex items-center gap-3 px-4 py-3 min-h-touch cursor-pointer hover:bg-porcelana active:bg-kreska select-none"
        ${e.mergeError?'title="Nie dało się zsumować — dwie różne jednostki bez przelicznika"':""}
      >
        <input
          type="checkbox"
          data-slug="${e.ingredientSlug}"
          ${n?"checked":""}
          class="shopping-check w-5 h-5 rounded-s accent-tak cursor-pointer flex-shrink-0"
        />
        <span class="flex-1 ${n?"line-through text-ink-3":"text-ink"} font-semibold text-[15px]">
          ${e.name}
          ${e.mergeError?'<span class="text-[12px] text-kurkuma ml-1" aria-label="Błąd sumowania">⚠</span>':""}
        </span>
        <span class="text-[14px] ${n?"text-ink-3":"text-ink-2"} font-medium flex-shrink-0">${i}</span>
      </label>
      <!-- Rozwinięcie: skąd pochodzi ilość (FR-13 ochrona przed Z-01) -->
      ${o?`
        <details class="px-4 pb-2">
          <summary class="text-[12.5px] text-ink-2 cursor-pointer list-none hover:text-ink">
            ▸ z ${e.sources.length} przepisów
          </summary>
          <ul class="pl-3 pt-1 space-y-0.5">
            ${e.sources.map(r=>`
              <li class="text-[12.5px] text-ink-2">
                z ${r.recipeTitle}: ${$(r.amount,r.unit)}
              </li>
            `).join("")}
          </ul>
        </details>
      `:`
        <p class="px-4 pb-2 text-[12px] text-ink-3">z ${e.sources[0].recipeTitle}</p>
      `}
      ${e.mergeError?`
        <p class="px-4 pb-2 text-[12px] text-kurkuma-tekst">
          Tego składnika nie dało się zsumować — dwie różne jednostki bez przelicznika w słowniku.
        </p>
      `:""}
    </li>
  `}function $(e,n){return`${Math.round(e*10)/10} ${n}`}function M(){document.querySelectorAll(".shopping-check").forEach(e=>{e.addEventListener("change",()=>{const n=e.dataset.slug,o=e.checked;m[n]=o,j(u,m);const i=d.find(r=>r.ingredientSlug===n);i&&(i.checked=o),v()})})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",z):z();
