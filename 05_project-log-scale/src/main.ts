import './style.css';
import * as d3 from 'd3';

type DataItem = {
  name: string;
  size: number;
};
type Dataset = DataItem[] | undefined;

interface Dimensions {
  width: number;
  height: number;
  margin: number;
  containerWidth?: number;
  containerHeight?: number;
}

const draw = async (elementSelector: string) => {
  // [1] DATA
  // array of objects of things with their size in the universe
  const dataset: Dataset = await d3.json('./data/data.json');
  if (!dataset) return;

  const getName = (d: DataItem) => d.name;
  const getSize = (d: DataItem) => d.size;

  // [2] DIMENSIONS
  const dimensions: Dimensions = {
    width: 200,
    height: 500,
    margin: 50,
  };

  // [3] DRAW IMAGE
  const svg = d3
    .select(elementSelector)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  // [4] SCALE
  const universeScale = d3
    // .scaleLinear() // // Skewing Problem: Linear Scale does NOT work since distance between biggest and smallest item is too great
    .scaleLog()
    .domain(<[number, number]>d3.extent(dataset, getSize))
    .range([dimensions.height - dimensions.margin, dimensions.margin]); // scale lowest value to highest point on screen and vice versa

  // [5] DRAW SHAPES
  // CSS property 'dominant-baseline' to align svg elements: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dominant-baseline
  const circlesGroup = svg.append('g').style('font-size', '16px').style('dominant-baseline', 'middle');

  circlesGroup
    .selectAll('circle')
    .data(dataset)
    .join('circle')
    .attr('cx', dimensions.margin)
    .attr('cy', (d) => universeScale(getSize(d)))
    .attr('r', 6);

  circlesGroup
    .selectAll('text')
    .data(dataset)
    .join('text')
    .attr('x', dimensions.margin + 15) // position text label at right of circle
    .attr('y', (d) => universeScale(getSize(d)))
    .text(getName);

  // [6] ADD AXIS
  const axis = d3.axisLeft(universeScale);
  svg.append('g').attr('transform', `translate(${dimensions.margin}, 0)`).call(axis);
};

draw('#chart');
