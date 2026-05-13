import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./GeoScaleMap.css";

const COLORS = ["#ef4444","#22c55e","#3b82f6","#f59e0b","#8b5cf6","#f97316","#06b6d4","#ec4899"];

const COUNTRY_DATA = {
  "Afghanistan":{area:652230,pop:"40M"},"Algeria":{area:2381741,pop:"45M"},
  "Angola":{area:1246700,pop:"35M"},"Argentina":{area:2780400,pop:"46M"},
  "Australia":{area:7692024,pop:"26M"},"Austria":{area:83871,pop:"9M"},
  "Bangladesh":{area:147570,pop:"170M"},"Belarus":{area:207600,pop:"9M"},
  "Bolivia":{area:1098581,pop:"12M"},"Botswana":{area:581730,pop:"3M"},
  "Brazil":{area:8515767,pop:"215M"},"Bulgaria":{area:110879,pop:"6M"},
  "Cambodia":{area:181035,pop:"17M"},"Cameroon":{area:475442,pop:"28M"},
  "Canada":{area:9984670,pop:"38M"},"Central African Rep.":{area:622984,pop:"5M"},
  "Chad":{area:1284000,pop:"17M"},"Chile":{area:756102,pop:"19M"},
  "China":{area:9596960,pop:"1.4B"},"Colombia":{area:1141748,pop:"52M"},
  "Croatia":{area:56594,pop:"4M"},"Cuba":{area:109884,pop:"11M"},
  "Czech Rep.":{area:78867,pop:"11M"},"Dem. Rep. Congo":{area:2344858,pop:"100M"},
  "Denmark":{area:42924,pop:"6M"},"Dominican Rep.":{area:48671,pop:"11M"},
  "Ecuador":{area:283561,pop:"18M"},"Egypt":{area:1001449,pop:"105M"},
  "Ethiopia":{area:1104300,pop:"120M"},"Finland":{area:338145,pop:"6M"},
  "France":{area:551695,pop:"68M"},"Gabon":{area:267668,pop:"2M"},
  "Germany":{area:357114,pop:"84M"},"Ghana":{area:238533,pop:"33M"},
  "Greece":{area:131957,pop:"11M"},"Greenland":{area:2166086,pop:"57K"},
  "Guatemala":{area:108889,pop:"18M"},"Honduras":{area:112492,pop:"10M"},
  "Hungary":{area:93028,pop:"10M"},"Iceland":{area:103000,pop:"376K"},
  "India":{area:3287263,pop:"1.4B"},"Indonesia":{area:1904569,pop:"275M"},
  "Iran":{area:1648195,pop:"86M"},"Iraq":{area:438317,pop:"42M"},
  "Ireland":{area:70273,pop:"5M"},"Italy":{area:301340,pop:"60M"},
  "Japan":{area:377915,pop:"125M"},"Jordan":{area:89342,pop:"10M"},
  "Kazakhstan":{area:2724900,pop:"19M"},"Kenya":{area:580367,pop:"56M"},
  "North Korea":{area:120538,pop:"26M"},"South Korea":{area:100210,pop:"52M"},
  "Kyrgyzstan":{area:199951,pop:"7M"},"Laos":{area:236800,pop:"7M"},
  "Latvia":{area:64589,pop:"2M"},"Libya":{area:1759541,pop:"7M"},
  "Lithuania":{area:65300,pop:"3M"},"Madagascar":{area:587041,pop:"28M"},
  "Malaysia":{area:329847,pop:"33M"},"Mali":{area:1240192,pop:"22M"},
  "Mauritania":{area:1030700,pop:"5M"},"Mexico":{area:1964375,pop:"128M"},
  "Mongolia":{area:1564116,pop:"3M"},"Morocco":{area:446550,pop:"37M"},
  "Mozambique":{area:801590,pop:"32M"},"Myanmar":{area:676578,pop:"54M"},
  "Namibia":{area:825615,pop:"3M"},"Nepal":{area:147181,pop:"30M"},
  "Netherlands":{area:41543,pop:"18M"},"New Zealand":{area:270467,pop:"5M"},
  "Niger":{area:1267000,pop:"25M"},"Nigeria":{area:923768,pop:"220M"},
  "Norway":{area:323802,pop:"5M"},"Pakistan":{area:796095,pop:"231M"},
  "Panama":{area:75417,pop:"4M"},"Papua New Guinea":{area:462840,pop:"10M"},
  "Paraguay":{area:406752,pop:"7M"},"Peru":{area:1285216,pop:"33M"},
  "Philippines":{area:300000,pop:"114M"},"Poland":{area:312679,pop:"38M"},
  "Portugal":{area:92212,pop:"10M"},"Romania":{area:238397,pop:"19M"},
  "Russia":{area:17098242,pop:"145M"},"Saudi Arabia":{area:2149690,pop:"35M"},
  "Senegal":{area:196722,pop:"17M"},"Serbia":{area:77474,pop:"7M"},
  "Somalia":{area:637657,pop:"17M"},"South Africa":{area:1219090,pop:"60M"},
  "Spain":{area:505990,pop:"47M"},"Sri Lanka":{area:65610,pop:"22M"},
  "Sudan":{area:1861484,pop:"46M"},"Sweden":{area:450295,pop:"10M"},
  "Switzerland":{area:41285,pop:"9M"},"Syria":{area:185180,pop:"22M"},
  "Tajikistan":{area:143100,pop:"10M"},"Tanzania":{area:945087,pop:"63M"},
  "Thailand":{area:513120,pop:"72M"},"Tunisia":{area:163610,pop:"12M"},
  "Turkey":{area:783562,pop:"85M"},"Turkmenistan":{area:488100,pop:"6M"},
  "Uganda":{area:241550,pop:"48M"},"Ukraine":{area:603550,pop:"44M"},
  "United Arab Emirates":{area:83600,pop:"10M"},
  "United Kingdom":{area:243610,pop:"68M"},
  "United States of America":{area:9372610,pop:"331M"},
  "Uruguay":{area:176215,pop:"4M"},"Uzbekistan":{area:447400,pop:"36M"},
  "Venezuela":{area:912050,pop:"32M"},"Vietnam":{area:331212,pop:"97M"},
  "Yemen":{area:527968,pop:"34M"},"Zambia":{area:752618,pop:"19M"},
  "Zimbabwe":{area:390757,pop:"16M"},
};

