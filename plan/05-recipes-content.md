# 05 — Treść: 10 przepisów startowych

> Utwórz wszystkie 10 plików w `src/content/recipes/`.
> Zdjęcia na razie jako `undefined` (brak `image:` w frontmatter) —
> aplikacja wyświetla jednolite tło zastępcze. Dodaj je gdy będą dostępne.
> Każdy przepis musi mieć calorie i ingredients zgodne z ingredients.json.

---

## 1. owsianka-z-jablkiem.md

```markdown
---
title: Owsianka z jabłkiem i cynamonem
time_minutes: 10
calories: 340
servings: 1
slots:
  - sniadanie
ingredients:
  - slug: platki-owsiane
    name: Płatki owsiane
    amount: 80
    unit: g
  - slug: mleko
    name: Mleko
    amount: 200
    unit: ml
  - slug: jablko
    name: Jabłko
    amount: 1
    unit: szt
  - slug: cukier
    name: Cukier trzcinowy
    amount: 10
    unit: g
  - slug: cynamon
    name: Cynamon
    amount: 1
    unit: szczypta
---

Klasyczne śniadanie, które da energię na poranek — gotowe w 10 minut.

## Przygotowanie

1. Zagotuj mleko w małym garnku.
2. Wsyp płatki owsiane i gotuj na małym ogniu przez 4–5 minut, mieszając.
3. Jabłko zetrzyj na tarce lub pokrój w kostkę.
4. Przełóż owsiankę do miski, dodaj jabłko i cynamon.
5. Posłódź cukrem trzcinowym według smaku.
```

---

## 2. zapiekanka-z-soczewica.md

(Pełny przykład w `03-data-model.md` — przepisz tam gotowy plik)

---

## 3. makaron-z-papryka-i-fetą.md

```markdown
---
title: Makaron z papryką i fetą
time_minutes: 25
calories: 610
servings: 2
slots:
  - obiad
  - kolacja
ingredients:
  - slug: makaron-penne
    name: Makaron penne
    amount: 250
    unit: g
  - slug: papryka-czerwona
    name: Papryka czerwona
    amount: 2
    unit: szt
  - slug: feta
    name: Ser feta
    amount: 100
    unit: g
  - slug: czosnek
    name: Czosnek
    amount: 3
    unit: ząbek
  - slug: oliwa
    name: Oliwa z oliwek
    amount: 3
    unit: łyżka
  - slug: sol
    name: Sól
    amount: 1
    unit: szczypta
  - slug: pieprz
    name: Pieprz czarny
    amount: 1
    unit: szczypta
---

Szybki makaron z pieczonym smakiem papryki i kremową fetą — minimum składników, maksimum smaku.

## Przygotowanie

1. Ugotuj makaron al dente zgodnie z instrukcją na opakowaniu. Zachowaj szklankę wody po gotowaniu.
2. Pokrój paprykę w paski. Smaż na oliwie z czosnkiem przez 8–10 minut na średnim ogniu.
3. Kiedy papryka zmięknie, wrzuć odsączoną fetę i rozgnieć ją widelcem.
4. Dodaj ugotowany makaron i kilka łyżek wody z gotowania — sos powinien być kremowy.
5. Dopraw solą i pieprzem, podawaj od razu.
```

---

## 4. jajka-sadzone-na-grzankach.md

```markdown
---
title: Jajka sadzone na grzankach z awokado
time_minutes: 15
calories: 420
servings: 1
slots:
  - sniadanie
  - drugie-sniadanie
ingredients:
  - slug: jajka
    name: Jajka
    amount: 2
    unit: szt
  - slug: chleb-pszenny
    name: Chleb pszenny (kromki)
    amount: 2
    unit: szt
  - slug: awokado
    name: Awokado
    amount: 1
    unit: szt
  - slug: sok-cytrynowy
    name: Sok z cytryny
    amount: 1
    unit: łyżka
  - slug: sol
    name: Sól
    amount: 1
    unit: szczypta
  - slug: pieprz
    name: Pieprz czarny
    amount: 1
    unit: szczypta
---

Klasyczne śniadanie w nowej wersji — chrupiące grzanki, kremowe awokado i idealnie sadzone jajka.

## Przygotowanie

1. Opiecz kromki chleba w tosterze lub na patelni grillowej.
2. Awokado rozgnieć widelcem, dodaj sok z cytryny, sól i pieprz.
3. Na suchej patelni na małym ogniu smaż jajka przez 3–4 minuty, aż białko się zetnie.
4. Posmaruj grzanki awokado i połóż na nich jajka.
5. Dopraw pieprzem i podawaj od razu.
```

