import './style.css';
import * as d3 from 'd3';
import { ScaleLinear } from 'd3';

type Dataset = number[] | undefined;

interface Dimensions {
  width: number;
  height: number;
  containerWidth?: number;
  containerHeight?: number;
}

const draw = async (elementSelector: string, scale: 'linear') => {
  // [1] DATA
  // array of 100 numbers representing income of US households
  const dataset: Dataset = await d3.json('./data/data.json');
  if (!dataset) return;
  dataset.sort((a, b) => a - b); // sort data in ascending order

  // [2] DIMENSIONS
  const dimensions: Dimensions = {
    width: 600,
    height: 150,
  };

  const box = 30; // 100 data points: 600px/30px = 20; 150px/30px = 5; 20 * 5 = 100 items

  // [3] DRAW IMAGE
  const svg = d3
    .select(elementSelector)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  // [4] SCALES
  let colorScale: ScaleLinear<string, string>;
  if (scale === 'linear') {
    colorScale = d3
      .scaleLinear<string, string>() // define string as output range for colors
      .domain(<[number, number]>d3.extent(dataset))
      .range(['white', 'red']); // d3 converts color names into range of rgb
  }

  // [5] DRAW SHAPES -> RECTANGLES
  svg
    .append('g')
    .attr('transform', 'translate(2, 2)') // move group to have some spacing to container borders
    .attr('stroke', 'black') // representational attributes applied to <g> will be inherited to all child elements
    .selectAll('rect')
    .data(dataset)
    .join('rect')
    .attr('width', box - 3) // 3px = gap between rectangles
    .attr('height', box - 3)
    // map all rectangles on x and y axis
    .attr('x', (d, index) => box * (index % 20)) // [1st row] 0, 30, 60, 90, ... 570, [2nd row] 0, 30 ... 570, ...
    // use bitwise OR operator (does same as Math.floor()) to cut decimals
    .attr('y', (d, index) => box * ((index / 20) | 0)) // [first 20 cols -> until index 19] 0, [second 20 cols] 30
    .attr('fill', (d) => colorScale?.(d));
};

draw('#heatmap-1', 'linear');