const ISO_MAP = {
  "United States of America":"840","Russia":"643","Canada":"124","China":"156",
  "Brazil":"076","Australia":"036","India":"356","Argentina":"032",
  "Kazakhstan":"398","Algeria":"012","Dem. Rep. Congo":"180","Saudi Arabia":"682",
  "Mexico":"484","Indonesia":"360","Sudan":"729","Libya":"434","Iran":"364",
  "Mongolia":"496","Peru":"604","Chad":"148","Niger":"562","Angola":"024",
  "Mali":"466","South Africa":"710","Colombia":"170","Ethiopia":"231",
  "Bolivia":"068","Mauritania":"478","Egypt":"818","Tanzania":"834",
  "Nigeria":"566","Venezuela":"862","Namibia":"516","Mozambique":"508",
  "Pakistan":"586","Turkey":"792","Chile":"152","Zambia":"894","Myanmar":"104",
  "Afghanistan":"004","Somalia":"706","Central African Rep.":"140",
  "Ukraine":"804","Madagascar":"450","Kenya":"404","Botswana":"072",
  "France":"250","Yemen":"887","Thailand":"764","Spain":"724",
  "Turkmenistan":"795","Cameroon":"120","Papua New Guinea":"598",
  "Sweden":"752","Uzbekistan":"860","Iraq":"368","Paraguay":"600",
  "Zimbabwe":"716","Japan":"392","Germany":"276","Norway":"578",
  "Poland":"616","Finland":"246","Italy":"380","Philippines":"608",
  "Ecuador":"218","New Zealand":"554","Gabon":"266","United Kingdom":"826",
  "Ghana":"288","Romania":"642","Laos":"418","Uganda":"800",
  "Kyrgyzstan":"417","Cambodia":"116","Syria":"760","Uruguay":"858",
  "Tunisia":"788","Bangladesh":"050","Nepal":"524","Tajikistan":"762",
  "Greece":"300","North Korea":"408","South Korea":"410","Iceland":"352",
  "Portugal":"620","Jordan":"400","United Arab Emirates":"784",
  "Sri Lanka":"144","Lithuania":"440","Latvia":"428","Croatia":"191",
  "Denmark":"208","Switzerland":"756","Netherlands":"528","Austria":"040",
  "Hungary":"348","Cuba":"192","Honduras":"340","Guatemala":"320",
  "Panama":"591","Morocco":"504","Malaysia":"458","Vietnam":"704",
  "Serbia":"688","Ireland":"372","Greenland":"304","Senegal":"686",
  "Belarus":"112","Oman":"512","Czech Rep.":"203",
};

// â”€â”€â”€ Mercator reprojection helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Given the original (centroid) latitude and the new (target) latitude,
// reproject a single [lat, lng] coordinate so that the horizontal scale
// matches the Mercator distortion at the target latitude.
//
// Mercator horizontal scale factor = 1 / cos(lat).
// To move from origLat â†’ newLat we multiply the lng offset from centroid
// by cos(origLat) / cos(newLat), which is the ratio of the two scale factors.

