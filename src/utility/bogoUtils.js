// bogoUtils.js
//
// Single source of truth for BOGO ("Buy 1 Get 1") pricing and removal
// rules across the POS cart tree: cart -> business.dish[] -> dish.data[].
//
// Mirrors the logic used in the React Native customer app's
// BogoSelectModal / useCartStore, adapted for this project's nested
// cart shape (a companion dish can live under a DIFFERENT `dish` node
// than the main/offer dish, so group membership has to be found by
// walking the whole tree instead of filtering one flat array).
//
// Rule recap:
//  - Every line that belongs to one BOGO "round" shares a bogo_group_id.
//  - Of all members currently in a group, whichever ONE has the lowest
//    regular (list) price gets the discount% applied + is_bogo_free=true.
//    Every other member in the group is charged its full regular price.
//  - With 0 or 1 member, the pairing isn't complete yet, so nobody is
//    discounted.
//  - A discounted (is_bogo_free) line can always be removed. A full-price
//    line in a group can only be removed once no discounted sibling
//    remains in that same group (ordered removal).
//
// Adjust the relative import path wherever you place this file.

export const listPriceOf = entry => {
  const n = Number(entry?.delprice ?? entry?.price ?? 0);
  return isNaN(n) ? 0 : n;
};

// Two lines are only "the same line" (safe to merge/increment) if their
// id, relation/options, AND bogo_group_id all match. This stops a BOGO
// row from ever being silently merged into a pre-existing plain row, and
// stops two independent BOGO rounds of the same dish from merging into
// each other.
export const sameBogoGroup = (entryA, entryB) =>
  (entryA?.bogo_group_id || null) === (entryB?.bogo_group_id || null);

// Walk the whole cart tree and collect every data entry that belongs to
// a given bogo_group_id, along with its tree indices so callers can
// mutate it in place.
export const findBogoGroupEntries = (cart, groupId) => {
  const found = [];
  if (!groupId || !Array.isArray(cart)) return found;

  for (let i = 0; i < cart.length; i++) {
    const businessDishes = cart[i]?.dish || [];
    for (let j = 0; j < businessDishes.length; j++) {
      const dataArr = businessDishes[j]?.data || [];
      for (let k = 0; k < dataArr.length; k++) {
        if (dataArr[k]?.bogo_group_id === groupId) {
          found.push({ i, j, k, entry: dataArr[k] });
        }
      }
    }
  }
  return found;
};

const round2 = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const stampBogoBase = d => {
  if (d.bogo_list_price != null) return;
  d.bogo_list_price = Number(d.price) || 0;
  d.bogo_options_extra = Math.max(
    0,
    round2(Number(d.totalprice) - Number(d.price)),
  );
};

export const syncBogoPricingInCart = (
  cart,
  groupId,
  discountPercent,
  offerName,
) => {
  const members = findBogoGroupEntries(cart, groupId);
  if (members.length === 0) return cart;

  members.forEach(({ entry }) => stampBogoBase(entry));

  let winnerEntry = null;
  if (members.length > 1) {
    winnerEntry = members[0].entry;
    members.forEach(m => {
      if (m.entry.bogo_list_price < winnerEntry.bogo_list_price) {
        winnerEntry = m.entry;
      }
    });
  }

  const pct = Number(discountPercent || 0);

  members.forEach(({ i, j, k, entry }) => {
    const isWinner = winnerEntry !== null && entry === winnerEntry;
    const base = entry.bogo_list_price;
    const extra = entry.bogo_options_extra || 0;
    const qty = parseInt(entry.quantity, 10) || 1;

    const discountedBase = isWinner ? round2(base * (1 - pct / 100)) : base;
    const finalUnit = round2(discountedBase + extra);

    const d = cart[i].dish[j].data[k];
    d.totalprice = finalUnit;
    d.total = (finalUnit * qty).toFixed(2);
    d.is_bogo_free = isWinner;
    d.offer_name = isWinner ? offerName || null : null;
    d.bogo_discount_applied = isWinner ? round2(base - discountedBase) : 0;
    d.bogo_discount_percent = pct;
    d.bogo_offer_name = offerName || null;
  });

  return cart;
};

// Re-run pricing for a group using whatever discount%/offer name is
// already stamped on a surviving member. Call this after any removal
// from a BOGO group so the remaining line(s) get re-evaluated (e.g. the
// group drops to 1 member -> that member goes back to full price).
export const resyncBogoGroup = (cart, groupId) => {
  if (!groupId) return cart;
  const members = findBogoGroupEntries(cart, groupId);
  if (members.length === 0) return cart;
  const { bogo_discount_percent, bogo_offer_name } = members[0].entry;
  return syncBogoPricingInCart(
    cart,
    groupId,
    bogo_discount_percent || 0,
    bogo_offer_name,
  );
};

export const isBogoGroupItem = entry => !!entry?.bogo_group_id;

// Ordered-removal guard: discounted line can always go; a full-price
// sibling is blocked while a discounted sibling is still in the group.
export const canRemoveBogoItem = (cart, entry) => {
  if (!entry) return true;
  if (entry.is_bogo_free) return true;

  const members = findBogoGroupEntries(cart, entry.bogo_group_id);
  if (members.length <= 1) return true;

  const offerLineStillPresent = members.some(m => m.entry.is_bogo_free);
  return !offerLineStillPresent;
};

// Convenience: tag the most-recently-added data entry for a given dish
// id under a given business as a BOGO group member. Used right after a
// normal addDishToCartArray() call to retroactively mark that line as
// the group's "main" without having to special-case the add path.
export const tagLastDataEntryForDish = (cart, businessId, dishId, fields) => {
  const business = (cart || []).find(b => b.id === businessId);
  if (!business) return cart;
  const dishEntry = business.dish.find(d => d.id === dishId);
  if (!dishEntry || dishEntry.data.length === 0) return cart;
  Object.assign(dishEntry.data[dishEntry.data.length - 1], fields);
  return cart;
};

// Default shape for the new BOGO fields every cart `data` entry should
// carry, so spreading this into a freshly-built data object keeps every
// entry's shape consistent whether or not it's part of a BOGO group.
export const emptyBogoFields = () => ({
  bogo_group_id: null,
  is_bogo_main: false,
  is_bogo_free: false,
  offer_name: null,
  bogo_discount_applied: 0,
  bogo_discount_percent: 0,
  bogo_offer_name: null,
  bogo_list_price: null,
  bogo_options_extra: 0,
});