---

## 5. sernik-na-zimno.md

```markdown
---
title: Sernik na zimno z malinami
time_minutes: 20
calories: 340
servings: 6
slots:
  - deser
ingredients:
  - slug: twarog
    name: Twaróg półtłusty
    amount: 500
    unit: g
  - slug: smietana-18
    name: Śmietana 18%
    amount: 200
    unit: ml
  - slug: cukier
    name: Cukier
    amount: 60
    unit: g
  - slug: zelka
    name: Żelatyna
    amount: 10
    unit: g
  - slug: maliny
    name: Maliny (mrożone)
    amount: 200
    unit: g
  - slug: herbatniki
    name: Herbatniki maślane
    amount: 150
    unit: g
  - slug: maslo
    name: Masło
    amount: 60
    unit: g
---

Lekki sernik bez pieczenia — gotowy po 3 godzinach w lodówce.
Świetny na upalne dni i jako szybki deser na imprezę.

## Przygotowanie

1. Herbatniki zetrzyj na okruchy, wymieszaj z roztopionym masłem. Wyłóż dno formy (20 cm), wstaw do lodówki.
2. Żelatynę namocz w 50 ml zimnej wody przez 5 minut, potem rozpuść w gorącej wodzie w kąpieli wodnej.
3. Twaróg utrzyj z cukrem i śmietaną na gładką masę.
4. Wlej przestudzoną żelatynę do masy serowej, ciągle mieszając.
5. Wylej na spód, wstaw do lodówki na minimum 3 godziny.
6. Przed podaniem udekoruj malinami.
```

---

## 6. zupa-krem-z-dyni.md

```markdown
---
title: Krem z dyni z imbirem
time_minutes: 35
calories: 180
servings: 4
slots:
  - obiad
ingredients:
  - slug: dynia
    name: Dynia (np. hokkaido)
    amount: 800
    unit: g
  - slug: cebula
    name: Cebula
    amount: 1
    unit: szt
  - slug: czosnek
    name: Czosnek
    amount: 2
    unit: ząbek
  - slug: imbir-swiezy
    name: Imbir świeży
    amount: 20
    unit: g
  - slug: bulion-warzywny
    name: Bulion warzywny
    amount: 750
    unit: ml
  - slug: mleczko-kokosowe
    name: Mleczko kokosowe
    amount: 200
    unit: ml
  - slug: oliwa
    name: Oliwa z oliwek
    amount: 2
    unit: łyżka
  - slug: sol
    name: Sól
    amount: 1
    unit: szczypta
---

Rozgrzewający krem, który gotuje się sam — blender robi całą robotę.
Dynia hokkaido nie wymaga obierania, co skraca czas o połowę.

## Przygotowanie

1. Pokrój dynię na kawałki (hokkaido: ze skórką). Cebulę pokrój w kostkę.
2. Na oleju zeszklij cebulę, dodaj czosnek i starty imbir, smaż minutę.
3. Dodaj dynię, wlej bulion. Gotuj pod przykryciem 20 minut.
4. Zblenduj na gładki krem. Wlej mleczko kokosowe, dopraw solą.
5. Podawaj z pestkami dyni lub kleksem śmietany.
```

---

## 7. salatka-z-kurczakiem.md

```markdown
---
title: Sałatka z kurczakiem i rukolą
time_minutes: 20
calories: 380
servings: 2
slots:
  - obiad
  - kolacja
ingredients:
  - slug: pierś-kurczaka
    name: Pierś kurczaka
    amount: 300
    unit: g
  - slug: rukola
    name: Rukola
    amount: 80
    unit: g
  - slug: pomidorki-koktajlowe
    name: Pomidorki koktajlowe
    amount: 150
    unit: g
  - slug: parmezan
    name: Parmezan
    amount: 30
    unit: g
  - slug: oliwa
    name: Oliwa z oliwek
    amount: 2
    unit: łyżka
  - slug: sok-cytrynowy
    name: Sok z cytryny
    amount: 1
    unit: łyżka
  - slug: sol
    name: Sół
    amount: 1
    unit: szczypta
  - slug: pieprz
    name: Pieprz czarny
    amount: 1
    unit: szczypta
---

Lekki obiad gotowy w 20 minut. Kurczak pieczony zamiast smażonego — mniej tłuszczu, więcej smaku.

## Przygotowanie

1. Pierś kurczaka skrop oliwą, dopraw solą i pieprzem.
2. Piecz w 200°C przez 18–20 minut lub smaż na patelni grillowej.
3. Odczekaj 5 minut, pokrój w plastry.
4. Na talerzu ułóż rukolę, pomidorki przekrojone na pół i kurczaka.
5. Skrop sokiem z cytryny i oliwą, posyp startym parmezanem.
```