function reprojectLatLng(lat, lng, origCentroidLat, origCentroidLng, newCentroidLat, newCentroidLng) {
  const toRad = d => d * Math.PI / 180;
  const cosOrig = Math.cos(toRad(origCentroidLat));
  const cosNew  = Math.cos(toRad(newCentroidLat));
  // Clamp to avoid division by zero near poles
  const safeNew = cosNew < 0.01 ? 0.01 : cosNew;

  const dlng = lng - origCentroidLng;
  const dlat = lat - origCentroidLat;

  const newLng = newCentroidLng + dlng * (cosOrig / safeNew);
  const newLat = Math.max(-85, Math.min(85, newCentroidLat + dlat));
  return L.latLng(newLat, newLng);
}

function reprojectRing(ring, origCLat, origCLng, newCLat, newCLng) {
  if (!Array.isArray(ring)) return ring;
  if (ring[0] && typeof ring[0].lat === "number") {
    return ring.map(ll => reprojectLatLng(ll.lat, ll.lng, origCLat, origCLng, newCLat, newCLng));
  }
  return ring.map(r => reprojectRing(r, origCLat, origCLng, newCLat, newCLng));
}

// Compute centroid of a flat LatLng array (works on nested rings too)
function flattenLatLngs(latlngs, out = []) {
  if (!Array.isArray(latlngs)) return out;
  if (latlngs[0] && typeof latlngs[0].lat === "number") {
    latlngs.forEach(ll => out.push(ll));
  } else {
    latlngs.forEach(r => flattenLatLngs(r, out));
  }
  return out;
}

