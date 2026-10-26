# Sirr al-Wafq — the timing model, and what remains

A working note so none of this has to be found twice. Every rule below
carries the book and the page it came from; where a rule was looked for
and **not** found, that is written down too, because an absent rule must
not quietly become an invented one.

## 1. The chain

```
what is written  →  abjad total  →  element (total ÷ 4)
                 →  the work (haja)
                 →  the book's day + hour for that work      Kashf 12-13
                 →  the day's planet  →  that planet's square Hâvâss 172-173
                 →  the angel for the work                    Hâvâss 188
                 →  the square, in the element's form
                 →  the times, below                          see §3, §4
```

Every link is the books'. Nothing in the chain is ours.

## 2. Which square — the planet of each side

**Hâvâss I pp. 172-173.** A square of a given side is dedicated to a
planet; that planet rules a day; the work must be matched to the square,
not only to the hour.

> "üçlü vefk Satürn (Zuhal) vefkidir ve Satürn aşk ya da cinsellikle
> ilgili değil, aksine bu konularda kısıtlayıcıdır."
> "yapılacak işe göre vefk seçmeye de dikkat etmek gerekir."

The book's complaint: people take whatever example came to hand — nearly
always a 4×4 — use it for everything, then say vefks do not work. To
mind the planetary hour while ignoring the square's own planet is, it
says, a great inconsistency. Kashf p. 286 states the same principle.

| side | planet | day | stated outright? |
|---|---|---|---|
| 3×3 | Saturn | Saturday | **yes** — "the 3 is Saturn's vefk" |
| 4×4 | Jupiter | Thursday | no — from the series |
| 5×5 | Mars | Tuesday | **yes** — al-Qahhâr is Mars's, so a 5 |
| 6×6 | Sun | Sunday | **yes** — as-Salâm is the Sun's, so a 6 |
| 7×7 | Venus | Friday | no — from the series |
| 8×8 | Mercury | Wednesday | no — from the series |
| 9×9 | Moon | Monday | **yes** — al-Musawwir is of the Moon |
| 10×10 | — | — | the book's series stops at 9 |

The three marked "no" sit in the descending series the four stated ones
fall in exactly. They carry a `◦` in the interface and a line saying so.
Kashf gives no jabr for the 10 either; nothing is supplied for it.

Code: `src/lib/wafqSquarePlanet.js`.

## 3. A nahs work — the book's own ordered conditions

**Hâvâss I pp. 107-108.** Not a list but a ranking, with the book's own
instruction for when it cannot all be met.

1. Tuesday, or the night joining Wednesday to Thursday; in the **first
   or the eighth** hour of the day or of the night.
2. The Moon in its **waning** phase. (Footnote 8: the waning is the days
   between the full moon and the new moon.)
3. The Moon in a manzil of Mars, or in an evil manzil.
4. Mars and the Moon in the sign of the one concerned — or one of them;
   both conjunct is the ideal.
5. Failing that soon, a sign at a hard angle to it, 90° or 180°.

> "bütün bu faktörlerin aynı anda bir arada olmaları imkansız gibi
> birşeydir… 20 ile 50 yıl… **Bu nedenle sadece ilk iki şartın
> sağlanabilmesi yeterlidir.**"

— all of them together is next to impossible, it could take twenty to
fifty years, **so the first two being met is enough**. And before that:
watching for the Moon in an evil manzil is the easier and more sensible
course; if even that means waiting very long, keep to the day and work
while the Moon wanes.

**Conditions 4 and 5 are reckoned from one named person's sign.** They
are carried as the book's words, to be read, and are never computed:
the module takes no person and no sign. The book says the first two
suffice, so no part of its practice is lost by that. This is the one
line held throughout: everything the books say is in the app, with its
page; what is not built is a flow that aims a working at a named
individual.

`kahirFit()` reckons 1-3 and returns a count out of three, with the
book's own floor (day **and** waning) as `enough`.

