// @ts-nocheck

import * as select from "@zag-js/select"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import { useState, useEffect} from 'react';
import './Select.css'
import { getId } from "../../App"

export default function Select() {

  const [tableList, setTableList] = useState(config.tables)

  const collection = select.collection({
    items: tableList,
    itemToString: (item) => item,
    itemToValue: (item) => item,
  })

  const [state, send] = useMachine(
    select.machine({
      id: getId(`SelectPagination`),
      collection,
      value: [config.title],
      onValueChange(details) {
        window.location.href = `../${details.value[0]}/index_1.html`
      }
    }),
  )

  const onInputChange = (value: string) => {
    setTableList(config.tables.filter(cellValue => cellValue.includes(value)))
  }

  const api = select.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getControlProps()}>
        <label {...api.getLabelProps()} className="breadcrumb-report-name">{config.report_name}</label>
        <button {...api.getTriggerProps()} className="breadcrumb-menu-btn">
          {api.valueAsString || ""}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
          </svg>
        </button>
      </div>

      <Portal>
        <div {...api.getPositionerProps()} className="breadcrumb-menu">
          <div className="breadcrumb-menu">
          <ul {...api.getContentProps()}>
            <input type="search" placeholder="Filter..." className="pagination-searchbox" onChange={(e) => {onInputChange(e.target.value)}}/>
            {tableList.map((item) => (
              <li key={item} {...api.getItemProps({ item })}>
                <span>{item}</span>
                <span {...api.getItemIndicatorProps({ item })}></span>
              </li>
            ))}
          </ul>
          </div>
        </div>
      </Portal>
      </div>
  )
}