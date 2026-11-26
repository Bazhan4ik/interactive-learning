/**
 * Introduction to vectors: definition and notation, addition and
 * subtraction, scalar multiplication, and the dot product.
 */
import { defineLesson } from '#lesson';
import definition from './1-what-is-a-vector.md?raw';
import addition from './2-addition.md?raw';
import additionScene from './2-addition.scene';
import scaling from './3-scaling.md?raw';
import scalingScene from './3-scaling.scene';
import dotProduct from './4-dot-product.md?raw';
import dotProductScene from './4-dot-product.scene';

export default defineLesson({
	title: 'Introduction to vectors',
	sections: [
		{ title: 'Vector definition and notation', text: definition },
		{ title: 'Vector addition and subtraction', text: addition, scene: additionScene },
		{ title: 'Scalar multiplication', text: scaling, scene: scalingScene },
		{ title: 'The dot product', text: dotProduct, scene: dotProductScene }
	]
});
