import { Msg } from "../../extension/pageview";

const vscode = acquireVsCodeApi();

const useMain = () => {
  const send = (message: Msg) => {
    vscode.postMessage(JSON.stringify(message))
  }

  return {
    send
  }
}

export default useMain