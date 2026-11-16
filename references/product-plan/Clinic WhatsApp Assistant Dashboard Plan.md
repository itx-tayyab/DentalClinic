# Clinic WhatsApp Assistant Dashboard Plan

Nov 13, 2026 · @Deep Dev Solutions

A read only app where the doctor sees today's appointments: how many, when, who, and for which service. Bookings, cancellations and reschedules still happen only through the WhatsApp bot.

## 1. Decisions

| Question | Answer |
| --- | --- |
| Market | Built for US clinics. First testing with a clinic in Pakistan |
| Where it lives | Its own app, separate from DeepKhata |
| Who uses it | The doctor |
| What it does | Shows appointments only: how many today, and at each time who is coming and for what service |
| Who books | Only the WhatsApp bot. The app never creates, cancels or moves an appointment |

This cuts the earlier plan by about 80 percent. No inbox, no alerts queue, no Postgres event log and no n8n changes are needed for v1.

## 2. What the doctor sees

One main screen, built for a phone first because that's where a doctor checks between patients.

**Today**

1. **Header:** the date, the clinic name and the count, e.g. "8 appointments today".
2. **Service breakdown:** small chips like Cleaning 3, Filling 2, Root canal 1, Whitening 1, Extraction 1.
3. **Next up card:** the next patient's name, service and time, with "in 25 min" or "now".
4. **Day list in time order.** Each row shows start and end time, patient name, service, duration and status (upcoming, now, done). It also shows a small tag for booked by the bot or added by hand, and the patient's number, which opens a call or WhatsApp on tap.
5. **Free gaps** between appointments shown as quiet empty rows, so the doctor sees where the day has room.

**Around it**

- **Day switcher:** yesterday, today, tomorrow, and a date picker for any day in the bot's 14 day booking range.
- **Week view** (desktop and tablet): seven columns with the same cards, for planning.
- **Login:** one login per clinic for now.
- **Auto refresh** every 60 seconds, so a booking the bot just made shows up without reloading.

**Left out on purpose:** cancelled appointment counts (see section 3), patient history and any editing.

## 3. Where the data comes from

Google Calendar already holds everything the doctor needs, so the app just reads the same calendar the bot writes to. No database of our own in v1.

The bot's Create Appointment node writes every booking in a fixed shape:

```text
Title:       Ayesha Khan - 923001234567 (Cleaning)
Description: Booked by the WhatsApp assistant. Patient phone: 923001234567
Start/End:   the slot, length taken from the service
```

| Field on screen | Taken from |
| --- | --- |
| Patient name | Title, text before " - " |
| Phone | Title, the digits |
| Service | Title, text inside the brackets |
| Time and duration | Event start and end, shown in the clinic's timezone |
| Bot or manual | Description starts with "Booked by the WhatsApp assistant" |

Events the receptionist adds by hand in another format still show, as "Manual" with their raw title.

**Two things to know:**

1. **The title format is now a contract.** If anyone edits the Create Appointment node's title, the app's parser breaks. Add a sticky note in n8n saying so.
2. **Cancelled appointments disappear.** The bot's Cancel node deletes the event, so the calendar keeps no trace. Reschedules are fine, since they only move the event. If the doctor later wants "2 cancelled today", that's one n8n change: log cancellations somewhere the app can read.

## 4. Stack and hosting

| Layer | Pick | Why |
| --- | --- | --- |
| App | Next.js App Router, TypeScript | Your stack. Server components fetch the calendar, nothing heavy in the browser |
| Calendar access | Google Calendar API with a service account, calendar shared with it as read only | Read only means the app physically can't change bookings |
| Auth | Auth.js with email and password, one user per clinic from env vars during testing | A users table only when clinic number two arrives |
| Database | None in v1 | Nothing to store: the calendar is the source of truth |
| UI | Tailwind and shadcn/ui |  |
| Install | PWA, so the doctor adds it to the phone's home screen like an app | No app store needed |
| Hosting | Vercel for the Pakistan test | Fits a stateless read only app. Revisit before the first US clinic (section 7) |

