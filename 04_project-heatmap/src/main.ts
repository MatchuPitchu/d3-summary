import './style.css';
import * as d3 from 'd3';
import { ScaleLinear, ScaleQuantile, ScaleQuantize, ScaleThreshold } from 'd3';

type Dataset = number[] | undefined;

interface Dimensions {
  width: number;
  height: number;
  containerWidth?: number;
  containerHeight?: number;
}

const draw = async (elementSelector: string, scale: 'linear' | 'quantize' | 'quantile' | 'threshold') => {
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
  let colorScale:
    | ScaleLinear<string, string>
    | ScaleQuantize<string>
    | ScaleQuantile<string>
    | ScaleThreshold<number, string>;

  if (scale === 'linear') {
    // Problem: linear scale transforms continuous scale into continuous (100 different data points to 100 different colors) -> hard to read
    // Better solution: using other scale to transform into discrete output scale (limited number of colors)
    colorScale = d3
      .scaleLinear<string, string>() // define string as output range for colors
      .domain(<[number, number]>d3.extent(dataset))
      .range(['white', 'red']); // d3 converts color names into range of rgb
  } else if (scale === 'quantize') {
    colorScale = d3
      .scaleQuantize<string>()
      .domain(<[number, number]>d3.extent(dataset))
      .range(['white', 'pink', 'red']);

    console.log('Quantize thresholds:', (colorScale as ScaleQuantize<string>).thresholds());
  } else if (scale === 'quantile') {
    colorScale = d3
      .scaleQuantile<string>()
      .domain(dataset) // pass in entire dataset
      .range(['white', 'pink', 'red']);

    console.log('Quantile thresholds:', (colorScale as ScaleQuantile<string>).quantiles());
  } else if (scale === 'threshold') {
    colorScale = d3
      .scaleThreshold<number, string>()
      .domain([45200, 135600]) // pass in array with your thresholds
      .range(['white', 'pink', 'red']);
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
draw('#heatmap-2', 'quantize');
draw('#heatmap-3', 'quantile');
draw('#heatmap-4', 'threshold');