---

## 8. placki-ziemniaczane.md

```markdown
---
title: Placki ziemniaczane ze śmietaną
time_minutes: 30
calories: 450
servings: 3
slots:
  - obiad
  - kolacja
  - sniadanie
ingredients:
  - slug: ziemniaki
    name: Ziemniaki
    amount: 700
    unit: g
  - slug: jajka
    name: Jajka
    amount: 2
    unit: szt
  - slug: maka-pszenna
    name: Mąka pszenna
    amount: 40
    unit: g
  - slug: cebula
    name: Cebula
    amount: 1
    unit: szt
  - slug: smietana-18
    name: Śmietana 18%
    amount: 100
    unit: ml
  - slug: olej
    name: Olej roślinny
    amount: 4
    unit: łyżka
  - slug: sol
    name: Sól
    amount: 1
    unit: szczypta
---

Babciny przepis, który sprawdza się zawsze. Chrupiące z zewnątrz, miękkie w środku.

## Przygotowanie

1. Zetrzyj ziemniaki na tarce o grubych oczkach. Cebulę zetrzyj lub posiekaj drobno.
2. Odciśnij jak najwięcej wody z tartych ziemniaków przez ściereczkę.
3. Wymieszaj ziemniaki z cebulą, jajkami i mąką. Dopraw solą i pieprzem.
4. Na rozgrzanej patelni z olejem smaż porcje ciasta po 3–4 minuty z każdej strony.
5. Odsącz na papierowym ręczniku i podawaj ze śmietaną.
```

---

## 9. tosty-french-toast.md

```markdown
---
title: French toast z cynamonem
time_minutes: 15
calories: 390
servings: 2
slots:
  - sniadanie
  - deser
ingredients:
  - slug: chleb-tostowy
    name: Chleb tostowy
    amount: 4
    unit: szt
  - slug: jajka
    name: Jajka
    amount: 2
    unit: szt
  - slug: mleko
    name: Mleko
    amount: 80
    unit: ml
  - slug: cukier
    name: Cukier
    amount: 15
    unit: g
  - slug: cynamon
    name: Cynamon
    amount: 1
    unit: łyżeczka
  - slug: maslo
    name: Masło
    amount: 20
    unit: g
---

Śniadanie jak z kawiarni — gotowe w kwadrans, z tym co zawsze masz w domu.

## Przygotowanie

1. Roztrzep jajka z mlekiem, cukrem i cynamonem w miseczce.
2. Mocz kromki chleba w mieszance po 20 sekund z każdej strony.
3. Smaż na maśle 2–3 minuty z każdej strony, na średnim ogniu.
4. Podawaj z dżemem, miodem lub owocami.
```

---

## 10. ryż-z-warzywami-stir-fry.md

```markdown
---
title: Ryż stir-fry z warzywami i jajkiem
time_minutes: 20
calories: 480
servings: 2
slots:
  - obiad
  - kolacja
ingredients:
  - slug: ryz-jasmynowy
    name: Ryż jaśminowy
    amount: 200
    unit: g
  - slug: jajka
    name: Jajka
    amount: 2
    unit: szt
  - slug: marchew
    name: Marchew
    amount: 1
    unit: szt
  - slug: groszek-mrozony
    name: Groszek mrożony
    amount: 100
    unit: g
  - slug: sos-sojowy
    name: Sos sojowy
    amount: 2
    unit: łyżka
  - slug: czosnek
    name: Czosnek
    amount: 2
    unit: ząbek
  - slug: olej-sezamowy
    name: Olej sezamowy
    amount: 1
    unit: łyżka
  - slug: olej
    name: Olej roślinny
    amount: 2
    unit: łyżka
---

Klasyka azjatyckiej kuchni ulicznej — gotowa w 20 minut, najlepsza z ryżu z poprzedniego dnia.

## Przygotowanie

1. Ugotuj ryż i ostudź (lub użyj wcześniej ugotowanego).
2. Na mocno rozgrzanej patelni lub woku podsmaż marchew pokrojoną w zapałki przez 3 minuty.
3. Dodaj czosnek, groszek i smaż minutę.
4. Zepchnij warzywa na bok, wbij jajka i szybko mieszaj tworząc jajecznicę.
5. Dodaj ryż, sos sojowy i olej sezamowy. Smaż mieszając przez 2–3 minuty.
6. Podawaj od razu.
```

