//@ts-nocheck

import React, { useState, useRef, useEffect, useMemo } from 'react';
import './Table.css';
import FilterPopup from './FilterPopup'
import vegaEmbed from 'vega-embed';
import * as vega from 'vega'
import LZString from 'lz-string';
const jsonm = require('jsonm');
const d3 = require("d3");

interface TableRowProps {
  [rowKey: string]: string | number;
  setShowQR: any;
  setQRURL: any;
  visibleColumns: any;
  showLineNumbers: any;
  data: any;
}

interface TableProps {
  data: string[][];
  currentPage: number;
  rowCountPerPage: number;
  visibleColumns: string[];
  hideColumn: (column : string) => void;
  showHistogram: (index: string) => void;
  setShowQR: React.Dispatch<React.SetStateAction<boolean>>;
  setQRURL: any;
  filters: any;
  setFilters: any;
  filterPopupRef: any;
  showLineNumbers: boolean;
}

function filterByRange(cellValue: any, filterValue: any) {
  const [minValue, maxValue] = filterValue.split(',').map(Number);
  if (!minValue || !maxValue) return true;

  const numericCellValue = parseFloat(cellValue);

  return numericCellValue >= minValue && numericCellValue <= maxValue;
}

function filterByString(cellValue: any, filterValue: any) {
  return cellValue.includes(filterValue);
}

function filterByCheckbox(cellValue: any, filterValue: any) {
  var choosenValues: any = []

  filterValue.split(',').map((value: any) => {
    if (value == '') return;
    choosenValues.push(value)
  })

  return choosenValues.some((value: string) => cellValue.includes(value));
}

function createShareURL(rowData: any) {
  var c = JSON.parse(JSON.stringify(config));
  c["data"] = rowData
  const packer = new jsonm.Packer();
  let packedMessage = packer.pack(c);
  let compressed = LZString.compressToEncodedURIComponent(JSON.stringify(packedMessage))
  let url = `${config.webview_host}?config=${compressed}&version=${config.version}`;
  return url;
}

function copyToClipboard(props: any) {
  navigator.clipboard.writeText(createShareURL(props))
}

function datavzrdScale(heatmap: any) {
  let scale = null;
  if (heatmap.heatmap.scale == "ordinal") {
      if (heatmap.heatmap.color_scheme != "") {
          scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).range(vega.scheme(heatmap.heatmap.color_scheme));
      } else if (heatmap.heatmap.range.length != 0) {
          scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).range(heatmap.heatmap.range);
      } else {
          scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain);
      }
  } else {
      if (heatmap.heatmap.color_scheme != "") {
          let scheme = heatmap.heatmap.color_scheme;
          let d3_scheme = d3[`interpolate${scheme.charAt(0).toUpperCase()}${scheme.slice(1).toLowerCase()}`];
          let s = heatmap.heatmap.scale;
          if (heatmap.heatmap.scale == "linear") {
              s = "";
          }
          scale = d3[`scaleSequential${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`](heatmap.heatmap.domain, d3_scheme);
      } else if (heatmap.heatmap.range.length != 0) {
          scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp).range(heatmap.heatmap.range);
      } else {
          scale = vega.scale(heatmap.heatmap.scale)().domain(heatmap.heatmap.domain).clamp(heatmap.heatmap.clamp);
      }
  }
  return scale
}

function precision_formatter(precision: any, value: any) {
  if (value == "") {
      return ""; 
  }
  value = parseFloat(value)
  if (1 / (10 ** precision) < Math.abs(value) || value == 0) {
      return value.toFixed(precision).toString()
  } else {
      return value.toExponential(precision)
  }
}

