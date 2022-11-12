import './style.css';
import * as d3 from 'd3';

type DataItem = Record<string, any>;
type Dataset = DataItem[] | undefined;

interface Dimensions {
  width: number;
  height: number;
  containerWidth?: number;
  containerHeight?: number;
}

const draw = async (elementSelector: string) => {
  // [1] DATA
  // array of 100 numbers representing income of US households
  const dataset: Dataset = await d3.json('./data/data.json');
  if (!dataset) return;

  // [2] DIMENSIONS
  const dimensions: Dimensions = {
    width: 600,
    height: 150,
  };

  const box = 30 - 3; // 100 data points: 600px/30px = 20; 150px/30px = 5; 20 * 5 = 100 items; 3px = gap between rectangles

  // [3] DRAW IMAGE
  const svg = d3
    .select(elementSelector)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  // [5] DRAW SHAPES -> RECTANGLES
  svg
    .append('g')
    .attr('transform', 'translate(2, 2)') // spacing to container borders
    .attr('stroke', 'black') // representational attributes applied to <g> will be inherited to all child elements
    .attr('fill', '#ddd')
    .selectAll('rect')
    .data(dataset)
    .join('rect')
    .attr('width', box)
    .attr('height', box);
};

draw('#heatmap-1');
