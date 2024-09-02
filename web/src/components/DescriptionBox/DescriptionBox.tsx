// @ts-nocheck

import * as collapsible from "@zag-js/collapsible";
import { useMachine, normalizeProps } from "@zag-js/react";
import React, { useEffect, useState } from "react";
import { getId } from "../../App";
import './DescriptionBox.css'
const showdown = require("showdown");
const showdownKatex = require("showdown-katex")

interface DescriptionBoxProps {
  isOpen: boolean;
  toggleOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DescriptionBox({ isOpen, toggleOpen }: DescriptionBoxProps) {
    const [state, send] = useMachine(
      collapsible.machine({
        id: getId("descriptionBox"),
      })
    );
  
    const api = collapsible.connect(state, send, normalizeProps);

    const [markdownContent, setMarkdownContent] = useState('');
  
    useEffect(() => {
      if (isOpen) {
        send({ type: "OPEN" });
      } else {
        send({ type: "CLOSE" });
      }
    }, [isOpen, send]);

    const handleClick = () => {
      toggleOpen(prev => !prev);
    };

    useEffect(() => {
      const converter = new showdown.Converter({
        extensions: [
          showdownKatex({
            throwOnError: true,
            displayMode: false,
            errorColor: '#1500ff',
          }),
        ],
      });
  
      converter.setFlavor('github');
  
      let htmlContent = null;
      
      if (config !== undefined && config.description) {
          htmlContent = converter.makeHtml(config.description);
      } else if (typeof description !== 'undefined') {
          htmlContent = converter.makeHtml(description);
      }

      setMarkdownContent(htmlContent);
    }, []);
  
    return (
      markdownContent ? (
      <div {...api.getRootProps()}>
        <div className={`description-box ${state.matches('open') ? 'open' : 'closed'}`} {...api.getContentProps()}>
          <button onClick={() => handleClick()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
          </svg>
          </button>
          <div id="innerDescription" dangerouslySetInnerHTML={{ __html: markdownContent }} />
        </div>
      </div>
    ) : null
    );
  }