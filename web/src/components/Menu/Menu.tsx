// @ts-nocheck

import * as menu from "@zag-js/menu";
import { useMachine, normalizeProps } from "@zag-js/react";
import React from "react";
import { getId } from "../../App";
import './Menu.css'

interface MenuProps {
  setCollapsibleOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onButtonSelect: (button: string) => void;
}

export default function Menu({ setCollapsibleOpen, onButtonSelect }: MenuProps) {
  const [menuState, send] = useMachine(
    menu.machine({
      id: getId(`menu`),
      closeOnSelect: false,
      onSelect(details) {
        if (details.value === "showDescription") {
          setCollapsibleOpen(prev => !prev);
        } else {
          onButtonSelect(details.value);
        }
      },
    })
  );

  const api = menu.connect(menuState, send, normalizeProps);

  return (
    <div>
      <button {...api.getTriggerProps()} className="topRightMenu">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
          <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
        </svg>
      </button>
      <div {...api.getPositionerProps()} className="menu">
        <ul {...api.getContentProps()} className="sidebar">
          { config !== undefined && config.has_excel_sheet && (
            <li key="downloadExcel" className="sidebar-btn" {...api.getItemProps({ value: "downloadExcel" })}>
            Download Excel Sheet
            </li>
          )}
          { config !== undefined && config.description && (
            <li key="showDescription" className="sidebar-btn" {...api.getItemProps({ value: "showDescription" })}>
            Show Description
            </li>
          )}
          { config !== undefined && config.is_single_page && (
            <li key="downloadCSV" className="sidebar-btn" {...api.getItemProps({ value: "downloadCSV" })}>
            Download CSV
            </li>   
          )}
          { config !== undefined && config.is_single_page && (
            <li key="unhideColumns" className="sidebar-btn" {...api.getItemProps({ value: "unhideColumns" })}>
            Unhide Columns
            </li>   
          )}
          { config !== undefined && config.is_single_page && (
            <li key="clearFilters" className="sidebar-btn" {...api.getItemProps({ value: "clearFilters" })}>
            Clear Filters
            </li>   
          )}
          <li key="screenshotTable" className="sidebar-btn" {...api.getItemProps({ value: "screenshotTable" })}>
            Export Table Page as SVG
          </li>
          <li key="toggleLineNumbers" className="sidebar-btn" {...api.getItemProps({ value: "toggleLineNumbers" })}>
            Show/Hide Line Numbers
          </li>
        </ul>
      </div>
    </div>
  );
}
