import './style.css';
import * as d3 from 'd3';
import { PieArcDatum } from 'd3';

type DataItem = {
  name: string;
  value: string;
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
  // array of objects of weather data
  const dataset = (await d3.csv<keyof DataItem>('./data/data.csv')) as Dataset;
  if (!dataset) return;

  // [2] DIMENSIONS
  const dimensions: Dimensions = {
    width: 600,
    height: 600,
    margin: 10,
    containerWidth: 0,
    containerHeight: 0,
  };

  dimensions.containerWidth = dimensions.width - dimensions.margin * 2;
  dimensions.containerHeight = dimensions.height - dimensions.margin * 2;

  const chartRadius = dimensions.containerWidth / 2;

  // [3] DRAW IMAGE
  const svg = d3
    .select(chartWrapperSelector)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const container = svg.append('g').attr('transform', `translate(${dimensions.margin}, ${dimensions.margin})`);

  // [4] SCALES
  // pie() returns function that can transform data; value() works as an accessor of value on which pie is baseds
  // value() tells d3 how to access data
  // Notice:
  const populationPie = d3
    .pie<any, DataItem>()
    .value((d) => +d.value)
    .sort(null); // populationPie sorts data in descending order clockwise based on return of value(), sort(null) keeps order of original datase
  // returns array of slices with all data needed to draw them; angles data is calculated in radians (https://www.mathsisfun.com/geometry/radians.html)
  const dataConvertedToSlices = populationPie(dataset);

  // arc() returns function that returns all path coordinates to draw an arc
  const arcCoordsCreator = d3.arc<any, PieArcDatum<DataItem>>().outerRadius(chartRadius).innerRadius(0); // sets space at center of pie (-> create a donut chart)

  const arcLabelsCoordsCreator = d3.arc<any, PieArcDatum<DataItem>>().outerRadius(chartRadius).innerRadius(200); // sets space at center of pie (-> create a donut chart)

  // when you need more than 11 colors, you can NOT use `schemeNAME_OF_SCHEME()`
  // you have to generate colors with quantize() that loops through 1st argument cb fn x times (-> here dataset.length)
  // parameter t = evenly distributed number between 0 and 1
  // -> eta reduction of cb function possible: d3.interpolateSpectral
  const colors = d3.quantize((t) => d3.interpolateSpectral(t), dataset.length);
  const colorScale = d3
    .scaleOrdinal<string>()
    .domain(dataset.map((item) => item.name)) // pass in array of ALL name properties of dataItem object
    .range(colors);

  // [5] DRAW SHAPES - ARC
  const arcGroup = container
    .append('g')
    .attr('transform', `translate(${dimensions.containerWidth / 2}, ${dimensions.containerHeight / 2})`); // center container; arc is drawn based on center position

  arcGroup
    .selectAll('path')
    .data(dataConvertedToSlices)
    .join('path')
    .attr('d', arcCoordsCreator)
    .attr('fill', (d) => colorScale(d.data.name));

  const labelsGroup = container
    .append('g')
    .attr('transform', `translate(${dimensions.containerWidth / 2}, ${dimensions.containerHeight / 2})`)
    .classed('labels', true);

  labelsGroup
    .selectAll('text')
    .data(dataConvertedToSlices)
    .join('text')
    // use arcLabelsCoordsCreator to position labels closer to edge of arc
    .attr('transform', (d) => `translate(${arcLabelsCoordsCreator.centroid(d)})`) // centroid() returns x, y coordinates
    // call() returns initial selection AND allows to call all elements of your selection and manipulate them or do something with them
    // https://github.com/d3/d3-selection/blob/v1.4.1/README.md#selection_call
    .call((text) =>
      text
        .append('tspan')
        .style('font-weight', 'bold')
        .attr('y', -4) // move <tspan> higher
        .text((d) => d.data.name)
    )
    .call((text) =>
      text
        .filter((d) => d.endAngle - d.startAngle > 0.25) // when slices are too small, text can NOT be read, so filter these texts out
        .append('tspan')
        .attr('y', 9)
        .attr('x', 0)
        .text((d) => d.data.value)
    );
};

draw('#chart');
