import './style.css';
import * as d3 from 'd3';

/*** SELECTION AND MODIFIYING SECTION ***/

// similar to select elements with native browser API
// const p = d3.select('p');

// append new element as last child to selected element
// returns a selection (here based on 'p')
const body = d3.select('body');
const p = body.append('p');

console.log(body);
console.log(p);

const selection = d3
  .select('body')
  .append('p')
  .attr('id', 'foo')
  .classed('bar baz', true)
  .text('Text content replaced')
  .style('color', 'blue');

/*** JOINING DATA SECTION ***/
const data = [10, 20, 30, 40, 50];

// data(): array of selections and array of data is joined (first selection with first item ...)
// [1] in element property list you can find __data__: 10 etc.
// [2] _enter property of selection: tells how many data items have been joint
// join(): generates new elements if there were more data items than elements before
// and append these new elements to parent of selection (-> here: you need additional `select('ul')`,
// otherwise html element would be parent)
const element = d3.select('ul').selectAll('li').data(data).join('li').text('ListItem text overwritten');

console.log(element);
