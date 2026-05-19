import type { IAPIResp } from "../models/APIResp";

/**
 * Parses a numeric value from a string like "+0007,1" or "-0005,2"
 * The value before the comma is the actual value multiplied by 10.
 * If the value consists of all nines (e.g., "+9999" or "-9999"), it's considered missing.
 * @param str The string to parse
 * @returns The parsed value divided by 10, or NaN if missing/invalid
 */
function parseNumericValue(str: string | undefined): number {
  if (!str) return NaN;
  // Extract the part before the first comma
  const parts = str.split(",");
  if (parts.length === 0) return NaN;
  const valueStr = parts[0].trim();
  if (!valueStr) return NaN;
  // Check if it's all nines (with optional sign)
  const match = valueStr.match(/^[+-]?9+$/);
  if (match) return NaN;
  // Parse as integer and divide by 10
  const intVal = parseInt(valueStr, 10);
  return isNaN(intVal) ? NaN : intVal / 10;
}

/**
 * Parses precipitation from AA1 field.
 * Format: "hours,precipitation_times_10,?,?"
 * - hours: number of hours over which precipitation was measured (99 = missing)
 * - precipitation_times_10: precipitation in mm * 10 (9999 = missing)
 * @param aa1 The AA1 string
 * @returns Precipitation in mm for the hour, or 0 if missing/invalid
 */
function parsePrecipitation(aa1: string | undefined): number {
  if (!aa1) return 0;
  const parts = aa1.split(",");
  if (parts.length < 2) return 0;
  const hoursStr = parts[0].trim();
  const precipStr = parts[1].trim();
  // If hours is 99 (missing) or precipitation is 9999 (missing), treat as missing (0)
  if (hoursStr === "99" || precipStr === "9999") return 0;
  const precipVal = parseInt(precipStr, 10);
  return isNaN(precipVal) ? 0 : precipVal / 10; // Convert to mm
}

/**
 * Parses visibility from VIS field.
 * Format: "visibility_in_meters,?,?,?"
 * - visibility_in_meters: visibility in meters (999999 = missing)
 *   Note: values > 160000 are stored as 160000.
 * @param vis The VIS string
 * @returns Visibility in meters, or NaN if missing/invalid
 */
function parseVisibility(vis: string | undefined): number {
  if (!vis) return NaN;
  const parts = vis.split(",");
  if (parts.length === 0) return NaN;
  const valueStr = parts[0].trim();
  if (valueStr === "999999") return NaN;
  const val = parseInt(valueStr, 10);
  return isNaN(val) ? NaN : val;
}

/**
 * Parses ceiling height from CIG field.
 * Format: "ceiling_height_in_meters,?,?,?"
 * - ceiling_height_in_meters: ceiling height in meters
 *   Values 99999 (all nines) or 22000 (above sensor range) indicate missing.
 * @param cig The CIG string
 * @returns Ceiling height in meters, or NaN if missing/invalid
 */
function parseCeiling(cig: string | undefined): number {
  if (!cig) return NaN;
  const parts = cig.split(",");
  if (parts.length === 0) return NaN;
  const valueStr = parts[0].trim();
  if (valueStr === "99999" || valueStr === "22000") return NaN;
  const val = parseInt(valueStr, 10);
  return isNaN(val) ? NaN : val;
}

/**
 * Calculates relative humidity from temperature and dew point using the August-Roche-Magnus formula
 * @param temp Temperature in Celsius
 * @param dew Dew point in Celsius
 * @returns Relative humidity as a percentage (0-100)
 */
function calculateHumidity(temp: number, dew: number): number {
  const a = 17.625;
  const b = 243.04;
  const numerator = Math.exp((a * dew) / (b + dew));
  const denominator = Math.exp((a * temp) / (b + temp));
  return (numerator / denominator) * 100;
}

export interface MonthlyStats {
  yearMonth: string;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  totalPrecip: number; // mm
  avgHumidity: number; // percent
  sunnyDays: number;
}

/**
 * Processes NOAA data to calculate monthly aggregates
 * @param data Array of NOAA hourly observations
 * @returns Array of monthly statistics
 */