function colorizeHeaderRow(heatmap: any) {
  let scale = null;

  if (heatmap.scale == "ordinal") {
      if (heatmap.domain != null) {
          if (heatmap.color_scheme != "") {
              scale = vega.scale(heatmap.scale)().domain(heatmap.domain).range(vega.scheme(heatmap.color_scheme));
          } else if (!heatmap.range.length == 0) {
              scale = vega.scale(heatmap.scale)().domain(heatmap.domain).range(heatmap.range);
          } else {
              scale = vega.scale(heatmap.scale)().domain(heatmap.domain);
          }
      } else {
          if (heatmap.color_scheme != "") {
              scale = vega.scale(heatmap.scale)().range(vega.scheme(heatmap.color_scheme));
          } else if (!heatmap.range.length == 0) {
              scale = vega.scale(heatmap.scale)().range(heatmap.range);
          } else {
              scale = vega.scale(heatmap.scale)();
          }
      }
  } else {
      if (heatmap.domain != null) {
          if (heatmap.color_scheme != "") {
              scale = vega.scale(heatmap.scale)().domain(heatmap.domain).clamp(heatmap.clamp).range(vega.scheme(heatmap.color_scheme));
          } else if (!heatmap.range == 0) {
              scale = vega.scale(heatmap.scale)().domain(heatmap.domain).clamp(heatmap.clamp).range(heatmap.range);
          } else {
              scale = vega.scale(heatmap.scale)().domain(heatmap.domain).clamp(heatmap.clamp);
          }
      } else {
          if (heatmap.color_scheme != "") {
              scale = vega.scale(heatmap.scale)().clamp(heatmap.clamp).range(vega.scheme(heatmap.color_scheme));
          } else if (!heatmap.range == 0) {
              scale = vega.scale(heatmap.scale)().clamp(heatmap.clamp).range(heatmap.range);
          } else {
              scale = vega.scale(heatmap.scale)().clamp(heatmap.clamp);
          }
      }
  }
  return scale
}

