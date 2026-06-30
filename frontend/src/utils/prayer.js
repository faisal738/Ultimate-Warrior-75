// Offline-first astronomical prayer time calculations
// Uses standard calculation formulas (e.g. ISNA: Fajr 15 deg, Isha 15 deg)

export const calculatePrayerTimes = (latitude, longitude, timezoneOffset = null, date = new Date()) => {
  // If timezoneOffset is not provided, read it from the client browser
  const tz = timezoneOffset !== null ? timezoneOffset : -date.getTimezoneOffset() / 60;
  
  const latitudeRad = (latitude * Math.PI) / 180;
  
  // Calculate day of the year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Astronomical calculations
  // Declination of Sun
  const sunDeclination = 0.409 * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365);
  
  // Equation of time
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
  const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes

  // Solar noon (Dhuhr)
  const meridian = 15 * tz;
  const solarNoon = 12 + (meridian - longitude) / 15 - equationOfTime / 60; // hours decimal

  // Helper to calculate hour angle
  const calculateHourAngle = (angle, isSunriseSunset = false) => {
    const angleRad = (angle * Math.PI) / 180;
    let cosH;
    
    if (isSunriseSunset) {
      // account for refraction/sun disk size (-0.833 degrees)
      const refractionAngleRad = (-0.833 * Math.PI) / 180;
      cosH = (Math.sin(refractionAngleRad) - Math.sin(latitudeRad) * Math.sin(sunDeclination)) / 
             (Math.cos(latitudeRad) * Math.cos(sunDeclination));
    } else {
      cosH = (Math.sin(angleRad) - Math.sin(latitudeRad) * Math.sin(sunDeclination)) / 
             (Math.cos(latitudeRad) * Math.cos(sunDeclination));
    }

    if (cosH > 1 || cosH < -1) return null; // Sun doesn't reach this angle
    return Math.acos(cosH) * (180 / Math.PI) / 15; // hours decimal
  };

  // 1. Fajr (usually 15 or 17.7 or 18 degrees below horizon)
  // Let's use 15 degrees (ISNA standard)
  const fajrAngle = -15; 
  const fajrHourAngle = calculateHourAngle(fajrAngle);
  const fajrTime = fajrHourAngle ? solarNoon - fajrHourAngle : solarNoon - 1.5;

  // 2. Sunrise
  const sunriseHourAngle = calculateHourAngle(0, true);
  const sunriseTime = sunriseHourAngle ? solarNoon - sunriseHourAngle : solarNoon - 1.0;

  // 3. Dhuhr
  const dhuhrTime = solarNoon;

  // 4. Asr (Standard method: shadow factor = 1)
  const asrAngleRad = Math.atan(1 + Math.abs(Math.tan(latitudeRad - sunDeclination)));
  const asrAngleDeg = (asrAngleRad * 180) / Math.PI;
  const asrHourAngle = calculateHourAngle(asrAngleDeg);
  const asrTime = asrHourAngle ? solarNoon + asrHourAngle : solarNoon + 2.5;

  // 5. Maghrib (Sunset)
  const maghribTime = sunriseHourAngle ? solarNoon + sunriseHourAngle : solarNoon + 1.0;

  // 6. Isha (ISNA standard: 15 degrees below horizon)
  const ishaAngle = -15;
  const ishaHourAngle = calculateHourAngle(ishaAngle);
  const ishaTime = ishaHourAngle ? solarNoon + ishaHourAngle : solarNoon + 1.5;

  // Helper to format decimal hours into "HH:MM"
  const formatTime = (decimalHours) => {
    let hours = Math.floor(decimalHours);
    let minutes = Math.round((decimalHours - hours) * 60);
    
    if (minutes === 60) {
      hours += 1;
      minutes = 0;
    }
    
    hours = (hours + 24) % 24;
    
    const hStr = hours.toString().padStart(2, '0');
    const mStr = minutes.toString().padStart(2, '0');
    
    return `${hStr}:${mStr}`;
  };

  return {
    fajr: formatTime(fajrTime),
    sunrise: formatTime(sunriseTime),
    dhuhr: formatTime(dhuhrTime),
    asr: formatTime(asrTime),
    maghrib: formatTime(maghribTime),
    isha: formatTime(ishaTime)
  };
};

// Calculate Hijri Date approximation based on Gregorian date
export const getHijriDate = (date = new Date()) => {
  // Simple astronomical estimation or standard Umm al-Qura math
  // We can write a lightweight converter
  let gYear = date.getFullYear();
  let gMonth = date.getMonth();
  let gDay = date.getDate();

  let jd;
  if (gMonth < 2) {
    gYear -= 1;
    gMonth += 12;
  }
  
  const a = Math.floor(gYear / 100);
  const b = Math.floor(a / 4);
  const c = 2 - a + b;
  const e = Math.floor(365.25 * (gYear + 4716));
  const f = Math.floor(30.6001 * (gMonth + 2));
  jd = c + gDay + e + f - 1524.5;

  let l = jd - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  let j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  
  const hMonth = Math.floor((24 * l) / 709);
  const hDay = l - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  const islamicMonths = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ];

  return `${hDay} ${islamicMonths[hMonth - 1]} ${hYear} AH`;
};
