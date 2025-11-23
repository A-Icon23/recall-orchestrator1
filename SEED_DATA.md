# Quick Seed Script

To populate Firestore with sample multi-business/store data:

## Method 1: Via Browser (Easiest)

1. **Start your app**:
   ```powershell
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Run this**:
   ```javascript
   fetch('/api/seedMultiStore', { method: 'POST' })
     .then(r => r.json())
     .then(data => console.log('Seeded:', data))
   ```

## Method 2: Via curl

```powershell
curl -X POST http://localhost:5173/api/seedMultiStore
```

## Method 3: Via Vercel (Production)

```powershell
curl -X POST https://your-app.vercel.app/api/seedMultiStore
```

---

## What Gets Created:

### Businesses (2)
1. **FoodCorp Distribution**
   - 3 stores (NYC Downtown, NYC Uptown, Boston)
   - Industry: Food & Beverage
   
2. **FreshMart Groceries**
   - 2 stores (LA Main, LA Beach)
   - Industry: Retail

### Data Per Business
- 3-5 recalls (with severity levels)
- 10-15 refunds (pending & issued)
- Sample customers

---

**Total**: 2 businesses, 5 stores, ~10 recalls, ~20 refunds, ~10 customers