export function processNOAAData(data: IAPIResp[]): MonthlyStats[] {
  // Map to store monthly data: key = "YYYY-MM"
  const monthlyMap = new Map<
    string,
    {
      temps: number[];
      precipSum: number;
      humiditySum: number;
      humidityCount: number;
      dailyData: Map<
        string,
        {
          dayPrecip: number;
          visSum: number;
          visCount: number;
          cigSum: number; // in meters
          cigCount: number;
        }
      >;
    }
  >();

  for (const record of data) {
    const date = new Date(record.DATE);
    if (isNaN(date.getTime())) continue;

    const yearMonth = date.toISOString().slice(0, 7); // "YYYY-MM"
    const yearMonthDay = date.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // Initialize monthly entry if not exists
    if (!monthlyMap.has(yearMonth)) {
      monthlyMap.set(yearMonth, {
        temps: [],
        precipSum: 0,
        humiditySum: 0,
        humidityCount: 0,
        dailyData: new Map(),
      });
    }
    const monthEntry = monthlyMap.get(yearMonth)!;
    if (!monthEntry) continue;

    // Initialize daily entry if not exists
    if (!monthEntry.dailyData.has(yearMonthDay)) {
      monthEntry.dailyData.set(yearMonthDay, {
        dayPrecip: 0,
        visSum: 0,
        visCount: 0,
        cigSum: 0,
        cigCount: 0,
      });
    }
    const dayEntry = monthEntry.dailyData.get(yearMonthDay)!;
    if (!dayEntry) continue;

    // Process temperature
    const temp = parseNumericValue(record.TMP);
    if (!isNaN(temp)) {
      monthEntry.temps.push(temp);
    }

    // Process precipitation (AA1)
    const precip = parsePrecipitation(record.AA1);
    monthEntry.precipSum += precip;
    dayEntry.dayPrecip += precip;

    // Process humidity (requires TMP and DEW)
    const dew = parseNumericValue(record.DEW);
    if (!isNaN(temp) && !isNaN(dew)) {
      const humidity = calculateHumidity(temp, dew);
      monthEntry.humiditySum += humidity;
      monthEntry.humidityCount++;
    }

    // Process visibility (VIS)
    const vis = parseVisibility(record.VIS);
    if (!isNaN(vis)) {
      dayEntry.visSum += vis;
      dayEntry.visCount++;
    }

    // Process ceiling (CIG)
    const cig = parseCeiling(record.CIG);
    if (!isNaN(cig)) {
      dayEntry.cigSum += cig;
      dayEntry.cigCount++;
    }
  }

  // Calculate final monthly statistics
  const result: MonthlyStats[] = [];
  for (const [yearMonth, monthEntry] of monthlyMap.entries()) {
    const { temps, precipSum, humiditySum, humidityCount, dailyData } =
      monthEntry;

    // Temperature stats
    const avgTemp =
      temps.length > 0 ? temps.reduce((a, b) => a + b) / temps.length : 0;
    const minTemp = temps.length > 0 ? Math.min(...temps) : 0;
    const maxTemp = temps.length > 0 ? Math.max(...temps) : 0;

    // Humidity average
    const avgHumidity = humidityCount > 0 ? humiditySum / humidityCount : 0;

    // Sunny days count
    let sunnyDays = 0;
    for (const dayEntry of dailyData.values()) {
      // Condition 1: No precipitation (allow small rounding error)
      const noPrecip = dayEntry.dayPrecip < 0.1;
      // Condition 2: Good visibility (if data available)
      const goodVis =
        dayEntry.visCount > 0
          ? dayEntry.visSum / dayEntry.visCount >= 10000 // 10 km
          : true; // If no visibility data, assume okay
      // Condition 3: High ceiling (if data available)
      const goodCig =
        dayEntry.cigCount > 0
          ? dayEntry.cigSum / dayEntry.cigCount >= 1828.8 // ~6000 feet in meters
          : true; // If no ceiling data, assume okay

      if (noPrecip && goodVis && goodCig) {
        sunnyDays++;
      }
    }

    result.push({
      yearMonth,
      avgTemp,
      minTemp,
      maxTemp,
      totalPrecip: precipSum,
      avgHumidity,
      sunnyDays,
    });
  }

  // Sort by yearMonth ascending
  result.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

  // Removes the first element
  result.shift();

  return result;
}
