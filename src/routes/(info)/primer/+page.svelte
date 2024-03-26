<script lang="ts">
    import { onMount } from "svelte"
    import katex from "katex"
    import RecursiveCall from "$lib/components/RecursiveCall.svelte"
    import { FibonacciCall } from "$lib/algorithms/fibonacci"
    import { NumberValue } from "$lib/core/values"


    let fibOne: HTMLDivElement
    let fibTwo: HTMLDivElement
    let fibThree: HTMLDivElement
    let fibOneHeight: number
    let fibTwoHeight: number
    let fibThreeHeight: number

    onMount(() => {
        fibOneHeight = fibOne.scrollHeight
        fibTwoHeight = fibTwo.scrollHeight
        fibThreeHeight = fibThree.scrollHeight
        setTreeScales()
        window.addEventListener("resize", setTreeScales)
    })

    function setTreeScales() {
        let fibOneScale = 0.2
        let fibTwoScale = 0.05
        let fibThreeScale = 0.1
        if (screen.width > 768) {
            fibOneScale = 0.3
            fibTwoScale = 0.1
            fibThreeScale = 0.2
        }
        fibOne.style.transform = `scale(${fibOneScale})`
        fibOne.style.height = `${fibOneHeight * fibOneScale}px`
        fibTwo.style.transform = `scale(${fibTwoScale})`
        fibTwo.style.height = `${fibTwoHeight * fibTwoScale}px`
        fibThree.style.transform = `scale(${fibThreeScale})`
        fibThree.style.height = `${fibThreeHeight * fibThreeScale}px`

    }

    function renderMath(math: string) {
        return katex.renderToString(math, {
            throwOnError: false,
            displayMode: false,
        })
    }

    function conqueredFib(n: number): FibonacciCall {
        const fib = new FibonacciCall({n: new NumberValue(n)})
        fib.conquer()
        return fib
    }

    function dpFib(n: number): FibonacciCall {
        const fib = new FibonacciCall({n: new NumberValue(n)})
        fib.toggleMemoise()
        fib.conquer()
        return fib
    }

</script>

<p>
This page presents a brief introduction to divide-and-conquer algorithms, dynamic programming, and the notion of algorithmic complexity. For those familiar with these concepts, please skip ahead and begin using <b>Divisualise!</b>
</p>
<br>

<h2 class="text-lg md:text-xl font-bold">Divide-and-Conquer Algorithms</h2>

<p>
The solution to many problems that we encounter in Computer Science can be most simply expressed in terms of the solutions to smaller, similar <b>subproblems</b>. Take, as a toy example, the famous Fibonacci sequence. Let {@html renderMath("\F\(n\)")} denote the {@html renderMath("n")}th Fibonacci number, which we define as the following:
</p>

<br>
<div class="flex flex-col items-center">
<div>
<p>{@html renderMath("\F\(n\) = \F\(n-1\) + \F\(n-2\),")}</p>
<p>{@html renderMath("\F\(2\) = 1,")}</p>
<p>{@html renderMath("\F\(1\) = 1.")}</p>
</div>
</div>
<br>

<p>
How might we design an algorithm that calculates the {@html renderMath("n")}th Fibonacci number? The idea is simple: to compute {@html renderMath("F\(n\)")}, we compute {@html renderMath("F\(n-1\)")} and {@html renderMath("F\(n-2\)")}, then add them together - this is our <b>recursive case</b>. This process continues until we reach {@html renderMath("F\(1\)")} and {@html renderMath("F\(0\)")}, which we know by definition - we call these our <b>base cases</b>. We might write some code that looks like this:
</p>
<br>

<div class="flex text-sm md:text-lg justify-center items-center w-full">
<pre>
<code>
{`function fib(n):
    if n == 1 or n == 0:
        return n
    else:
        return fib(n-1) + fib(n-2)
`}
</code>
</pre> 
</div>

<p>This is a classic example of a <b>divide-and-conquer algorithm</b>: we divide our problem into two smaller problems, solve them, and combine the solutions to solve the original problem. The following <b>tree diagram</b> shows all of the subproblems we solve when computing the 5th Fibonacci number:</p>

<br>
<div class="flex justify-center items-center w-full" bind:this={fibOne}>
    <RecursiveCall 
        call={conqueredFib(5)} 
        showButtons={false} 
    />
</div>
<br>

<p>
Computing Fibonacci numbers is a simple example with few practical applications, but the divide-and-conquer paradigm is a powerful tool for solving a wide range of real-world problems. If you've ever found yourself on <a href="https://themodernhouse.com" class="underline text-blue-400">The Modern House</a> at 3am, asking yourself "What's the nicest house I could buy with my conservative, hypothetical future budget of £3m?" a divide-and-conquer sorting algorithm was responsible for placing that one Barbican flat at the top of your screen.
</p>
<br>


<h2 class="text-lg md:text-xl font-bold">Dynamic Programming</h2>
<p>
Regrettably, the algorithm we've just described has a fatal flaw. Observe the tree diagram above and notice that we put in work to compute the 3rd Fibonacci number twice. For small values of {@html renderMath("n")}, this isn't a problem, but as {@html renderMath("n")} grows, the number of subproblems we solve grows exponentially. Let's see what happens when we try to compute the 8th Fibonacci number with this algorithm:
</p>
<br>

<div class="flex justify-center items-center w-full" bind:this={fibTwo}>
    <RecursiveCall 
        call={conqueredFib(8)} 
        showButtons={false}
    />
</div>

