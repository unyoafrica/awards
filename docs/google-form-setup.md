# Connecting the nomination form to Google Forms

**Status:** connected. The form "Únyọ Award 2026 nominations" (owned by unyo.africa@gmail.com) was
created through the Google Forms API with the 29 questions below, and its id and entry codes are set
in `src/nomination.ts`. The steps below are kept for recreating or replacing the form.

The nomination page (`nominate.html`) collects and checks every answer itself, then sends it to a
Google Form you own. Responses appear in that form, and in a Google Sheet if you link one.

It takes about 15 minutes.

## 1. Create the Google Form

1. Go to [forms.google.com](https://forms.google.com) with the account that should own the nominations
   and create a blank form, for example "Únyọ Award 2026 nominations".
2. Add the 29 questions below, **in this order, with these types**.
   - Use only **Short answer** or **Paragraph**, as listed. Do not use multiple choice, dropdowns or
     checkboxes: the website already shows those choices and sends the chosen wording as text.
   - Leave **every question optional** (Required off). The website enforces the required fields; if
     Google also requires them, a nomination with an empty optional answer can be silently rejected.
   - Turn off **Settings → Responses → Collect email addresses** and **Limit to 1 response**. Both make
     Google reject submissions sent from the website.

| # | Question title (any wording works) | Type | Website field |
| --- | --- | --- | --- |
| 1 | Reference | Short answer | `submissionId` |
| 2 | Who are you nominating? | Short answer | `nominationType` |
| 3 | Nominator full name | Short answer | `nominatorName` |
| 4 | Nominator email | Short answer | `nominatorEmail` |
| 5 | Nominator phone | Short answer | `nominatorPhone` |
| 6 | How do you know this initiative? | Paragraph | `relationship` |
| 7 | Organisation or initiative name | Short answer | `organisation` |
| 8 | Founder or team lead's full name | Short answer | `leadName` |
| 9 | Founder or team lead's age | Short answer | `leadAge` |
| 10 | Initiative's contact email | Short answer | `email` |
| 11 | Initiative's phone number | Short answer | `phone` |
| 12 | Location and area of operation | Short answer | `location` |
| 13 | Type of initiative | Short answer | `organisationType` |
| 14 | When did its activities begin? | Short answer | `startDate` |
| 15 | Main social media profile link | Short answer | `socialLink` |
| 16 | Website link | Short answer | `website` |
| 17 | Main area of cultural tourism work | Short answer | `category` |
| 18 | Confirms youth-led and Nigerian | Short answer | `nigerian` |
| 19 | Activities in the past two years | Paragraph | `activities` |
| 20 | How it preserves or promotes Nigerian culture | Paragraph | `culturalImpact` |
| 21 | Who benefits and what difference it has made | Paragraph | `communityBenefit` |
| 22 | Participation or reach | Paragraph | `reach` |
| 23 | What is distinctive about the approach | Paragraph | `innovation` |
| 24 | Evidence links | Paragraph | `evidenceLinks` |
| 25 | Confirms activity in the past two years | Short answer | `active` |
| 26 | How the ₦100,000 grant would be used | Paragraph | `grantUse` |
| 27 | How the work could continue or grow | Paragraph | `futurePlans` |
| 28 | Confirms information is accurate | Short answer | `accurate` |
| 29 | Consents to sharing for assessment | Short answer | `consent` |

The four confirmation questions (18, 25, 28, 29) arrive as "Yes".

## 2. Get the connection details

1. In the form editor, open the **⋮** menu and choose **Get pre-filled link**.
2. Type a placeholder in every question (for example `x`), then click **Get link** and **Copy link**.
3. Send that link to the developer (or to Claude). It contains the form's id and one
   `entry.123456789` code per question, which is everything needed to connect the website.

## 3. What happens next

The developer fills in `googleForm` in `src/nomination.ts` with the form id and the 29 entry codes,
then sends one test nomination and confirms it appears in the form's **Responses** tab.

Optional: in **Responses**, click **Link to Sheets** to collect nominations in a spreadsheet.

## Limits to know

- Google does not report back to the website whether a response was accepted. The page shows the
  confirmation once the response has been sent; follow the rules in step 1 so Google never rejects one.
- Anyone who finds the form id could post to it directly. The website's hidden spam trap only filters
  simple bots; review responses before shortlisting.
