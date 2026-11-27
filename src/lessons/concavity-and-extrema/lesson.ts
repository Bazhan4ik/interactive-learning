/**
 * Comparison, Concavity and Local Extrema (MATH 137, Lecture 30).
 *
 * Comparison through derivatives and the logarithm bounds, the limit
 * (1 + 1/n)^n → e, concavity and inflection points, an RC-circuit physics
 * connection, and the first derivative test. Every section ends with a quiz;
 * most questions come from the lecture's own problems.
 *
 * Prompts use String.raw so LaTeX backslashes need no escaping.
 */
import { defineLesson } from '#lesson';
import comparison from './1-comparison.md?raw';
import comparisonScene from './1-comparison.scene';
import logBounds from './2-log-bounds.md?raw';
import logBoundsScene from './2-log-bounds.scene';
import limitE from './3-limit-e.md?raw';
import limitEScene from './3-limit-e.scene';
import concavity from './4-concavity.md?raw';
import concavityScene from './4-concavity.scene';
import inflection from './5-inflection.md?raw';
import inflectionScene from './5-inflection.scene';
import findInflectionScene from './5-quiz-find-inflection.scene';
import rcCircuit from './6-rc-circuit.md?raw';
import rcCircuitScene from './6-rc-circuit.scene';
import halfCurrentScene from './6-quiz-half-current.scene';
import firstDerivativeTest from './7-first-derivative-test.md?raw';
import firstDerivativeTestScene from './7-first-derivative-test.scene';
import cornerMinimumScene from './7-quiz-corner-minimum.scene';
import takeaways from './8-takeaways.md?raw';

