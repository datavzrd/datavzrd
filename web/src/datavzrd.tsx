// @ts-nocheck

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import App, { Empty, Plot } from "./App.tsx";
import "./styles/index.css";
import { decompress } from "./App.tsx";
import vegaEmbed from 'vega-embed';

export function load() {
    const rootElement = document.createElement("div");
    rootElement.id = "root";

    document.body.appendChild(rootElement);

    document.title = "datavzrd report";

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

export function load_table(specs: any, data2: any, multiple_datasets: any) {

    if (multiple_datasets) {
        specs.datasets = {};
        specs.datasets = decompress(data2);
    } else {
        specs.data = {};
        specs.data.values = decompress(data2);
    }

    document.title = "datavzrd report";

    vegaEmbed('#vis', specs).catch((err: any) => {
        console.error(err)
        document.getElementById('error-modal')?.classList.add('visible');
    });

}

export function load_search() {

    const rootElement = document.createElement("div")
    rootElement.id = "root"
    document.body.appendChild(rootElement)

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <SearchTable />
        </React.StrictMode>
    )
}

export function load_plot(specs: any, plotData: any, multiple_datasets: any) {

    const rootElement = document.createElement("div")
    rootElement.id = "root"
    document.body.appendChild(rootElement)

    document.title = "datavzrd report";

    ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <Plot specs={specs} plotData={plotData} multiple_datasets={multiple_datasets} />
    </React.StrictMode>
    )
}

export function load_empty() {

    const rootElement = document.createElement("div")
    rootElement.id = "root"
    document.body.appendChild(rootElement)

    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Empty />
        </React.StrictMode>
    )
}

const SearchTable = () => {

    let decompressed = decompress(search_data);

    const [searchTableList, setSearchTableList] = useState(decompressed);

    const onInputChange = (value: string) => {
        if (value === "") {
            setSearchTableList(decompressed)
        } else {
            setSearchTableList(decompressed.filter((cellValue: string) => cellValue.includes(value)));
        }
    };


    return (
        <div className="table-container">
                        <input type="search" placeholder="Filter..." className="pagination-searchbox" onChange={(e) => {onInputChange(e.target.value)}}/>
            <table>
                <thead>
                    <tr>
                        <th>
                            <div className="th-inner">page</div>
                        </th>
                        <th>
                            <div className="th-inner">{table_title}</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {searchTableList.map((row: String[]) => {
                        let href = `../index_${row[1]}.html?highlight=${row[2]}`
                        return ( 
                        <tr>
                            <td>
                                <a target="_parent" href={href}>{row[1]}</a>
                            </td>
                            <td>{row[0]}</td>
                        </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}