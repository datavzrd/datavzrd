//@ts-nocheck

import React, { useState, useRef, useMemo, useEffect } from 'react';
import LZString from 'lz-string';
const jsonm = require('jsonm');
import { documentToSVG, elementToSVG, inlineResources, formatXML } from 'dom-to-svg';
import vegaEmbed from 'vega-embed'
import './styles/App.css';
import Menu from './components/Menu/Menu';
import  DescriptionBox from './components/DescriptionBox/DescriptionBox';
import Table from './components/Table/Table';
import Pagination from './components/Table Pagination/Pagination';
import Select from './components/SelectPagination/Select';
import HistogramPlot from './components/HistogramPlot/HistogramPlot';
import QRCodeModal from './components/QRCodeModal/QRCodeModal';

interface PlotProps {
  specs: any;
  plotData: any;
  multiple_datasets: any;
}

export function getId(name: string) {
  return (`datavzrd-${name}`);
}

export function decompress(data: string) {
  var decompressed = JSON.parse(LZString.decompressFromUTF16(data));
  const unpacker = new jsonm.Unpacker();
  decompressed = unpacker.unpack(decompressed);
  return decompressed;
}

function downloadCSV(data: any) {
  data = JSON.parse(JSON.stringify(data));
  if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("No data found or data format is invalid.");
      return;
  }
  var csvContent = "data:text/csv;charset=utf-8,";
  var headers = config["columns"];
  csvContent += headers.join(",") + "\n";
  data.forEach(function(item){
      var row: any = [];
      headers.forEach(function(header: any) {
          var value = item[config.columns.indexOf(header)];
          if (typeof value === 'string' && value.includes(',')) {
              value = '"' + value.replace(/"/g, '""') + '"';
          }
          row.push(value);
      });
      csvContent += row.join(",") + "\n";
  });
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link)
}

function addRotationTransform(svgString) {
  let table_headers = config.displayed_columns.map(column =>
      config.column_config[column].label !== null ? config.column_config[column].label : column
  );

  const widthMatch = svgString.match(/<svg[^>]*width="([\d.]+)"[^>]*>/);
  let svgWidth = 0;
  if (widthMatch) {
      svgWidth = parseFloat(widthMatch[1]);
  }

  const maxLength = Math.max(...table_headers.map(word => word.length));
  const headerHeight = (80 + 6 * maxLength * Math.SQRT2) / 2 + 80;

  svgWidth += headerHeight;

  svgString = svgString.replace(/(<svg[^>]*width=")([\d.]+)"/, `$1${svgWidth}"`);

  return svgString.replace(/<text\b([^>]*)>(<tspan[^>]*x="([\d.]+)"[^>]*y="([\d.]+)"[^>]*>([^<]+)<\/tspan>)(<\/text>)/g,
      (match, textAttributes, tspanContent, x, y, word, closingTag) => {
          if (table_headers.includes(word)) {
              const transform = `transform="rotate(-45, ${x}, ${y})"`;
              return `<text${textAttributes} ${transform}>${tspanContent}${closingTag}`;
          }
          return match;
      }
  );
}

function downloadSVG(svgString, fileName) {
  svgString = addRotationTransform(svgString);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function screenshotTable() {
  document.querySelectorAll('table tr').forEach(row => {
    const cells = row.querySelectorAll('td');

    let s = -1;
    if (linkouts !== null) {
        s = -2;
    }
    if (!config.webview_controls) {
        s += 1;
    }
    if (s < 0) {
        const lastTwo = Array.from(cells).slice(s);
        lastTwo.forEach(cell => cell.style.display = 'none');
    }
  });

  document.querySelectorAll('button').forEach(el => el.style.display = 'none');

  if (config.detail_mode) {
    document.querySelectorAll('table tr').forEach(row => {
      const cells = row.querySelectorAll('td, th');
      const first = Array.from(cells).slice(0, 1);
      first.forEach(cell => cell.style.display = 'none');
    });
  }
  const table_element = document.getElementById("table");
  const svgDocument = elementToSVG(table_element);
  const svgString = new XMLSerializer().serializeToString(svgDocument);
  downloadSVG(svgString, `table.svg`);
}

export default function App() {
  const [descriptionBoxOpen, setDescriptionBoxOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowCountPerPage, setRowCountPerPage] = useState(config.page_size)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(config.displayed_columns);
  const [histogramPlot, setHistogramPlot] = useState<object | null>(null);
  const [showHistogram, setShowHistogram] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrURL, setQRURL] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});


  let decompressed = decompress(data);
  
  for (let row of decompressed) {
    var row_with_keys = Object.fromEntries(config.columns.map((k: any, i: any) => [k, row[i]]));
    for (const column of config.columns) {
        if (config.additional_colums[column]) {
            let value_function: any = window[config.additional_colums[column]];
            let new_value = value_function(row_with_keys);
            row.push(new_value);
        }
    }
  }

  const handleMenuButtonClick = (button: string) => {

      if (button == 'unhideColumns') {
        setVisibleColumns(config.displayed_columns)
      } else if (button == 'clearFilters') {
        setFilters({})
      } else if (button == 'downloadCSV') {
        downloadCSV(decompressed)
      } else if (button == 'toggleLineNumbers') {
        setShowLineNumbers(prev => !prev)
      } else if (button == 'downloadExcel') {
        window.location.href = '../data.xlsx';
      } else if (button == 'screenshotTable') {
        screenshotTable()
      } else if (button == 'showDescription') {
        setDescriptionBoxOpen(prev => !prev)
      }
  }

  const handleShowHistogram = (index: any) => {
    const plotKey = `plot_${config.columns.indexOf(index)}`;
    setHistogramPlot(eval(plotKey));
    setShowHistogram(true);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowCountChange = (newRowCount: number) => {
    setRowCountPerPage(newRowCount)
  }

  const closeHistogramModal = () => {
    setShowHistogram(false);
    setHistogramPlot(null);
  };

  return (
    <div>
      <div>
        <div className="fixed-top">
        <Menu 
          onButtonSelect={handleMenuButtonClick}
        />
        <Select />
        </div>
      </div>
      <DescriptionBox 
        isOpen={descriptionBoxOpen} 
        toggleOpen={setDescriptionBoxOpen}
      />
      <div className="table-container">
        <Table 
          data={decompressed}
          currentPage={currentPage}
          rowCountPerPage={rowCountPerPage}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          showHistogram={handleShowHistogram}
          setShowQR={setShowQR}
          setQRURL={setQRURL}
          filters={filters}
          setFilters={setFilters}
          showLineNumbers={showLineNumbers}
        />
        <Pagination
          currentRowCount={rowCountPerPage}
          data={decompressed} 
          onPageChange={handlePageChange}
          onRowCountChange={handleRowCountChange}
        />
      </div>
      {showHistogram && histogramPlot && (
        <HistogramPlot 
          showPlot={showHistogram}
          plot={histogramPlot}
          onClose={closeHistogramModal}
        />
      )}
      {showQR && (
        <QRCodeModal 
          showQR={showQR}
          setShowQR={setShowQR}
          qrURL={qrURL}
        />
      )}
      <footer class="footer">
        <nav class="bottom-footer">
            <a class="bottom-footer-brand" href="#">datavzrd</a>
            <div class="bottom-footer-option-menu" id="navbarText">
                <ul class="bottom-footer-options">
                    <li class="bottom-footer-option">
                        <a class="bottom-footer-option-link" href="https://github.com/datavzrd/datavzrd/blob/master/CHANGELOG.md">{config.version}</a>
                    </li>
                    <li class="bottom-footer-option">
                        <a class="bottom-footer-option-link" href="https://github.com/datavzrd/datavzrd">github</a>
                    </li>
                </ul>
                <span class="bottom-footer-created-time">
                        {config.time}
                    </span>
            </div>
        </nav>
      </footer>
    </div>
  );
}

