# Understanding D3 & Data Visualization

- Data visualization
  - is the ability to convey a story or an idea as efficiently as possible
  - makes it easy to identify certain patterns or disruptions in data
  - made up of shapes, size and color

## D3 (Data Driven Documents)

- helps to close gap between data and visualization on the web
- helps to calculate size, shape, color and position

- `Data`
  - JSON, CSV, plain text etc.
  - data should drive the visualization; NOT other way around
- `Document`
  - HTML webpage
  - represents the data; the visual will depend on the data itself and not dictate what the data should be

## SVG (Scalable Vector Graphics)

- regular images based on pixels are `JPG`, `JPEG`, `PNG`, `BMP`, `GIF`
- vector images generated and manipulated with code are `SVG`

  - vectors are created using math equations and commands

- `<svg>` element: order of elements inside this container is only defined by order of appearance

```HTML
<svg width="500" height="500">
  <!-- ... vector elements -->
</svg>
```

- `<rect>` element: creates a rectangle shape
  - `fill`: background color of shape
  - `stroke`: border color
  - `stroke-width`: border width
  - specific for strokes: half stroke width is inside element, and half outside
  - by default svg is set to `overflow`: hidden
    - solution: 1) svg -> overflow: visible; 2) position rect with x and y attributes, standing for coordinates inside svg container

```HTML
<rect x="25" y="25" width="100" height="100" fill="#f44336" stroke="#8bc34a" stroke-width="10"></rect>
```

- `<circle>` element: creates a circle shape
  - `r`: radius
  - `cx`: coordinate on x axis inside svg to position circle
  - `cy`: coordinate on y axis inside svg to position circle

```HTML
<circle r="100" cx="250" cy="150" fill="#9c28b0"></circle>
```

- `<line>` element: creates a line shape
  - `x1`, `y1`: starting coordinates
  - `x2`, `y2`: ending coordinates
  - `stroke`: lines do NOT have `fill` to fill color

```HTML
<line x1="100" y1="100" x2="200" y2="200" stroke="blue" stroke-width="5"></line>
```

- `<path>` element: most powerful shape because it can be conformed to draw every shape
  - Article: <https://www.mediaevent.de/tutorial/svg-path.html>
  - `d` (short for data): list of commands and coordinates
  - `M, m` move to point: instructs SVG to move the "pen" to certain coordinates (by default "pen" starts at 0,0)
  - `Z, z` close path: at the end of list of coordinates closes the path to a shape
  - `L, l` draw line to: großes L = gehe absolutem Punkt x/y; kleines l = relativer path, gehe x/y Einheiten
  - `C, c` und `S, s`: Cubic Bézierkurve
  - `Q, q` und `T, t`: Quadratische Bézierkurve
  - `S,s` smooth: cubic curve to
  - `A, a` Elliptical Arc: Kreisbogen oder elliptischer Bogen
  - `stroke-dasharray`="50,5" bestimmt die Länge des durchgehenden Teilstücks (50), der zweite (5) die Breite der Lücken
  - `stroke-dashoffset` liegt zwischen 0 und dem ersten Wert von stroke-dasharray und legt den Anfang der ersten Teillinie fest.
  - `stroke-linecap`="round" für gepunktete Linie

```HTML
<path d="M300,300 L300,200 L200,200 Z" fill="red" stroke="#000" stroke-width="5"></path>
```

- `<g>` element is a container used to group other SVG elements
  - all presentation attributes are inherited to child elements
- `viewBox` attribute is needed for responsive layout: `viewBox="x y width height"` (-> xy = starting point)

```HTML
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="white" stroke="green" stroke-width="5">
    <circle cx="40" cy="40" r="25" />
    <circle cx="60" cy="60" r="25" />
  </g>
</svg>
```

![](/00_slides/03_svg-viewBox.png)

## Install D3

> GitHub Repository of D3 Library: <https://github.com/d3/d3>

> GitHub Repositories of specific parts of D3 libraries: <https://github.com/d3>

> Overview of available D3 modules (-> APIs): <https://github.com/d3/d3/blob/main/API.md>

- package has big size, so it's split in multiple parts to save data volume
- with `ES6 modules` you can import only specific symbols from specific D3 modules

  - e.g. `import {scaleLinear} from "d3-scale"`

- install d3: `npm install d3`
- types for TypeScript: `npm install --save-dev @types/d3`

## Selections

- `selections`: objects that represent HTML elements in the `DOM`
  - methods that select or create elements return always the selection

> <https://github.com/d3/d3-selection>

```JavaScript
// Native
document.querySelector('p');

// D3
// similar to select elements with native browser API
d3.select('p');

d3.selectAll('p');

// append new element as last child to selected element
// returns a selection (here based on 'p')
const body = d3.select('body');
const p = body.append('p');
```

## Modyfiying Elements

> <https://github.com/d3/d3-selection#modifying-elements>

- a modifying method returns always the selection
- you can chain multiple modifying methods together

