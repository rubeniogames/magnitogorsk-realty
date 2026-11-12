// The public catalog starts empty; real listings will be connected separately.
export const REGION = Object.freeze({
  center: [53.458342, 59.350090],
  bounds: [[52.35, 56.65], [54.6, 62.05]],
  minZoom: 8.6,
  maxZoom: 18,
});

export const LISTINGS = [];

export function numberOrNull(value) {
  const cleaned = String(value ?? '').replace(/\s/g,'').replace(',','.');
  if (!cleaned) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function filterListings(items, filters = {}) {
  const text = (filters.settlement || '').trim().toLocaleLowerCase('ru');
  const min = numberOrNull(filters.priceMin), max = numberOrNull(filters.priceMax);
  const areaMin = numberOrNull(filters.areaMin), areaMax = numberOrNull(filters.areaMax);
  const landMin = numberOrNull(filters.landMin);
  const result = items.filter(item => {
    if (filters.deal && item.deal !== filters.deal) return false;
    if (filters.type && filters.type !== 'all' && item.type !== filters.type) return false;
    if (text && !item.settlement.toLocaleLowerCase('ru').includes(text)) return false;
    if (min !== null && item.price < min || max !== null && item.price > max) return false;
    // Units differ: area in m² for houses/apartments, in sotkas for land.
    if (filters.type && filters.type !== 'all') {
      if (areaMin !== null && item.area < areaMin || areaMax !== null && item.area > areaMax) return false;
    }
    if (filters.type === 'house' && landMin !== null && item.land < landMin) return false;
    if (filters.type === 'apartment' && filters.rooms &&
      (filters.rooms === '4+' ? item.rooms < 4 : item.rooms !== Number(filters.rooms))) return false;
    if (filters.type === 'land' && filters.landUse && item.landUse !== filters.landUse) return false;
    return true;
  });
  return result.sort((a,b) => filters.sort === 'price-asc' ? a.price-b.price :
    filters.sort === 'price-desc' ? b.price-a.price : b.date-a.date);
}

export function money(value, compact = false) {
  if(compact && value >= 1000000) return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(value/1000000)+' млн';
  if(compact && value >= 1000) return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(value/1000)+' тыс.';
  return new Intl.NumberFormat('ru-RU').format(value)+' ₽';
}
export const typeNames = {house:'Дом',apartment:'Квартира',land:'Участок'};
export function summary(item) {
  if(item.type === 'house') return `${item.area} м² · ${item.land} сот. · ${item.rooms} комн.`;
  if(item.type === 'land') return `${item.area} сот. · ${item.landUse === 'izhs' ? 'ИЖС' : 'Земельный участок'}`;
  return `${item.rooms}-комн. · ${item.area} м² · ${item.floor}/${item.floors} этаж`;
}
