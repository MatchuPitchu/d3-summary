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

const draw = async () => {
  // [1] GET DATA
  const dataset: Dataset = await d3.json('/data/data.json');
  if (!dataset) return;

  const xAccessor = (d: DataItem) => d.currently.humidity;
  const yAccessor = (d: DataItem) => d.currently.apparentTemperature;

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

  // DRAW EMPTY CHART
  const svg = d3.select('#chart').append('svg').attr('width', dimensions.width).attr('height', dimensions.height);

  // <g> element is a container used to group other SVG elements
  // all presentation attributes are inherited to child elements
  const container = svg.append('g').attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`);

  // SCALES FUNCTIONS
  // d3.extent(array, cb accessor fn) returns input domain [number, number]
  // TypeScript solution: https://stackoverflow.com/questions/52124689/argument-of-type-string-string-error-in-angular-and-d3
  const xScale = d3
    .scaleLinear()
    .domain(<[number, number]>d3.extent(dataset, xAccessor))
    .range([0, dimensions.containerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(<[number, number]>d3.extent(dataset, yAccessor))
    .range([0, dimensions.containerHeight]);

  // DRAW CIRCLES
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
    .attr('fill', 'orange');
};

draw();
