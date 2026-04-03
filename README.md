# payfornothing.store

> nothing. now with ai.

---

## Files

```
index.html        — the complete site
api/generate.js   — Vercel edge function (keeps Anthropic key safe)
vercel.json       — Vercel routing config
```

---

## Deploy in 10 minutes

### 1. Get accounts (if you haven't already)
- [Vercel](https://vercel.com) — free hosting
- [Anthropic](https://console.anthropic.com) — AI, add $5 credit
- [Stripe](https://stripe.com) — payments (start verification today, takes 24–48h)

### 2. Deploy to Vercel
- Push this folder to a GitHub repo
- Connect the repo in Vercel dashboard
- Or drag the folder into vercel.com/new

### 3. Add your Anthropic key
In Vercel dashboard → Project → Settings → Environment Variables:
```
ANTHROPIC_API_KEY = sk-ant-your-key-here
```

### 4. Enable the API in index.html
Open `index.html`, find the CONFIG block near the top and change:
```js
useApi: false  →  useApi: true
```
Also remove the `anthropicKey` line — it's no longer needed since
the serverless function handles it.

The fetch in `fetchAiJoke()` is already pointed at `/api/generate`.

### 5. Connect your domain
In Vercel dashboard → Project → Settings → Domains:
Add `payfornothing.store` and follow the DNS instructions.

### 6. Add Stripe (when you're ready)
The simplest approach:
1. Create a Stripe Payment Link in your dashboard
2. Enable "Customer chooses price"
3. Set success redirect to `https://payfornothing.store/?paid=1`
4. Replace the `handlePay()` function body with a redirect:
   `window.location.href = 'YOUR_STRIPE_PAYMENT_LINK'`

For the full flow (name + qty + AI receipt after real payment),
you'll need a second serverless function to verify the Stripe
session — ask for `api/checkout.js` when you're ready for that.

---

## Customise

Everything you need is in the `CONFIG` object at the top of the script:

```js
const CONFIG = {
  anthropicKey: '...',   // remove once API is on server
  useApi: false,         // flip to true after step 4
  taxLabel: 'Tax for Nothing',
  currency: '$',
  siteName: 'payfornothing.store',
};
```

Tax options, amount buttons, and fallback messages are all in
clearly labelled sections directly below.

---

## nothing, inc.
nothing. now with ai.