function centroid(latlngs) {
  const pts = flattenLatLngs(latlngs);
  if (!pts.length) return { lat: 0, lng: 0 };
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  return { lat, lng };
}
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function GeoScaleMapPage() {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const geoDataRef      = useRef(null);
  const layersRef       = useRef({});       // name â†’ { layer, origLatLngs, origCentroid }
  const colorIdxRef     = useRef(0);
  const [pinned, setPinned]           = useState([]);
  const [search, setSearch]           = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState("");

  // Init map
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [20, 0], zoom: 3, minZoom: 2, maxZoom: 10, zoomControl: false,
    });
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      { attribution: "&copy; CARTO", subdomains: "", maxZoom: 19 }
    ).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    mapRef.current = map;

    // Preload GeoJSON
    import("topojson-client").then(topo => {
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(r => r.json())
        .then(data => { geoDataRef.current = topo.feature(data, data.objects.countries); })
        .catch(e => console.error("GeoJSON load failed", e));
    }).catch(e => console.error("topojson load failed", e));


    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Search suggestions
  useEffect(() => {
    if (!search.trim()) { setSuggestions([]); return; }
    const q = search.toLowerCase();
    setSuggestions(Object.keys(COUNTRY_DATA).filter(n => n.toLowerCase().includes(q)).slice(0, 8));
  }, [search]);

  const addCountry = async (name) => {
    if (!mapRef.current || pinned.find(c => c.name === name)) return;
    setLoading(name);
    const color = COLORS[colorIdxRef.current % COLORS.length];
    colorIdxRef.current++;
    if (!geoDataRef.current) {
      try {
        const topo = await import("topojson-client");
        const data = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(r => r.json());
        geoDataRef.current = topo.feature(data, data.objects.countries);
      } catch(e) { setLoading(""); alert("Failed to load map data."); return; }
    }
    const isoId = ISO_MAP[name];
    const features = isoId
      ? geoDataRef.current.features.filter(f => String(f.id) === isoId)
      : geoDataRef.current.features.filter(f => (f.properties?.name || "").toLowerCase() === name.toLowerCase());
    if (!features.length) { setLoading(""); alert("Borders not found for " + name); return; }
    const geojson = features.length === 1 ? features[0] : { type: "FeatureCollection", features };
    const map = mapRef.current;
    const layer = L.geoJSON(geojson, {
      style: { color, weight: 2, opacity: 0.9, fillColor: color, fillOpacity: 0.4 },
    }).addTo(map);
    let origLatLngs = null;
    let origCentroid = null;
    layer.eachLayer(sub => {
      if (!origLatLngs) { origLatLngs = sub.getLatLngs(); origCentroid = centroid(origLatLngs); }
    });
    let isDragging = false, dragStartLL = null, dragBaseLat = null, dragBaseLng = null, snapLatLngs = null;
    layer.eachLayer(sub => {
      sub.on("mousedown", e => {
        isDragging = true; dragStartLL = e.latlng;
        const c = centroid(sub.getLatLngs());
        dragBaseLat = c.lat; dragBaseLng = c.lng;
        snapLatLngs = sub.getLatLngs();
        map.dragging.disable(); e.originalEvent.preventDefault();
      });
    });
    map.on("mousemove", e => {
      if (!isDragging || !dragStartLL) return;
      const dlat = e.latlng.lat - dragStartLL.lat;
      const dlng = e.latlng.lng - dragStartLL.lng;
      const newCLat = Math.max(-80, Math.min(80, dragBaseLat + dlat));
      const newCLng = dragBaseLng + dlng;
      layer.eachLayer(sub => {
        sub.setLatLngs(reprojectRing(snapLatLngs || sub.getLatLngs(), dragBaseLat, dragBaseLng, newCLat, newCLng));
      });
    });
    map.on("mouseup", () => {
      if (!isDragging) return;
      isDragging = false; dragStartLL = null; snapLatLngs = null;
      map.dragging.enable();
    });
    layer.bindTooltip(name, { permanent: false, direction: "center", className: "gs-tip" });
    layersRef.current[name] = { layer, origLatLngs, origCentroid };
    const bounds = layer.getBounds();
    if (bounds.isValid()) map.flyToBounds(bounds, { padding: [60, 60], duration: 0.7 });
    const info = COUNTRY_DATA[name] || { area: 0, pop: "?" };
    setPinned(prev => [...prev, { name, color, area: info.area, pop: info.pop }]);
    setSearch(""); setSuggestions([]); setLoading("");
  };

  function removeCountry(name) {
    const entry = layersRef.current[name];
    if (entry && mapRef.current) mapRef.current.removeLayer(entry.layer);
    delete layersRef.current[name];
    setPinned(prev => prev.filter(c => c.name !== name));
  }

  function clearAll() {
    Object.values(layersRef.current).forEach(e => mapRef.current?.removeLayer(e.layer));
    layersRef.current = {}; colorIdxRef.current = 0; setPinned([]);
  }

  function fmtArea(km2) {
    return km2 >= 1e6 ? (km2 / 1e6).toFixed(2) + "M km2" : km2.toLocaleString() + " km2";
  }


  return (
    <div id="map-wrapper" style={{ position: "relative", width: "100%", height: "100vh", fontFamily: "DM Sans, sans-serif" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 1000,
        background: "rgba(15,15,30,0.92)", backdropFilter: "blur(12px)",
        borderRadius: 14, padding: "20px 18px", width: 290, color: "#fff",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
      }}>
        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 19, marginBottom: 14, letterSpacing: "-0.5px" }}>
          The True Size Of...
        </div>

        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && suggestions[0]) addCountry(suggestions[0]); }}
            placeholder="eg... Canada"
            style={{
              width: "100%", padding: "9px 12px",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, color: "#fff", fontSize: 14, boxSizing: "border-box",
              fontFamily: "DM Sans, sans-serif", outline: "none"
            }}
          />
          {suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "110%", left: 0, right: 0,
              background: "#1e1e3a", borderRadius: 10, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)", zIndex: 10
            }}>
              {suggestions.map(s => (
                <div key={s} className="gs-suggest" onClick={() => addCountry(s)}
                  style={{ padding: "9px 14px", cursor: "pointer", fontSize: 13, color: "#e5e7eb", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "transparent" }}>
                  {loading === s ? "Loading..." : s}
                </div>
              ))}
            </div>
          )}
        </div>

        {pinned.map(c => (
          <div key={c.name} style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
            background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px"
          }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#f9fafb", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, display: "flex", gap: 10 }}>
                <span>{fmtArea(c.area)}</span>
                <span>{c.pop}</span>
              </div>
            </div>
            <button onClick={() => removeCountry(c.name)}
              style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 16, padding: "2px 4px" }}>x</button>
          </div>
        ))}

        {pinned.length > 1 && (
          <button onClick={clearAll} style={{
            width: "100%", marginTop: 6, padding: "8px",
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, color: "#fca5a5", fontSize: 12, cursor: "pointer"
          }}>Clear all</button>
        )}

        {pinned.length === 0 && (
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
            Search a country and drag it anywhere to compare true sizes.
          </div>
        )}

        <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "#4b5563" }}>
          GeoScale 2026
        </div>
      </div>

      <button
        onClick={() => {
          const el = document.getElementById("map-wrapper");
          if (!document.fullscreenElement) el.requestFullscreen();
          else document.exitFullscreen();
        }}
        style={{
          position: "absolute", bottom: 40, right: 15, zIndex: 1000,
          background: "white", border: "2px solid rgba(0,0,0,0.3)",
          borderRadius: 4, width: 34, height: 34, cursor: "pointer",
          fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
        }}
        title="Toggle Fullscreen"
      >&#x26F6;</button>
    </div>
  );
}