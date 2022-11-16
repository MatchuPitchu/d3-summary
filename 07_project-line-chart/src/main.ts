import './style.css';
import * as d3 from 'd3';

type DataItem = {
  date: string;
  close: string;
};

type Dataset = DataItem[] | undefined;

interface Dimensions {
  width: number;
  height: number;
  margin: number;
  containerWidth: number;
  containerHeight: number;
}

const numberToCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const draw = async (chartWrapperSelector: string, tooltipSelector: string) => {
  // [1] DATA
  // array of objects of weather data
  const dataset = (await d3.csv<keyof DataItem>('./data/data.csv')) as Dataset;
  if (!dataset) return;

  // parse with built-in timeParse() and tell d3 which values are year, month and day
  const parseDate = d3.timeParse('%Y-%m-%d');

  const xAccessor = (d: DataItem) => parseDate(d.date);
  const yAccessor = (d: DataItem) => +d.close;

  // [2] DIMENSIONS
  const dimensions: Dimensions = {
    width: 800,
    height: 600,
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

  // [4] TOOLTIP
  const tooltip = d3.select(tooltipSelector);

  const tooltipDot = container
    .append('circle')
    .attr('r', 5)
    .attr('fill', '#fc8781')
    .attr('strok', '#000000')
    .attr('stroke-width', 2)
    .style('opacity', 0)
    .style('pointer-events', 'none');

  // [5] SCALES
  const yScale = d3
    .scaleLinear<number, number>()
    .domain(<[number, number]>d3.extent(dataset, yAccessor))
    .range([dimensions.containerHeight, 0])
    .nice();

  // scaleTime and scaleUtc transform Date object into number
  // scaleUtc: constructs a new time scale based on the Coordinated Universal Time (UTC) with the specified range
  // -> time is equal no matter where you are living
  const xScale = d3
    // .scaleTime<number, number>()
    .scaleUtc<number, number>()
    .domain(<[Date, Date]>d3.extent(dataset, xAccessor))
    .range([0, dimensions.containerWidth]);

  // [6] PATH GENERATOR
  const lineGenerator = d3
    .line<DataItem>()
    .x((d) => xScale(xAccessor(d)!))
    .y((d) => yScale(yAccessor(d)!));

  // [7] DRAW SHAPE -> PATH
  const handleTouch = (event: TouchEvent | MouseEvent) => {
    const mousePosition = d3.pointer(event, event.target); // returns current mouse position

    // x mouse position is mousePosition[0]
    const date = xScale.invert(mousePosition[0]); // returns original value in dataset, NOT scale value

    // CUSTOM BISECTOR
    // const index = d3.bisect(dataset, date); // NOT working since bisect() can only compare numbers, NOT dates
    const bisector = d3.bisector(xAccessor).left; // tells d3 how to access the date in dataset; options where to insert date: left, center, right
    const index = bisector(dataset, date);
    const selectedDataPoint = dataset[index - 1]; // index - 1: because the value that you are searching for is left (!) to the point where mouse hovers

    // UPDATE TOOLTIP
    tooltipDot
      .style('opacity', 1)
      .attr('cx', xScale(xAccessor(selectedDataPoint)!)) // NO (d) => { ... } because you are NOT using data item object
      .attr('cy', yScale(yAccessor(selectedDataPoint)))
      .raise(); // Re-insert each selected element, in order, as the last child of its parent

    tooltip
      .style('display', 'block')
      .style('top', `${yScale(yAccessor(selectedDataPoint)) - 20}px`)
      .style('left', `${xScale(xAccessor(selectedDataPoint)!)}px`);

    tooltip.select('.price').text(numberToCurrency.format(yAccessor(selectedDataPoint)));

    const dateFormatter = d3.timeFormat('%B %-d, %Y');
    tooltip.select('.date').text(dateFormatter(xAccessor(selectedDataPoint)!));
  };

  const handleMouseleave = (event: MouseEvent) => {
    tooltipDot.style('opacity', 0);
    tooltip.style('display', 'none');
  };

  container
    .append('path')
    .datum(dataset) // datum() instead of data() path is 1 element, so have to join whole dataset to this element
    .attr('d', lineGenerator)
    .attr('fill', 'none') // by default line path is filled
    .attr('stroke', '#4a4a4a')
    .attr('stroke-width', 2);

  // [8] AXIS
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => numberToCurrency.format(+d));
  const xAxis = d3.axisBottom(xScale);

  container.append('g').call(yAxis);
  container.append('g').style('transform', `translateY(${dimensions.containerHeight}px`).call(xAxis);

  // [9] IMPROVE UX OF MOUSE AND TOUCH EVENTS
  // when adding events on <path> then event is only triggered when hovering over small line
  container
    .append('rect')
    .attr('width', dimensions.containerWidth)
    .attr('height', dimensions.containerHeight)
    .style('opacity', 0)
    .on('touchmouse mousemove', handleTouch) // listen for 2 events (-> touchmouse for touch screens)
    .on('mouseleave', handleMouseleave);
};

draw('#chart', '#tooltip');
