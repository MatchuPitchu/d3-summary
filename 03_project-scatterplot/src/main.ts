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

const convertFahrenheitToCelsius = (number: number) => {
  const celsius = ((number - 32) * 5) / 9;
  return Math.round(celsius * 100) / 100;
};

const draw = async (chartWrapperSelector: string, tooltipSelector: string) => {
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
  const svg = d3
    .select(chartWrapperSelector)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  // <g> element is a container used to group other SVG elements
  // all presentation attributes are inherited to child elements
  const container = svg.append('g').attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`);

  const tooltip = d3.select(tooltipSelector);

  // data object joined to rect element is available as 2nd parameter
  // since `dataset` is connected to elements with data(dataset)
  const handleMouseenter = ({ target }: { target: SVGRectElement }, datum: DataItem) => {
    // FOR OPTION 1 WITHOUT VORONOI: update existing circle
    // d3.select(target).attr('fill', '#120078').attr('r', 8);

    // FOR OPTION 2 WITH VORONOI: create new circle
    container
      .append('circle')
      .classed('dot-hovered', true)
      .attr('fill', '#120078')
      .attr('r', 8)
      .attr('cx', (d) => xScale(xAccessor(datum)))
      .attr('cy', (d) => yScale(yAccessor(datum)))
      // have to set that ALL events on this event will be ignored
      // otherwise when hovering over new created circle, mouseleave event of 'path' element would be triggered
      .style('pointer-events', 'none');

    // Docu: https://github.com/d3/d3-format
    const formatter = d3.format('.2f');
    // Docu: https://github.com/d3/d3-time-format
    const dateFormatter = d3.timeFormat('%B %-d, %Y');

    tooltip
      .style('display', 'block')
      .style('top', `${yScale(yAccessor(datum)) - 30}px`) // position tooltip on top of circle
      .style('left', `${xScale(xAccessor(datum))}px`);

    tooltip.select('.metric-humidity > span').text(`${Math.round(xAccessor(datum) * 100)}%`);
    tooltip.select('.metric-temperature > span').text(formatter(yAccessor(datum)));
    const dateInMs = new Date(datum.currently.time * 1000);
    tooltip.select('.metric-date').text(dateFormatter(dateInMs));
  };

  const handleMouseleve = ({ target }: { target: SVGRectElement }) => {
    // FOR OPTION 1 WITHOUT VORONOI: update existing circle
    // d3.select(target).attr('fill', 'orange').attr('r', 5);

    // FOR OPTION 2 WITH VORONOI
    container.select('.dot-hovered').remove();

    tooltip.style('display', 'none');
  };

  // [4] SCALES
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
  // OPTION 1: attached to circles
  // .on('mouseenter', handleMouseenter)
  // .on('mouseleave', handleMouseleve);

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

  // [7] VORONOI DIAGRAM WITH D3 DELAUNAY LIBRARY
  // to detect which datapoint is closest to mouse cursor position
  // goal: improve UX for mouse events
  const delaunay = d3.Delaunay.from(
    dataset,
    (d) => xScale(xAccessor(d)), // x coordinate
    (d) => yScale(yAccessor(d)) // y coordinate
  ); // returns object with coordinates to draw the voronoi diagram

  const voronoi = delaunay.voronoi(); // generates functions to draw the voronoi diagram
  voronoi.xmax = dimensions.containerWidth; // set dimensions of scatterplot
  voronoi.ymax = dimensions.containerHeight;

  container
    .append('g')
    .selectAll('path') // no paths exist
    .data(dataset) // joins dataset items with selected elements
    .join('path') // creates new paths to match with dataset items
    .attr('stroke', 'grey')
    .attr('fill', 'transparent')
    .attr('d', (d, index) => voronoi.renderCell(index)) // renderCell returns coordinates that paths can be drawn (-> 'd' property)
    // OPTION 2: attached to voronoi areas
    .on('mouseenter', handleMouseenter)
    .on('mouseleave', handleMouseleve);
};

draw('#chart', '#tooltip');