---

## Uzupełnij ingredients.json o brakujące składniki

Po przejrzeniu powyższych przepisów dodaj do `src/data/ingredients.json`:

```json
"cynamon": { "name": "Cynamon", "unit_default": "szczypta", "category": "przyprawy" },
"feta": { "name": "Ser feta", "unit_default": "g", "calories_per_100g": 264, "category": "nabial" },
"awokado": { "name": "Awokado", "unit_default": "szt", "calories_per_100g": 160, "conversion_to_grams": 200, "category": "warzywa-owoce" },
"chleb-pszenny": { "name": "Chleb pszenny", "unit_default": "szt", "calories_per_100g": 265, "conversion_to_grams": 35, "category": "pieczywo" },
"twarog": { "name": "Twaróg półtłusty", "unit_default": "g", "calories_per_100g": 104, "category": "nabial" },
"zelka": { "name": "Żelatyna", "unit_default": "g", "category": "inne" },
"maliny": { "name": "Maliny", "unit_default": "g", "calories_per_100g": 52, "category": "warzywa-owoce" },
"herbatniki": { "name": "Herbatniki maślane", "unit_default": "g", "calories_per_100g": 480, "category": "pieczywo" },
"maslo": { "name": "Masło", "unit_default": "g", "calories_per_100g": 717, "category": "nabial" },
"dynia": { "name": "Dynia", "unit_default": "g", "calories_per_100g": 26, "category": "warzywa-owoce" },
"imbir-swiezy": { "name": "Imbir świeży", "unit_default": "g", "calories_per_100g": 80, "category": "warzywa-owoce" },
"bulion-warzywny": { "name": "Bulion warzywny", "unit_default": "ml", "calories_per_100g": 5, "category": "inne" },
"mleczko-kokosowe": { "name": "Mleczko kokosowe", "unit_default": "ml", "calories_per_100g": 197, "category": "inne" },
"pierś-kurczaka": { "name": "Pierś kurczaka", "unit_default": "g", "calories_per_100g": 120, "category": "mieso-ryby" },
"rukola": { "name": "Rukola", "unit_default": "g", "calories_per_100g": 25, "category": "warzywa-owoce" },
"pomidorki-koktajlowe": { "name": "Pomidorki koktajlowe", "unit_default": "g", "calories_per_100g": 18, "category": "warzywa-owoce" },
"parmezan": { "name": "Parmezan", "unit_default": "g", "calories_per_100g": 431, "category": "nabial" },
"sok-cytrynowy": { "name": "Sok z cytryny", "unit_default": "łyżka", "calories_per_100g": 22, "category": "inne" },
"ziemniaki": { "name": "Ziemniaki", "unit_default": "g", "calories_per_100g": 77, "category": "warzywa-owoce" },
"maka-pszenna": { "name": "Mąka pszenna", "unit_default": "g", "calories_per_100g": 364, "category": "suche-produkty" },
"olej": { "name": "Olej roślinny", "unit_default": "łyżka", "calories_per_100g": 884, "conversion_to_grams": 14, "category": "inne" },
"chleb-tostowy": { "name": "Chleb tostowy", "unit_default": "szt", "calories_per_100g": 265, "conversion_to_grams": 30, "category": "pieczywo" },
"ryz-jasmynowy": { "name": "Ryż jaśminowy", "unit_default": "g", "calories_per_100g": 360, "category": "suche-produkty" },
"marchew": { "name": "Marchew", "unit_default": "szt", "calories_per_100g": 41, "conversion_to_grams": 100, "category": "warzywa-owoce" },
"groszek-mrozony": { "name": "Groszek mrożony", "unit_default": "g", "calories_per_100g": 80, "category": "warzywa-owoce" },
"sos-sojowy": { "name": "Sos sojowy", "unit_default": "łyżka", "calories_per_100g": 60, "category": "inne" },
"olej-sezamowy": { "name": "Olej sezamowy", "unit_default": "łyżka", "calories_per_100g": 884, "conversion_to_grams": 14, "category": "inne" }
```
