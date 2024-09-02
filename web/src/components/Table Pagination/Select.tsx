import * as select from "@zag-js/select"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import { getId } from "../../App";

const selectData = [
  { value: "10" },
  { value: "25" },
  { value: "50" },
  { value: "100" },
]

interface SelectMenuProps {
  onRowCountChange: (page: number) => void;
}

export default function Select({ onRowCountChange }: SelectMenuProps) {
  const collection = select.collection({
    items: selectData,
    itemToString: (item) => item.value,
    itemToValue: (item) => item.value,
  })

  const [state, send] = useMachine(
    select.machine({
      id: getId('tablePaginationSelect'),
      collection,
      value: [config.page_size],
      onValueChange(details) {
        onRowCountChange(Number(details.value))
      }
    }),
  )

  const api = select.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()} className="pagination-row-count-menu">
          {api.valueAsString || config.page_size.toString()}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-up-fill" viewBox="0 0 16 16">
            <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
          </svg>
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()} className="pagination-select-menu">
            {selectData.map((item) => (
              <li key={item.value} className="select-menu-item" {...api.getItemProps({ item })}>
                <span>{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  )
}