```JavaScript
// attr(): adds (OR overwrites) attributes to specific element; can be placed on any position in the method chain
// text(): replaces text content of element
const el = d3.select('body')
  .append('p')
  .attr('i', 'foo')
  .classed('bar baz', true) // truthy = classes are assigned to elements; falsy = unassigned
  .text('Hello World')
  .style('color', 'blue');
```

## Joining Data

- data for D3 is only `text` and `numbers`
- process of associating a piece of data with an element is known as `joining data`
- then you can manipulate the shape of an element based on a data point

![](/00_slides/01_joining-data.png)

- `data()`: array of selections and array of data is joined (first selection with first item etc.)
  - in element property list you can find `__data__: 10` etc.
  - returns `_enter` property of selection: tells if more data items than elements (-> how many data items could not be joined)
  - returns `_exit` property of selection: tells if more selected elements than data items (-> how many selected elements could not be joined)
- `join(<string>|<cb fn>)`: handles balance if not exact number in selections array and data array
  - generates new elements if there were more data items than elements before and appends these new elements to parent of selection (-> here: you need additional `select('ul')`, otherwise html element would be parent)
  - OR removes elements if more selected elements than data items

```HTML
<ul>
  <li>ListItem</li>
  <li>ListItem</li>
  <li>ListItem</li>
</ul>
```

```JavaScript
const data = [10, 20, 30, 40, 50];

// Example 1
const element = d3
  .select('ul')
  .selectAll('li')
  .data(data)
  .join('li')
  .text((d) => d); // insert string OR cb fn that provides data parameter);
```

```JavaScript
// Example 2
const element = d3
.select('ul')
.selectAll('li')
.data(data)
.join(
  // enter parameter: selection containing new created elements
  (enter) => {
    // return enter.append('li'); // default behavior ('li' is example)
    return enter.append('li').style('color', 'purple');
  },
  // update parameter: selection containing elements that are already in existence
  (update) => {
    // return update; // default behavior
    return update.style('color', 'green');
  },
  // exit parameter: selection containing elements that need to to be removed
  (exit) => {
    // return exit.remove(); // default behavior
    return exit.style('color', 'green');
  }
)
.text((d) => d);
```

## JSON Requests

- data origin:

  1. hard coded into JavaScript file
  1. file (`JSON`, `CSV` etc.)
  1. API

> `d3-fetch` library: <https://github.com/d3/d3-fetch>

## Drawing a Scatterplot

![](/00_slides/02_scatterplot.png)

### Steps for Drawing a Chart

1. get data
1. draw chart dimensions
1. draw image
1. create scales
1. draw shapes
1. draw axis
1. add animation and events

### Accessor Function

- `accessor function` can access and return a property of an object

```TypeScript
const xAccessor = (d: DataItem) => d.currently.humidity;
const yAccessor = (d: DataItem) => d.currently.apparentTemperature;

container
  .selectAll('circle')
  .data(dataset)
  .join('circle')
  // accessor cb function to get specific property in data item object
  // draw humidity on x axis (cause value should ALWAYS be drawn on x axis, effect on y axis)
  .attr('cx', xAccessor)
  .attr('cy', yAccessor)
```

### Scales

> Documentation <https://github.com/d3/d3-scale>

- `scales` harmonize the dimension of a viewing area AND a chart -> i.e. mapping a dimension of abstract data to a visual representation -> `without scales`: data does NOT match the available space in the chart
- `Example`: on various screen resolutions, you can upscale or downscale the position of your data points to adjust them to the screen size and make them visible and readable
- in `d3` specific `scale functions` are implemented for different use cases
  - they take in data and return new data that can be used for positioning a shape, changing its dimensions, or changing its color: `Input`-> `Scale` -> `Output`
- `Example`: `const dataset = [100, 200, 300, 400, 500]`
  - `Input Domain`: a range of possible values within the data (-> `100`, `500`)
  - `Output Range`: size of the static viewing area (-> e.g. `0` to `max width of viewing area`)

```TypeScript
// Example for Scales
const dataset = [100, 200, 300, 400, 500];

//  d3.extent(array, cb accessor fn) does the same, BUT cb is useful for accessing deeper nested properties in array of objects
// const getDomain = (array: number[]): [number, number] => [Math.min(...array), Math.max(...array)];
// console.log(getDomain(dataset));

const scale = d3.scaleLinear().domain(d3.extend(dataset)).range([10, 350]);

scale(100); // 10
scale(500); // 350
```

#### Continuous vs Discrete Scales

- if a dataset is continuous or discrete will narrow down the choices of a scale
- `continuous` data
  - can be measured
  - can be broken down into fractions or decimals
  - `infinite` possible values
  - `Examples`: temperature, height, distance, time
- `discrete` data

  - can be counted
  - can NOT be broken down into fractions or decimals
  - `finite` possible values
  - `Examples`: number of books in a library etc.

#### Linear Scale

- `scaleLinear()`: input domain AND output range are `continuous`

![](/00_slides/04_scaleLinear-function-domain-range.png)

```JavaScript
const scale = d3.scaleLinear()
  .domain([10, 90])
  .range([0, 720]);

scale(10); // 0
scale(90); // 720
scale(47.35); // 336.15000000000003
scale(5); // -45
scale(100); // 810
```