function TableRow ({ data, rowKey, setShowQR, setQRURL, visibleColumns, showLineNumbers, ...props }: TableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tickRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const barRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const customPlotRefs = useRef<{ [key: string]: HTMLDivElement | null}>({})

  useEffect(() => {
    Object.entries(customPlotRefs.current).forEach(([key, ref]) => {
      if (ref && custom_plots.find((plot: any) => plot.title === key)) {
        const plotConfig = custom_plots.find((plot: any) => plot.title === key);
        if (plotConfig) {
          var data_func: any = window[plotConfig.data_function]
          let value = data_func(data[rowKey -1][config.columns.indexOf(key)])
          var s = { ...plotConfig.specs };
          s.data = {}
          s.data.values = value;
          var opt = {"actions": plotConfig.vega_controls, 'renderer': 'svg'};
          vegaEmbed(ref, JSON.parse(JSON.stringify(s)), opt);
        }
      }
    });
    Object.entries(tickRefs.current).forEach(([key, ref]) => {
      if (ref && config.ticks.find((tick: any) => tick.title === key)) {
        const tickConfig = config.ticks.find((tick: any) => tick.title === key);
        if (tickConfig) {
          const spec = { ...tickConfig.specs };
          spec.data = { values: [{ [key]: props[key] }] };
          if (config.column_config[key].is_float && config.column_config.precision !== undefined) {
            spec.data = { values: [{ [key]: precision_formatter(config.column_config.precision, props[key])}]}
          }
          vegaEmbed(ref, spec, { renderer: 'svg', actions: false });
        }
      }
    });
    Object.entries(barRefs.current).forEach(([key, ref]) => {
      if (ref && config.bars.find((bar: any) => bar.title === key)) {
        const barConfig = config.bars.find((bar: any) => bar.title === key);
        if (barConfig) {
          const spec = { ...barConfig.specs };
          spec.data = { values: [{ [key]: props[key] }] };
          if (config.column_config[key].is_float && config.column_config.precision !== undefined) {
            spec.data = { values: [{ [key]: precision_formatter(config.column_config.precision, props[key])}]}
          }
          vegaEmbed(ref, spec, { renderer: 'svg', actions: false });
        }
      }
    });
  }, [config, props]);

  return (
    <>
      <tr>
        {config.detail_mode && (
          <td>
            <i onClick={() => setIsExpanded(!isExpanded)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
              </svg>
            </i>
        </td>
        )}
        {showLineNumbers && (
          <td className='line-number'>{rowKey}</td>
        )}
        {Object.values(props).map((value, index) => {
          if (config.heatmap_titles.includes(visibleColumns[index])) {
            for (let i = 0; i < config.heatmaps.length; i++) {
              if (config.heatmaps[i].title === visibleColumns[index]) {
                let scale = datavzrdScale(config.heatmaps[i])
                return (<td style={{ backgroundColor: scale(value) }} key={index}>{value}</td>)
              }
            }
          }
          if (config.links.includes(visibleColumns[index])) {
            for (let i = 0; i < config.link_urls.length; i++) {
              if (config.link_urls[i].title === visibleColumns[index]) {
                let linkURL = config.link_urls[i].links[0].link.url.replace('{value}', value)
                return (
                <td key={index}>
                  <a href={linkURL}>{value}</a>
                </td>
                )
              }
            }
          }
          if (config.tick_titles.includes(visibleColumns[index])) {
            const tickTitle = visibleColumns[index];
            return (
              <td key={index}>
                <div className="row-tick-container">
                  <div
                    ref={el => tickRefs.current[tickTitle] = el}
                    id="row-tick-plot"
                  ></div>
                </div>
              </td>
            );
          }
          if (config.bar_titles.includes(visibleColumns[index])) {
            for (let i = 0; i < config.bars.length; i++) {
              if (config.bars[i].title === visibleColumns[index]) {
                const barTitle = visibleColumns[index];
                return (
                  <td key={index}>
                    <div className="row-bar-container">
                      <div
                        ref={el => barRefs.current[barTitle] = el}
                        id="row-bar-plot"
                      ></div>
                    </div>
                </td>
                )
              }
            }
          }
          
          return (
          <td key={index}>{value}</td>
          )
        })}
        <td>
          <div className="row-link-menu">
            <a>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
                <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
              </svg>
            </a>
          </div>
        </td>
        <td>
          <span className="row-qr-btn">
            <button onClick={() => {
              setShowQR(true); 
              setQRURL(createShareURL(props));
              }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-qr-code" viewBox="0 0 16 16">
                <path d="M2 2h2v2H2z"/>
                <path d="M6 0v6H0V0zM5 1H1v4h4zM4 12H2v2h2z"/>
                <path d="M6 10v6H0v-6zm-5 1v4h4v-4zm11-9h2v2h-2z"/>
                <path d="M10 0v6h6V0zm5 1v4h-4V1zM8 1V0h1v2H8v2H7V1zm0 5V4h1v2zM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8zm0 0v1H2V8H1v1H0V7h3v1zm10 1h-1V7h1zm-1 0h-1v2h2v-1h-1zm-4 0h2v1h-1v1h-1zm2 3v-1h-1v1h-1v1H9v1h3v-2zm0 0h3v1h-2v1h-1zm-4-1v1h1v-2H7v1z"/>
                <path d="M7 12h1v3h4v1H7zm9 2v2h-3v-1h2v-1z"/>
              </svg>
            </button>
          </span>
          <span className="row-clipboard-btn">
            <button onClick={() => copyToClipboard(props)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
              </svg>
            </button>
          </span>
        </td>
      </tr>
      {isExpanded && (
        <tr className="detail-view">
          <td colSpan={visibleColumns.length + 3}>
            <div className="card-holder">
            {config.columns.map((key) => {
              if (!config.hidden_columns.includes(key) && !config.displayed_columns.includes(key)) {
                let id;
                let card_title = key;
                var value = data[rowKey -1][config.columns.indexOf(key)];
                if (config.column_config[key].label) {
                  card_title = config.column_config[key].label;
                }
                if (config.custom_plot_titles.includes(key) || config.tick_titles.includes(key) || config.bar_titles.includes(key)) {
                  if (config.custom_plot_titles.includes(key)) {
                    id = `detail-plot-cp-${config.columns.indexOf(key)}`;
                  } else if (config.bar_titles.includes(key)) {
                    id = `detail-plot-bars-${config.columns.indexOf(key)}`;
                  } else {
                    id = `detail-plot-ticks-${config.columns.indexOf(key)}`;
                  }
                  return (
                    <div className="card">
                      <div class="card-header">
                       {card_title}
                     </div>
                     <div class="card-body">
                       <div id="detail-view-plot" ref={el => customPlotRefs.current[key] = el}></div>
                     </div>
                    </div>
                  )
                } else if (config.heatmap_titles.includes(key)) {
                  id = `heatmap-${config.columns.indexOf(key)}`;
                  return (
                    <div className="card">
                      <div className="card-header">
                        {card_title}
                      </div>
                      <div id={id} className="card-body">
                        {value}
                      </div>
                    </div>
                  )
                } else if (config.format[key] !== undefined) {
                  var data_function: any = window[config.format[key]];
                  value = data_function(value, row)
                  return (
                    <div className="card">
                      <div className="card-header">
                        {card_title}
                      </div>
                      <div className="card-body">
                        {value}
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div className="card">
                      <div className="card-header">
                        {card_title}
                      </div>
                      <div className="card-body">
                        {value}
                      </div>
                    </div>
                  )
                }
              }
            })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Table({ data, currentPage, rowCountPerPage, visibleColumns, hideColumn, showHistogram, setShowQR, setQRURL, filters, setFilters, filterPopupRef, showLineNumbers }: TableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof TableRowProps; direction: 'ascending' | 'descending' } | null>(null);
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const [showFilterPopup, setShowFilterPopup] = useState<boolean>(false);
  const [anchorRefs, setAnchorRefs] = useState<{ [key: string]: HTMLDivElement | null }>({});
  const [filterType, setFilterType] = useState('')
  const [isEmbedSearchModalOpen, setIsEmbedSearchModalOpen] = useState(false);


  const indexOfLastRow = currentPage * rowCountPerPage;
  const indexOfFirstRow = indexOfLastRow - rowCountPerPage;

  const processData = React.useMemo(() => {
    let processedData = [...data];

    if (Object.keys(filters).length > 0) {
      processedData = processedData.filter(row => {
        return Object.keys(filters).every(column => { 
          const columnIndex = config.columns.indexOf(column);
          const cellValue = row[columnIndex]?.toString() || '';

          if (config.displayed_numeric_columns.includes(column)) {
            return filterByRange(cellValue, filters[column]);
          } else if (config.unique_column_values[column]) {
              if (config.unique_column_values[column] > 10) {
                return filterByString(cellValue, filters[column])
              } else if (config.unique_column_values[column] <= 10) {
                return filterByCheckbox(cellValue, filters[column])
              }
            } else {
              return filterByString(cellValue, filters[column])
            }
          });
        });
      }
    
    if (sortConfig) {
      processedData.sort((a, b) => {
        const columnIndex = config.columns.indexOf(sortConfig.key);
        if (a[columnIndex] < b[columnIndex]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[columnIndex] > b[columnIndex]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return processedData;
  }, [data, filters, sortConfig, config.columns]);

  const currentRows = React.useMemo(() => {
    return processData.slice(indexOfFirstRow, indexOfLastRow);
  }, [processData, indexOfFirstRow, indexOfLastRow]);

  const handleSort = (key: keyof TableRowProps, direction: 'ascending' | 'descending') => {
    setSortConfig(prevConfig => {
      if (prevConfig && prevConfig.key === key ) {
        if (prevConfig.direction === direction) {
          return null;
        }
      }
      return { key, direction };
    });
  };

  
  const handleHideColumn = (column: string) => {
    hideColumn(column);
  };

  const handleEmbedHistogram = (index: string) => {
    showHistogram(index)
  }

  const handleOpenFilterPopup = (column: string, anchor: HTMLDivElement) => {
    if (config.displayed_numeric_columns.includes(column)) {
      setFilterType('brush')
    } else if (config.unique_column_values[column]) {
      if (config.unique_column_values[column] > 10) {
        setFilterType('string')
      } else if (config.unique_column_values[column] <= 10) {
        setFilterType('tick')
      }
    } else {
      setFilterType('string')
    }
    setFilterColumn(column);
    setAnchorRefs(prevRefs => ({ ...prevRefs, [column]: anchor }));
    setShowFilterPopup(true);
  };

  const handleEmbedSearch = (column: string) => {
    var source = `search/column_${config.columns.indexOf(column)}.html`;
    setIsEmbedSearchModalOpen(true)
  }

  const handleApplyFilter = (value: string) => {
    setFilters((prevFilters: any) => ({ ...prevFilters, [filterColumn || '']: value }));
  };
  const handleCloseFilterPopup = () => {
    setShowFilterPopup(false);
    setFilterColumn(null);
  };

  const onCloseEmbedSearchModal = () => {
    setIsEmbedSearchModalOpen(false)
  }

  return (
    <div className="table-container">
      <table id="table">
        <thead>
          <tr>
            <th></th>
            {showLineNumbers && (
              <th></th>
            )}
            {visibleColumns.map((key: any) => (
              <th key={key}>
                <div className="th-inner">
                  {config.column_config[key].label || key}
                  <div className="buttons">
                    {!(key in config.additional_colums) && (
                    <button
                      className="histogram-btn"
                      onClick={() => handleEmbedHistogram(key)}>   
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bar-chart-fill" viewBox="0 0 16 16">
                          <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>
                        </svg>
                    </button>
                    )}
                    {config.is_single_page && (
                    <button
                      onClick={() => handleSort(key as keyof TableRowProps, 'ascending')}
                      className={`sort-button ${sortConfig?.key === key && sortConfig?.direction === 'ascending' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-up-fill" viewBox="0 0 16 16">
                          <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                        </svg>
                    </button>
                    )}
                    {config.is_single_page && (
                    <button
                      onClick={() => handleSort(key as keyof TableRowProps, 'descending')}
                      className={`sort-button ${sortConfig?.key === key && sortConfig?.direction === 'descending' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                        </svg>
                    </button>
                    )}
                    {config.is_single_page && (
                    <button
                      onClick={() => handleHideColumn(key)}
                      className="hide-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                          <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                          <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
                        </svg>
                    </button>
                    )}
                    {config.is_single_page ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFilterPopup(key, e.currentTarget.closest('div') as HTMLDivElement);
                      }}
                      className="filter-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                        </svg>
                    </button>
                    ) : (
                      <button
                      onClick={(e) => handleEmbedSearch(key)}
                      className="filter-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                        </svg>
                    </button>
                    )
                    } 
                  </div>
                </div>
              </th>
            ))}
          </tr>
          {header_config && header_config.headers.map((header, index) => {
          const firstTdStyle = !config.detail_mode && !header.label ? { border: 'none' } : {};
          const heatmapOfRow = header_config.heatmaps.find(heatmap => heatmap.row === header.row)
          const scale = colorizeHeaderRow(heatmapOfRow.heatmap)
          return (
            <tr key={index}>
              {(config.detail_mode || header.label) && (
                <td style={firstTdStyle}>
                  {header.label && <b>{header.label}</b>}
                </td>
              )}
              <td></td>
              {config.columns.map((title, colIndex) => {
                  const hasContent = header.header[title] !== undefined && header.header[title] !== '';
                  const cellStyle = hasContent ? {
                    backgroundColor: scale(header.header[title]),
                  } : {};
                return ( config.displayed_columns.includes(title) ? (
                  <td key={colIndex} style={cellStyle}>
                    {header.header[title] !== undefined ? header.header[title] : ''}
                  </td>
                ) : null )
                })}
            </tr>
          );
        })}
        </thead>
        <tbody>
        {currentRows.map((row: String[], rowIndex: number) => {
            const rowProps = visibleColumns.reduce((acc: any, columnKey: string) => {
              acc[columnKey as keyof TableRowProps] = row[config.columns.indexOf(columnKey)] as string;
              return acc;
            }, {} as TableRowProps);
            return <TableRow data={data} rowKey={((currentPage - 1) * rowCountPerPage) + 1 + rowIndex} key={(currentPage * rowCountPerPage) + 1 + rowIndex} visibleColumns={visibleColumns} {...rowProps} setShowQR={setShowQR} setQRURL={setQRURL} showLineNumbers={showLineNumbers} />;
          })}
        </tbody>
      </table>
      {showFilterPopup && filterColumn && anchorRefs && (
        <FilterPopup
          ref={filterPopupRef}
          column={filterColumn}
          onApply={handleApplyFilter}
          onClose={handleCloseFilterPopup}
          anchorRef={anchorRefs[filterColumn]!}
          filterType={filterType}
          rows={data}
        />
      )}
      {isEmbedSearchModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className='modal-header'>
              <div className="header-title"></div>
              <button className="modal-close" onClick={onCloseEmbedSearchModal}>X</button>
            </div>
            <div className="modal-body">
              <iframe id="embed-search-container" src={`search/column_5.html`} style={{ top: "0px", width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>
        )
      }
    </div>
  );
}