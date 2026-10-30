import { loadDefaultGame } from '../src/data/defaultGame.ts';
import { auditProduction } from '../tests/helpers/productionContentAudit.mjs';
const rows=auditProduction(loadDefaultGame(),100);
console.log(JSON.stringify(rows,null,2));