export function Plot({ specs, plotData, multiple_datasets }: PlotProps) {

  const [descriptionBoxOpen, setDescriptionBoxOpen] = useState(true);
  const plotRef = useRef<HTMLDivElement>(null);

  if (multiple_datasets) {
    specs.datasets = {};
    specs.datasets = decompress(plotData);
} else {
    specs.data = {};
    specs.data.values = decompress(plotData);
}

  const handleMenuButtonClick = (button: string) => {

    if (button == 'unhideColumns') {
      setVisibleColumns(config.displayed_columns)
    } else if (button == 'clearFilters') {
      setFilters({})
      triggerPopupFunction()
    } else if (button == 'downloadCSV') {
      downloadCSV(decompressed)
    } else if (button == 'toggleLineNumbers') {
      setShowLineNumbers(prev => !prev)
    } else if (button == 'downloadExcel') {
      window.location.href = '../data.xlsx';
    } else if (button == 'screenshotTable') {
      screenshotTable()
    }  else if (button == 'showDescription') {
      setDescriptionBoxOpen(prev => !prev)
    }
  }

  useEffect(() => {
    if (plotRef.current) {
      vegaEmbed(plotRef.current, specs).catch(err => {
        console.error(err)
      })
    }
  })

  return (
    <div>
      <div>
        <div className="fixed-top">
          <Menu 
            onButtonSelect={handleMenuButtonClick}
          />
          <Select />
        </div>
      </div>
      <DescriptionBox 
        isOpen={descriptionBoxOpen} 
        toggleOpen={setDescriptionBoxOpen}
      />
      <div>
        <div id="plot-container" style={{ top: "200px" }}ref={plotRef}>
        </div>
      </div>
      <footer className="footer" style={{ position: "absolute", bottom: "0" }}>
        <nav class="bottom-footer">
            <a class="bottom-footer-brand" href="#">datavzrd</a>
            <div class="bottom-footer-option-menu" id="navbarText">
                <ul class="bottom-footer-options">
                    <li class="bottom-footer-option">
                        <a class="bottom-footer-option-link" href="https://github.com/datavzrd/datavzrd/blob/master/CHANGELOG.md">{config.version}</a>
                    </li>
                    <li class="bottom-footer-option">
                        <a class="bottom-footer-option-link" href="https://github.com/datavzrd/datavzrd">github</a>
                    </li>
                </ul>
                <span class="bottom-footer-created-time">
                        {config.time}
                    </span>
            </div>
        </nav>
      </footer>
    </div>
  )
}

export function Empty() {
  return (
    <div>
      <div>
        <div className="fixed-top">
          <Select />
        </div>
        <div>
          <div style={{ height: "calc(100vh - 190px)"}} className="empty-html-container">
            <h4>No data</h4>
          </div>
        </div>
      </div>
      <footer className="footer" style={{ position: "absolute", bottom: "0" }}>
        <nav class="bottom-footer">
            <a class="bottom-footer-brand" href="#">datavzrd</a>
            <div class="bottom-footer-option-menu" id="navbarText">
                <ul class="bottom-footer-options">
                    <li class="bottom-footer-option">
                        <a class="bottom-footer-option-link" href="https://github.com/datavzrd/datavzrd/blob/master/CHANGELOG.md">{config.version}</a>
                    </li>
                    <li class="bottom-footer-option">
                        <a class="bottom-footer-option-link" href="https://github.com/datavzrd/datavzrd">github</a>
                    </li>
                </ul>
                <span class="bottom-footer-created-time">
                        {config.time}
                    </span>
            </div>
        </nav>
      </footer>
    </div>
  )
}