export default defineLesson({
	title: 'Comparison, concavity and local extrema',
	sections: [
		{
			title: 'Comparing functions through their derivatives',
			text: comparison,
			scene: comparisonScene,
			quiz: [
				{
					type: 'choice',
					prompt: String.raw`Suppose $f'(x) > g'(x)$ for every $x$. Must $f(x) > g(x)$ for every $x$?`,
					options: ['Yes, always', 'No: without a common anchor, nothing follows about which is bigger', 'Only for $x < 0$'],
					answer: 1,
					explanation: String.raw`Take $f(x) = x$ and $g(x) = 100$. Then $f' = 1 > 0 = g'$, but $f(0) = 0 < 100 = g(0)$. Derivatives only control how the gap **changes**.`
				},
				{
					type: 'choice',
					prompt: String.raw`Suppose $f(3) = g(3)$ and $f'(x) \le g'(x)$ everywhere. What can you say at $x = 1$?`,
					options: [String.raw`$f(1) \le g(1)$`, String.raw`$f(1) \ge g(1)$`, '$f(1) = g(1)$', 'Nothing'],
					answer: 1,
					explanation: String.raw`$x = 1$ is to the **left** of the anchor, where the inequality reverses. $H = f - g$ is decreasing with $H(3) = 0$, so $H(1) \ge 0$.`
				},
				{
					type: 'choice',
					prompt: String.raw`If $f(0) = g(0)$ and $f(x) > g(x)$ for every $x > 0$, must $f'(x) > g'(x)$ for every $x > 0$?`,
					options: ['Yes', 'No'],
					answer: 1,
					explanation: String.raw`Let $f(x) = x(2 + \sin x)$ and $g(x) = 0$. Both are $0$ at $0$, and $f(x) > 0$ for $x > 0$ since $2 + \sin x \ge 1$. But $f'(x) = 2 + \sin x + x\cos x$, so $f'(\pi) = 2 - \pi < 0 = g'(\pi)$. The converse of the comparison theorem is false, even with a shared anchor.`
				}
			]
		},
		{
			title: 'Trapping the logarithm',
			text: logBounds,
			scene: logBoundsScene,
			quiz: [
				{
					type: 'number',
					prompt: String.raw`Use $x - \frac{x^2}{2} < \ln(1+x) < x$ with $x = 0.2$. What **lower** bound do you get for $\ln(1.2)$?`,
					answer: 0.18,
					tolerance: 0.0005,
					explanation: String.raw`$0.2 - \frac{0.2^2}{2} = 0.2 - 0.02 = 0.18$. Indeed $\ln(1.2) \approx 0.1823$, squeezed into $(0.18,\ 0.2)$.`
				},
				{
					type: 'choice',
					prompt: String.raw`In the proof of $\ln(1+x) < x$, which fact is used together with $\frac{1}{1+x} < 1$?`,
					options: ['Both functions equal $0$ at $x = 0$', 'Both functions are increasing', String.raw`$\ln$ is concave down`, '$x$ is positive'],
					answer: 0,
					explanation: 'The derivative comparison only controls how the gap changes. The shared anchor at $x = 0$ is what turns it into an inequality between the values.'
				}
			]
		},
		{
			title: 'Squeezing out e',
			text: limitE,
			scene: limitEScene,
			quiz: [
				{
					type: 'number',
					prompt: String.raw`Compute $\left(1 + \frac{1}{10}\right)^{10}$ to 3 decimal places.`,
					answer: 1.1 ** 10,
					tolerance: 0.001,
					explanation: String.raw`$1.1^{10} \approx 2.594$, still about $0.12$ below $e \approx 2.718$. The convergence is slow.`
				},
				{
					type: 'choice',
					prompt: String.raw`After showing $n\ln(1 + 1/n) \to 1$, why may we conclude that $\exp\big(n\ln(1 + 1/n)\big) \to e$?`,
					options: ['The exponential is continuous', 'The exponential is increasing', String.raw`$n\ln(1 + 1/n)$ is increasing`, 'The squeeze theorem'],
					answer: 0,
					explanation: String.raw`Continuity lets a limit pass through a function: if $a_n \to 1$, then $\exp(a_n) \to \exp(1) = e$.`
				}
			]
		},
		{
			title: 'Concavity: how slopes change',
			text: concavity,
			scene: concavityScene,
			quiz: [
				{
					type: 'choice',
					prompt: 'Can a function be increasing and concave down on the same interval?',
					options: [String.raw`Yes, for example $\sqrt{x}$ on $(0, \infty)$`, 'No: concave down means decreasing', 'Only at a single point'],
					answer: 0,
					explanation: String.raw`$f(x) = \sqrt{x}$ has $f'(x) = \frac{1}{2\sqrt{x}} > 0$ (increasing) and $f''(x) = -\frac{1}{4}x^{-3/2} < 0$ (concave down). Its slopes are positive but shrinking.`
				},
				{
					type: 'choice',
					prompt: String.raw`If $f'$ is increasing on an interval, what can you conclude about $f$ there?`,
					options: ['$f$ is increasing', '$f$ is concave up', '$f$ is concave up and increasing', '$f$ has an inflection point'],
					answer: 1,
					explanation: String.raw`Increasing slopes mean concave up. That says nothing about the **sign** of the slopes: $f(x) = x^2$ on $(-1, 0)$ has increasing slopes but is decreasing.`
				}
			]
		},
		{
			title: 'Inflection points',
			text: inflection,
			scene: inflectionScene,
			quiz: [
				{
					type: 'choice',
					prompt: String.raw`True or false: if $f''(c) = 0$, then $(c, f(c))$ is an inflection point.`,
					options: ['True', 'False'],
					answer: 1,
					explanation: String.raw`$f(x) = x^4$ has $f''(0) = 0$, but $f''(x) = 12x^2 > 0$ on both sides, so the concavity never changes. Zeros of $f''$ are only candidates.`
				},
				{
					type: 'number',
					prompt: String.raw`How many inflection points does $f(x) = x^4 - 6x^2$ have?`,
					answer: 2,
					tolerance: 0,
					explanation: String.raw`$f''(x) = 12(x - 1)(x + 1)$ changes sign at both $-1$ and $1$, giving $(-1, -5)$ and $(1, -5)$.`
				},
				{
					type: 'choice',
					prompt: String.raw`Does $f(x) = \frac{1}{x}$ have an inflection point at $x = 0$?`,
					options: [String.raw`Yes, because $f''$ changes sign across $0$`, 'No, because $0$ is not in the domain', String.raw`No, because $f''(0) \neq 0$`],
					answer: 1,
					explanation: String.raw`The concavity does change across $0$, but there is no point $(0, f(0))$ for it to happen at. An excluded input can't be an inflection point.`
				},
				{
					type: 'scene',
					prompt: String.raw`Drag the point to the inflection point of $g(x) = x^3 + 2x^2 - 1$.`,
					scene: findInflectionScene,
					explanation: String.raw`$g''(x) = 6x + 4$ changes sign from $-$ to $+$ at $x = -\frac{2}{3}$, and $g$ is continuous there, so the inflection point is $\left(-\frac{2}{3}, -\frac{11}{27}\right)$.`
				}
			]
		},
		{
			title: 'Physics: charging a capacitor',
			text: rcCircuit,
			scene: rcCircuitScene,
			quiz: [
				{
					type: 'choice',
					prompt: String.raw`For $Q(t) = Q_\infty(1 - e^{-t/\tau})$, how does the charge behave for $t > 0$?`,
					options: ['Increasing and concave down', 'Increasing and concave up', 'Decreasing and concave down', 'Decreasing and concave up'],
					answer: 0,
					explanation: String.raw`$Q' = \frac{Q_\infty}{\tau}e^{-t/\tau} > 0$ and $Q'' = -\frac{Q_\infty}{\tau^2}e^{-t/\tau} < 0$: it rises, ever more slowly.`
				},
				{
					type: 'number',
					prompt: String.raw`What fraction of $Q_\infty$ is on the capacitor at $t = \tau$? Give 2 decimal places.`,
					answer: 1 - Math.exp(-1),
					tolerance: 0.01,
					explanation: String.raw`$Q(\tau) = Q_\infty(1 - e^{-1}) \approx 0.632\,Q_\infty$.`
				},
				{
					type: 'scene',
					prompt: String.raw`With $\tau = 2\,\text{s}$, drag the point to the moment the current has dropped to **half** its starting value.`,
					scene: halfCurrentScene,
					explanation: String.raw`$e^{-t/\tau} = \frac{1}{2}$ gives $t = \tau\ln 2 = 2\ln 2 \approx 1.39\,\text{s}$. The halving time doesn't depend on the starting current.`
				}
			]
		},
		{
			title: 'The first derivative test',
			text: firstDerivativeTest,
			scene: firstDerivativeTestScene,
			quiz: [
				{
					type: 'number',
					prompt: String.raw`At which $x$ does $f(x) = \frac{x^3}{3} - \frac{3x^2}{2} + 2x + 1$ have its local **minimum**?`,
					answer: 2,
					explanation: String.raw`$f'(x) = (x - 1)(x - 2)$ changes from $-$ to $+$ at $x = 2$, so $\left(2, \frac{5}{3}\right)$ is a local minimum.`
				},
				{
					type: 'choice',
					prompt: String.raw`At a critical point $c$, $f' > 0$ on both sides. What is $c$?`,
					options: ['A local maximum', 'A local minimum', 'Neither'],
					answer: 2,
					explanation: String.raw`With the same strict sign on both sides, the values are lower on one side and higher on the other. Example: $x^3$ at $0$.`
				},
				{
					type: 'scene',
					prompt: String.raw`$g(x) = \tfrac{1}{2}\,|x^2 - 4|$ has points where $g'$ does not exist. Drag the point to a **local minimum** of $g$.`,
					scene: cornerMinimumScene,
					explanation: String.raw`At $x = \pm 2$ the graph has corners, so $g'(\pm 2)$ doesn't exist. But near $2$, $g' < 0$ on the left and $g' > 0$ on the right, and $g$ is continuous there, so the first derivative test still gives a local minimum. The same holds at $-2$.`
				}
			]
		},
		{
			title: 'Takeaways',
			text: takeaways,
			quiz: [
				{
					type: 'choice',
					prompt: String.raw`Which of these are **required** for $(c, f(c))$ to be an inflection point?`,
					options: [String.raw`$c$ is in the domain and $f$ is continuous at $c$`, 'The concavity changes across $c$', String.raw`$f''(c) = 0$`, String.raw`$f'(c) = 0$`],
					answer: [0, 1],
					explanation: String.raw`The definition asks only for continuity and a change of concavity. $f''(c) = 0$ follows when $f''$ is continuous at $c$, but it isn't part of the definition and isn't sufficient. $f'(c) = 0$ is unrelated: $x^3 - x$ has an inflection point at $0$ with $f'(0) = -1$.`
				},
				{
					type: 'choice',
					prompt: String.raw`On which intervals is $f(x) = x^4 - 8x^2$ decreasing?`,
					options: [String.raw`$(-\infty, -2)$`, '$(-2, 0)$', '$(0, 2)$', String.raw`$(2, \infty)$`],
					answer: [0, 2],
					explanation: String.raw`$f'(x) = 4x^3 - 16x = 4x(x - 2)(x + 2)$, with sign chart $-,\, +,\, -,\, +$ across $-2$, $0$, $2$.`
				},
				{
					type: 'number',
					prompt: String.raw`An RC circuit has $\tau = 3\,\text{s}$. After how many seconds does the capacitor hold about $63\%$ of $Q_\infty$?`,
					answer: 3,
					tolerance: 0.2,
					unit: 's',
					explanation: String.raw`$Q(\tau) = (1 - e^{-1})Q_\infty \approx 0.63\,Q_\infty$, so it takes one time constant: $t = \tau = 3\,\text{s}$.`
				}
			]
		}
	]
});
