// Отдельный бандл записи экрана (entry rrweb-record в webpack).
// Не входит в lib.js: RecordTracker дозагружает его script-тегом
// только когда включена опция trackRecord
import { record } from '@rrweb/record';
import { pack } from '@rrweb/packer';
import { win } from './Browser';

win.rrwebRecord = { record };
win.rrwebPacker = { pack };
