//@ts-nocheck

import React, { useEffect, useImperativeHandle, useRef, useState, Ref } from 'react';
import vegaEmbed from 'vega-embed'

interface FilterPopupProps {
  column: string;
  onApply: (value: string) => void;
  onClose: () => void;
  anchorRef: HTMLDivElement;
  filterType: any;
  rows: any;
  ref: any;
}

export interface FilterPopupHandle {
  clearFilters: () => void;
}

let filter_boundaries: any = {};

let brushFilterSpec: any = {
  "width": 50,
  "height": 12,
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {"values":[]},
  "mark": "tick",
  "encoding": {
      "tooltip": {"field": "value", "type": "quantitative"},
      "x": {
          "field": "value",
          "type": "quantitative",
          "scale": {"type": "linear", "zero": false},
          "axis": {
              "title": null,
              "orient": "top",
              "labelFontWeight": "lighter"
          }
      },
      "color": {"condition": {"param": "selection", "value": "#0275d8"}, "value": "grey"}
  },
  "params": [{"name": "selection", "select": "interval"}],
  "config": {"axis": {"grid": false},"background": null, "style": {"cell": {"stroke": "transparent"}}, "tick": {"thickness": 0.5, "bandSize": 10}}
};


function FilterPopup({ column, onApply, onClose, anchorRef, filterType, rows }: FilterPopupProps, ref: Ref<FilterPopupHandle>) {
  const popupRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [tickOptions, setTickOptions] = useState<string[]>([]);
  const [checkedOptions, setCheckedOptions] = useState<string[]>([]);

  const clearFilters = () => {
    alert('...');
  };

  useImperativeHandle(ref, () => ({
    clearFilters
  }));
  

  useEffect(() => {
    if (popupRef.current && anchorRef) {
      const anchorRect = anchorRef.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();

      const top = anchorRect.top - popupRect.height - 50;
      const left = anchorRect.left;

      popupRef.current.style.position = 'absolute';
      popupRef.current.style.top = `${top + window.scrollY}px`;
      popupRef.current.style.left = `${left + window.scrollX}px`;
    }
  }, [anchorRef]);

  useEffect(() => {
    if (chartRef.current && filterType === 'brush') {
      let brush_domains = config.brush_domains;
      let aux_domains = config.aux_domains;

      let tick_brush = 0;

      let index = tick_brush + 2;

      if (config.detail_mode || config.header_label_length > 0) {
        index += 1;
      }

      if (config.displayed_numeric_columns.includes(column)) {
        let plot_data = [];
        let values = []

        for (const row of rows) {
          if (row[column] != "" && row[column] != "NA") {
            plot_data.push({"value": parseFloat(row[config.columns.indexOf(column)])});
            values.push(parseFloat(row[config.columns.indexOf(column)]));
          }
        }

        let min = Math.min(...values);
        let max = Math.max(...values);

        if (brush_domains[column] != undefined && config.tick_titles.includes(column)) {
          min = Math.min(...brush_domains[column]);
          max = Math.max(...brush_domains[column]);
        } else if (aux_domains[column] != undefined) {
            let aux_values = [min, max];
            for (const col of aux_domains[column]) {
                for (const row of rows) {
                    aux_values.push(parseFloat(row[col]));
                }
            }
            min = Math.min(...aux_values);
            max = Math.max(...aux_values);
        }
        if (Number.isInteger(min)) {
            min = parseInt(min.toString());
        }
        if (Number.isInteger(max)) {
            max = parseInt(max.toString());
        }
        let legend_tick_length = min.toString().length + max.toString().length;
        var s = brushFilterSpec;
        let has_labels = legend_tick_length < 8;
        s.encoding.x.axis.labels = has_labels;
        s.data.values = plot_data;
        s.name = column;
        s.encoding.x.axis.values = [min, max];
        s.encoding.x.scale.domain = [min, max];
        let brush_class = "";
        if (!has_labels) {
            brush_class = "no-labels";
        }

        var opt = { "actions": false }

        if (filter_boundaries[s.name] != undefined) {
          s.params[0].value = {"x": filter_boundaries[s.name].value};
      }


        vegaEmbed(chartRef.current, s, opt).then(({spec, view}) => {
          view.addSignalListener('selection', function(name, value) {
            filter_boundaries[s.name] = value;
            onApply(value.value.join(','));
          })
        }).catch(err => console.error(err));

      }
    } else if (filterType === 'tick') {
      let column_values = [];

      for (let row of rows) {
          column_values.push(row[config.columns.indexOf(column)]);
      }

      let values = [...new Set(column_values)];

      setTickOptions(values);
      setCheckedOptions(values)
      
    }

  }, [filterType, column]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, option: string) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setCheckedOptions(prev => [...prev, option]);
    } else {
      setCheckedOptions(prev => prev.filter(checkedBox =>  checkedBox != option))
    }
  };

  useEffect(() => {
    onApply(checkedOptions.join(','))
  }, [checkedOptions])
  

  return (    
    <div className="filter-popup" ref={popupRef}>
      <button onClick={onClose} className="filter-popup-close">X</button>
      <h4>Filter by {column}</h4>
      {filterType === 'string' ? (
      <input type="text" className="text-filter" placeholder="Filter..." onChange={(e) => {onApply(e.target.value)}} />
      ) : filterType === 'tick' ? (
        <div>
          {tickOptions.map(option => (
            <div className='form-check' key={option}>
              <input type='checkbox' className='form-check-input' id={option} onChange={(e) => handleCheckboxChange(e, option)} checked={checkedOptions.includes(option)}/>
              <label className='form-check-label'htmlFor={option}>{option}</label>
            </div>
          ))}
        </div>
      ) : filterType === 'brush' ? (
        <div className="brush-plot-container">
          <div ref={chartRef} style={{ width: '100%', height: '100%' }} id="brush-plot"/>
        </div>
      ) : null
      }
    </div>
  );
}

export default React.forwardRef(FilterPopup)
