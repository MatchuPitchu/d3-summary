import './style.css';
import * as d3 from 'd3';
import { SeriesPoint } from 'd3';

type DataItem = {
  name: string;
  '<10': string;
  '10-19': string;
  '20-29': string;
  '30-39': string;
  '40-49': string;
  '50-59': string;
  '60-69': string;
  '70-79': string;
  '≥80': string;
};

type Dataset = DataItem[] | undefined;

interface Dimensions {
  width: number;
  height: number;
  margin: number;
  containerWidth: number;
  containerHeight: number;
}

const draw = async (chartWrapperSelector: string) => {
  // [1] DATA
  // autoType() detects appropriate types for data
  const dataset = await d3.csv<keyof DataItem>('./data/data.csv');
  if (!dataset) return;

  const formattedData: Dataset = dataset.map((d) => d3.autoType(d));

  // [2] DIMENSIONS
  const dimensions: Dimensions = {
    width: 1000,
    height: 600,
    margin: 20,
    containerWidth: 0,
    containerHeight: 0,
  };

  dimensions.containerWidth = dimensions.width - dimensions.margin * 2;
  dimensions.containerHeight = dimensions.height - dimensions.margin * 2;

  // [3] DRAW IMAGE
  const svg = d3
    .select(chartWrapperSelector)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const container = svg.append('g').attr('transform', `translate(${dimensions.margin}, ${dimensions.margin})`);

  // [4] SCALES
  // constructs a new stack generator function
  // slice(1): "name" is on index 0 and NOT needed
  const stackGenerator = d3.stack<DataItem, string>().keys(dataset.columns.slice(1));
  const stackData = stackGenerator(formattedData).map((ageGroup) => {
    // add ageGroup.key property also to all sub arrays
    ageGroup.forEach((state: { [key: string]: any }) => (state.key = ageGroup.key));
    return ageGroup;
  });

  const yScale = d3
    .scaleLinear()
    .domain(<[number, number]>[
      0,
      d3.max(stackData, (ageGroup) => {
        return d3.max(ageGroup, (state) => state[1]);
      }),
    ]) // take highest population sizes of all nested data groups in the transformed dataset as highest domain input value
    .rangeRound([dimensions.containerHeight, dimensions.margin]); // round output range values

  const xScale = d3
    .scaleBand<string>()
    .domain(formattedData.map((state) => state.name)) // pass ALL discrete categories (-> "name") into input domain
    .range([dimensions.margin, dimensions.containerWidth]);

  const colorScale = d3
    .scaleOrdinal() // can convert x group names into x colors
    .domain(stackData.map((d) => d.key))
    .range(d3.schemeSpectral[stackData.length])
    .unknown('#ccc'); // fallback color if ordinal scale is probably not able to scale group name to a color

  // [5] DRAW SHAPES - BARS
  // create group for all bar groups: dataset is joined each to a group
  const ageGroups = container
    .append('g')
    .classed('age-groups', true)
    .selectAll('g')
    .data(stackData)
    .join('g')
    .attr('fill', (d) => colorScale(d.key) as string); // colorize each age group with same color

  // create rect elements for each group
  ageGroups
    .selectAll('rect')
    .data((d) => d) // grab data that has already been joined above
    .join('rect')
    .attr('x', (d) => xScale(d.data.name)!)
    .attr('y', (d) => yScale(d[1])) // endposition on y axis is stored at data item object at index 1
    .attr('width', xScale.bandwidth()) // bandwidth returns how much space each group should take
    .attr('height', (d) => yScale(d[0]) - yScale(d[1]));

  // [6] AXIS
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0); // configures size of start and end ticks
  const yAxis = d3
    .axisLeft(yScale)
    // configures number of ticks to appear (-> null = all ticks)
    // 's' is formatting argument (https://github.com/d3/d3-format#locale_format)
    .ticks(null, 's');

  container.append('g').attr('transform', `translate(0, ${dimensions.containerHeight})`).call(xAxis);
  container.append('g').attr('transform', `translate(${dimensions.margin}, 0)`).call(yAxis);
};

draw('#chart');