### Axis

> Documentation: <https://github.com/d3/d3-axis>

- `d3.axisTop()`: ticks are drawn above horizontal line
- `d3.axisBottom()`: ticks are drawn below horizontal line
- `d3.axisLeft()`: ticks are drawn left of vertical line
- `d3.axisRight()`: ticks are drawn right of vertical line

### Example of Scatterplot

```TypeScript
import './style.css';
import * as d3 from 'd3';

type DataItem = Record<string, any>;
type Dataset = DataItem[] | undefined;

interface Dimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  containerWidth?: number;
  containerHeight?: number;
}

const convertFahrenheitToCelsius = (number: number) => ((number - 32) * 5) / 9;

const draw = async () => {
  // [1] GET DATA
  const dataset: Dataset = await d3.json('/data/data.json');
  if (!dataset) return;

  const xAccessor = (d: DataItem) => d.currently.humidity;
  const yAccessor = (d: DataItem) => convertFahrenheitToCelsius(d.currently.apparentTemperature);

  // [2] DIMENSIONS OF SVG GROUP AND CONTAINER FOR CHART ITEMS
  const dimensions: Dimensions = {
    width: 800,
    height: 800,
    margin: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    },
  };

  dimensions.containerWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.containerHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // [3] DRAW IMAGE (-> EMPTY CHART)
  const svg = d3.select('#chart').append('svg').attr('width', dimensions.width).attr('height', dimensions.height);

  // <g> element is a container used to group other SVG elements
  // all presentation attributes are inherited to child elements
  const container = svg.append('g').attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`);

  // [4] CREATE SCALES
  // d3.extent(array, cb accessor fn) returns input domain [number, number]
  // TypeScript solution: https://stackoverflow.com/questions/52124689/argument-of-type-string-string-error-in-angular-and-d3
  const xScale = d3
    .scaleLinear()
    .domain(<[number, number]>d3.extent(dataset, xAccessor))
    .rangeRound([0, dimensions.containerWidth]) // rangeround() instead of range() will round output range
    .clamp(true); // clamp() forces scale function not to transform values that are passed in as arguments and outside of input range

  const yScale = d3
    .scaleLinear()
    .domain(<[number, number]>d3.extent(dataset, yAccessor))
    .rangeRound([dimensions.containerHeight, 0]) // reverse output numbers range (-> because data point 0 should be at bottom of chart, NOT at top)
    .nice() // nice(): applied to input domain (-> look at data, if usefull or not), start + end number is rounded
    .clamp(true);

  // [5] DRAW SHAPES
  // a) selectAll founds nothing in DOM
  // b) then dataset is applied,
  // c) data array of selections and array of data is joined, join creates new circles for every data item
  container
    .selectAll('circle')
    .data(dataset)
    .join('circle')
    // accessor cb function to get specific property in data item object
    // draw humidity on x axis (cause value should ALWAYS be drawn on x axis, effect on y axis)
    .attr('cx', (d) => xScale(xAccessor(d)))
    .attr('cy', (d) => yScale(yAccessor(d)))
    .attr('r', 4)
    .attr('fill', 'orange')
    .attr('data-temp', yAccessor); // to see which circle represents which data point

  // [6] DRAW AXIS
  // add scale function for correct scale
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(5) // overwrites number of ticks (d3 figures out if number can be distributed evenly OR if d3 has to take another number)
    // .tickValues([0.4, 0.5, 0.8]); // define custom ticks
    .tickFormat((d) => (typeof d === 'number' ? `${d * 100}%` : '')); // transform original label to another value

  // append axis as new group (<g>) at the end of our container
  // move axis to bottom of container
  const xAxisGroup = container
    .append('g')
    .call(xAxis)
    .style('transform', `translateY(${dimensions.containerHeight}px`)
    .classed('axis', true);

  // append svg <text> element and position it inside xAxisGroup selection
  xAxisGroup
    .append('text')
    .attr('x', dimensions.containerWidth / 2)
    .attr('y', dimensions.margin.bottom - 10)
    .attr('fill', 'black')
    .text('Humidity');

  const yAxis = d3.axisLeft(yScale);
  const yAxisGroupe = container.append('g').call(yAxis).classed('axis', true);
  yAxisGroupe
    .append('text')
    .attr('x', -dimensions.containerHeight / 2) // minus because of rotation
    .attr('y', -dimensions.margin.left + 15) // minus because of rotation
    .attr('fill', 'black')
    .html(`Temperature &deg;C`) // html() replaced here text() because want to draw HTML entity inside string
    .style('transform', 'rotate(270deg)')
    // 'text-anchor' is alignment property for svg only
    // 'middle': middle of text is exactly the value of x coordinate (-> here because of rotation)
    .style('text-anchor', 'middle');
};

draw();
```

- `shape-rendering` CSS property: for SVG elements to define tradeoff between performance and accuracy: <https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering>

```CSS
.axis {
  shape-rendering: geometricPrecision;
}
```
