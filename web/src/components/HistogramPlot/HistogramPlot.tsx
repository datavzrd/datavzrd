//@ts-nocheck

import React, { useEffect, useRef } from 'react';
import vegaEmbed from 'vega-embed';
import './HistogramPlot.css';

interface HistogramPlotProps {
  showPlot: boolean;
  plot: any;
  onClose: () => void;
}

export default function HistogramPlot({showPlot, plot, onClose}: HistogramPlotProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const plotColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showPlot && plotRef.current && plotColRef.current) {
      
      if (Object.keys(plot).length > 0 && plot.layer[0].data.values != null) {
        plotColRef.current.textContent = plot?.layer?.[0]?.encoding?.x?.title || 'No Title';
        vegaEmbed(plotRef.current, plot).then(result => {
        }).catch(error => {
          console.error("Error embedding plot:", error);
          plotRef.current!.innerHTML = '<p>Failed to render plot.</p>';
        });
      } else {
        plotRef.current.innerHTML = '<p>No reasonable plot possible.</p>';
      }
    }
  }, [showPlot, plot]);


  return (
    showPlot ? (
      <div className="modal-overlay">
        <div className="modal-content">
        <div className='modal-header'>
          <div ref={plotColRef} className="header-title"></div>
            <button className="modal-close" onClick={onClose}>X</button>
          </div>
          <div className="modal-body">
            <div ref={plotRef} id="plot-container"></div>
          </div>
        </div>
      </div>
    ) : null
  );
};
