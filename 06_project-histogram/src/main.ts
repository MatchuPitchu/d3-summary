import './style.css';
import * as d3 from 'd3';

type DataItem = Record<string, any>;
type Dataset = DataItem[] | undefined;

interface Dimensions {
  width: number;
  height: number;
  margin: number;
  containerWidth: number;
  containerHeight: number;
}

type Metric = 'humidity' | 'temperature' | 'dewPoint' | 'windSpeed' | 'cloudCover' | 'ozone';

const draw = async (chartWrapperSelector: string, metricSelector: string) => {
  // [1] DATA
  // array of objects of weather data
  const dataset: Dataset = await d3.json('./data/data.json');
  if (!dataset) return;

  // [2] DIMENSIONS
  const dimensions: Dimensions = {
    width: 800,
    height: 400,
    margin: 50,
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

  // create once labelsGroup AND xAxisGroup
  // so d3 is aware when there are already elements on screen and
  // removes and creates new elements based on dataset
  const labelsGroup = container.append('g').classed('bar-labels', true);
  const xAxisGroup = container.append('g').style('transform', `translateY(${dimensions.containerHeight}px)`);

  const drawHistogram = (metric: Metric) => {
    const xAccessor = (d: DataItem): number => d.currently[metric];
    const yAccessor = (d: any[]): number => d.length;

    // [4] SCALE
    const xScale = d3
      .scaleLinear()
      .domain(<[number, number]>d3.extent(dataset, xAccessor))
      .range([0, dimensions.containerWidth])
      .nice(); // round domain values

    // [5] DATA GROUPING FOR HISTOGRAM
    const bin = d3
      .bin<DataItem, number>()
      .domain(<[number, number]>xScale.domain()) // provides your defined input domain above
      .value(xAccessor) // tells d3 based on which value the data should be grouped together
      .thresholds(10); // number of bins/groups should be returned, value is a recommendation to d3

    // newDataset: in each array, properties x0 and x1 indicates the range of values of this specifc groupe
    const newDataset = bin(dataset);
    const padding = 1;
    // console.log({ original: dataset, new: newDataset });

    const yScale = d3
      .scaleLinear()
      .domain(<[number, number]>[0, d3.max(newDataset, yAccessor)])
      .range([dimensions.containerHeight, 0]) // reverse values in output range that you can read data from bottom to top
      .nice();

    // [6] DRAW SHAPES - BARS
    // NOW: all bars are drawn (even if they overlap)
    container
      .selectAll('rect')
      .data(newDataset)
      .join('rect')
      .attr('width', (d) => d3.max([0, xScale(d.x1!) - xScale(d.x0!) - padding]) || 0) // width should be >= 0 or calculated value
      .attr('height', (d) => {
        console.log(yAccessor(d), yScale(yAccessor(d)));
        return dimensions.containerHeight - yScale(yAccessor(d)); // minus yScale() since output range was reversed in yScale
      })
      .attr('x', (d) => xScale(d.x0!)) // position bars on x axis
      .attr('y', (d) => yScale(yAccessor(d)))
      .attr('fill', '#01c5c4');

    labelsGroup
      .selectAll('text')
      .data(newDataset)
      .join('text')
      .attr('x', (d) => xScale(d.x0!) + (xScale(d.x1!) - xScale(d.x0!)) / 2) // position <text> in middle of each group
      .attr('y', (d) => yScale(yAccessor(d)) - 10) // position 10px above top point of bar (minus since yScale was reversed)
      .text(yAccessor);

    // [7] AXIS
    const axis = d3.axisBottom(xScale);
    xAxisGroup.call(axis);
  };

  // [8] Events
  const handleMetricChange = (event: Event) => {
    event.preventDefault();
    const metric = (event.target as HTMLSelectElement).value as Metric;

    drawHistogram(metric);
  };

  d3.select(metricSelector).on('change', handleMetricChange); // listen to change events

  drawHistogram('humidity');
};

draw('#chart', '#metric');
