import test from 'node:test';
import assert from 'node:assert/strict';
import {LISTINGS as PUBLIC_LISTINGS,filterListings,numberOrNull,REGION} from '../web/domain.js';
// Fixtures are used only by tests, never by the public catalog.
const LISTINGS = [
  {id:'demo-1',type:'house',deal:'sale',title:'Светлый дом с большой террасой',settlement:'Красная Башкирия',price:7850000,area:132,land:8,rooms:4,lat:53.467,lng:58.887,image:'house',tag:'Терраса и свой сад',date:6},
  {id:'demo-2',type:'apartment',deal:'sale',title:'Двухкомнатная с просторной кухней',settlement:'Магнитогорск',price:6450000,area:64,rooms:2,floor:5,floors:10,lat:53.395,lng:58.974,image:'apartment',tag:'Светлая планировка',date:5},
  {id:'demo-3',type:'land',deal:'sale',title:'Участок для дома за городом',settlement:'Агаповка',price:1650000,area:10,landUse:'izhs',lat:53.298,lng:59.137,image:'land',tag:'ИЖС',date:4},
  {id:'demo-4',type:'house',deal:'sale',title:'Дом для спокойной загородной жизни',settlement:'Ташбулатово',price:9200000,area:148,land:12,rooms:4,lat:53.587,lng:58.549,image:'house',tag:'Рядом с природой',date:3},
  {id:'demo-5',type:'apartment',deal:'rent',title:'Уютная квартира на длительный срок',settlement:'Магнитогорск',price:32000,area:42,rooms:1,floor:3,floors:9,lat:53.421,lng:58.999,image:'apartment',tag:'Длительная аренда',date:2},
  {id:'demo-6',type:'land',deal:'sale',title:'Земля в окружении гор',settlement:'Аскарово',price:2100000,area:15,landUse:'izhs',lat:53.337,lng:58.512,image:'land',tag:'ИЖС',date:1},
];
test('public catalog contains no seeded listings',()=>assert.deepEqual(PUBLIC_LISTINGS,[]));
test('filters by deal, type, settlement and budget together',()=>{assert.deepEqual(filterListings(LISTINGS,{deal:'sale',type:'house',settlement:'  КРАСНАЯ ',priceMin:7000000,priceMax:8000000}).map(x=>x.id),['demo-1']);});
test('rental prices never mix into sale results',()=>{assert.equal(filterListings(LISTINGS,{deal:'rent'}).length,1);assert.ok(filterListings(LISTINGS,{deal:'sale'}).every(x=>x.deal==='sale'));});
test('type-specific parameters use correct units',()=>{assert.deepEqual(filterListings(LISTINGS,{type:'land',areaMin:12,landUse:'izhs'}).map(x=>x.id),['demo-6']);assert.deepEqual(filterListings(LISTINGS,{type:'house',landMin:10}).map(x=>x.id),['demo-4']);assert.deepEqual(filterListings(LISTINGS,{type:'apartment',rooms:'2',areaMax:70}).map(x=>x.id),['demo-2']);});
test('stale type-specific filters cannot affect all-property search',()=>{assert.equal(filterListings(LISTINGS,{type:'all',areaMin:1000,rooms:'9',landUse:'snt'}).length,LISTINGS.length);});
test('no-result search, sorting, invalid numeric input',()=>{assert.equal(filterListings(LISTINGS,{settlement:'Нет такого посёлка'}).length,0);assert.equal(filterListings(LISTINGS,{sort:'price-asc'})[0].id,'demo-5');assert.equal(numberOrNull(''),null);assert.equal(numberOrNull('1 500,5'),1500.5);assert.equal(numberOrNull('Infinity'),null);});
test('reference zoom is bounded and coordinates stay within region',()=>{assert.equal(REGION.minZoom,8.6);assert.ok(REGION.maxZoom>REGION.minZoom);for(const item of LISTINGS){assert.ok(item.lat>REGION.bounds[0][0]&&item.lat<REGION.bounds[1][0]);assert.ok(item.lng>REGION.bounds[0][1]&&item.lng<REGION.bounds[1][1]);}});
