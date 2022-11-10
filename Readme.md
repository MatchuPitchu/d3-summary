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
  - `_enter` property of selection: tells how many data items have been joint
- `join()`: generates new elements if there were more data items than elements before
  - and appends these new elements to parent of selection (-> here: you need additional `select('ul')`, otherwise html element would be parent)

```HTML
<ul>
  <li>ListItem</li>
  <li>ListItem</li>
  <li>ListItem</li>
</ul>
```

```JavaScript
const data = [10, 20, 30, 40, 50];

const element = d3.select('ul').selectAll('li').data(data).join('li').text('ListItem text overwritten');
```
