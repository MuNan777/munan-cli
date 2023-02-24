import { useState } from "react"
import useContextMenu from "../hooks/useContextMenu"

const TestContextMenu = () => {

  const [items] = useState(['aaa', 'bbb', 'ccc'])

  const clickedItem = useContextMenu([{
    label: 'alert dataset-id',
    click: () => {
      if (clickedItem.current) {
        let element = clickedItem.current as HTMLElement
        alert(element.dataset.id)
      }
    }
  }], '.item', [items])

  return <>
    <ul>
      {
        items.map((item, index) => <li className="item" data-id={index} key={item}>{item}</li>)
      }
    </ul>
  </>
}

export default TestContextMenu