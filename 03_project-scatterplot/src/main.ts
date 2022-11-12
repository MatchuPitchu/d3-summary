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
  // array of objects containing wether data
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

  // [5] DRAW SHAPES -> CIRCLES
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
