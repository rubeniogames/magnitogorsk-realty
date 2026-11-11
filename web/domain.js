// All entries are fictional examples. Coordinates are approximate, not addresses.
export const REGION = Object.freeze({
  center: [53.458342, 59.350090],
  bounds: [[52.35, 56.65], [54.6, 62.05]],
  minZoom: 8.6,
  maxZoom: 18,
});

export const LISTINGS = [
  {id:'demo-1',type:'house',deal:'sale',title:'Светлый дом с большой террасой',settlement:'Красная Башкирия',price:7850000,area:132,land:8,rooms:4,lat:53.467,lng:58.887,image:'house',tag:'Терраса и свой сад',date:6},
  {id:'demo-2',type:'apartment',deal:'sale',title:'Двухкомнатная с просторной кухней',settlement:'Магнитогорск',price:6450000,area:64,rooms:2,floor:5,floors:10,lat:53.395,lng:58.974,image:'apartment',tag:'Светлая планировка',date:5},
  {id:'demo-3',type:'land',deal:'sale',title:'Участок для дома за городом',settlement:'Агаповка',price:1650000,area:10,landUse:'izhs',lat:53.298,lng:59.137,image:'land',tag:'ИЖС',date:4},
  {id:'demo-4',type:'house',deal:'sale',title:'Дом для спокойной загородной жизни',settlement:'Ташбулатово',price:9200000,area:148,land:12,rooms:4,lat:53.587,lng:58.549,image:'house',tag:'Рядом с природой',date:3},
  {id:'demo-5',type:'apartment',deal:'rent',title:'Уютная квартира на длительный срок',settlement:'Магнитогорск',price:32000,area:42,rooms:1,floor:3,floors:9,lat:53.421,lng:58.999,image:'apartment',tag:'Длительная аренда',date:2},
  {id:'demo-6',type:'land',deal:'sale',title:'Земля в окружении гор',settlement:'Аскарово',price:2100000,area:15,landUse:'izhs',lat:53.337,lng:58.512,image:'land',tag:'ИЖС',date:1},
];

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