The clinic's timezone and calendar ID live in config, same values as the n8n Config node. Times are always shown in the clinic's timezone, never the browser's, so a doctor travelling still sees the clinic's day.

## 5. Design brief for Claude Design

Paste this as is:

```text
Design a read-only appointments app for a dentist. Bookings come from a
WhatsApp AI receptionist; the doctor only views them.
Demo clinic: Bright Smile Dental Clinic.

Mobile first (doctor checks between patients), plus desktop.

Screens:
1. Today (mobile + desktop)
   - Header: date, clinic name, "8 appointments today"
   - Service chips with counts: Cleaning 3, Filling 2, Root canal 1,
     Whitening 1, Extraction 1
   - "Next up" card: patient name, service, time, "in 25 min" / "Now"
   - Time-ordered list: start-end time, patient name, service, duration,
     status (upcoming / now / done), small "Bot" or "Manual" tag,
     phone number that opens call or WhatsApp
   - Free gaps shown as quiet empty rows between appointments
   - Day switcher: yesterday / today / tomorrow + date picker
2. Week view (desktop/tablet): 7 columns of the same cards
3. Login

States to design: no appointments today; clinic closed (Sunday);
appointment in progress right now; a busy day with 15 appointments;
a manual event with an unusual title; calendar can't be reached.

Visual direction: calm, clinical, light, lots of white space, one teal
accent. Each service gets its own soft colour, used consistently in chips
and list rows. Large readable times. No charts.

Realistic data: services Cleaning 30 min, Filling 45, Root canal 60,
Whitening 60, Extraction 45. Hours Mon-Fri 9:00-18:00, Sat 10:00-14:00,
Sunday closed. Mix of Pakistani and US patient names.
```

## 6. Build plan

| Phase | What | Done when |
| --- | --- | --- |
| 1. Design | Claude Design with the section 5 brief | You'd show it to the doctor without explaining anything |
| 2. Build | Next.js setup, login, service account access to the calendar, title parser, Today screen, day switcher | The phone shows exactly what Google Calendar shows for today, with name, time and service right |
| 3. Polish | Week view, PWA install, 60 second refresh, empty and error states | The doctor uses it for a week instead of opening Google Calendar |
| 4. Later | Cancelled counts, a "next patient in 10 min" notification, more clinics | Only if the doctor asks |

**Driving Claude Code well:**

1. Give it this doc and the design export, and put the stack rules from section 4 in `CLAUDE.md`, including "read only, never write to the calendar".
2. Build the title parser first, with unit tests on real titles from your test bookings, including Roman Urdu names, a manual event, and a title with brackets in the name.
3. Then the Today screen against your real test calendar, not made up data.
4. Keep the service account key in env vars only. Never commit it.

## 7. Risks

1. **US patient data.** A name, phone number and dental service together count as protected health information for a US clinic. Before the first US client: the calendar must sit in a Google Workspace account covered by Google's healthcare agreement, the host must be one that will sign that kind of agreement too, login stays mandatory, and no patient data goes into logs or analytics. The read only, store nothing design keeps this small, but doesn't remove it. Testing in Pakistan with test data is fine as is.
2. **Title format breaks.** Covered in section 3. One sticky note in n8n and a parser test suite.
3. **It may not beat Google Calendar.** The doctor can already see these events in the Google Calendar app. The app wins only if it's clearly faster to read: counts, next up, service colours, one tap to call. Ask the Pakistan test doctor after a week whether they actually open it.
4. **Timezone mistakes.** The test clinic runs on Asia/Karachi while the US clinic will run on a US timezone. Always render in the clinic's configured zone and test a booking near midnight.

## 8. Parked for later

The first version of this plan covered a full staff dashboard: a shared inbox where staff take over chats and reply from the clinic's WhatsApp number, an alerts queue for emergencies and handoffs, unanswered questions, clinic settings, insights and a multi clinic admin. All of it needs a Postgres event log and about ten n8n changes. It's out of scope now, and still in this doc's version history if the clinic asks for it.
