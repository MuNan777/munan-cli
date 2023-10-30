import { commands } from "vscode"
import { PageView } from "./pageview";
import * as vscode from 'vscode';
import { VIEW_NAME } from "./config";

export enum ShowStatus {
  hidden,
  show,
}

export interface Command {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any[]) => any;
}

export const setExpandStatus = (status: ShowStatus) => {
  commands.executeCommand('setContext', `${VIEW_NAME}.show`, status);
}

export const getDisposableList = (codeView: PageView): Command[] => {

  const commandList: Command[] = []

  commands.executeCommand('setContext', `${VIEW_NAME}.show`, ShowStatus.show);

  // 默认的命令
  commandList.push({
    name: `${VIEW_NAME}.helloWorld`,
    fn: () => {
      vscode.window.showInformationMessage('Hello World from test-page!');
    }
  });

  commandList.push({
    name: `${VIEW_NAME}.showText`,
    fn: () => {
      codeView.postMessage({
        type: 'show-text',
        value: true,
      });
      setExpandStatus(ShowStatus.show)
    }
  });

  commandList.push({
    name: `${VIEW_NAME}.hiddenText`,
    fn: () => {
      codeView.postMessage({
        type: 'hidden-text',
        value: false,
      });
      setExpandStatus(ShowStatus.hidden)
    }
  });

  return commandList
}