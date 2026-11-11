import test from 'node:test';
import assert from 'node:assert/strict';
import {LISTINGS,filterListings,numberOrNull,REGION} from '../web/domain.js';
test('filters by deal, type, settlement and budget together',()=>{assert.deepEqual(filterListings(LISTINGS,{deal:'sale',type:'house',settlement:'  КРАСНАЯ ',priceMin:7000000,priceMax:8000000}).map(x=>x.id),['demo-1']);});
test('rental prices never mix into sale results',()=>{assert.equal(filterListings(LISTINGS,{deal:'rent'}).length,1);assert.ok(filterListings(LISTINGS,{deal:'sale'}).every(x=>x.deal==='sale'));});
test('type-specific parameters use correct units',()=>{assert.deepEqual(filterListings(LISTINGS,{type:'land',areaMin:12,landUse:'izhs'}).map(x=>x.id),['demo-6']);assert.deepEqual(filterListings(LISTINGS,{type:'house',landMin:10}).map(x=>x.id),['demo-4']);assert.deepEqual(filterListings(LISTINGS,{type:'apartment',rooms:'2',areaMax:70}).map(x=>x.id),['demo-2']);});
test('stale type-specific filters cannot affect all-property search',()=>{assert.equal(filterListings(LISTINGS,{type:'all',areaMin:1000,rooms:'9',landUse:'snt'}).length,LISTINGS.length);});
test('no-result search, sorting, invalid numeric input',()=>{assert.equal(filterListings(LISTINGS,{settlement:'Нет такого посёлка'}).length,0);assert.equal(filterListings(LISTINGS,{sort:'price-asc'})[0].id,'demo-5');assert.equal(numberOrNull(''),null);assert.equal(numberOrNull('1 500,5'),1500.5);assert.equal(numberOrNull('Infinity'),null);});
test('reference zoom is bounded and coordinates stay within region',()=>{assert.equal(REGION.minZoom,8.6);assert.ok(REGION.maxZoom>REGION.minZoom);for(const item of LISTINGS){assert.ok(item.lat>REGION.bounds[0][0]&&item.lat<REGION.bounds[1][0]);assert.ok(item.lng>REGION.bounds[0][1]&&item.lng<REGION.bounds[1][1]);}});