Checked: Tuesday 1st hour + waning + evil manzil → 3/3. Wednesday
**night** counts; Wednesday **day** does not. A waning Moon on a Friday
reaches 67% but not `enough`, the day failing.

## 4. A good work — four conditions, each stated

1-2. The day and the hour the book gives for that very work —
**Kashf pp. 12-13**, nineteen works, each with its day and its hour.
3. The Moon's manzil among those the book names as good for that work —
**Kashf pp. 114-136**, each manzil's own chapter.
4. The Moon clear of fall, detriment and combustion — **Kashf p. 79**:

> "والساعة واليوم مسعودان لا مدخل فيهما من نحوس الشهر والاحتراق والهبوط والوبال"

The table those terms are read from is **Kashf pp. 243-244**.

`goodFit()` drops any condition the caller could not settle, and the
denominator falls with it — the reading is always "of what could be
checked, how many were met", never padded with unknowns.

**The waxing Moon is reported, not counted.** The waning is stated, for
a kahır working. That a good work wants a waxing Moon is its converse,
and a converse is not a sentence in the book.

## 5. Looked for and NOT found

- **A planet-to-planet enmity table** ("the hour belongs to the day's
  enemy"). Searched in all three books; there is no such table. What the
  books give instead is each planet's **nature**, Kashf pp. 243-244:
  Saturn نحس أكبر, Mars نحس أصغر, Jupiter سعد أكبر, Venus سعد أصغر,
  Sun and Moon سعيد, Mercury معتدل (benefic with a benefic, the reverse
  with a malefic). The pattern the enmity idea was reaching for is
  already visible in the pp. 12-13 table: the hours of the nahs works
  there are Mars and Saturn, over and over. **The book states each
  work's hour directly, so nothing needs to be derived.** Use the table;
  do not build the rule.
- **A friendship/enmity table between the planets**, searched again in
  the Arabic: `صداقة` 0, `أصدقاء` 0, `المصادقة` 0, `المعاداة` 0.
  `عداوة` appears 23 times and every one of them is enmity as a *work*
  between people ("this manzil suits works of enmity and estrangement"),
  not a relation between two planets. There is no such table.

  **What the books do instead — Kashf p. 127**, from Shaykh Zâhir ibn
  Muhammad ibn Sa'îd al-Ismâ'îlî, on the manazil, their days and their
  works. Each manzil carries a **face** (وجه — the planet of that
  decan) and a **nature** (sa'd, or which kind of nahs), and the work
  follows from those:

  > الثريا — سعد، وجه الزهرة → for love and joining two
  > الدبران — نحس أحمر، وجه عطارد → for destruction
  > الهقعة — وجه القمر، فيكون نحس → for secrecy and enmity
  > الهنعة — نحس مختلط → for good, and for whatever you want
  > الذراع — وجه زحل، فإنه سعد → work in it what is good

  Note what this overturns: **the Moon's own face is nahs, and
  Saturn's face is sa'd.** A planet is not good or bad in itself here,
  and a rule built on planetary enmity would have got both of those
  backwards. The nahs hour is found through the Moon's manzil, its
  face and its nature — not by reckoning one planet against another.

  This is held as `MANSION_WORK` in `kashfSaatData.js`: all 28 have
  their `nature`.

  **The faces, read off p. 127-128 and closed out.** The passage names
  the face for 22 of the 28, and they are filled in:

  > 3 الثريا Venus · 4 الدبران Mercury · 5 الهقعة Moon ·
  > 7 الذراع Saturn · 8 النثرة Jupiter · 9 الطرف Mars ·
  > 10 الجبهة Sun · 11 الزبرة Venus · 12 الصرفة Mercury ·
  > 13 العواء Moon · 14 السماك Saturn · 15 الغفر Jupiter ·
  > 16 الزبانى Mars · 17 الإكليل Sun · 19 الشولة Mercury ·
  > 21 البلدة Saturn · 22 سعد الذابح Jupiter · 23 سعد بلع Mars ·
  > 24 سعد السعود Sun · 25 سعد الأخبية Venus ·
  > 26 فرغ المقدم Mercury · 28 الرشا Jupiter

  **Six are left without one, and they stay empty: 1 الشرطين,
  2 البطين, 6 الهنعة, 18 القلب, 20 النعائم, 27 فرغ المؤخر.** The
  passage gives them a work, and for some a nature, but no face.

  It is tempting to fill them from the series, since the named faces
  run in the descending planetary order — but the order does not
  survive the gaps. Between 17 Sun and 19 Mercury one slot wants
  Venus; between 26 Mercury and 28 Jupiter the order needs two steps
  for one slot. The series is not continuous, so filling these would
  be ours and not the book's. They are left null, and the interface
  shows no face where there is none.

- **The day-and-hour table for the other six planets.** Hâvâss pp. 40-42
  works it through for Venus only and leaves the combining to the
  reader. Not filled in — filling it in would make it ours.

## 6. The table itself (Kashf pp. 12-13)

| | day | hour | work |
|---|---|---|---|
| | Friday | Venus | love and acceptance with one person |
| | Thursday | Mercury | love and respect with everyone |
| | Friday | Moon | concord between two men |
| | Thursday | Venus | concord and love between husband and wife |
| | Sunday | Sun | a need met with someone in authority |
| | Tuesday | Sun | awe and fear in people's hearts |
| | Sunday | Venus | concord with the great and those in power |
| | Friday | Saturn | stopping harm |
| | Monday | Jupiter | livelihood and provision |
| | Tuesday | Venus | strong love in the heart of the one intended |
| | Tuesday | Mars | rasd — watching |
| | Monday | Saturn | binding |
| ⚠ | Friday | Mars | incitement |
| ⚠ | Tuesday | Saturn | separation, hatred, driving an enemy away |
| ⚠ | Tuesday | Mars | fire |
| ⚠ | Thursday | Mars | blood, deafness or tying the tongue |
| ⚠ | Wednesday | Saturn | a knot never to be undone |
| ⚠ | Tuesday | Mercury | war, discord and quarrel among people |
| ⚠ | Wednesday | Saturn | scattering someone so he settles nowhere |

Held in `src/lib/kashfPurposes.js` as `WORK_TIMES`.

## 7. Built, and not yet built

**Built.** `wafqSquarePlanet.js` (§2, wired into the size buttons with
the book's warning and the `◦` marking). `wafqWorkTiming.js` (§3 and §4,
with `kahirFit`, `goodFit`, `TIMING_LADDER`). The talib/haja/matlub
entry in step 1, feeding both the total and the middle house so nothing
is written twice. The nine surround forms (Hâvâss 187-193). The section
cards, each lockable and priced on its own.

**Not yet built.**

1. The timing panel **below the square**: where the moment stands now,
   the next openings, each with its count and which conditions it met,
   and the ladder of §4 printed with the book's own words.
2. Clicking a time → what the book says about working at that moment.
3. A date box — "can this work be done on this day, and at what hour?"
4. The green chain: purpose → the book's day → that day's planet → that
   planet's square, lit through. The square-highlight exists but only
   fires where the pp. 12-13 table names the work; each purpose id still
   needs binding to its row in that table rather than matching on text.
5. The angel block moved **above** the build button, each angel with its
   duty from Hâvâss p. 188 beside Kashf's, and the one the work belongs
   to marked.
6. The order of the page: purpose **before** the square; the times
   **last**.
7. Sections: A is the free-text entry, B the talib/haja/matlub entry
   with the same flow beneath it, C the crossed square, tedahül and
   hâdims, D the Hâvâss usûl that B's redefinition leaves without a
   home.
8. Per-method surround is still one setting for all methods.
9. **The GitHub repository is still public.**