<br>
<p>
The number of additions we have to perform has grown from 4 to 20 - a small increase in {@html renderMath("n")} has quintupled the amount of work we have to do! These <b>overlapping subproblems</b> plague many simple divide-and-conquer approaches, and in many cases, the naive recursive implementation of an algorithm is too slow to be useful in practice. A small modification to our algorithm can fix this issue.
</p>
<br>

<div class="flex text-sm md:text-lg justify-center items-center w-full">
<pre>
<code>
{`function fib(n):
    fs = [1, 2]
    for i in [3, ..., n]
        fs[i] = fs[i-1] + fs[i-2]
    return fs[n]
`}
</code>
</pre>
</div>

<p>
Now, we grow a list of Fibonacci numbers from the bottom up, reusing the answers to previous subproblems to avoid redundant work. This technique is called <b>dynamic programming</b>, a common optimisation applied to divide-and-conquer algorithms. Note that our application of dynamic programming is a <b>trade-off</b>: we save time at the expense of the <b>space</b> needed to store the results of our subproblems; in most cases, this is a trade-off that we're thrilled to make. The tree diagram below demonstrates the operation of our new algorithm, and how it significantly reduces the number of additions we make given the same input:
</p>

<br>
<div class="flex justify-center items-center w-full" bind:this={fibThree}>
    <RecursiveCall 
        call={dpFib(8)} 
        showButtons={false}
    />
</div>
<br>
<br>

<h2 class="text-lg md:text-xl font-bold">Algorithmic Complexity and Big-O Notation</h2>
<p>
The complexity of an algorithm is a measure of how its run-time, or space it needs, <b>grows</b> with the size of its input. Typically, far more emphasis is placed on <b>time complexity</b> than <b>space complexity</b> as space is seldom a limiting factor in modern computing (of course, there are exceptions).
</p>
<br>
<p>
We place our attention on the <b>asymptotic</b> behaviour of our algorithms - how they behave as the size of the input grows to infinity. We saw that our naive Fibonacci implementation doubles the number of additions with each increase in {@html renderMath("n")}, while our dynamic programming implementation only necessitates one extra addition per increase in {@html renderMath("n")}. When we consider the 20th Fibonacci number, the dynamic programming algorithm only requires 18 additions, while the naive recursive algorithm requires over a million!
</p>
<br>
<p>
The time complexity of an algorithm is often expressed in terms of <b>Big-O notation</b>, which describes the <b>worst-case upper bound</b> on the algorithm's run-time as {@html renderMath("n")} grows to infinity. Big-O notation provides a means of comparing the efficiency of different algorithms without getting bogged down in the details of their implementation. For example, let us consider the two Fibonacci algorithms we've discussed. Loosely speaking, we say the time complexity of our naive recursive Fibonacci algorithm is {@html renderMath("O(2^n)")}, as the number of subproblems we solve doubles with each increase in {@html renderMath("n")}. The time complexity of our dynamic programming algorithm is {@html renderMath("O(n)")}, as the number of subproblems we solve grows linearly with {@html renderMath("n")}.
</p>
<br>
<p>
The following table shows other commonly encountered time complexities, their characteristics, and some examples of algorithms that exhibit them, ordered from slowest to fastest growing:
</p>
<br>

<table class="w-full text-left border-collapse">
  <thead>
    <tr class="text-black">
      <th class="px-2 md:px-4 py-1 md:py-2">Complexity</th>
      <th class="px-2 md:px-4 py-1 md:py-2">Description</th>
      <th class="px-2 md:px-4 py-1 md:py-2">Examples</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-t-2 border-black">
      <td class="px-2 md:px-4 py-1 md:py-2">{@html renderMath("O(1)")}</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Constant time. The algorithm takes the same amount of time regardless of input size</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Popping an element from a stack; timing-attack-resistant password comparison</td>
    </tr>
    <tr class="border-t-2 border-black">
      <td class="px-2 md:px-4 py-1 md:py-2">{@html renderMath("O(\\log (n))")}</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Logarithmic time. Multiplying the input size by a constant factor additively increases the run-time by a constant factor</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Binary search; finding the largest power of 2 less than a given number</td>
    </tr>
    <tr class="border-t-2 border-black">
      <td class="px-2 md:px-4 py-1 md:py-2">{@html renderMath("O(n)")}</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Linear time. The run-time grows linearly with the input size</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Summing the elements of an array; finding the maximum element in an array</td>
    </tr>
    <tr class="border-t-2 border-black">
      <td class="px-2 md:px-4 py-1 md:py-2">{@html renderMath("O(n \\log (n))")}</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Linearithmic time. Common in efficient sorting algorithms</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Merge sort; heap sort; quick sort</td>
    </tr>
    <tr class="border-t-2 border-black">
      <td class="px-2 md:px-4 py-1 md:py-2">{@html renderMath("O(n^2)")}</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Quadratic time. This is where things start to slow down</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Selection sort; bubble sort; insertion sort</td>
    </tr>
    <tr class="border-t-2 border-black">
      <td class="px-2 md:px-4 py-1 md:py-2">{@html renderMath("O(n^3)")}</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Cubic time</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Naive matrix multiplication; naive matrix inversion.</td>
    </tr>
    <tr class="border-t-2 border-black">
      <td class="px-2 md:px-4 py-1 md:py-2">{@html renderMath("O(2^n)")}</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Exponential time. Now things are prohibitively slow.</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Naive recursive Fibonacci; brute-force search over all subsets of a set</td>
    </tr>
    <tr class="border-t-2 border-black">
      <td class="px-2 md:px-4 py-1 md:py-2">{@html renderMath("O(n!)")}</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Factorial time.</td>
      <td class="px-2 md:px-4 py-1 md:py-2">Brute-force search over all permutations of a set</td>
    </tr>
  </tbody>
</table>
