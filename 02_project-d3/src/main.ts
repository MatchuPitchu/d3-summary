import './style.css';
import * as d3 from 'd3';

/*** SECTION: SELECTION AND MODIFIYING ***/

// similar to select elements with native browser API
// const p = d3.select('p');

// append new element as last child to selected element
// returns a selection (here based on 'p')
const body = d3.select('body');
const p = body.append('p');

console.log(body);
console.log(p);

d3.select('#section-1')
  .append('p')
  .attr('id', 'foo')
  .classed('bar baz', true)
  .text('Text content replaced')
  .style('color', 'blue');

/*** SECTION: JOINING DATA ***/
const data = [10, 20, 30, 40, 50];

// data(): array of selections and array of data is joined (first selection with first item ...)
// [1] in element property list you can find __data__: 10 etc.
// [2] _enter property of selection: tells if more data items than elements (-> how many data items could not be joined)
// [3] _exit property of selection: tells if more selected elements than data items (-> how many selected elements could not be joined)
// join(<string>|<cb fn>): generates new elements if there were more data items than elements before
// and append these new elements to parent of selection (-> here: you need additional `select('ul')`,
// otherwise html element would be parent) OR removes elements if more selected elements than data items
// const element = d3.select('ul').selectAll('li').data(data).join('li').text('foo');

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
  .text((d) => d); // cb fn that provides data parameter

console.log(element);

/*** SECTION: DATA REQUESTS ***/
const getData = async () => {
  // JSON file
  const jsonData = await d3.json('./data/data.json');
  console.log(jsonData);

  const csvData = await d3.csv('./data/data.csv');
  console.log(csvData);
};

getData();
