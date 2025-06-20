import fs from 'fs';
import fetch from 'node-fetch';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';

const SAMPLE_SPACING = 1.0; // 1.0 degrees between sample points
const MIN_POINTS_PER_REGION = 3; // Minimum points to consider a region

async function fetchWorldData() {
    const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json');
    return response.json();
}

function samplePoints(feature) {
    const points = [];
    const regions = [];
    let currentRegion = [];

    // Sample points across the globe
    for (let lat = -90; lat <= 90; lat += SAMPLE_SPACING) {
        for (let lng = -180; lng <= 180; lng += SAMPLE_SPACING) {
            if (d3.geoContains(feature, [lng, lat])) {
                const point = [lng, lat];
                points.push(point);
                
                // Group adjacent points into regions
                if (currentRegion.length === 0 || 
                    isAdjacent(currentRegion[currentRegion.length - 1], point)) {
                    currentRegion.push(point);
                } else {
                    if (currentRegion.length >= MIN_POINTS_PER_REGION) {
                        regions.push([...currentRegion]);
                    }
                    currentRegion = [point];
                }
            }
        }
        // Check for region at end of latitude line
        if (currentRegion.length >= MIN_POINTS_PER_REGION) {
            regions.push([...currentRegion]);
        }
        currentRegion = [];
    }

    return regions;
}

function isAdjacent(point1, point2) {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;
    const latDiff = Math.abs(lat1 - lat2);
    let lngDiff = Math.abs(lng1 - lng2);
    
    // Handle wraparound at 180/-180
    if (lngDiff > 180) {
        lngDiff = 360 - lngDiff;
    }

    return latDiff <= SAMPLE_SPACING * 1.5 && lngDiff <= SAMPLE_SPACING * 1.5;
}

function optimizeRegions(regions) {
    return regions.map(region => {
        // Simplify each region by removing some intermediate points
        const simplified = region.filter((_, index) => {
            // Keep start, end, and every other point
            return index === 0 || index === region.length - 1 || index % 2 === 0;
        });
        return simplified;
    }).filter(region => region.length >= MIN_POINTS_PER_REGION);
}

function sampleEvenlyToTarget(regions, targetCount) {
    const totalPoints = regions.reduce((sum, region) => sum + region.length, 0);
    const keepRatio = targetCount / totalPoints;
    
    return regions.map(region => {
        const keepCount = Math.max(3, Math.round(region.length * keepRatio));
        const step = Math.max(1, Math.floor(region.length / keepCount));
        return region.filter((_, index) => index % step === 0);
    }).filter(region => region.length >= 3);
}

async function generateGlobeData() {
    console.log('Fetching world data...');
    const worldData = await fetchWorldData();
    const land = topojson.feature(worldData, worldData.objects.land);
    
    console.log('Sampling points...');
    const regions = samplePoints(land);
    
    // Sample down to approximately 8000 points while maintaining distribution
    const targetRegions = sampleEvenlyToTarget(regions, 8000);
    
    console.log(`Generated ${targetRegions.length} regions with a total of ${
        targetRegions.reduce((sum, region) => sum + region.length, 0)
    } points`);
    
    // Convert to format suitable for our Globe component
    const output = `// Auto-generated globe data
export const CONTINENTAL_POINTS = ${
        JSON.stringify(targetRegions, null, 2)
    };
`;
    
    fs.writeFileSync('./src/data/globeData.ts', output);
    console.log('Data written to src/data/globeData.ts');
}

generateGlobeData().catch(console.error);
