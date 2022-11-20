import './style.css';
import * as d3 from 'd3';
// @ts-ignore
import { feature } from 'topojson-client';
import { GeoPermissibleObjects } from 'd3';

// [1] npm world atals TopoJSON: https://www.npmjs.com/package/world-atlas
// [2] npm topojson-client to convert TopoJSON to GeoJSON: https://www.npmjs.com/package/topojson-client

type Dataset = {
  type: string;
  arcs: Array<number[]>;
  bbox: number[];
  objects: {
    countries: {
      type: string;
      geometries: {
        type: string;
        id: string;
        properties: {
          name: string;
        };
        arcs: Array<number[]>;
      }[];
    };
    land: {
      type: string;
      geometries: {
        type: string;
        arcs: Array<number[]>;
      }[];
    };
  };
  transform: {
    type: string;
    scale: number[];
    translate: number[];
  };
};

type FeatureCollection = {
  type: string;
  features: {
    type: string;
    id: string;
    properties: {
      name: string;
    };
    geometry: {
      type: string;
      coordinates: Array<number[]>;
    };
  }[];
};

interface Dimensions {
  width: number;
  height: number;
  margin: number;
  containerWidth: number;
  containerHeight: number;
}

const draw = async (chartWrapperSelector: string) => {
  // [1] DATA
  const dataset = await d3.json<Dataset>('./data/countries-110m.json');
  if (!dataset) return;

  // convert TopoJSON into GeoJSON
  const countries: FeatureCollection = feature(dataset, dataset.objects.countries);

  // [2] DIMENSIONS
  const dimensions: Dimensions = {
    width: 1000,
    height: 700,
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
    .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);

  const container = svg.append('g').attr('transform', `translate(${dimensions.margin}, ${dimensions.margin})`);

  // [4] SCALES
  const projection = d3.geoMercator();
  const pathGenerator = d3.geoPath().projection(projection);

  // [5] DRAW SHAPES
  container
    .selectAll('path')
    .data(countries.features)
    .join('path')
    .attr('d', (d) => pathGenerator(d as GeoPermissibleObjects))
    .attr('stroke', '#4a4a4a')
    .attr('stroke-width', 0.5)
    .attr('fill', '#eee');
};

draw('#chart');
